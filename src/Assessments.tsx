import type { MicroProgress } from "./micro-exercises";
import { useState } from "react";
import { assessments, assessmentKey, assessmentTasks } from "./assessments";
import { readAttempt } from "./contest";
import {
  MICRO_KEY,
  microExercises,
  microComplete,
  parseMicroProgress,
} from "./micro-exercises";

export default function Assessments() {
  const [snapshot] = useState(() => {
    const warnings: string[] = [];
    const results = assessments.map((assessment) => {
      try {
        return readAttempt(
          localStorage.getItem(assessmentKey(assessment.id)),
          Date.now(),
          assessmentTasks(assessment),
          assessment.minutes * 60000,
        );
      } catch {
        warnings.push(assessment.title);
        return null;
      }
    });
    let micro: MicroProgress = {};
    try {
      micro = parseMicroProgress(localStorage.getItem(MICRO_KEY));
    } catch {
      warnings.push("Короткие упражнения");
    }
    return { results, warnings, micro };
  });
  const complete = microExercises.filter((task) =>
    microComplete(task, snapshot.micro[task.id]),
  ).length;
  return (
    <div className="page narrow-page">
      <a className="back-link" href="#/">
        ← К обучению
      </a>
      <div className="eyebrow">ОТ ПРИМЕРА К СВОЕМУ РЕШЕНИЮ</div>
      <h1>Самостоятельные работы</h1>
      <p className="lead">
        Новые условия на уже изученные приёмы. Здесь нужно самому выбрать способ
        решения.
      </p>
      <p>
        После каждой недели — две задачи на 30 минут. После курса — шесть задач
        на 180 минут. Это ориентир для отдельной попытки: если времени не
        хватило, разберись с трудностью и потренируйся ещё. Переход к следующим
        урокам остаётся свободным.
      </p>
      <p>
        Подсказки и решения доступны после завершения всей работы. Проверять
        свой код можно во время попытки. Результаты сохраняются отдельно от 40
        уроков и двух туров по знакомым A–F.
      </p>
      <div className="outcome-card">
        <div>
          <h2>Короткие шаги в уроках</h2>
          <p>
            Выполнено {complete} из {microExercises.length}. Это упражнения на
            понимание между объяснениями: значения переменных, пропущенные
            выражения и порядок действий. Они не заменяют самостоятельную
            работу.
          </p>
        </div>
      </div>
      {snapshot.warnings.length > 0 && (
        <p className="storage-warning" role="alert">
          Не удалось прочитать: {snapshot.warnings.join(", ")}. Эти результаты
          сейчас недоступны; сохранения уроков отдельные.
        </p>
      )}
      <div className="assessment-list">
        {assessments.map((assessment, index) => {
          const attempt = snapshot.results[index];
          const finished = attempt?.finishedAt != null;
          return (
            <section className="assessment-card" key={assessment.id}>
              <h2>{assessment.title}</h2>
              <p>
                {assessment.tasks.length}{" "}
                {assessment.tasks.length === 2 ? "задачи" : "задач"} ·{" "}
                {assessment.minutes} минут · после {assessment.week}-й недели
              </p>
              <p>
                {!attempt
                  ? "Ещё не начата"
                  : `${finished ? "Завершена" : "Попытка идёт"}: зачтено ${Object.keys(attempt.accepted).length} из ${assessment.tasks.length}`}
              </p>
              {attempt?.reviewed && (
                <p>Повторная тренировка на знакомых задачах.</p>
              )}
              <a
                className="button primary"
                href={`#/assessment/${assessment.id}`}
              >
                {!attempt
                  ? "Посмотреть правила"
                  : finished
                    ? "Результат и разбор"
                    : "Продолжить работу"}
              </a>
              <a className="back-link" href={`#/week/${assessment.week}`}>
                К урокам недели
              </a>
            </section>
          );
        })}
      </div>
    </div>
  );
}
