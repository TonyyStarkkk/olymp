import {
  coreLessons,
  coreExercises,
  advancedExerciseIds,
  coreLessonComplete,
  routeStats,
  weeklyRhythm,
} from "./learning-route";
import type { Progress } from "./storage";
export function WeekRhythm({ week }: { week: number }) {
  const rhythm = weeklyRhythm[week - 1];
  return (
    <section className="route-note">
      <h2>Ритм этой недели</h2>
      <p>{rhythm.practice}</p>
      <p>
        Время уроков — ориентир. Можно остановиться после небольшого шага и
        продолжить с сохранённого кода. Дополнительные упражнения и исправление
        ошибок тоже требуют времени.
      </p>
      <a href="#/plan">Как распределить занятия и отдых →</a>
    </section>
  );
}
export default function StudyPlan({ progress }: { progress: Progress }) {
  const stats = routeStats(progress);
  return (
    <div className="page narrow-page">
      <a className="back-link" href="#/">
        ← К обучению
      </a>
      <div className="eyebrow">ДВА МЕСЯЦА ПОДГОТОВКИ</div>
      <h1>Маршрут и ритм</h1>
      <p className="lead">
        Сначала закрепи базу. Сложные задачи можно отложить и вернуться к ним
        позже.
      </p>
      <section className="route-note">
        <h2>Основной маршрут: {stats.percent}%</h2>
        <p>
          {
            coreLessons.filter((lesson) => coreLessonComplete(progress, lesson))
              .length
          }{" "}
          из {coreLessons.length} занятий · {stats.solved} из{" "}
          {coreExercises.length} задач.
        </p>
        <p>
          Префиксы, полная задача F и упражнение на её повторение не входят в
          этот процент. Повышенная сложность: {stats.advancedSolved} из{" "}
          {advancedExerciseIds.size} задач. Все прежние решения учитываются.
        </p>
        <p>
          Пройденный маршрут означает выполненные упражнения. Готовность к новой
          задаче проверяй в самостоятельных работах.
        </p>
      </section>
      <section className="route-note">
        <h2>Обычная неделя</h2>
        <ul>
          <li>
            Понедельник–пятница: по одному занятию. Если оно большое, раздели на
            два блока по 25–30 минут с перерывом 5–10 минут.
          </li>
          <li>
            Первые 5 минут занятия: без подсказки восстанови небольшой пример из
            прошлого урока.
          </li>
          <li>
            Суббота: самостоятельная работа на 30 минут и 15–20 минут на разбор.
            Оставь запасной блок на незаконченный урок.
          </li>
          <li>
            Воскресенье: отдых. Не нужно догонять весь план за один вечер.
          </li>
        </ul>
        <p>
          Для начала зарезервируй около 5–7 часов в неделю вместе с повторением
          и запасом. Это планирование, не норматив скорости. После первой недели
          подстрой нагрузку под себя.
        </p>
      </section>
      <section className="route-note">
        <h2>Если не укладываешься</h2>
        <p>
          Сохрани незаконченный код и запиши, на каком шаге остановился. На
          следующем занятии начни с него. Если 15–20 минут нет продвижения,
          возьми подсказку, проверь короткий пример или вернись к нужному
          объяснению.
        </p>
        <p>
          Не пропускай непонятную базу ради календаря. Сначала убери
          дополнительные занятия с F, затем лишний повторный тур. Можно
          перенести трудную задачу на запасной блок. Медленный первый раз не
          означает, что ты не способен научиться.
        </p>
      </section>
      <section className="route-note">
        <h2>Недели с туром</h2>
        <p>
          На 7-й и 8-й неделях выдели отдельный день на одну попытку в 180 минут
          и время на разбор. В этот день не добавляй обычное занятие. Ориентир
          на неделю — 6–8 часов с учётом тура; сложные дополнительные задачи —
          только при наличии сил и времени.
        </p>
        <p>
          На последней неделе выбери знакомую генеральную репетицию или новый
          итоговый вариант. Второй тур по желанию, не обязательная часть
          маршрута. В обоих вариантах сложную задачу F можно оставить на конец
          или не решать.
        </p>
      </section>
      <div className="assessment-list">
        {weeklyRhythm.map((rhythm, index) => (
          <section className="assessment-card" key={rhythm.focus}>
            <h2>
              Неделя {index + 1}: {rhythm.focus}
            </h2>
            <p>{rhythm.practice}</p>
            <a className="button secondary" href={`#/week/${index + 1}`}>
              Открыть неделю {index + 1}
            </a>
          </section>
        ))}
      </div>
      <section className="route-note">
        <h2>Повышенная сложность: вернуться позже</h2>
        <p>
          Если уверенно работаешь со строками, множествами и вложенными циклами,
          начни с префиксов. Перед полной F выполни короткие шаги на выбор места
          изменения, построение кандидата и сравнение вариантов.
        </p>
        <a className="button secondary" href="#/lesson/prefixes">
          Подготовка к F: префиксы
        </a>{" "}
        <a className="button secondary" href="#/lesson/viral">
          Полная задача F
        </a>
      </section>
    </div>
  );
}
