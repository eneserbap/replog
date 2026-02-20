import Dexie, { Table } from "dexie";
import {
  ProgramEntity,
  ProgramDayEntity,
  ProgramExerciseEntity,
  LogSessionEntity,
  LogSetEntity,
  ExerciseNoteEntity,
} from "../domain/entities";

export class RepLogDatabase extends Dexie {
  programs!: Table<ProgramEntity>;
  days!: Table<ProgramDayEntity>;
  exercises!: Table<ProgramExerciseEntity>;
  sessions!: Table<LogSessionEntity>;
  sets!: Table<LogSetEntity>;
  exerciseNotes!: Table<ExerciseNoteEntity>;

  constructor() {
    super("RepLogDB_v2");

    // Version 5: Added composite index for sets to prevent duplication
    this.version(5).stores({
      programs: "id, name",
      days: "id, programId, order",
      exercises: "id, dayId, order, name",
      sessions: "id, programDayId, date, timestamp",
      sets: "id, sessionId, exerciseId, [sessionId+exerciseId+setIndex]",
      exerciseNotes: "id, sessionId, exerciseId, [sessionId+exerciseId]",
    });
  }
}

export const db = new RepLogDatabase();
