import { lazy, Suspense, useEffect, useRef, useState } from "react";
import {
  CONTEST_DURATION,
  getContestKey,
  getContestTasks,
  reviewCauses,
  newAttempt,
  readAttempt,
} from "./contest";
import type { ContestKind } from "./contest";
import { assessmentKey, assessmentTasks } from "./assessments";
import type { Assessment, ContestTask } from "./assessments";
import KeyboardPaths from "./KeyboardPaths";
import { explainError, normalizeOutput, usePython } from "./usePython";

const CodeEditor = lazy(() => import("./CodeEditor"));
function loadAttempt(
  storageKey: string,
  tasks: ContestTask[],
  duration: number,
) {
  try {
    return {
      data: readAttempt(
        localStorage.getItem(storageKey),
        Date.now(),
        tasks,
        duration,
      ),
      warning: "",
    };
  } catch {
    return {
      data: null,
      warning:
        "Не удалось прочитать сохранение тура. Прогресс уроков не затронут. Можно начать новую попытку.",
    };
  }
}
export default function MockContest({
  kind = "practice",
  assessment,
}: {
  kind?: ContestKind;
  assessment?: Assessment;
}) {
  const storageKey = assessment
    ? assessmentKey(assessment.id)
    : getContestKey(kind);
  const duration = assessment ? assessment.minutes * 60000 : CONTEST_DURATION;
  const minutes = duration / 60000;
  const title =
    assessment?.title ??
    (kind === "final" ? "Генеральная репетиция" : "Тренировочный тур");
  const contestTasks = assessment
    ? assessmentTasks(assessment)
    : getContestTasks(kind);
  const isFinal = kind === "final";
  const [loaded] = useState(() =>
    loadAttempt(storageKey, contestTasks, duration),
  );
  const [attempt, setAttempt] = useState(loaded.data);
  const [warning, setWarning] = useState(loaded.warning);
  const [now, setNow] = useState(Date.now());
  const [confirm, setConfirm] = useState<"finish" | "restart" | null>(null);
  const [feedback, setFeedback] = useState("");
  const { execute, stop, status } = usePython();
  const busy = status !== "idle";
  const mounted = useRef(true);
  const current = useRef(attempt);
  current.current = attempt;
  const deadline = attempt ? attempt.startedAt + duration : 0;
  const finished = Boolean(
    attempt && (attempt.finishedAt !== null || now >= deadline),
  );
  const task = contestTasks[attempt?.selected ?? 0];
  const exercise = task.exercise;
  const code = attempt?.drafts[exercise.id] ?? exercise.starter;
  const input = attempt?.inputs[exercise.id] ?? exercise.sample.input;
  useEffect(() => {
    mounted.current = true;
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => {
      mounted.current = false;
      clearInterval(timer);
    };
  }, []);
  useEffect(() => {
    if (!attempt) return;
    try {
      localStorage.setItem(storageKey, JSON.stringify(attempt));
    } catch {
      setWarning(
        "Не удалось сохранить тур в браузере. Скачай результат перед закрытием страницы.",
      );
    }
  }, [attempt, storageKey]);
  useEffect(() => {
    if (attempt && attempt.finishedAt === null && now >= deadline) {
      stop();
      setAttempt((old) => (old ? { ...old, finishedAt: deadline } : old));
      setFeedback(
        "Время вышло. Новые решения больше не принимаются; код сохранён для разбора.",
      );
      setConfirm(null);
    }
  }, [now, deadline, attempt, stop]);
  const update = (field: "drafts" | "inputs", value: string) => {
    if (finished || busy) return;
    setAttempt((old) =>
      old ? { ...old, [field]: { ...old[field], [exercise.id]: value } } : old,
    );
    setFeedback("");
  };
  const begin = () => {
    stop();
    const started = newAttempt();
    if (
      assessment &&
      (attempt?.reviewed ||
        (attempt?.finishedAt !== null && attempt?.finishedAt !== undefined))
    )
      started.reviewed = true;
    setNow(started.startedAt);
    setAttempt(started);
    setFeedback("");
    setWarning("");
    setConfirm(null);
  };
  const finish = () => {
    stop();
    setAttempt((old) =>
      old
        ? {
            ...old,
            finishedAt: Math.min(Date.now(), old.startedAt + duration),
          }
        : old,
    );
    setFeedback("");
    setConfirm(null);
  };
  const download = () => {
    if (!attempt) return;
    const blob = new Blob(
      [
        JSON.stringify(
          { ...attempt, exportedAt: new Date().toISOString() },
          null,
          2,
        ),
      ],
      { type: "application/json" },
    );
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = assessment
      ? `olymp-${assessment.id}.json`
      : isFinal
        ? "olymp-final-tour.json"
        : "olymp-training-tour.json";
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  const run = async (check: boolean) => {
    if (
      !attempt ||
      busy ||
      attempt.finishedAt !== null ||
      Date.now() >= deadline
    )
      return;
    if (!code.trim()) {
      setFeedback("Напиши хотя бы одну команду.");
      return;
    }
    if (code.length > 100000 || input.length > 100000) {
      setFeedback("Слишком длинный код или ввод: предел — 100 000 символов.");
      return;
    }
    const startedAt = attempt.startedAt;
    setFeedback("");
    const results = await execute({
      code,
      inputs: check ? exercise.tests.map((item) => item.input) : [input],
    });
    if (
      !mounted.current ||
      current.current?.startedAt !== startedAt ||
      current.current.finishedAt !== null ||
      Date.now() >= deadline
    )
      return;
    const failure = results.findIndex(
      (result, index) =>
        result.error ||
        (check &&
          normalizeOutput(result.output) !==
            normalizeOutput(exercise.tests[index]?.expected ?? "")),
    );
    if (!check) {
      const result = results[0];
      setFeedback(
        result?.error
          ? explainError(result.error)
          : result?.output || "Программа завершилась без вывода.",
      );
    } else if (failure === -1 && results.length === exercise.tests.length) {
      const at = Date.now();
      setAttempt((old) =>
        old && old.finishedAt === null && at < old.startedAt + duration
          ? {
              ...old,
              accepted: {
                ...old.accepted,
                [exercise.id]: old.accepted[exercise.id] ?? { code, at },
              },
            }
          : old,
      );
      setFeedback(
        `Все проверки пройдены: ${results.length} из ${exercise.tests.length}. Задача зачтена в этом туре.`,
      );
    } else {
      const index = Math.max(0, failure);
      const result = results[index];
      setFeedback(
        result?.error
          ? explainError(result.error)
          : `Проверка ${index + 1}: ответ пока не совпал.\nВвод:\n${exercise.tests[index].input}\nОжидалось:\n${exercise.tests[index].expected}\nПолучилось:\n${result?.output ?? ""}`,
      );
    }
  };
  const score = Object.keys(attempt?.accepted ?? {}).length;
  const seconds = Math.max(0, Math.ceil((deadline - now) / 1000));
  const clock = `${Math.floor(seconds / 3600)
    .toString()
    .padStart(2, "0")}:${Math.floor((seconds / 60) % 60)
    .toString()
    .padStart(2, "0")}:${(seconds % 60).toString().padStart(2, "0")}`;
  return (
    <div className="page contest-page">
      <a
        className="back-link"
        href={assessment ? "#/assessments" : isFinal ? "#/week/8" : "#/week/7"}
      >
        {assessment
          ? "← К самостоятельным работам"
          : isFinal
            ? "← К восьмой неделе"
            : "← К седьмой неделе"}
      </a>
      <div className="eyebrow">
        {assessment
          ? "САМОСТОЯТЕЛЬНАЯ РАБОТА"
          : isFinal
            ? "ФИНАЛЬНАЯ РЕПЕТИЦИЯ"
            : "ПЕРВАЯ РЕПЕТИЦИЯ"}{" "}
        · {minutes} МИНУТ
      </div>
      <h1>{title}</h1>
      <p className="lead">
        {assessment
          ? attempt?.reviewed
            ? "Повторение варианта после разбора. Попробуй восстановить решения самостоятельно."
            : `${contestTasks.length === 2 ? "Две новые задачи" : "Шесть новых задач"} на изученные приёмы. Выбери способ решения самостоятельно.`
          : "Задачи A–E из основного маршрута и дополнительная F. Проверь, что можешь решить самостоятельно."}
      </p>
      {assessment && attempt?.reviewed && (
        <p className="assessment-note">
          Повторная попытка: эти задачи уже открывались для разбора. Результат
          показывает тренировку на знакомом варианте.
        </p>
      )}
      {warning && (
        <p className="storage-warning" role="alert">
          {warning}
        </p>
      )}
      {!attempt ? (
        <section className="contest-intro">
          <h2>Перед стартом</h2>
          <p>
            Отведи {minutes} минут. Таймер продолжит идти, если уйти со страницы
            или закрыть браузер. Подсказки и разборы откроются после завершения;
            во время тура не подглядывай в уроки.
          </p>
          <p>
            {assessment
              ? "Редакторы пустые. Условия не называют способ решения. Можно запускать код и проверять его сколько нужно; разборы доступны только после завершения всей работы. Повторная попытка после разбора уже считается тренировкой на знакомых задачах. "
              : isFinal
                ? "Редакторы пустые: ввод и решение напиши самостоятельно. Рисунки, схема клавиатуры и справочник слов доступны в условиях. Первый тур сохраняется отдельно. "
                : "В шаблонах оставлены ввод и справочные данные. "}
            {assessment
              ? "Это учебная самопроверка, не официальный вариант олимпиады. "
              : "Это учебная репетиция по материалам курса, не официальный тур. "}
            Зачёт — число задач, прошедших все учебные проверки, без частичных
            баллов. Прогресс уроков учитывается отдельно.
          </p>
          <button className="button primary" onClick={begin}>
            {assessment ? "Начать работу" : "Начать тур"} · {minutes} минут
          </button>
        </section>
      ) : (
        <>
          <div className="contest-toolbar">
            <strong
              className="contest-clock"
              role="timer"
              aria-label="Осталось времени"
            >
              {finished
                ? assessment
                  ? "Работа завершена"
                  : "Тур завершён"
                : clock}
            </strong>
            <span className="contest-score">
              Зачтено: {score} из {contestTasks.length}
            </span>
            <button className="button secondary" onClick={download}>
              {assessment
                ? "Скачать результат работы"
                : "Скачать результат тура"}
            </button>
            <button
              className="button secondary"
              disabled={busy}
              onClick={() => setConfirm(finished ? "restart" : "finish")}
            >
              {finished
                ? "Новая попытка"
                : assessment
                  ? "Завершить работу"
                  : "Завершить тур"}
            </button>
          </div>
          {confirm && (
            <div
              className="contest-confirm"
              role="group"
              aria-label="Подтверждение действия"
            >
              <p>
                {confirm === "finish"
                  ? "Завершить раньше? Отправки закроются, откроются разборы."
                  : "Новая попытка заменит этот тур и его черновики. Сначала скачай результат, если хочешь сохранить его."}
              </p>
              <button
                className="button primary"
                onClick={confirm === "finish" ? finish : begin}
              >
                {confirm === "finish" ? "Да, завершить" : "Заменить попытку"}
              </button>
              <button
                className="button secondary"
                onClick={() => setConfirm(null)}
              >
                Отмена
              </button>
            </div>
          )}
          {finished && (
            <section className="contest-summary" aria-label="Итоги тура">
              <h2>
                Результат: {score} из {contestTasks.length} задач
              </h2>
              <p>
                Сохранены решения, принятые до окончания времени. Выбери задачу
                ниже, сравни код с разбором и запиши причину затруднения:
                условие, алгоритм, ошибка в коде или нехватка времени.
              </p>
              <p>
                {assessment
                  ? "Последние черновики доступны для просмотра. После разбора можно начать новую попытку; она будет тренировкой на знакомых задачах. Перед заменой скачай результат. Ссылка под разбором ведёт к теме для повторения."
                  : "Последние черновики доступны для просмотра. Исправлять решения после тура можно в уроках."}
              </p>
            </section>
          )}
          <nav className="contest-task-nav" aria-label="Задачи тура">
            {contestTasks.map((item, index) => (
              <button
                key={item.letter}
                aria-pressed={index === attempt.selected}
                disabled={busy}
                onClick={() => {
                  stop();
                  setAttempt({ ...attempt, selected: index });
                  setFeedback("");
                }}
              >
                {item.letter}
                {attempt.accepted[item.exercise.id] ? " · зачтено" : ""}
              </button>
            ))}
          </nav>
          <section className="contest-statement">
            {task.letter === "F" && (
              <p className="route-note">
                <strong>Повышенная сложность · по желанию</strong>
                <br />
                Начни с понятных задач. F можно оставить на конец или отложить;
                она не блокирует основной маршрут курса.
              </p>
            )}
            <h2>
              {task.letter}. {exercise.title.replace(/^[A-F]\.\s*/, "")}
            </h2>
            <p>{exercise.prompt}</p>
            <p>
              <strong>Ввод:</strong> {exercise.inputHelp}
            </p>
            <div className="sample-grid">
              <div>
                <h3>Пример ввода</h3>
                <pre>{exercise.sample.input}</pre>
              </div>
              <div>
                <h3>Ожидаемый ответ</h3>
                <pre>{exercise.sample.expected}</pre>
              </div>
            </div>
            {task.lesson.referencePatterns && (
              <details className="font-reference">
                <summary>Шаблоны цифр из условия</summary>
                <div className="font-grid">
                  {Object.entries(task.lesson.referencePatterns).map(
                    ([digit, pattern]) => (
                      <figure key={digit}>
                        <figcaption>Цифра {digit}</figcaption>
                        <pre>{pattern}</pre>
                      </figure>
                    ),
                  )}
                </div>
              </details>
            )}
            {!assessment && isFinal && task.letter === "A" && <KeyboardPaths />}
            {task.lesson.referenceTable && (
              <details className="word-reference">
                <summary>Английские названия из условия</summary>
                <table>
                  <tbody>
                    {task.lesson.referenceTable.rows.map(([number, word]) => (
                      <tr key={number}>
                        <th scope="row">{number}</th>
                        <td>{word}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </details>
            )}
          </section>
          <section className="contest-workspace" aria-label="Редактор тура">
            <h2>Твоё решение</h2>
            {attempt.accepted[exercise.id] && (
              <p>
                Задача уже зачтена. Принятое решение сохранено отдельно от
                последующих изменений черновика.
              </p>
            )}
            <Suspense fallback={<p>Загрузка редактора…</p>}>
              <CodeEditor
                key={exercise.id}
                code={code}
                editable={!finished && !busy}
                onChange={(value) => update("drafts", value)}
              />
            </Suspense>
            <label className="contest-input">
              Входные данные
              <textarea
                aria-label="Входные данные"
                value={input}
                readOnly={finished || busy}
                onChange={(event) => update("inputs", event.target.value)}
              />
            </label>
            <div className="contest-actions">
              <button
                className="button secondary"
                disabled={finished || busy}
                onClick={() => void run(false)}
              >
                Запустить
              </button>
              <button
                className="button primary"
                disabled={finished || busy}
                onClick={() => void run(true)}
              >
                Проверить
              </button>
              {busy && (
                <button className="button secondary" onClick={() => stop()}>
                  Остановить
                </button>
              )}
            </div>
            <div className="contest-feedback" role="status" aria-busy={busy}>
              <pre>
                {busy
                  ? status === "loading"
                    ? "Загружается Python…"
                    : "Выполняется проверка…"
                  : feedback || "Результат запуска появится здесь."}
              </pre>
            </div>
          </section>
          {finished && (
            <section className="contest-review">
              <h2>
                {assessment ? "Разбор после работы" : "Разбор после тура"}
              </h2>
              <div className="review-journal">
                <h3>Мой разбор задачи {task.letter}</h3>
                <label>
                  Причина затруднения
                  <select
                    aria-label="Причина затруднения"
                    value={attempt.review?.[exercise.id]?.cause ?? ""}
                    onChange={(event) => {
                      const cause = event.target.value;
                      setAttempt((old) =>
                        old
                          ? {
                              ...old,
                              review: {
                                ...old.review,
                                [exercise.id]: {
                                  cause,
                                  plan: old.review?.[exercise.id]?.plan ?? "",
                                },
                              },
                            }
                          : old,
                      );
                    }}
                  >
                    <option value="" disabled>
                      Выбери причину
                    </option>
                    {reviewCauses.map((cause) => (
                      <option key={cause}>{cause}</option>
                    ))}
                  </select>
                </label>
                <label>
                  Что повторить и как проверить
                  <textarea
                    aria-label="Что повторить и как проверить"
                    maxLength={2000}
                    value={attempt.review?.[exercise.id]?.plan ?? ""}
                    disabled={!attempt.review?.[exercise.id]?.cause}
                    placeholder={
                      assessment
                        ? "Например: повторить границы цикла и проверить случай без элементов."
                        : "Например: разобрать нулевые количества и проверить перестановки цветов."
                    }
                    onChange={(event) => {
                      const plan = event.target.value;
                      setAttempt((old) =>
                        old && old.review?.[exercise.id]
                          ? {
                              ...old,
                              review: {
                                ...old.review,
                                [exercise.id]: {
                                  ...old.review[exercise.id],
                                  plan,
                                },
                              },
                            }
                          : old,
                      );
                    }}
                  />
                </label>
                <p className="small">
                  Сначала выбери причину. Заметка сохраняется в этом браузере
                  вместе с попыткой и включается в скачанный результат. Это твой
                  план повторения, а не дополнительная отметка.
                </p>
              </div>
              <p>{exercise.explanation}</p>
              <details>
                <summary>Подсказки по шагам</summary>
                <ol>
                  {exercise.hints.map((hint) => (
                    <li key={hint}>{hint}</li>
                  ))}
                </ol>
              </details>
              <details>
                <summary>Посмотреть решение</summary>
                <pre className="code-example">{exercise.solution}</pre>
              </details>
              {attempt.accepted[exercise.id] && (
                <details>
                  <summary>Моё принятое решение</summary>
                  <pre className="code-example">
                    {attempt.accepted[exercise.id].code}
                  </pre>
                </details>
              )}
              <a
                className="button secondary"
                href={`#/lesson/${task.lesson.id}`}
              >
                Повторить тему в уроке
              </a>
            </section>
          )}
        </>
      )}
    </div>
  );
}
