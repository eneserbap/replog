export interface PlannedSet {
  reps: number;
  weight: number;
}

export interface ProgramEntity {
  id: string;
  name: string;
  createdAt: number;
}

export interface ProgramDayEntity {
  id: string;
  programId: string;
  name: string;
  order: number;
}

export interface ProgramExerciseEntity {
  id: string;
  dayId: string;
  name: string;
  order: number;
  plannedSets: PlannedSet[];
}

export interface LogSessionEntity {
  id: string;
  programDayId: string;
  date: string; // YYYY-MM-DD
  startTime: number;
  timestamp: number; // For micro-ordering within a day
}

export interface LogSetEntity {
  id: string;
  sessionId: string;
  exerciseId: string;
  setIndex: number;
  weight: number;
  reps: number;
  note?: string; // Kept for backward compatibility but moving to ExerciseNote
}

export interface ExerciseNoteEntity {
  id: string;
  sessionId: string;
  exerciseId: string;
  content: string;
}
