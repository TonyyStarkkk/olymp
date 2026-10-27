import StudyPlan, { WeekRhythm } from "./StudyPlan";
import FontStages, { useFontStages } from "./FontStages";
import { fontStages } from "./font-stages";
import {
  advancedLessonIds,
  advancedExerciseIds,
  coreLessons,
  coreExercises,
  coreLessonComplete,
  routeStats,
  resumeCoreLesson,
  nextCoreLesson,
} from "./learning-route";
import Assessments from "./Assessments";
import MicroPractice from "./MicroPractice";
import { assessments } from "./assessments";
import { microExercises } from "./micro-exercises";
import KeyboardPaths from "./KeyboardPaths";
import CubeExplorer from "./CubeExplorer";
import { lazy, Suspense, useEffect, useRef, useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import {
  ArrowDownToLine,
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  CheckCheck,
  ChevronRight,
  CircleHelp,
  Clock3,
  Code2,
  Flag,
  Lightbulb,
  LoaderCircle,
  Menu,
  Mountain,
  Play,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Square,
  Target,
  Terminal,
  Trophy,
  X,
} from "lucide-react";
import {
  lessons,
  weeks,
  allExercises,
  getWeekLessons,
  availableWeekNumbers,
} from "./course";
import type { Exercise, Lesson } from "./course";
import { lessonComplete, loadProgress, STORAGE_KEY } from "./storage";
import type { Progress } from "./storage";
import { explainError, normalizeOutput, usePython } from "./usePython";
import type { RunResult } from "./usePython";

type SetProgress = Dispatch<SetStateAction<Progress>>;
type View = {
  kind:
    | "home"
    | "progress"
    | "guide"
    | "week"
    | "lesson"
    | "contest"
    | "assessments"
    | "assessment"
    | "plan";
  id?: string;
};
function getView(): View {
  const parts = window.location.hash.replace(/^#\/?/, "").split("/");
  if (parts[0] === "lesson" && lessons.some((x) => x.id === parts[1]))
    return { kind: "lesson", id: parts[1] };
  if (parts[0] === "week" && /^[1-8]$/.test(parts[1]))
    return { kind: "week", id: parts[1] };
  if (parts[0] === "plan") return { kind: "plan" };
  if (parts[0] === "assessments") return { kind: "assessments" };
  if (
    parts[0] === "assessment" &&
    assessments.some((item) => item.id === parts[1])
  )
    return { kind: "assessment", id: parts[1] };
  if (parts[0] === "contest")
    return { kind: "contest", id: parts[1] === "final" ? "final" : "practice" };
  if (parts[0] === "progress" || parts[0] === "guide")
    return { kind: parts[0] };
  return { kind: "home" };
}
const CodeEditor = lazy(() => import("./CodeEditor"));
const MockContest = lazy(() => import("./MockContest"));

export default function App() {
  const [loaded] = useState(loadProgress);
  const [progress, setProgress] = useState(loaded.data);
  const [warning, setWarning] = useState(loaded.warning);
  const [view, setView] = useState(getView);
  const [drawer, setDrawer] = useState(false);
  const [toast, setToast] = useState("");
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    const handler = () => {
      setView(getView());
      setDrawer(false);
      window.scrollTo(0, 0);
    };
    window.addEventListener("hashchange", handler);
    return () => window.removeEventListener("hashchange", handler);
  }, []);
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    } catch {
      setWarning(
        "Браузер не смог сохранить прогресс. Не закрывай вкладку: скачай результаты в разделе «Мой прогресс».",
      );
    }
  }, [progress]);
  useEffect(
    () => () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
    },
    [],
  );
  const notify = (message: string) => {
    setToast(message);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(""), 4500);
  };
  const currentLesson = lessons.find((x) => x.id === view.id);
  const resumeLesson = resumeCoreLesson(progress);
  const coreStats = routeStats(progress);
  const activeWeek =
    view.kind === "week"
      ? Number(view.id)
      : (currentLesson?.week ?? resumeLesson.week);
  const percent = coreStats.percent;

  return (
    <div className="app-shell">
      {drawer && (
        <button
          className="drawer-backdrop"
          onClick={() => setDrawer(false)}
          aria-label="Закрыть меню"
        />
      )}
      <aside className={`sidebar ${drawer ? "open" : ""}`}>
        <a href="#/" className="brand" aria-label="Олимп — главная">
          <span className="brand-icon">
            <Mountain size={26} strokeWidth={2.4} />
          </span>
          <span>
            олимп<span className="brand-dot">.</span>
          </span>
        </a>
        <div className="course-label">ТВОЙ ПУТЬ В ПРОГРАММИРОВАНИЕ</div>
        <nav className="main-nav" aria-label="Главная навигация">
          <a
            href="#/"
            className={
              ["home", "lesson", "week"].includes(view.kind) ? "active" : ""
            }
          >
            <BookOpen size={19} />
            Моё обучение
            <ChevronRight size={15} className="nav-chevron" />
          </a>
          <a
            href="#/progress"
            className={view.kind === "progress" ? "active" : ""}
          >
            <Target size={19} />
            Мой прогресс
          </a>
          <a href="#/guide" className={view.kind === "guide" ? "active" : ""}>
            <Code2 size={19} />
            Памятка Python
          </a>
          <a
            href="#/contest"
            className={
              view.kind === "contest" && view.id === "practice" ? "active" : ""
            }
          >
            <Trophy size={19} />
            Тренировочный тур
          </a>
          <a
            href="#/contest/final"
            className={
              view.kind === "contest" && view.id === "final" ? "active" : ""
            }
          >
            <Flag size={19} />
            Генеральная репетиция
          </a>
          <a
            href="#/assessments"
            className={
              ["assessments", "assessment"].includes(view.kind) ? "active" : ""
            }
          >
            <CheckCheck size={19} />
            Самостоятельные работы
          </a>
          <a href="#/plan" className={view.kind === "plan" ? "active" : ""}>
            <BookOpen size={19} />
            Маршрут и ритм
          </a>
        </nav>
        <div className="sidebar-divider" />
        <div className="sidebar-caption">
          <span>ПЛАН ПОДГОТОВКИ</span>
          <span>8 НЕДЕЛЬ</span>
        </div>
        <nav className="week-nav" aria-label="Недели курса">
          {weeks.map((week, index) => (
            <a
              href={`#/week/${index + 1}`}
              key={week.title}
              className={
                activeWeek === index + 1 &&
                ["home", "week", "lesson"].includes(view.kind)
                  ? "selected"
                  : ""
              }
            >
              <span
                className={`week-number ${getWeekLessons(index + 1).length ? "available" : ""}`}
              >
                {getWeekLessons(index + 1).length > 0 &&
                coreLessons
                  .filter((lesson) => lesson.week === index + 1)
                  .every((lesson) => coreLessonComplete(progress, lesson)) ? (
                  <Check size={14} />
                ) : (
                  String(index + 1).padStart(2, "0")
                )}
              </span>
              <span>
                {week.title}
                {getWeekLessons(index + 1).length > 0 && (
                  <small>
                    {getWeekLessons(index + 1).length} занятий · доступны
                  </small>
                )}
              </span>
              {getWeekLessons(index + 1).length > 0 && (
                <span className="tiny-dot" />
              )}
            </a>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="side-progress-heading">
            <span>Основной маршрут</span>
            <strong>{percent}%</strong>
          </div>
          <div className="progress-track">
            <span style={{ width: `${percent}%` }} />
          </div>
          <p>
            {coreStats.solved} из {coreExercises.length} задач основного
            маршрута
          </p>
          <div className="student-tag">
            <span className="student-avatar">Я</span>
            <div>
              <strong>Будущий олимпиадник</strong>
              <small>9 класс · Python с нуля</small>
            </div>
          </div>
        </div>
      </aside>
      <div className="main-shell">
        <header className="topbar">
          <div className="topbar-left">
            <button
              className="icon-button mobile-menu"
              onClick={() => setDrawer(true)}
              aria-label="Открыть меню"
            >
              <Menu size={22} />
            </button>
            <span className="breadcrumb">Моё обучение</span>
            <ChevronRight size={14} />
            <strong>
              {view.kind === "plan"
                ? "Маршрут и ритм"
                : ["assessments", "assessment"].includes(view.kind)
                  ? "Самостоятельные работы"
                  : view.kind === "contest"
                    ? view.id === "final"
                      ? "Генеральная репетиция"
                      : "Тренировочный тур"
                    : view.kind === "progress"
                      ? "Мой прогресс"
                      : view.kind === "guide"
                        ? "Памятка Python"
                        : currentLesson
                          ? currentLesson.title
                          : "Python с нуля"}
            </strong>
          </div>
          <div className="topbar-right">
            <span className="course-chip">
              <span />
              Курс на 8 недель
            </span>
            <a href="#/guide" className="help-link">
              <CircleHelp size={19} />
              <span>Помощь</span>
            </a>
          </div>
        </header>
        {warning && (
          <div className="storage-warning" role="alert">
            {warning}
          </div>
        )}
        <main>
          {view.kind === "home" && (
            <Home progress={progress} resumeLesson={resumeLesson} />
          )}
          {view.kind === "week" && (
            <WeekOverview week={Number(view.id)} progress={progress} />
          )}
          {view.kind === "lesson" && currentLesson && (
            <LessonView
              key={currentLesson.id}
              lesson={currentLesson}
              progress={progress}
              setProgress={setProgress}
              notify={notify}
            />
          )}
          {view.kind === "progress" && (
            <ProgressView
              progress={progress}
              percent={percent}
              notify={notify}
            />
          )}
          {view.kind === "plan" && <StudyPlan progress={progress} />}
          {view.kind === "guide" && <Guide />}
          {view.kind === "assessments" && <Assessments />}
          {view.kind === "assessment" && (
            <Suspense fallback={<p className="page">Загрузка работы…</p>}>
              <MockContest
                key={view.id}
                assessment={assessments.find((item) => item.id === view.id)}
              />
            </Suspense>
          )}
          {view.kind === "contest" && (
            <Suspense fallback={<p className="page">Загрузка тура…</p>}>
              <MockContest
                key={view.id}
                kind={view.id === "final" ? "final" : "practice"}
              />
            </Suspense>
          )}
        </main>
        <footer className="page-footer">
          <span>
            <Mountain size={15} />
            Большие вершины начинаются с маленьких шагов.
          </span>
          <span>Python · практика · уверенность</span>
        </footer>
      </div>
      {toast && (
        <div className="toast" role="status">
          <Check size={18} />
          {toast}
        </div>
      )}
    </div>
  );
}

function Home({
  progress,
  resumeLesson,
}: {
  progress: Progress;
  resumeLesson: Lesson;
}) {
  const coreFinished = routeStats(progress).complete;
  const started =
    Object.keys(progress.drafts).length > 0 ||
    Object.keys(progress.solved).length > 0;
  return (
    <div className="page dashboard">
      <div className="page-heading">
        <div>
          <div className="eyebrow">ОТ ПЕРВОЙ СТРОКИ ДО ПЕРВОЙ ОЛИМПИАДЫ</div>
          <h1>
            Всё начинается с тебя<span className="green-dot">.</span>
          </h1>
          <p>
            Никаких знаний на старте. Только любопытство и немного практики.
          </p>
        </div>
        <span className="outline-badge">
          <Code2 size={15} />
          Python 3
        </span>
      </div>
      <section className="hero">
        <div className="hero-content">
          <span className="hero-tag">
            <Sparkles size={14} />
            ТВОЯ ПЕРВАЯ ВЕРШИНА
          </span>
          <h2>
            Сегодня — первая строка.
            <br />
            Дальше — больше.
          </h2>
          <p>
            Разбирайся в своём темпе, пробуй и ошибайся.
            <br className="desktop-break" />
            Мы подготовили понятный маршрут и подсказки.
          </p>
          <a
            className="button primary hero-cta"
            href={
              coreFinished
                ? "#/assessment/new-final"
                : `#/lesson/${resumeLesson.id}`
            }
          >
            {coreFinished
              ? "Перейти к итоговой проверке"
              : started
                ? "Продолжить обучение"
                : "Начать первый урок"}
            <ArrowRight size={18} />
          </a>
          <div className="hero-meta">
            <span className="hero-meta-item">
              <Clock3 size={14} />
              Около 35 минут · можно разделить
            </span>
            <span className="meta-separator">·</span>
            <span className="hero-meta-item">Всё работает в браузере</span>
          </div>
        </div>
        <div className="hero-art" aria-hidden="true">
          <div className="orbit orbit-one" />
          <div className="orbit orbit-two" />
          <span className="spark spark-one">+</span>
          <span className="spark spark-two">✦</span>
          <div className="summit">
            <svg viewBox="0 0 300 240">
              <path d="M8 221 112 60 176 150 214 94 299 221Z" fill="#d8d8d8" />
              <path d="m112 60 64 90-39-12-22 17-25-22-32 11Z" fill="#fafafa" />
              <path d="m214 94 85 127h-68l-55-71Z" fill="#b0b0b0" />
              <path d="m214 94 29 43-18-5-15 13-14-9Z" fill="#fafafa" />
              <path d="M112 59V22" stroke="#333333" strokeWidth="3" />
              <path d="M113 22h37l-9 12 9 12h-37Z" fill="#444444" />
            </svg>
          </div>
          <div className="floating-code">
            <span className="code-dots">
              <i />
              <i />
              <i />
            </span>
            <code>
              <span>print</span>(<em>"Я могу!"</em>)
            </code>
            <div>
              <span className="terminal-arrow">›</span>Я могу!
              <Check size={14} />
            </div>
          </div>
          <span className="art-label">шаг 01 → твой первый код</span>
        </div>
      </section>
      <div className="stat-grid">
        <div className="stat-card">
          <span className="stat-icon mint">
            <BookOpen size={21} />
          </span>
          <div>
            <strong>{lessons.length} занятий</strong>
            <span>доступно недель: {availableWeekNumbers.length}</span>
          </div>
        </div>
        <div className="stat-card">
          <span className="stat-icon peach">
            <Terminal size={21} />
          </span>
          <div>
            <strong>{allExercises.length} задач</strong>
            <span>от простого к интересному</span>
          </div>
        </div>
        <div className="stat-card">
          <span className="stat-icon lavender">
            <Lightbulb size={21} />
          </span>
          <div>
            <strong>В своём темпе</strong>
            <span>с подсказками на каждом шаге</span>
          </div>
        </div>
      </div>
      <section className="route-note">
        <h2>Сначала основной маршрут</h2>
        <p>
          Задача F и подготовка к ней — повышенная сложность. Их можно отложить,
          продолжая курс. Время уроков — ориентир, а не ограничение.
        </p>
        <a className="button secondary" href="#/plan">
          Посмотреть маршрут и недельный ритм
        </a>
      </section>
      <div className="dashboard-columns">
        <section>
          {availableWeekNumbers.map((week) => (
            <section className="dashboard-week" key={week}>
              <div className="section-heading">
                <div>
                  <span className="eyebrow">
                    НЕДЕЛЯ {String(week).padStart(2, "0")}
                  </span>
                  <h2>{weeks[week - 1].title}</h2>
                </div>
                <span className="muted small">
                  {
                    getWeekLessons(week).filter((lesson) =>
                      coreLessonComplete(progress, lesson),
                    ).length
                  }{" "}
                  /{" "}
                  {
                    getWeekLessons(week).filter(
                      (lesson) => !advancedLessonIds.has(lesson.id),
                    ).length
                  }{" "}
                  основных занятий
                </span>
              </div>
              <LessonList progress={progress} week={week} />
            </section>
          ))}
          <a href="#/plan" className="next-week-link">
            А что дальше? Посмотреть маршрут
            <ArrowRight size={16} />
          </a>
        </section>
        <aside className="right-rail">
          <div className="how-card">
            <span className="round-icon">
              <Flag size={21} />
            </span>
            <h3>
              Учиться самостоятельно —<br />
              получится.
            </h3>
            <p>Каждый урок устроен так, чтобы ты всегда знал следующий шаг.</p>
            <ol className="steps-list">
              <li>
                <span>1</span>
                <div>
                  <strong>Разберись</strong>
                  <small>Короткая теория и понятный пример</small>
                </div>
              </li>
              <li>
                <span>2</span>
                <div>
                  <strong>Попробуй</strong>
                  <small>Напиши и запусти настоящий код</small>
                </div>
              </li>
              <li>
                <span>3</span>
                <div>
                  <strong>Проверь себя</strong>
                  <small>Получи результат и разбор ошибок</small>
                </div>
              </li>
            </ol>
            <div className="gentle-note">
              <Lightbulb size={17} />
              <span>
                Не получается? Подсказка поможет сделать следующий шаг.
              </span>
            </div>
          </div>
          <div className="local-note">
            <ShieldCheck size={21} />
            <div>
              <strong>Твоё место для практики</strong>
              <p>
                Без регистрации. Прогресс хранится в этом браузере на этом
                устройстве.
              </p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function LessonList({ progress, week }: { progress: Progress; week: number }) {
  return (
    <div className="lesson-list">
      {getWeekLessons(week).map((lesson, index) => {
        const complete = lessonComplete(progress, lesson.id);
        const count = lesson.exercises.filter(
          (task) => progress.solved[task.id],
        ).length;
        return (
          <a
            href={`#/lesson/${lesson.id}`}
            key={lesson.id}
            className={`lesson-card ${complete ? "complete" : ""}`}
          >
            <span className={`lesson-index ${index === 0 ? "first" : ""}`}>
              {complete ? <Check size={21} /> : lesson.number}
            </span>
            <div className="lesson-card-text">
              <div className="lesson-title-row">
                <h3>{lesson.title}</h3>
                {lesson.id === "hello" && !complete && (
                  <span className="mini-tag">Начни здесь</span>
                )}
                {coreLessonComplete(progress, lesson) && !complete && (
                  <span className="mini-tag">Основная часть пройдена</span>
                )}
                {advancedLessonIds.has(lesson.id) && (
                  <span className="mini-tag">
                    Повышенная сложность · по желанию
                  </span>
                )}
                {lesson.id === "review-olympiad" && (
                  <span className="mini-tag">Задание 3 — дополнительное</span>
                )}
                {index === 4 && (
                  <span className="mini-tag checkpoint-tag">Практика</span>
                )}
              </div>
              <p>{lesson.subtitle}</p>
              <div className="lesson-meta">
                <span>
                  <Clock3 size={12} />
                  Ориентир: {lesson.duration} мин
                </span>
                <span>
                  {lesson.id === "font"
                    ? "D: 5 этапов, можно сделать перерыв"
                    : lesson.id === "viral"
                      ? "Можно разделить на 2–3 подхода"
                      : "3 задания"}
                </span>
                {count > 0 && (
                  <span className="green-text">{count}/3 решено</span>
                )}
              </div>
            </div>
            <ChevronRight className="lesson-arrow" size={20} />
          </a>
        );
      })}
    </div>
  );
}

function WeekOverview({
  week,
  progress,
}: {
  week: number;
  progress: Progress;
}) {
  const data = weeks[week - 1];
  return (
    <div className="page narrow-page">
      <a href="#/" className="back-link">
        <ArrowLeft size={16} />К обучению
      </a>
      <div className="eyebrow">
        НЕДЕЛЯ {String(week).padStart(2, "0")} ИЗ 08
      </div>
      <h1>{data.title}</h1>
      <p className="lead">{data.topic}</p>
      <div className="tag-row">
        {data.tags.map((tag) => (
          <span className="outline-badge" key={tag}>
            {tag}
          </span>
        ))}
      </div>
      <div className="outcome-card">
        <Target size={26} />
        <div>
          <h3>Что ты сможешь</h3>
          <p>{data.result}</p>
        </div>
      </div>
      <WeekRhythm week={week} />
      {getWeekLessons(week).length > 0 ? (
        <LessonList progress={progress} week={week} />
      ) : (
        <div className="planned-card">
          <BookOpen size={32} />
          <h2>Этот раздел пока в плане</h2>
          <p>
            Уроки и задания этой недели ещё не добавлены. Сейчас доступны недели{" "}
            {availableWeekNumbers.join(", ")}: {lessons.length} занятий,{" "}
            {allExercises.length} задач и вопросы для самопроверки.
          </p>
          <a className="button primary" href="#/week/1">
            Перейти к первой неделе
            <ArrowRight size={17} />
          </a>
        </div>
      )}
      <section className="contest-intro">
        <h2>Проверь себя на новых задачах</h2>
        <p>
          После уроков недели реши две новые задачи за 30 минут. Пустой
          редактор, разбор после завершения, отдельный результат.
        </p>
        <a className="button primary" href={`#/assessment/week-${week}`}>
          Самостоятельная работа недели
        </a>
      </section>
      {week === 7 && (
        <section className="contest-intro">
          <h2>Первая репетиция</h2>
          <p>
            Задачи A–E и дополнительная F, 180 минут и отдельные результаты.
            Начни после основных уроков этой недели; полную F можно отложить.
          </p>
          <a className="button primary" href="#/contest">
            Открыть тренировочный тур
          </a>
        </section>
      )}
      {week === 8 && (
        <section className="contest-intro">
          <h2>Генеральная репетиция</h2>
          <p>
            Те же шесть задач A–F за 180 минут, теперь с пустым редактором.
            Первая репетиция и её результаты сохранятся отдельно.
          </p>
          <a className="button primary" href="#/contest/final">
            Открыть генеральную репетицию
          </a>
          <a className="back-link" href="#/contest">
            Вернуться к разбору первого тура
          </a>
          <a className="button secondary" href="#/assessment/new-final">
            Решить новый итоговый вариант
          </a>
        </section>
      )}
      <div className="week-pagination">
        {week > 1 ? (
          <a href={`#/week/${week - 1}`}>
            <ArrowLeft size={16} />
            Неделя {week - 1}
          </a>
        ) : (
          <span />
        )}
        {week < 8 && (
          <a href={`#/week/${week + 1}`}>
            Неделя {week + 1}
            <ArrowRight size={16} />
          </a>
        )}
      </div>
    </div>
  );
}

function LessonView({
  lesson,
  progress,
  setProgress,
  notify,
}: {
  lesson: Lesson;
  progress: Progress;
  setProgress: SetProgress;
  notify: (message: string) => void;
}) {
  const initialIndex = lesson.exercises.findIndex(
    (task) => task.id === progress.lastExercise,
  );
  const [exerciseIndex, setExerciseIndex] = useState(Math.max(0, initialIndex));
  const [tab, setTab] = useState<"theory" | "practice">("theory");
  const [quizChoice, setQuizChoice] = useState<number | null>(
    progress.quizzes[lesson.id] ? lesson.quiz.answer : null,
  );
  const exercise = lesson.exercises[exerciseIndex];
  const completed = lessonComplete(progress, lesson.id);
  const nextLesson = nextCoreLesson(lesson);
  const coreDone = coreLessonComplete(progress, lesson);
  useEffect(() => {
    setProgress((old) =>
      old.lastExercise === exercise.id
        ? old
        : { ...old, lastExercise: exercise.id },
    );
  }, [exercise.id, setProgress]);
  const selectExercise = (i: number) => {
    setExerciseIndex(i);
    setTab("practice");
  };
  const answerQuiz = (choice: number) => {
    setQuizChoice(choice);
    if (choice === lesson.quiz.answer)
      setProgress((old) => ({
        ...old,
        quizzes: { ...old.quizzes, [lesson.id]: true },
      }));
  };
  return (
    <div className="page lesson-page">
      <a className="back-link" href={`#/week/${lesson.week}`}>
        <ArrowLeft size={15} />
        Неделя {lesson.week}
      </a>
      <div className="lesson-page-heading">
        <div>
          <div className="eyebrow">
            НЕДЕЛЯ {lesson.week} · ЗАНЯТИЕ {lesson.number}
          </div>
          <h1>{lesson.title}</h1>
          <p>{lesson.subtitle}</p>
        </div>
        <span className={`outline-badge ${completed ? "success-badge" : ""}`}>
          {completed ? <CheckCheck size={16} /> : <Clock3 size={16} />}
          {completed
            ? "Занятие пройдено"
            : `Ориентир: ${lesson.duration} минут`}
        </span>
      </div>
      <section className="route-note lesson-route-note">
        <strong>
          {advancedLessonIds.has(lesson.id)
            ? "Повышенная сложность · по желанию"
            : "Основной маршрут"}
        </strong>
        <p>
          {advancedLessonIds.has(lesson.id)
            ? "Эту тему можно отложить. Она не уменьшает процент завершения основного маршрута. Начни с коротких шагов в объяснениях; полный алгоритм можно собирать в несколько подходов."
            : lesson.id === "font"
              ? "Полную D собирай по этапам: две новые цифры, проверка, затем перерыв. Код и пройденные этапы сохраняются. Не обязательно закончить все рисунки сегодня."
              : lesson.id === "review-olympiad"
                ? "Для основной части достаточно вопроса и первых двух задач. Задание 3 повторяет сложную F и остаётся дополнительным."
                : "Время в заголовке — примерная оценка. Можно разделить занятие на короткие блоки и вернуться к сохранённому коду."}
        </p>
        {advancedLessonIds.has(lesson.id) ? (
          <a className="button secondary" href="#/lesson/tour-plan">
            Продолжить основной маршрут
          </a>
        ) : (
          <a href="#/plan">Как распределить нагрузку →</a>
        )}
      </section>
      {lesson.id === "prefixes" && (
        <p className="route-note">
          После коротких шагов и задач про префиксы можно{" "}
          <a href="#/lesson/viral">перейти к полной F</a>. Это продолжение
          повышенного уровня, а не обязательный следующий урок.
        </p>
      )}
      <div className="learning-layout">
        <section className="lesson-content">
          <div className="tabs" role="tablist" aria-label="Материал урока">
            <button
              role="tab"
              id="theory-tab"
              aria-controls="lesson-panel"
              aria-selected={tab === "theory"}
              className={tab === "theory" ? "active" : ""}
              onClick={() => setTab("theory")}
            >
              <BookOpen size={16} />
              Разобраться
            </button>
            <button
              role="tab"
              id="practice-tab"
              aria-controls="lesson-panel"
              aria-selected={tab === "practice"}
              className={tab === "practice" ? "active" : ""}
              onClick={() => setTab("practice")}
            >
              <Code2 size={16} />
              Практика
              <span>
                {
                  lesson.exercises.filter((task) => progress.solved[task.id])
                    .length
                }
                /3
              </span>
            </button>
          </div>
          <div
            id="lesson-panel"
            role="tabpanel"
            aria-labelledby={tab === "theory" ? "theory-tab" : "practice-tab"}
          >
            {tab === "theory" ? (
              <div className="theory">
                <div className="goals-box">
                  <span className="eyebrow">СЕГОДНЯ НАУЧИШЬСЯ</span>
                  {lesson.goals.map((goal) => (
                    <div key={goal}>
                      <Check size={15} />
                      {goal}
                    </div>
                  ))}
                </div>
                {lesson.showKeyboard && <KeyboardPaths />}
                {lesson.showCubes && <CubeExplorer />}
                {lesson.sections.map((section, i) => (
                  <article className="theory-section" key={section.title}>
                    <span className="section-number">0{i + 1}</span>
                    <h2>{section.title}</h2>
                    <p>{section.body}</p>
                    {section.code && (
                      <pre className="code-example">
                        <code>{section.code}</code>
                      </pre>
                    )}
                    {section.caption && (
                      <p className="code-caption">{section.caption}</p>
                    )}
                    {microExercises
                      .filter(
                        (task) =>
                          task.lessonId === lesson.id &&
                          task.afterSection === i,
                      )
                      .map((task) => (
                        <MicroPractice key={task.id} task={task} />
                      ))}
                  </article>
                ))}
                {lesson.referencePatterns && (
                  <section
                    className="font-reference"
                    aria-label="Шаблоны десяти цифр"
                  >
                    <h2>Шаблоны цифр 0–9</h2>
                    <p>
                      Это рисунки из условия: используй их при решении. В каждом
                      — 9 строк по 5 символов.
                    </p>
                    <div className="font-grid">
                      {Object.entries(lesson.referencePatterns).map(
                        ([digit, pattern]) => (
                          <figure key={digit}>
                            <figcaption>Цифра {digit}</figcaption>
                            <pre aria-label={`Рисунок цифры ${digit}`}>
                              {pattern}
                            </pre>
                          </figure>
                        ),
                      )}
                    </div>
                  </section>
                )}
                {lesson.referenceTable && (
                  <details className="word-reference">
                    <summary>{lesson.referenceTable.title}</summary>
                    <table>
                      <caption>
                        Названия из условия задачи E. Их можно брать отсюда:
                        учить английские слова наизусть не требуется.
                      </caption>
                      <thead>
                        <tr>
                          {lesson.referenceTable.headers.map((header) => (
                            <th scope="col" key={header}>
                              {header}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {lesson.referenceTable.rows.map(([number, word]) => (
                          <tr key={number}>
                            <th scope="row">{number}</th>
                            <td>{word}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </details>
                )}
                <div className="remember-box">
                  <Lightbulb size={20} />
                  <div>
                    <strong>Возьми с собой</strong>
                    <p>{lesson.takeaway}</p>
                  </div>
                </div>
                <section className="quiz-card">
                  <span className="eyebrow">МИНУТКА НА ПРОВЕРКУ</span>
                  <h3>{lesson.quiz.question}</h3>
                  {lesson.quiz.code && (
                    <pre className="code-example">
                      <code>{lesson.quiz.code}</code>
                    </pre>
                  )}
                  <div className="quiz-options">
                    {lesson.quiz.options.map((option, i) => (
                      <button
                        key={option}
                        className={
                          quizChoice === i
                            ? i === lesson.quiz.answer
                              ? "correct"
                              : "incorrect"
                            : ""
                        }
                        onClick={() => answerQuiz(i)}
                        aria-pressed={quizChoice === i}
                      >
                        <span>{String.fromCharCode(65 + i)}</span>
                        {option}
                        {quizChoice === i && i === lesson.quiz.answer && (
                          <Check size={16} />
                        )}
                      </button>
                    ))}
                  </div>
                  {quizChoice !== null && (
                    <div
                      className={`quiz-feedback ${quizChoice === lesson.quiz.answer ? "positive" : ""}`}
                      role="status"
                    >
                      <strong>
                        {quizChoice === lesson.quiz.answer
                          ? "Верно!"
                          : "Давай разберёмся."}
                      </strong>{" "}
                      {lesson.quiz.explanation}
                      {quizChoice !== lesson.quiz.answer &&
                        " Теперь выбери подходящий ответ."}
                    </div>
                  )}
                </section>
                <button
                  className="button primary wide"
                  onClick={() => setTab("practice")}
                >
                  Перейти к заданиям
                  <ArrowRight size={17} />
                </button>
              </div>
            ) : (
              <ExerciseDescription
                exercise={exercise}
                index={exerciseIndex}
                progress={progress}
                setProgress={setProgress}
              />
            )}
          </div>
        </section>
        <div className="workspace-column">
          <Workspace
            key={exercise.id}
            exercise={exercise}
            exercises={lesson.exercises}
            index={exerciseIndex}
            onSelect={selectExercise}
            progress={progress}
            setProgress={setProgress}
            notify={notify}
          />
          <div className="workspace-tip">
            <ShieldCheck size={16} />
            <span>
              Код выполняется в твоём браузере. Можно экспериментировать — так и
              учатся.
            </span>
          </div>
        </div>
      </div>
      {getWeekLessons(lesson.week).at(-1)?.id === lesson.id && (
        <section className="contest-intro">
          <h2>Теперь попробуй новое условие</h2>
          <p>
            После задач урока проверь, получится ли выбрать способ решения
            самостоятельно.
          </p>
          <a
            className="button secondary"
            href={`#/assessment/week-${lesson.week}`}
          >
            Самостоятельная работа · неделя {lesson.week}
          </a>
        </section>
      )}
      {lesson.id === "next-small" && (
        <section className="route-note">
          <h2>Дальше — подготовка к туру</h2>
          <p>
            Полную F можно изучить отдельно, когда уверенно получаются строки,
            множества и вложенные циклы.
          </p>
          <a href="#/lesson/prefixes">
            Хочу попробовать повышенную сложность: подготовка к F →
          </a>
        </section>
      )}
      <div className={`lesson-finish ${completed ? "finished" : ""}`}>
        <div>
          <strong>
            {completed
              ? "Ещё один шаг к вершине!"
              : coreDone
                ? "Основная часть пройдена"
                : "Чтобы завершить занятие"}
          </strong>
          <p>
            {completed
              ? "Ты ответил на вопрос и решил все три задания. Можно двигаться дальше."
              : coreDone
                ? "Основная часть занятия пройдена. Дополнительное задание можно оставить на потом."
                : lesson.id === "review-olympiad"
                  ? "Ответь на вопрос и реши первые две задачи. Третья — повышенная сложность."
                  : "Ответь на вопрос во вкладке «Разобраться» и пройди проверку трёх заданий."}
          </p>
        </div>
        {lesson.id === "ready" ? (
          <a className="button secondary" href="#/contest/final">
            Перейти к генеральной репетиции
            <Flag size={17} />
          </a>
        ) : lesson.id === "tour-plan" ? (
          <a className="button secondary" href="#/contest">
            Перейти к тренировочному туру
            <Trophy size={17} />
          </a>
        ) : nextLesson ? (
          <a className="button secondary" href={`#/lesson/${nextLesson.id}`}>
            Следующее занятие
            <ArrowRight size={17} />
          </a>
        ) : (
          <a className="button secondary" href="#/progress">
            Посмотреть результаты
            <Trophy size={17} />
          </a>
        )}
      </div>
    </div>
  );
}

function ExerciseDescription({
  exercise,
  index,
  progress,
  setProgress,
}: {
  exercise: Exercise;
  index: number;
  progress: Progress;
  setProgress: SetProgress;
}) {
  const hints = progress.hints[exercise.id] ?? 0;
  const solutionShown = progress.solutions.includes(exercise.id);
  return (
    <div className="exercise-description">
      <span className="eyebrow">ЗАДАНИЕ {index + 1} ИЗ 3</span>
      <h2>{exercise.title}</h2>
      {advancedExerciseIds.has(exercise.id) && (
        <p className="route-note">
          Повышенная сложность. Можно вернуться позже; основной маршрут от этого
          не станет незавершённым.
        </p>
      )}
      <p>{exercise.prompt}</p>
      <h4>Входные данные</h4>
      <p className="muted">{exercise.inputHelp}</p>
      <div className="sample-grid">
        <div>
          <h4>Пример ввода</h4>
          <pre>{exercise.sample.input || "Не нужен"}</pre>
        </div>
        <div>
          <h4>Ожидаемый ответ</h4>
          <pre>{exercise.sample.expected}</pre>
        </div>
      </div>
      <div className="exercise-tip">
        <Target size={17} />
        <span>
          «Запустить» проверяет твою идею на введённых данных. «Проверить»
          запускает тесты задания.
        </span>
      </div>
      <div className="hints-section">
        <h3>
          <Lightbulb size={19} />
          Если нужна помощь
        </h3>
        <p className="small muted">
          Подсказки открываются по одной. Их использование отметится в
          прогрессе.
        </p>
        {exercise.hints.slice(0, hints).map((hint, i) => (
          <div className="hint" key={hint}>
            <span>Подсказка {i + 1}</span>
            <p>{hint}</p>
          </div>
        ))}
        {hints < exercise.hints.length && (
          <button
            className="button secondary wide"
            onClick={() =>
              setProgress((old) => ({
                ...old,
                hints: { ...old.hints, [exercise.id]: hints + 1 },
              }))
            }
          >
            <Lightbulb size={16} />
            {hints === 0 ? "Небольшая подсказка" : "Следующая подсказка"}
            <span className="muted">{hints + 1}/3</span>
          </button>
        )}
        {hints === 3 && !solutionShown && (
          <button
            className="text-button"
            onClick={() =>
              setProgress((old) => ({
                ...old,
                solutions: [...old.solutions, exercise.id],
              }))
            }
          >
            Показать решение и объяснение
            <ChevronRight size={15} />
          </button>
        )}
        {solutionShown && (
          <div className="solution-box">
            <h4>Разбор решения</h4>
            <pre className="code-example">
              <code>{exercise.solution}</code>
            </pre>
            <p>{exercise.explanation}</p>
            <p className="small muted">
              После разбора попробуй написать код заново, затем переходи к
              следующей задаче.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

type Feedback = {
  mode: "run" | "check";
  results: RunResult[];
  passed?: boolean;
  failedIndex?: number;
  tests?: Exercise["tests"];
  fontStage?: number;
};
function Workspace({
  exercise,
  exercises,
  index,
  onSelect,
  progress,
  setProgress,
  notify,
}: {
  exercise: Exercise;
  exercises: Exercise[];
  index: number;
  onSelect: (index: number) => void;
  progress: Progress;
  setProgress: SetProgress;
  notify: (message: string) => void;
}) {
  const [code, setCode] = useState(
    progress.drafts[exercise.id] ?? exercise.starter,
  );
  const [input, setInput] = useState(
    progress.inputs[exercise.id] ?? exercise.sample.input,
  );
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [changed, setChanged] = useState(false);
  const [resetConfirm, setResetConfirm] = useState(false);
  const font = useFontStages(exercise.id === "font-3");
  const { execute, stop, status, version } = usePython();
  const busy = status !== "idle";
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  const updateCode = (value: string) => {
    setCode(value);
    setChanged(true);
    setResetConfirm(false);
    setProgress((old) => ({
      ...old,
      drafts: { ...old.drafts, [exercise.id]: value },
    }));
  };
  const run = async (mode: "run" | "check", fontStage?: number) => {
    const tests =
      fontStage === undefined
        ? exercise.tests
        : exercise.tests.filter((test) =>
            fontStages[fontStage].digits.includes(test.input),
          );
    if (code.length > 100000) {
      notify(
        "Для этого задания достаточно небольшого кода. Лимит — 100 000 символов.",
      );
      return;
    }
    if (!code.trim()) {
      setFeedback({
        mode: "run",
        results: [
          {
            output: "",
            error: "EmptyCode: сначала напиши хотя бы одну команду.",
          },
        ],
      });
      setChanged(false);
      return;
    }
    setChanged(false);
    setFeedback(null);
    const results = await execute({
      code,
      inputs: mode === "run" ? [input] : tests.map((test) => test.input),
    });
    if (!mounted.current) return;
    if (mode === "check") {
      const failedIndex = results.findIndex(
        (result, i) =>
          result.error ||
          normalizeOutput(result.output) !== normalizeOutput(tests[i].expected),
      );
      const passed = failedIndex === -1 && results.length === tests.length;
      setFeedback({
        mode,
        results,
        passed,
        failedIndex: failedIndex < 0 ? 0 : failedIndex,
        tests,
        fontStage,
      });
      if (passed && exercise.id === "font-3")
        font.accept(fontStage ?? fontStages.length - 1, code);
      if (passed && tests.length === exercise.tests.length) {
        setProgress((old) => {
          // Keep the first successful attempt's independence; later review does not erase it.
          if (old.solved[exercise.id]) return old;
          return {
            ...old,
            solved: {
              ...old.solved,
              [exercise.id]: {
                helped:
                  (old.hints[exercise.id] ?? 0) > 0 ||
                  old.solutions.includes(exercise.id),
                at: new Date().toISOString(),
              },
            },
          };
        });
      }
    } else setFeedback({ mode, results });
  };
  const checkedTests = feedback?.tests ?? exercise.tests;
  const partialStage =
    feedback?.fontStage !== undefined &&
    checkedTests.length < exercise.tests.length;
  const failure =
    feedback?.results[
      feedback.mode === "check" ? (feedback.failedIndex ?? 0) : 0
    ];
  return (
    <section className="workspace" aria-label="Редактор Python">
      <div className="workspace-header">
        <span>
          <Terminal size={16} />
          Твоя мастерская
        </span>
        <span className="python-badge">
          <span />
          Python {version || "3"}
        </span>
      </div>
      <div className="exercise-switcher">
        <span>Задания</span>
        {exercises.map((task, i) => (
          <button
            key={task.id}
            disabled={busy}
            aria-label={`Задание ${i + 1}: ${task.title}`}
            aria-pressed={i === index}
            className={i === index ? "active" : ""}
            onClick={() => onSelect(i)}
          >
            {progress.solved[task.id] ? <Check size={14} /> : i + 1}
          </button>
        ))}
        <span className="exercise-switch-title">{exercise.title}</span>
      </div>
      <div className="workspace-assignment">
        <p>{exercise.prompt}</p>
        <button
          className="text-button"
          disabled={busy}
          onClick={() => onSelect(index)}
        >
          Пример и подсказки
          <ChevronRight size={14} />
        </button>
      </div>
      {exercise.id === "font-3" && (
        <FontStages
          alreadySolved={Boolean(progress.solved[exercise.id])}
          {...font}
          busy={busy}
          code={code}
          onCheck={(stage) => void run("check", stage)}
        />
      )}
      <div className="editor-file">
        <span>
          <Code2 size={13} />
          solution.py
        </span>
        <button
          className="reset-code"
          disabled={busy}
          title="Вернуть начальный код"
          aria-label="Вернуть начальный код"
          onClick={() => setResetConfirm(!resetConfirm)}
        >
          <RotateCcw size={14} />
        </button>
      </div>
      {resetConfirm && (
        <div className="reset-confirm">
          <span>Заменить твой код начальным шаблоном?</span>
          <button onClick={() => updateCode(exercise.starter)}>Заменить</button>
          <button
            aria-label="Отменить сброс"
            onClick={() => setResetConfirm(false)}
          >
            <X size={15} />
          </button>
        </div>
      )}
      <Suspense
        fallback={<div className="editor-loading">Готовим редактор…</div>}
      >
        <CodeEditor code={code} onChange={updateCode} editable={!busy} />
      </Suspense>
      <div className="input-panel">
        <label htmlFor={`stdin-${exercise.id}`}>
          Входные данные<span>каждое значение с новой строки</span>
        </label>
        <textarea
          id={`stdin-${exercise.id}`}
          value={input}
          disabled={busy}
          rows={3}
          spellCheck={false}
          placeholder={
            exercise.sample.input
              ? "Введи данные для input()"
              : "В этой задаче ввод не нужен"
          }
          onChange={(event) => {
            const value = event.target.value;
            setInput(value);
            setChanged(true);
            setProgress((old) => ({
              ...old,
              inputs: { ...old.inputs, [exercise.id]: value },
            }));
          }}
        />
      </div>
      <div className="run-actions">
        {busy ? (
          <button className="button stop-button" onClick={() => stop()}>
            <Square size={14} fill="currentColor" />
            Остановить
          </button>
        ) : (
          <button className="button run-button" onClick={() => run("run")}>
            <Play size={15} fill="currentColor" />
            Запустить
          </button>
        )}
        <button
          className="button check-button"
          disabled={busy}
          onClick={() => run("check")}
        >
          {busy ? (
            <LoaderCircle size={16} className="spin" />
          ) : (
            <CheckCheck size={17} />
          )}
          Проверить
        </button>
      </div>
      <div className="output-panel" aria-live="polite" aria-busy={busy}>
        <div className="output-heading">
          <span>РЕЗУЛЬТАТ</span>
          <span>
            {busy
              ? status === "loading"
                ? "Загрузка Python…"
                : "Выполняется…"
              : feedback?.mode === "check"
                ? "Проверка задания"
                : "Консоль"}
          </span>
        </div>
        {busy ? (
          <div className="output-placeholder">
            <LoaderCircle className="spin" size={22} />
            <p>
              {status === "loading"
                ? "Готовим настоящий Python. Первый запуск займёт немного времени."
                : "Запускаем твой код…"}
            </p>
          </div>
        ) : !feedback ? (
          <div className="output-placeholder">
            <Terminal size={24} />
            <p>
              Здесь появится результат.
              <br />
              Напиши код и нажми «Запустить».
            </p>
          </div>
        ) : (
          <div className="run-feedback">
            {changed && (
              <div className="stale-notice">
                Код или ввод изменён. Запусти ещё раз для актуального
                результата.
              </div>
            )}
            {feedback.mode === "check" && feedback.passed ? (
              <div className="test-success">
                <span className="success-check">
                  <Check size={22} />
                </span>
                <h3>Получилось!</h3>
                <p>
                  Все проверки пройдены: {checkedTests.length} из{" "}
                  {checkedTests.length}.
                </p>
                <small>
                  {partialStage
                    ? progress.solved[exercise.id]
                      ? "Этап повторён. Полная D была зачтена ранее; её результат сохраняется."
                      : "Этап сохранён. Полная D ещё не зачтена: добавляй следующие цифры, когда будешь готов."
                    : progress.solved[exercise.id]?.helped
                      ? "Решено с помощью подсказок. Попробуй следующую задачу самостоятельно."
                      : "Решено самостоятельно. Ещё один шаг вперёд."}
                </small>
                {index < exercises.length - 1 && (
                  <button
                    className="text-button"
                    onClick={() => onSelect(index + 1)}
                  >
                    Следующее задание
                    <ArrowRight size={15} />
                  </button>
                )}
              </div>
            ) : failure?.error ? (
              <div className="error-feedback">
                <strong>
                  {failure.error.includes("Stopped")
                    ? "Остановлено"
                    : "Давай разберёмся"}
                </strong>
                <p>
                  {failure.error.includes("EmptyCode")
                    ? "Напиши команду в редакторе выше, затем запусти её."
                    : explainError(failure.error)}
                </p>
                <details>
                  <summary>Сообщение Python</summary>
                  <pre>{failure.error}</pre>
                </details>
              </div>
            ) : feedback.mode === "check" ? (
              <div className="test-failure">
                <strong>Ответ пока не совпал</strong>
                <p>
                  Проверка {(feedback.failedIndex ?? 0) + 1}. Сравни результаты:
                  пробелы и порядок строк тоже важны.
                </p>
                <div className="comparison">
                  <div>
                    <span>Вход</span>
                    <pre>
                      {checkedTests[feedback.failedIndex ?? 0].input ||
                        "Не нужен"}
                    </pre>
                  </div>
                  <div>
                    <span>Ожидается</span>
                    <pre>
                      {checkedTests[feedback.failedIndex ?? 0].expected ||
                        "(пустой вывод)"}
                    </pre>
                  </div>
                  <div>
                    <span>Твой ответ</span>
                    <pre>{failure?.output || "(нет вывода)"}</pre>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <pre className="console-output">
                  {failure?.output || "(программа завершилась без вывода)"}
                </pre>
                <div className="run-note">
                  <Check size={12} />
                  Выполнено. Нажми «Проверить», чтобы проверить ответ.
                </div>
              </>
            )}
          </div>
        )}
      </div>
      <div className="editor-footer">
        <span>
          <span className="tiny-dot" />
          Черновик сохраняется в браузере
        </span>
        <span>Лимит запуска · 5 с</span>
      </div>
    </section>
  );
}

function ProgressView({
  progress,
  percent,
  notify,
}: {
  progress: Progress;
  percent: number;
  notify: (message: string) => void;
}) {
  const stats = routeStats(progress);
  const allComplete = lessons.every((lesson) =>
    lessonComplete(progress, lesson.id),
  );
  const solved = Object.values(progress.solved);
  const independent = solved.filter((x) => !x.helped).length;
  const exportProgress = () => {
    const blob = new Blob(
      [
        JSON.stringify(
          { ...progress, exportedAt: new Date().toISOString() },
          null,
          2,
        ),
      ],
      { type: "application/json" },
    );
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "olymp-progress.json";
    anchor.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    notify("Файл с прогрессом и твоим кодом подготовлен.");
  };
  return (
    <div className="page narrow-page">
      <div className="eyebrow">КАЖДЫЙ ШАГ СЧИТАЕТСЯ</div>
      <h1>
        Ты уже на пути<span className="green-dot">.</span>
      </h1>
      <p className="lead">Здесь виден твой прогресс по доступным неделям.</p>
      <div className="progress-hero">
        <div
          className="progress-ring"
          style={{
            background: `conic-gradient(#222222 ${percent}%, #e5e5e5 0)`,
          }}
        >
          <span>
            {percent}
            <small>%</small>
          </span>
        </div>
        <div>
          <h2>
            {allComplete
              ? "Все уроки курса пройдены!"
              : stats.complete
                ? "Основной маршрут пройден!"
                : solved.length
                  ? "Хорошее начало. Продолжай."
                  : "Первая вершина впереди"}
          </h2>
          <p>
            Основной маршрут: {stats.solved} из {coreExercises.length} задач,{" "}
            {stats.quizzes} из {coreLessons.length} вопросов. Повышенная
            сложность: {stats.advancedSolved} из {advancedExerciseIds.size}{" "}
            задач.
          </p>
          <p>
            Весь курс: {solved.length} из {allExercises.length} задач ·{" "}
            {Object.keys(progress.quizzes).length} из {lessons.length} вопросов
          </p>
          <p className="small muted">
            Прогресс растёт за проверенные решения и верные ответы, а не за
            открытые страницы.
          </p>
          {percent === 100 && (
            <p>
              <a className="button secondary" href="#/contest/final">
                Проверить себя в генеральной репетиции
              </a>
            </p>
          )}
        </div>
      </div>
      <div className="stat-grid progress-stats">
        <div className="stat-card">
          <span className="stat-icon mint">
            <CheckCheck size={21} />
          </span>
          <div>
            <strong>{independent}</strong>
            <span>самостоятельно</span>
          </div>
        </div>
        <div className="stat-card">
          <span className="stat-icon peach">
            <Lightbulb size={21} />
          </span>
          <div>
            <strong>{solved.length - independent}</strong>
            <span>с подсказками</span>
          </div>
        </div>
        <div className="stat-card">
          <span className="stat-icon lavender">
            <BookOpen size={21} />
          </span>
          <div>
            <strong>
              {lessons.filter((x) => lessonComplete(progress, x.id)).length} из{" "}
              {lessons.length}
            </strong>
            <span>занятий пройдено</span>
          </div>
        </div>
      </div>
      <div className="week-progress-grid">
        {availableWeekNumbers.map((week) => {
          const weekLessons = getWeekLessons(week);
          const tasks = weekLessons.flatMap((lesson) => lesson.exercises);
          const completed = weekLessons.filter((lesson) =>
            lessonComplete(progress, lesson.id),
          ).length;
          return (
            <a
              className="week-progress-card"
              key={week}
              href={`#/week/${week}`}
            >
              <strong>
                Неделя {week}: {weeks[week - 1].title}
              </strong>
              <span>
                {completed} из {weekLessons.length} занятий пройдено
              </span>
              <span>
                {tasks.filter((task) => progress.solved[task.id]).length} из{" "}
                {tasks.length} задач решено
              </span>
              <span>
                Основной маршрут:{" "}
                {
                  weekLessons.filter((lesson) =>
                    coreLessonComplete(progress, lesson),
                  ).length
                }{" "}
                из{" "}
                {
                  weekLessons.filter(
                    (lesson) => !advancedLessonIds.has(lesson.id),
                  ).length
                }{" "}
                занятий
              </span>
              {completed === weekLessons.length && (
                <span>Неделя пройдена ✓</span>
              )}
            </a>
          );
        })}
      </div>
      <section className="contest-intro">
        <h2>Понимание и самостоятельность</h2>
        <p>
          Короткие упражнения внутри уроков и новые самостоятельные работы
          сохраняются отдельно. Их результаты не меняют прежние отметки за курс.
        </p>
        <a className="button secondary" href="#/assessments">
          Посмотреть самостоятельные работы
        </a>
      </section>
      <h2 className="list-heading">Твои задания</h2>
      <div className="results-list">
        {lessons.map((lesson) => (
          <section key={lesson.id}>
            <a href={`#/lesson/${lesson.id}`}>
              <span className="lesson-index">{lesson.number}</span>
              <h3>{lesson.title}</h3>
              <ChevronRight size={17} />
            </a>
            {lesson.exercises.map((task) => (
              <div className="result-row" key={task.id}>
                <span>
                  {task.title}
                  {advancedExerciseIds.has(task.id)
                    ? " · повышенная сложность"
                    : ""}
                </span>
                <span
                  className={`result-badge ${progress.solved[task.id] ? (progress.solved[task.id].helped ? "assisted" : "solved") : ""}`}
                >
                  {progress.solved[task.id]
                    ? progress.solved[task.id].helped
                      ? "С помощью"
                      : "Самостоятельно"
                    : "Впереди"}
                </span>
              </div>
            ))}
          </section>
        ))}
      </div>
      <div className="export-card">
        <div>
          <strong>Сохрани свои результаты</strong>
          <p>
            Скачай файл с прогрессом и кодом. Сейчас результаты хранятся только
            в этом браузере; автоматического переноса между устройствами нет.
          </p>
        </div>
        <button className="button secondary" onClick={exportProgress}>
          <ArrowDownToLine size={17} />
          Скачать прогресс
        </button>
      </div>
    </div>
  );
}

function Guide() {
  const cards = [
    [
      "Вывести ответ",
      'print("Привет!")\nprint(2 + 3)',
      "Текст — в кавычках, вычисление — без них. Каждый print выводит новую строку.",
    ],
    [
      "Сохранить значение",
      "points = 10\npoints = points + 5",
      "Сначала вычисляется правая часть, затем результат присваивается имени слева.",
    ],
    [
      "Прочитать данные",
      "name = input()\nn = int(input())",
      "input читает строку. int превращает её в целое число. На каждый input нужна одна строка входа.",
    ],
    [
      "Посчитать",
      "a + b   # сумма\na - b   # разность\na * b   # произведение\na / b   # обычное деление\na // b  # целочисленное деление\na % b   # остаток\na ** b  # степень",
      "Скобки меняют порядок действий. На ноль делить нельзя.",
    ],
    [
      "Найти цифры",
      "n = 47\ntens = n // 10\nones = n % 10",
      "Для положительного двузначного числа // 10 выделяет десятки, а % 10 — единицы.",
    ],
    [
      "Разложить время",
      "t = 135\nminutes = t // 60\nseconds = t % 60",
      "Полные группы и остаток: один приём для секунд, коробок и объёма памяти.",
    ],
    [
      "Сравнить",
      "a == b  # равны\na != b  # не равны\na > b   # больше\na < b   # меньше\na >= b  # больше или равно\na <= b  # меньше или равно",
      "Результат — True или False. Один знак = присваивает значение, два == сравнивают.",
    ],
    [
      "Выбрать действие",
      'n = int(input())\nif n > 0:\n    print("Плюс")\nelif n < 0:\n    print("Минус")\nelse:\n    print("Ноль")',
      "Выполняется первая подходящая ветвь. После условия — двоеточие, внутри ветви — четыре пробела.",
    ],
    [
      "Соединить условия",
      "10 <= n and n <= 20\nday == 6 or day == 7\nnot blocked",
      "and — оба условия верны; or — хотя бы одно; not — меняет True и False местами. В примерах blocked — логическое значение.",
    ],
    [
      "Повторить с for",
      "for i in range(1, 4):\n    print(i)\n# Получится 1, 2, 3\n# range(3) даёт 0, 1, 2",
      "Правая граница не входит. range(5, -1, -1) даёт 5, 4, 3, 2, 1, 0. Шаг не может быть нулём.",
    ],
    [
      "Накопить сумму",
      "total = 0\nfor i in range(1, 4):\n    total = total + i\nprint(total)",
      "Начальное значение — до цикла, изменение — внутри, итог — после. Для подсчёта количества прибавляй 1.",
    ],
    [
      "Повторять, пока условие верно",
      "n = 3\nwhile n > 0:\n    print(n)\n    n = n - 1",
      "while проверяет условие до каждого прохода. Не забывай менять данные, чтобы цикл закончился. При зависании нажми «Остановить».",
    ],
    [
      "Перевести единицы памяти",
      "decimal_mb = 1000 ** 2\nbinary_mib = 1024 ** 2\nn = 2500\nprint(n // 1024)\nprint(n % 1024)",
      "В задаче B входные KB…PB основаны на 1000. Двоичные KiB…PiB — на 1024. После выделения каждой крупной части продолжай с остатком.",
    ],
    [
      "Работать со строкой",
      'text = "Python"\nprint(len(text))  # 6\nprint(text[0])    # P\nprint(text[-1])   # n\nprint(text[:2])   # Py',
      "Индексы начинаются с нуля. У среза правая граница не входит. Пустая строка не имеет первого и последнего символов.",
    ],
    [
      "Соединить текст",
      'print("twenty" + "-" + "one")\nprint("Год: " + str(2026))',
      "Добавляй пробелы и дефисы явно. str превращает число в строку; строку и число напрямую складывать нельзя.",
    ],
    [
      "Сохранить список",
      "values = []\nvalues.append(5)\nvalues.append(8)\nprint(values[-1])  # 8",
      "append меняет список. Не присваивай результат append обратно списку. Последний неотрицательный индекс — len(values) − 1.",
    ],
    [
      "Найти значение по ключу",
      'words = {20: "twenty", 30: "thirty"}\nn = 20\nif n in words:\n    print(words[n])',
      "Словарь хранит пары ключ: значение. in проверяет наличие ключа. Число 20 и строка «20» — разные ключи.",
    ],
    [
      "Перебрать пары",
      "for a in range(1, 3):\n    for b in range(1, 4):\n        print(a, b)",
      "Для каждого a внутренний цикл заново перебирает все b. Здесь 2 × 3 = 6 упорядоченных пар.",
    ],
    [
      "Выделить все окна",
      'text = "abcde"\nk = 3\nfor start in range(len(text) - k + 1):\n    print(text[start:start + k])',
      "При k ≤ n полных окон n − k + 1, иначе 0. Срезы могут перекрываться; неполные окна у края исключены границей цикла.",
    ],
    [
      "Не считать повторы",
      'seen = []\nfor letter in "abaca":\n    if letter not in seen:\n        seen.append(letter)\nprint(len(seen))  # 3',
      "in у списка проверяет значение, у словаря — ключ, у строки — непрерывный фрагмент. Для небольшого числа вариантов список seen помогает убрать повторы.",
    ],
    [
      "Найти минимум и максимум",
      "r = 5\ng = 3\nb = 4\nlargest = max(r, g, b)\nothers = r + g + b - largest\nprint(min(r + g + b, 2 * others + 1))",
      "max выбирает наибольшее число, min — наименьшее. Вычитай один максимум, даже если несколько значений равны. В задаче C длину ограничивают общий запас и число разделителей.",
    ],
    [
      "Проверить соседей",
      'text = "RGGB"\nbad = 0\nfor i in range(len(text) - 1):\n    if text[i] == text[i + 1]:\n        bad = bad + 1\nprint(bad)  # 1',
      "У n символов n − 1 соседних пар, если строка непустая. Последний i равен n − 2, поэтому i + 1 остаётся внутри строки. В RGR повторение R разрешено: буквы не соседние.",
    ],
    [
      "Оценить количество действий",
      "n = 1000000000\nprint(n * n)\nprint(n * (n + 1) // 2)",
      "Первое число — количество шагов двух вложенных циклов по n. Второе — сумма 1…n. Формулы вычисляют результат без перебора миллиарда элементов; целочисленное // сохраняет точность.",
    ],
    [
      "Создать множество",
      'seen = set()\nseen.add("a")\nseen.add("a")\nprint(len(seen))  # 1\nprint("a" in seen)',
      "Множество хранит значения без повторений. add добавляет элемент; порядок не гарантирован, индексов нет. Пустые {} создают словарь, а не множество.",
    ],
    [
      "Проверить цифры числа",
      "n = 120\ntext = str(n)\nprint(len(set(text)) == len(text))  # True",
      "Сравни число всех цифр с числом разных. У нуля одна цифра. Проверка уникальности ещё не ищет следующее число: в F ответ должен быть строго больше входа.",
    ],
    [
      "Достроить минимальный хвост",
      'candidate = "23"\nsize = 5\nfor digit in "0123456789":\n    if len(candidate) < size and digit not in candidate:\n        candidate = candidate + digit\nprint(candidate)  # 23014',
      "Начало должно быть без повторений и ведущего нуля. Свободные цифры в возрастающем порядке дают наименьшее продолжение; size не больше 10.",
    ],
  ];
  return (
    <div className="page narrow-page">
      <div className="eyebrow">МОЖНО ПОДСМАТРИВАТЬ</div>
      <h1>Памятка Python</h1>
      <p className="lead">
        Самое нужное из изученных тем. Запоминать всё сразу не обязательно.
      </p>
      <div className="guide-grid">
        {cards.map(([title, code, explanation]) => (
          <article className="guide-card" key={title}>
            <h3>{title}</h3>
            <pre className="code-example">
              <code>{code}</code>
            </pre>
            <p>{explanation}</p>
          </article>
        ))}
      </div>
      <section className="guide-help">
        <h2>Если что-то не работает</h2>
        <dl>
          <dt>SyntaxError</dt>
          <dd>Проверь скобки, кавычки и написание команды.</dd>
          <dt>IndentationError / TabError</dt>
          <dd>
            Внутри условия или цикла добавь четыре пробела относительно внешнего
            блока. if, elif и else одной цепочки стоят на одном уровне. Не
            смешивай пробелы и табуляцию.
          </dd>
          <dt>NameError</dt>
          <dd>
            Проверь имя переменной и убедись, что она уже получила значение.
          </dd>
          <dt>IndexError</dt>
          <dd>
            Такой позиции нет. Индексы начинаются с 0; последний — длина минус
            1. У пустой строки или списка нет элементов.
          </dd>
          <dt>KeyError</dt>
          <dd>
            Такого ключа нет в словаре. Проверь написание и тип: 20 и "20"
            различаются. Если неизвестный ключ допустим, проверь key in table.
          </dd>
          <dt>ValueError</dt>
          <dd>
            Для int нужен текст, представляющий целое число, например 15 или -3.
            У range шаг не должен быть нулевым.
          </dd>
          <dt>EOFError</dt>
          <dd>
            Не хватает входных строк. Посчитай вызовы input() и заполни поле
            ввода.
          </dd>
          <dt>Ответ не совпал</dt>
          <dd>
            Проверь вычисления, пробелы, знаки и порядок строк. Не выводи
            «Введите число».
          </dd>
        </dl>
      </section>
      <div className="local-note guide-note">
        <ShieldCheck size={23} />
        <div>
          <strong>О твоих данных и работе тренажёра</strong>
          <p>
            Код выполняется локально в браузере, без отправки на сервер
            выполнения. Первый запуск загружает Python с сервера приложения.
            Прогресс и черновики сохраняются на этом устройстве. Очистка данных
            сайта удалит их. Для резерва используй «Скачать прогресс»; импорт
            файла в этой версии пока не предусмотрен.
          </p>
          <p>
            Лимит одного запуска — 5 секунд и 24 КБ вывода. Бесконечный цикл
            можно остановить кнопкой «Остановить». Для комфортной работы
            используй компьютер или планшет с клавиатурой.
          </p>
        </div>
      </div>
      <a className="button primary" href="#/">
        Вернуться к обучению
        <ArrowRight size={17} />
      </a>
    </div>
  );
}
