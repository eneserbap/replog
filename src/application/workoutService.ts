import { v4 as uuidv4 } from "uuid";
import { db } from "../infrastructure/db";
import {
  ProgramEntity,
  ProgramDayEntity,
  ProgramExerciseEntity,
  LogSessionEntity,
  LogSetEntity,
  PlannedSet,
} from "../domain/entities";

export class ProgramService {
  // Setup methods
  async createProgram(name: string): Promise<ProgramEntity> {
    const program: ProgramEntity = {
      id: uuidv4(),
      name,
      createdAt: Date.now(),
    };
    await db.programs.add(program);
    return program;
  }

  async addDayToProgram(
    programId: string,
    name: string,
  ): Promise<ProgramDayEntity> {
    const count = await db.days.where("programId").equals(programId).count();
    const day: ProgramDayEntity = {
      id: uuidv4(),
      programId,
      name,
      order: count + 1,
    };
    await db.days.add(day);
    return day;
  }

  async addExerciseToDay(
    dayId: string,
    name: string,
    plannedSets: PlannedSet[],
  ): Promise<ProgramExerciseEntity> {
    const count = await db.exercises.where("dayId").equals(dayId).count();
    const exercise: ProgramExerciseEntity = {
      id: uuidv4(),
      dayId,
      name,
      order: count + 1,
      plannedSets,
    };
    await db.exercises.add(exercise);
    return exercise;
  }

  // Logging methods
  async startSession(
    programDayId: string,
    date: string,
  ): Promise<LogSessionEntity> {
    const session: LogSessionEntity = {
      id: uuidv4(),
      programDayId,
      date,
      startTime: Date.now(),
      timestamp: Date.now(),
    };
    await db.sessions.add(session);
    return session;
  }

  async logSet(
    sessionId: string,
    exerciseId: string,
    setIndex: number,
    weight: number,
    reps: number,
    note?: string,
  ): Promise<LogSetEntity> {
    // Check if set already exists to prevent duplication
    const existing = await db.sets
      .where("[sessionId+exerciseId+setIndex]")
      .equals([sessionId, exerciseId, setIndex])
      .first();

    const id = existing ? existing.id : uuidv4();
    const logSet: LogSetEntity = {
      id,
      sessionId,
      exerciseId,
      setIndex,
      weight,
      reps,
      note,
    };
    await db.sets.put(logSet);
    return logSet;
  }

  async logExerciseNote(
    sessionId: string,
    exerciseId: string,
    content: string,
  ) {
    const existing = await db.exerciseNotes
      .where("[sessionId+exerciseId]")
      .equals([sessionId, exerciseId])
      .first();

    if (existing) {
      await db.exerciseNotes.update(existing.id, { content });
    } else {
      await db.exerciseNotes.add({
        id: uuidv4(),
        sessionId,
        exerciseId,
        content,
      });
    }
  }

  // Retrieval
  async getPrograms() {
    return db.programs.toArray();
  }

  async getProgramDetails(programId: string) {
    const program = await db.programs.get(programId);
    const days = await db.days
      .where("programId")
      .equals(programId)
      .sortBy("order");
    return { ...program, days };
  }

  async getDayDetails(dayId: string) {
    const day = await db.days.get(dayId);
    const exercises = await db.exercises
      .where("dayId")
      .equals(dayId)
      .sortBy("order");
    return { ...day, exercises };
  }

  async getSession(sessionId: string) {
    const session = await db.sessions.get(sessionId);
    if (!session) return null;
    const day = await db.days.get(session.programDayId);
    const exercises = await db.exercises
      .where("dayId")
      .equals(session.programDayId)
      .sortBy("order");
    const sets = await db.sets.where("sessionId").equals(sessionId).toArray();
    const notes = await db.exerciseNotes
      .where("sessionId")
      .equals(sessionId)
      .toArray();

    return { ...session, day, exercises, sets, notes };
  }

  async getPreviousExerciseStats(exerciseName: string) {
    // Find all sets for exercises with this name, across any day/session
    const allSetsWithName = await db.sets
      .where("exerciseId")
      .anyOf(
        await db.exercises.where("name").equals(exerciseName).primaryKeys(),
      )
      .toArray();

    if (allSetsWithName.length === 0) return null;

    // We want the most recent session's data, but also the max weight
    // First, let's get the max weight set
    const maxWeightSet = allSetsWithName.reduce((prev, current) =>
      prev.weight > current.weight ? prev : current,
    );

    // Now get the most recent set (highest timestamp/date)
    const sessionIds = [...new Set(allSetsWithName.map((s) => s.sessionId))];
    const sessions = await db.sessions.where("id").anyOf(sessionIds).toArray();
    // Sort by timestamp if available, fallback to date
    const sortedSessions = sessions.sort(
      (a, b) =>
        (b.timestamp || 0) - (a.timestamp || 0) || b.date.localeCompare(a.date),
    );

    const lastSession = sortedSessions[0];
    const lastSets = allSetsWithName.filter(
      (s) => s.sessionId === lastSession.id,
    );

    // Get the representative weight/reps from last time (e.g. max weight from last time)
    const lastMaxWeightSet = lastSets.reduce((prev, current) =>
      prev.weight > current.weight ? prev : current,
    );

    // Get full history grouped by session
    const exerciseIdsWithName = await db.exercises
      .where("name")
      .equals(exerciseName)
      .primaryKeys();
    const notesWithName = await db.exerciseNotes
      .where("exerciseId")
      .anyOf(exerciseIdsWithName)
      .toArray();

    const historyMap = new Map<
      string,
      { weight: number; reps: number; note?: string }[]
    >();
    allSetsWithName.forEach((s) => {
      const existing = historyMap.get(s.sessionId) || [];
      existing.push({ weight: s.weight, reps: s.reps, note: s.note });
      historyMap.set(s.sessionId, existing);
    });

    const history = sortedSessions
      .map((session) => {
        const sets = historyMap.get(session.id) || [];
        const exerciseNote = notesWithName.find(
          (n) => n.sessionId === session.id,
        );

        if (sets.length === 0 && !exerciseNote) return null;

        // Get the best set of that session
        const bestSet =
          sets.length > 0
            ? sets.reduce((prev, curr) =>
                curr.weight > prev.weight ? curr : prev,
              )
            : { weight: 0, reps: 0 };

        return {
          date: session.date,
          weight: bestSet.weight,
          reps: bestSet.reps,
          note: exerciseNote?.content || sets.find((s) => !!s.note)?.note, // Fallback to set note for old data
        };
      })
      .filter((h) => h !== null) as {
      date: string;
      weight: number;
      reps: number;
      note?: string;
    }[];

    const lastExerciseNote = notesWithName.find(
      (n) => n.sessionId === lastSession.id,
    );

    return {
      maxWeight: maxWeightSet.weight,
      lastWeight: lastMaxWeightSet.weight,
      lastReps: lastMaxWeightSet.reps,
      lastNote: history.find((h) => !!h.note)?.note,
      history,
      lastSets: lastSets.sort((a, b) => a.setIndex - b.setIndex),
    };
  }
}

export const programService = new ProgramService();
