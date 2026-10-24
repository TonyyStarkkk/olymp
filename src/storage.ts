import { allExercises, lessons } from "./course";

export const STORAGE_KEY = "olymp-learning-v1";
export type Progress = {
  version: 1;
  drafts: Record<string, string>;
  inputs: Record<string, string>;
  hints: Record<string, number>;
  solutions: string[];
  solved: Record<string, { helped: boolean; at: string }>;
  quizzes: Record<string, boolean>;
  lastExercise: string;
};
export function emptyProgress(): Progress {
  return {
    version: 1,
    drafts: {},
    inputs: {},
    hints: {},
    solutions: [],
    solved: {},
    quizzes: {},
    lastExercise: "hello-1",
  };
}
export function loadProgress(): { data: Progress; warning: string } {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { data: emptyProgress(), warning: "" };
    const parsed = JSON.parse(raw);
    if (!parsed || parsed.version !== 1) throw new Error("Invalid progress");
    const data = emptyProgress();
    for (const { id } of allExercises) {
      for (const field of ["drafts", "inputs"] as const) {
        if (typeof parsed[field]?.[id] === "string")
          data[field][id] = parsed[field][id].slice(0, 100000);
      }
      if (Number.isInteger(parsed.hints?.[id]))
        data.hints[id] = Math.max(0, Math.min(3, parsed.hints[id]));
      if (Array.isArray(parsed.solutions) && parsed.solutions.includes(id))
        data.solutions.push(id);
      const result = parsed.solved?.[id];
      if (
        result &&
        typeof result.helped === "boolean" &&
        typeof result.at === "string"
      )
        data.solved[id] = { helped: result.helped, at: result.at };
    }
    for (const { id } of lessons)
      if (parsed.quizzes?.[id] === true) data.quizzes[id] = true;
    if (allExercises.some((x) => x.id === parsed.lastExercise))
      data.lastExercise = parsed.lastExercise;
    return { data, warning: "" };
  } catch {
    return {
      data: emptyProgress(),
      warning:
        "Не удалось прочитать сохранённый прогресс. Можно продолжать, но старые результаты сейчас недоступны.",
    };
  }
}

export function lessonComplete(progress: Progress, id: string) {
  const lesson = lessons.find((x) => x.id === id);
  return Boolean(
    lesson &&
    progress.quizzes[id] &&
    lesson.exercises.every((task) => progress.solved[task.id]),
  );
}
