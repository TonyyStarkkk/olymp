import { useState } from "react";

const rows = ["qwertyuiop", "asdfghjkl", "zxcvbnm"];
const examples = [
  {
    word: "qwe",
    allowed: true,
    explanation: "Горизонтально слева направо, без пропусков.",
  },
  {
    word: "tgb",
    allowed: true,
    explanation: "Прямая диагональ сверху вниз вправо.",
  },
  {
    word: "rdx",
    allowed: true,
    explanation: "Прямая диагональ сверху вниз влево.",
  },
  {
    word: "gb",
    allowed: true,
    explanation: "Можно начать в середине диагонали tgb.",
  },
  {
    word: "edfv",
    allowed: false,
    explanation:
      "Направление меняется: сначала вниз, потом вправо, затем снова вниз. Это не одна прямая.",
  },
  {
    word: "ytrewq",
    allowed: false,
    explanation: "По горизонтали разрешено двигаться только слева направо.",
  },
  {
    word: "a",
    allowed: true,
    explanation:
      "Одна буква — один пароль. Её нельзя считать повторно за разные линии.",
  },
];

export default function KeyboardPaths() {
  const [selected, setSelected] = useState("qwe");
  const example = examples.find((item) => item.word === selected)!;
  return (
    <section className="keyboard-paths" aria-label="Маршруты по клавиатуре">
      <h2>Посмотри на маршрут</h2>
      <label>
        Пример маршрута
        <select
          value={selected}
          onChange={(event) => setSelected(event.target.value)}
        >
          {examples.map(({ word }) => (
            <option value={word} key={word}>
              {word}
            </option>
          ))}
        </select>
      </label>
      <svg
        viewBox="0 0 320 140"
        role="img"
        aria-label={`Клавиши слова ${example.word} выделены на схеме QWERTY`}
      >
        {rows.map((row, r) =>
          row.split("").map((letter, c) => {
            const active = example.word.includes(letter);
            const x = 7 + c * 30 + r * 15;
            const y = 8 + r * 44;
            return (
              <g key={letter}>
                <rect
                  x={x}
                  y={y}
                  width="26"
                  height="34"
                  rx="5"
                  fill={active ? "#e0e0e0" : "#ffffff"}
                  stroke={active ? "#111111" : "#cccccc"}
                  strokeWidth={active ? 2 : 1}
                />
                <text
                  x={x + 13}
                  y={y + 22}
                  textAnchor="middle"
                  fontSize="17"
                  fill="#111111"
                  fontWeight={active ? 700 : 400}
                >
                  {letter}
                </text>
              </g>
            );
          }),
        )}
      </svg>
      <div className="keyboard-explanation" aria-live="polite">
        <p className="keyboard-sequence">
          {example.word.split("").join(" → ")}
        </p>
        <strong>
          {example.allowed ? "Можно по условию" : "Не подходит по условию"}
        </strong>
        <p>{example.explanation}</p>
      </div>
      <p className="small">
        Схематично показаны только буквенные клавиши. Выбери другой пример,
        чтобы сравнить направления.
      </p>
    </section>
  );
}
