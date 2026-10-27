import { lessons } from "./course.ts";
import type { Lesson } from "./course";
import type { Progress } from "./storage";

export const advancedLessonIds = new Set(["prefixes", "viral"]);
export const advancedExerciseIds = new Set([
  ...lessons
    .filter((lesson) => advancedLessonIds.has(lesson.id))
    .flatMap((lesson) => lesson.exercises.map((task) => task.id)),
  "review-olympiad-3",
]);
export const coreLessons = lessons.filter(
  (lesson) => !advancedLessonIds.has(lesson.id),
);
export const coreExercises = coreLessons.flatMap((lesson) =>
  lesson.exercises.filter((task) => !advancedExerciseIds.has(task.id)),
);
export function coreLessonComplete(progress: Progress, lesson: Lesson) {
  return (
    !advancedLessonIds.has(lesson.id) &&
    Boolean(progress.quizzes[lesson.id]) &&
    lesson.exercises
      .filter((task) => !advancedExerciseIds.has(task.id))
      .every((task) => progress.solved[task.id])
  );
}
export function routeStats(progress: Progress) {
  const solved = coreExercises.filter(
    (task) => progress.solved[task.id],
  ).length;
  const quizzes = coreLessons.filter(
    (lesson) => progress.quizzes[lesson.id],
  ).length;
  const checkpoints = coreExercises.length + coreLessons.length;
  return {
    solved,
    quizzes,
    percent: Math.round((100 * (solved + quizzes)) / checkpoints),
    complete: solved + quizzes === checkpoints,
    advancedSolved: [...advancedExerciseIds].filter((id) => progress.solved[id])
      .length,
  };
}
export function resumeCoreLesson(progress: Progress) {
  const last = coreLessons.find((lesson) =>
    lesson.exercises.some(
      (task) =>
        task.id === progress.lastExercise && !advancedExerciseIds.has(task.id),
    ),
  );
  if (last && !coreLessonComplete(progress, last)) return last;
  return (
    coreLessons.find((lesson) => !coreLessonComplete(progress, lesson)) ??
    coreLessons[coreLessons.length - 1]
  );
}
export function nextCoreLesson(lesson: Lesson) {
  return lessons
    .slice(lessons.indexOf(lesson) + 1)
    .find((next) => !advancedLessonIds.has(next.id));
}
export const weeklyRhythm = [
  {
    focus: "Ввод, числа и арифметика",
    practice:
      "Объясни вслух, что читается, что вычисляется и что выводится. Повтори // и % на другом примере.",
  },
  {
    focus: "Условия и первые этапы D",
    practice:
      "Проверяй значения на границе условия. Задачу D раздели на 2–3 подхода: по две новые цифры за этап, с перерывом после проверки.",
  },
  {
    focus: "Циклы, сумма и единицы памяти",
    practice:
      "Заполни таблицу двух проходов цикла. Если путаешь сумму и счётчик, потрать запасной блок на них, прежде чем продолжать B.",
  },
  {
    focus: "Строки, списки, словари и годы",
    practice:
      "Потренируй индексы на короткой строке, затем переходи к сборке слов. Таблицы английских слов можно брать из условия.",
  },
  {
    focus: "Перебор и разные варианты",
    practice:
      "Выпиши маленький набор вручную и сверь с программой. Повтори различие между количеством позиций и количеством разных строк.",
  },
  {
    focus: "Границы, формулы и кубики",
    practice:
      "Проверь нулевой запас и один цвет. Если формула пока непонятна, вернись к маленьким цепочкам и разделителям.",
  },
  {
    focus: "Множества, небольшой поиск и первый тур",
    practice:
      "В основном маршруте — уроки 31, 32 и 35. Префиксы и полная F — отдельное усложнение. Выдели один день на первый тур вместо обычного занятия; F можно отложить.",
  },
  {
    focus: "Повторение и одна итоговая попытка",
    practice:
      "Выбери одну репетицию: знакомые A–F или новый итоговый вариант. Не ставь оба трёхчасовых тура подряд. Повторную попытку оставь на свободное время после разбора.",
  },
];
