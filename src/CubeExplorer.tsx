import { useState } from "react";
import { buildCubeChain } from "./cube-chain";

const colors = ["R — красные", "G — зелёные", "B — синие"];
const letters = ["R", "G", "B"];
const examples = [
  [0, 2, 2],
  [5, 3, 4],
  [1, 0, 4],
  [0, 0, 0],
];

export default function CubeExplorer() {
  const [counts, setCounts] = useState([5, 2, 0]);
  const chain = buildCubeChain(counts);
  const total = counts.reduce((sum, count) => sum + count, 0);
  const largest = Math.max(...counts);
  const others = total - largest;
  const remaining = counts.map(
    (count, color) => count - chain.filter((item) => item === color).length,
  );

  return (
    <section className="cube-explorer" aria-label="Собери цепочку кубиков">
      <h2>Проверь на кубиках</h2>
      <p>
        Измени запас каждого цвета от 0 до 6. Буквы обозначают цвета: одинаковые
        буквы рядом стоять не могут.
      </p>
      <div className="cube-controls">
        {colors.map((label, color) => (
          <label key={label}>
            <span>
              {label}: {counts[color]}
            </span>
            <input
              type="range"
              min="0"
              max="6"
              step="1"
              aria-label={label}
              value={counts[color]}
              onChange={(event) =>
                setCounts(
                  counts.map((count, index) =>
                    index === color ? Number(event.target.value) : count,
                  ),
                )
              }
            />
          </label>
        ))}
      </div>
      <div className="cube-presets" aria-label="Примеры запасов">
        {examples.map((example) => (
          <button
            type="button"
            key={example.join(",")}
            onClick={() => setCounts([...example])}
          >
            {example.join(" / ")}
          </button>
        ))}
      </div>
      <div className="cube-result" aria-live="polite" aria-atomic="true">
        <p>
          <strong>Максимальная длина: {chain.length}</strong>
        </p>
        {chain.length > 0 ? (
          <div
            className="cube-chain"
            role="list"
            aria-label="Пример самой длинной цепочки"
          >
            {chain.map((color, index) => (
              <span className="cube-piece" role="listitem" key={index}>
                {letters[color]}
              </span>
            ))}
          </div>
        ) : (
          <p>Кубиков нет — цепочка пустая.</p>
        )}
        <p className="cube-remaining">
          Осталось в коробке: R — {remaining[0]}, G — {remaining[1]}, B —{" "}
          {remaining[2]}.
        </p>
        <p>
          Всего {total}. Самая большая группа — {largest}, остальные — {others}.{" "}
          Предел по разделителям: 2 × {others} + 1 = {2 * others + 1}.
        </p>
        <p>
          {largest > others + 1
            ? "Разделителей не хватает: лишние кубики самого частого цвета придётся оставить."
            : "Все кубики помещаются. Длина ограничена общим запасом."}
        </p>
      </div>
      <p className="small">
        Показан один из возможных порядков. В олимпиадной задаче нужен только
        ответ числом; для миллиардов кубиков саму цепочку строить не нужно.
      </p>
    </section>
  );
}
