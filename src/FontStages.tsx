import { useState } from "react";
import {
  fontStages,
  FONT_STAGES_KEY,
  parseFontStages,
  emptyFontStages,
  acceptFontStage,
} from "./font-stages";
import { digitPatterns } from "./font-patterns";
import type { FontStageState } from "./font-stages";
export function useFontStages(enabled: boolean) {
  const [loaded] = useState(() => {
    try {
      return {
        data: enabled
          ? parseFontStages(localStorage.getItem(FONT_STAGES_KEY))
          : emptyFontStages(),
        warning: "",
      };
    } catch {
      return {
        data: emptyFontStages(),
        warning:
          "Не удалось прочитать этапы D. Черновик задания хранится отдельно и остаётся в редакторе.",
      };
    }
  });
  const [state, setState] = useState(loaded.data);
  const [warning, setWarning] = useState(loaded.warning);
  const save = (next: FontStageState) => {
    setState(next);
    try {
      localStorage.setItem(FONT_STAGES_KEY, JSON.stringify(next));
      setWarning("");
    } catch {
      setWarning(
        "Браузер не смог сохранить этапы. Не закрывай страницу; сохрани свой код отдельно.",
      );
    }
  };
  return {
    state,
    warning,
    select: (selected: number) => save({ ...state, selected }),
    accept: (stage: number, code: string) =>
      save(acceptFontStage(state, stage, code)),
  };
}
export default function FontStages({
  state,
  warning,
  select,
  onCheck,
  busy,
  code,
  alreadySolved,
}: {
  state: FontStageState;
  warning: string;
  select: (index: number) => void;
  onCheck: (index: number) => void;
  busy: boolean;
  code: string;
  alreadySolved: boolean;
}) {
  const stage = fontStages[state.selected];
  const accepted = state.passed[state.selected];
  return (
    <section className="font-stages" aria-label="Этапы задачи D">
      <h3>D по шагам: две новые цифры за раз</h3>
      <p>
        Не нужно писать все десять ветвей за один подход. Код общий для всех
        этапов и сохраняется автоматически. После успешной проверки можно
        сделать перерыв.
      </p>
      {alreadySolved && (
        <p className="font-complete-note">
          Полная D уже зачтена. Можно использовать этапы для повторения; прежний
          результат сохраняется.
        </p>
      )}
      <nav aria-label="Выбор этапа D">
        {fontStages.map((item, i) => (
          <button
            className="button secondary"
            key={item.title}
            disabled={busy}
            aria-pressed={state.selected === i}
            onClick={() => select(i)}
          >
            Этап {i + 1}
            {state.passed[i] ? " ✓" : ""}
          </button>
        ))}
      </nav>
      <h4>{stage.title}</h4>
      <p>
        Проверяем цифры: {stage.digits.join(", ")}. Добавляй новые ветви к
        прежнему коду — предыдущие рисунки тоже должны работать.
      </p>
      <details>
        <summary>Рисунки для этого шага</summary>
        <div className="font-grid">
          {stage.added.map((digit) => (
            <figure key={digit}>
              <figcaption>Цифра {digit}</figcaption>
              <pre>{digitPatterns[digit]}</pre>
            </figure>
          ))}
        </div>
      </details>
      <button
        className="button secondary"
        disabled={busy}
        onClick={() => onCheck(state.selected)}
      >
        Проверить этап {state.selected + 1}
      </button>
      {accepted && (
        <p role="status">
          Этап {state.selected + 1} пройден.
          {accepted.code !== code
            ? " Код после проверки изменён — проверь его снова перед продолжением."
            : " Можно продолжать или вернуться позже."}
        </p>
      )}
      {accepted && state.selected < fontStages.length - 1 && (
        <button
          className="text-button"
          disabled={busy}
          onClick={() => select(state.selected + 1)}
        >
          К следующему этапу
        </button>
      )}
      {accepted && (
        <details>
          <summary>Сохранённый код принятого этапа</summary>
          <pre className="code-example">{accepted.code}</pre>
          <p>
            Это твоя принятая версия. Текущий черновик остаётся в редакторе.
          </p>
        </details>
      )}
      <p className="small">
        Задача D целиком засчитывается только после всех десяти цифр. Кнопка
        «Проверить» под редактором всегда проверяет полное условие.
      </p>
      {warning && <p role="alert">{warning}</p>}
    </section>
  );
}
