import { useState } from "react";
import {
  MICRO_KEY,
  initialAnswers,
  microMatches,
  microComplete,
  parseMicroProgress,
} from "./micro-exercises";
import type { MicroExercise, MicroAttempt } from "./micro-exercises";

export default function MicroPractice({ task }: { task: MicroExercise }) {
  const [loaded] = useState(() => {
    try {
      return {
        data: parseMicroProgress(localStorage.getItem(MICRO_KEY))[task.id],
        warning: "",
      };
    } catch {
      return {
        data: undefined,
        warning:
          "Не удалось прочитать сохранение коротких упражнений. Можно выполнить этот шаг заново; уроки сохранены отдельно.",
      };
    }
  });
  const [attempt, setAttempt] = useState<MicroAttempt>(
    loaded.data ?? {
      answers: initialAnswers(task),
      checked: false,
      revealed: false,
    },
  );
  const [warning, setWarning] = useState(loaded.warning);
  const [showAnswer, setShowAnswer] = useState(false);
  const save = (next: MicroAttempt) => {
    setAttempt(next);
    try {
      let progress;
      try {
        progress = parseMicroProgress(localStorage.getItem(MICRO_KEY));
      } catch {
        progress = {};
      }
      localStorage.setItem(
        MICRO_KEY,
        JSON.stringify({ ...progress, [task.id]: next }),
      );
      setWarning("");
    } catch {
      setWarning(
        "Браузер не смог сохранить этот шаг. Не закрывай страницу до завершения занятия.",
      );
    }
  };
  const change = (answers: string[]) =>
    save({ ...attempt, answers, checked: false });
  const matches = microMatches(task, attempt.answers);
  const complete = microComplete(task, attempt);
  const move = (index: number, delta: number) => {
    const answers = [...attempt.answers];
    [answers[index], answers[index + delta]] = [
      answers[index + delta],
      answers[index],
    ];
    change(answers);
  };
  return (
    <section
      className="micro-practice"
      aria-labelledby={`${task.id}-title`}
      data-micro-id={task.id}
    >
      <span className="eyebrow">ПОПРОБУЙ СЕЙЧАС · 2–3 МИНУТЫ</span>
      <h3 id={`${task.id}-title`}>{task.title}</h3>
      <p>{task.prompt}</p>
      {task.code && (
        <pre className="code-example">
          <code>{task.code}</code>
        </pre>
      )}
      <form
        onSubmit={(event) => {
          event.preventDefault();
          save({ ...attempt, checked: true });
        }}
      >
        {task.kind === "fill" ? (
          <div className="micro-fields">
            {task.fields.map((field, index) => (
              <label key={field.label}>
                <span>{field.label}</span>
                <input
                  aria-label={field.label}
                  maxLength={150}
                  autoComplete="off"
                  spellCheck={false}
                  value={attempt.answers[index]}
                  aria-invalid={attempt.checked && !matches[index]}
                  onChange={(event) =>
                    change(
                      attempt.answers.map((value, i) =>
                        i === index ? event.target.value : value,
                      ),
                    )
                  }
                />
                {attempt.checked && (
                  <small>
                    {matches[index] ? "Верно" : "Проверь этот ответ"}
                  </small>
                )}
              </label>
            ))}
          </div>
        ) : (
          <ol className="micro-order">
            {attempt.answers.map((value, index) => (
              <li key={value}>
                <span>{task.steps[Number(value)]}</span>
                <div>
                  <button
                    type="button"
                    className="button secondary"
                    aria-label={`Шаг ${index + 1} вверх`}
                    disabled={index === 0}
                    onClick={() => move(index, -1)}
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    className="button secondary"
                    aria-label={`Шаг ${index + 1} вниз`}
                    disabled={index === attempt.answers.length - 1}
                    onClick={() => move(index, 1)}
                  >
                    ↓
                  </button>
                </div>
              </li>
            ))}
          </ol>
        )}
        <button className="button secondary" type="submit">
          Проверить шаг
        </button>
      </form>
      {attempt.checked && (
        <div className="micro-feedback" role="status">
          <strong>{complete ? "Шаг понятен." : "Пока не всё совпало."}</strong>{" "}
          {complete ? task.explanation : task.tip}
          {complete && attempt.revealed && (
            <p>
              Выполнено после открытия разбора. Это учебная разминка;
              самостоятельность проверяется в работе после недели.
            </p>
          )}
        </div>
      )}
      {attempt.checked && !complete && !showAnswer && (
        <button
          className="text-button"
          onClick={() => {
            save({ ...attempt, revealed: true });
            setShowAnswer(true);
          }}
        >
          Разобрать этот шаг
        </button>
      )}
      {showAnswer && (
        <div className="micro-feedback">
          <strong>Разбор</strong>
          <p>{task.explanation}</p>
          {task.kind === "fill" ? (
            <ul>
              {task.fields.map((field) => (
                <li key={field.label}>
                  {field.label}: <code>{field.answers[0]}</code>
                </li>
              ))}
            </ul>
          ) : (
            <ol>
              {task.steps.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
          )}
          <p>Исправь свои ответы и снова нажми «Проверить шаг».</p>
        </div>
      )}
      {warning && <p role="alert">{warning}</p>}
    </section>
  );
}
