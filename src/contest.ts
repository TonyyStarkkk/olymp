import { lessons } from "./course.ts";

export const CONTEST_KEY = "olymp-contest-v1";
export const FINAL_CONTEST_KEY = "olymp-final-contest-v1";
export type ContestKind = "practice" | "final";
export const getContestKey = (kind: ContestKind) =>
  kind === "final" ? FINAL_CONTEST_KEY : CONTEST_KEY;
export const CONTEST_DURATION = 180 * 60 * 1000;
export const contestTasks = [
  "passwords",
  "bytes",
  "cubes",
  "font",
  "years",
  "viral",
].map((id, index) => {
  const lesson = lessons.find((item) => item.id === id)!;
  const exercise = lesson.exercises[2];
  return {
    letter: "ABCDEF"[index],
    lesson,
    exercise: {
      ...exercise,
      prompt: exercise.prompt.replace("во вкладке «Разобраться»", "ниже"),
      starter: exercise.starter
        .split("\n")
        .filter((line) => !line.trim().startsWith("#"))
        .join("\n"),
    },
  };
});
export const finalContestTasks = contestTasks.map((task) => ({
  ...task,
  exercise: {
    ...task.exercise,
    starter: "",
    prompt: task.exercise.prompt.replace(
      "Все буквенные ряды и диагонали длины хотя бы 2 даны в шаблоне.",
      "Буквенная клавиатура и примеры направлений показаны на схеме ниже.",
    ),
  },
}));
export const getContestTasks = (kind: ContestKind) =>
  kind === "final" ? finalContestTasks : contestTasks;
export const reviewCauses = [
  "Без затруднений",
  "Не понял условие",
  "Не нашёл алгоритм",
  "Ошибка в коде",
  "Не хватило времени",
];
export type ContestAttempt = {
  version: 1;
  startedAt: number;
  finishedAt: number | null;
  selected: number;
  drafts: Record<string, string>;
  inputs: Record<string, string>;
  accepted: Record<string, { code: string; at: number }>;
  review?: Record<string, { cause: string; plan: string }>;
};
export function newAttempt(now = Date.now()): ContestAttempt {
  return {
    version: 1,
    startedAt: now,
    finishedAt: null,
    selected: 0,
    drafts: {},
    inputs: {},
    accepted: {},
  };
}
export function readAttempt(
  raw: string | null,
  now = Date.now(),
): ContestAttempt | null {
  if (!raw) return null;
  const parsed = JSON.parse(raw);
  if (
    !parsed ||
    parsed.version !== 1 ||
    !Number.isSafeInteger(parsed.startedAt) ||
    parsed.startedAt < 0 ||
    parsed.startedAt > now
  )
    throw new Error("Invalid contest start");
  const data = newAttempt(parsed.startedAt);
  const deadline = data.startedAt + CONTEST_DURATION;
  if (
    parsed.finishedAt !== null &&
    (!Number.isSafeInteger(parsed.finishedAt) ||
      parsed.finishedAt < data.startedAt ||
      parsed.finishedAt > Math.min(now, deadline))
  )
    throw new Error("Invalid contest finish");
  data.finishedAt = parsed.finishedAt ?? (now >= deadline ? deadline : null);
  data.selected =
    Number.isInteger(parsed.selected) &&
    parsed.selected >= 0 &&
    parsed.selected < contestTasks.length
      ? parsed.selected
      : 0;
  for (const {
    exercise: { id },
  } of contestTasks) {
    for (const field of ["drafts", "inputs"] as const) {
      if (typeof parsed[field]?.[id] === "string")
        data[field][id] = parsed[field][id].slice(0, 100000);
    }
    const accepted = parsed.accepted?.[id];
    if (
      accepted &&
      typeof accepted.code === "string" &&
      Number.isSafeInteger(accepted.at) &&
      accepted.at >= data.startedAt &&
      accepted.at < deadline &&
      accepted.at <= (data.finishedAt ?? now)
    ) {
      data.accepted[id] = {
        code: accepted.code.slice(0, 100000),
        at: accepted.at,
      };
    }
    const review = parsed.review?.[id];
    if (
      data.finishedAt !== null &&
      review &&
      reviewCauses.includes(review.cause) &&
      typeof review.plan === "string"
    ) {
      data.review ??= {};
      data.review[id] = {
        cause: review.cause,
        plan: review.plan.slice(0, 2000),
      };
    }
  }
  return data;
}
