import { useEffect, useState } from "react";
import "./App.css";

const defaultStartingWeight = 205;
const defaultGoalWeight = 185;
const planWeeks = 8;

const days = [
  {
    day: "Day 1",
    title: "Upper Body Push + Moderate Cardio",
    focus: "Chest, shoulders, triceps, muscular endurance",
    workout: [
      "Incline push-ups or regular push-ups - 4 x 8-15",
      "Pike push-ups - 3 x 8-12",
      "Bench dips or chair dips - 3 x 10-15",
      "Push-up hold at halfway point - 3 x 20-30 sec",
      "Shoulder taps - 3 x 20 total",
    ],
    cardio: "Brisk walk, treadmill walk, or easy bike - 25-30 minutes",
  },
  {
    day: "Day 2",
    title: "Lower Body + Moderate Cardio",
    focus: "Legs, glutes, fat burning, work capacity",
    workout: [
      "Bodyweight squats - 4 x 15-20",
      "Reverse lunges - 3 x 10-12 each leg",
      "Glute bridges - 4 x 15-20",
      "Step-ups on sturdy surface - 3 x 12 each leg",
      "Wall sit - 3 x 30-45 sec",
      "Calf raises - 3 x 20-25",
    ],
    cardio: "Brisk walk or incline walk - 25-35 minutes",
  },
  {
    day: "Day 3",
    title: "Core + Full Body Conditioning",
    focus: "Abs, endurance, calorie burn",
    workout: [
      "Mountain climbers - 30 seconds",
      "Bodyweight squats - 15",
      "Push-ups - 8-12",
      "Dead bugs - 12 each side",
      "Plank - 30-45 sec",
      "Alternating reverse lunges - 10 each leg",
      "Bicycle crunches - 20 total",
      "Repeat circuit for 4 rounds; rest 60-90 sec after each round",
    ],
    cardio: "Easy-to-moderate walk - 20-25 minutes",
  },
  {
    day: "Day 4",
    title: "Pull/Back Focus + Moderate Cardio",
    focus: "Back, posture, support muscles",
    workout: [
      "Superman raises - 4 x 15",
      "Prone Y-T-W raises - 3 x 8 each pattern",
      "Reverse snow angels - 3 x 12",
      "Towel isometric rows - 3 x 20-30 sec",
      "Bird dogs - 3 x 10 each side",
      "Superman hold - 3 x 25-35 sec",
    ],
    cardio: "Brisk walk, bike, or elliptical - 25-30 minutes",
  },
  {
    day: "Day 5",
    title: "Full Body Endurance + Moderate Cardio",
    focus: "Stamina, calorie burn, total-body conditioning",
    workout: [
      "Push-ups - 8-12",
      "Bodyweight squats - 20",
      "Alternating lunges - 10 each leg",
      "Plank shoulder taps - 20 total",
      "Glute bridges - 15",
      "Mountain climbers - 30 seconds",
      "Bear crawl hold or high plank - 20-30 sec",
      "Repeat circuit for 5 rounds; rest 60 sec between rounds",
    ],
    cardio: "Brisk walk or incline walk - 20-30 minutes",
  },
];

const progression = [
  {
    weeks: "Weeks 1-2",
    details: "Learn the movements, stay near the lower end of rep ranges, keep cardio at 20-25 minutes.",
  },
  {
    weeks: "Weeks 3-4",
    details: "Add reps to each set, add one extra set to 1-2 exercises per workout, bring cardio to 25-30 minutes.",
  },
  {
    weeks: "Weeks 5-6",
    details: "Reduce rest slightly, increase circuit pace without losing form, bring cardio to 30-35 minutes on 2-3 days.",
  },
  {
    weeks: "Weeks 7-8",
    details: "Push toward the top end of all rep ranges, try harder variations where possible, keep cardio consistent.",
  },
];

const tips = [
  "Warm up 5-8 minutes before every workout.",
  "Rest 30-60 seconds between sets.",
  "Move with control, not sloppy speed.",
  "Stop 1-2 reps before failure on most sets.",
  "Aim for 8,000-10,000 steps per day.",
];

const timerOptions = [30, 45, 60, 90];

function readStorage(key, fallback) {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : fallback;
  } catch {
    return fallback;
  }
}

function normalizeWeeks(weeks) {
  if (!Array.isArray(weeks) || weeks.length === 0) return null;

  const now = new Date().toISOString();
  return weeks.map((week, index) => {
    const number = Number(week?.number) || index + 1;
    const startedAt = typeof week?.startedAt === "string" ? week.startedAt : now;
    const completed = typeof week?.completed === "object" && week.completed ? week.completed : {};
    const id = typeof week?.id === "string" ? week.id : `week-${number}-${startedAt}`;

    return {
      id,
      number,
      startedAt,
      completed,
    };
  });
}

function createWeek(number, completed = {}) {
  const startedAt = new Date().toISOString();
  return {
    id: `week-${number}-${startedAt}`,
    number,
    startedAt,
    completed,
  };
}

function formatTime(seconds) {
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
}

function readTextStorage(key, fallback) {
  return localStorage.getItem(key) || fallback;
}

export default function CalisthenicsWorkoutApp() {
  const dayKeys = days.map((day) => day.day);
  const [selectedDay, setSelectedDay] = useState(days[0].day);
  const [weeks, setWeeks] = useState(() => {
    const savedWeeks = normalizeWeeks(readStorage("workout-weeks", null));
    if (savedWeeks) return savedWeeks;

    const legacyCompleted = readStorage("workout-completed", {});
    return [createWeek(1, legacyCompleted)];
  });
  const [currentWeekIndex, setCurrentWeekIndex] = useState(() => {
    const savedIndex = readStorage("workout-current-week", 0);
    return typeof savedIndex === "number" && Number.isFinite(savedIndex) ? savedIndex : 0;
  });
  const [startingWeight, setStartingWeight] = useState(() => readTextStorage("starting-weight", String(defaultStartingWeight)));
  const [goalWeight, setGoalWeight] = useState(() => readTextStorage("goal-weight", String(defaultGoalWeight)));
  const [weight, setWeight] = useState(() => readTextStorage("current-weight", String(defaultStartingWeight)));
  const [weightLog, setWeightLog] = useState(() =>
    readStorage("weight-log", [{ date: new Date().toLocaleDateString(), weight: String(defaultStartingWeight) }]),
  );
  const [timerSeconds, setTimerSeconds] = useState(60);
  const [timeLeft, setTimeLeft] = useState(60);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    localStorage.setItem("workout-weeks", JSON.stringify(weeks));
  }, [weeks]);

  useEffect(() => {
    const safeIndex = Math.min(Math.max(0, currentWeekIndex), Math.max(0, weeks.length - 1));
    if (safeIndex !== currentWeekIndex) {
      setCurrentWeekIndex(safeIndex);
      return;
    }

    localStorage.setItem("workout-current-week", JSON.stringify(safeIndex));
  }, [currentWeekIndex, weeks.length]);

  useEffect(() => {
    localStorage.setItem("starting-weight", startingWeight);
  }, [startingWeight]);

  useEffect(() => {
    localStorage.setItem("goal-weight", goalWeight);
  }, [goalWeight]);

  useEffect(() => {
    localStorage.setItem("current-weight", weight);
  }, [weight]);

  useEffect(() => {
    localStorage.setItem("weight-log", JSON.stringify(weightLog));
  }, [weightLog]);

  useEffect(() => {
    if (!running) return undefined;

    const interval = setInterval(() => {
      setTimeLeft((time) => {
        if (time <= 1) {
          clearInterval(interval);
          setRunning(false);
          return 0;
        }

        return time - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [running]);

  const currentWeek = weeks[currentWeekIndex] || weeks[0];
  const completed = currentWeek?.completed || {};
  const currentWeekNumber = Number(currentWeek?.number) || currentWeekIndex + 1;

  useEffect(() => {
    localStorage.setItem("workout-completed", JSON.stringify(completed));
  }, [completed]);

  const activeDay = days.find((day) => day.day === selectedDay) || days[0];
  const completionCount = dayKeys.filter((key) => completed[key]).length;
  const workoutProgress = Math.round((completionCount / days.length) * 100);
  const startWeightValue = Number(startingWeight) || defaultStartingWeight;
  const goalWeightValue = Number(goalWeight) || defaultGoalWeight;
  const currentWeight = Number(weight) || startWeightValue;
  const poundsLost = Math.max(0, startWeightValue - currentWeight);
  const poundsRemaining = Math.max(0, currentWeight - goalWeightValue);
  const timerProgress = timerSeconds > 0 ? Math.round(((timerSeconds - timeLeft) / timerSeconds) * 100) : 0;
  const timerStatus = timeLeft === 0 ? "Done" : running ? "Running" : timeLeft === timerSeconds ? "Ready" : "Paused";

  const toggleDay = (day) => {
    setWeeks((prev) =>
      prev.map((week, index) => {
        if (index !== currentWeekIndex) return week;
        const weekCompleted = week.completed || {};
        return {
          ...week,
          completed: { ...weekCompleted, [day]: !weekCompleted[day] },
        };
      }),
    );
  };

  const saveWeightEntry = () => {
    if (!weight) return;
    setWeightLog((prev) => [{ date: new Date().toLocaleDateString(), weight }, ...prev]);
  };

  const resetWeek = () => {
    setWeeks((prev) =>
      prev.map((week, index) => {
        if (index !== currentWeekIndex) return week;
        return { ...week, completed: {} };
      }),
    );
  };

  const startNextWeek = () => {
    setWeeks((prev) => {
      const lastNumber = prev.reduce((max, week) => Math.max(max, Number(week?.number) || 0), 0) || prev.length;
      const nextWeek = createWeek(lastNumber + 1, {});
      const nextWeeks = [...prev, nextWeek];
      setCurrentWeekIndex(nextWeeks.length - 1);
      return nextWeeks;
    });
  };

  const clearWeightLog = () => {
    setStartingWeight(String(defaultStartingWeight));
    setGoalWeight(String(defaultGoalWeight));
    setWeight(String(defaultStartingWeight));
    setWeightLog([{ date: new Date().toLocaleDateString(), weight: String(defaultStartingWeight) }]);
  };

  const resetTimer = () => {
    setRunning(false);
    setTimeLeft(timerSeconds);
  };

  const selectTimer = (seconds) => {
    setTimerSeconds(seconds);
    setTimeLeft(seconds);
    setRunning(false);
  };

  return (
    <main className="app-shell">
      <section className="hero-panel">
        <div>
          <p className="eyebrow">8-week training dashboard</p>
          <h1>Calisthenics Fat-Loss Plan</h1>
          <p className="hero-copy">
            A focused 5-day bodyweight routine with cardio, weight tracking, weekly completion, and a rest timer.
          </p>
        </div>

        <div className="progress-card" aria-label={`${workoutProgress}% of Week ${currentWeekNumber} workouts completed`}>
          <div className="progress-card__top">
            <span>
              Week {currentWeekNumber}
              {currentWeekNumber <= planWeeks ? ` of ${planWeeks}` : ""}
            </span>
            <strong>{completionCount}/5</strong>
          </div>
          <div className="progress-bar">
            <span style={{ width: `${workoutProgress}%` }} />
          </div>

          <div className="week-controls">
            <label className="week-picker">
              <span>Current week</span>
              <select onChange={(event) => setCurrentWeekIndex(Number(event.target.value))} value={currentWeekIndex}>
                {weeks.map((week, index) => {
                  const weekNumber = Number(week?.number) || index + 1;
                  let dateLabel = "";
                  if (typeof week?.startedAt === "string") {
                    const parsed = Date.parse(week.startedAt);
                    if (!Number.isNaN(parsed)) {
                      dateLabel = new Date(parsed).toLocaleDateString();
                    }
                  }
                  return (
                    <option key={week.id ?? `${weekNumber}-${index}`} value={index}>
                      Week {weekNumber}{dateLabel ? ` · ${dateLabel}` : ""}
                    </option>
                  );
                })}
              </select>
            </label>

            <div className="week-actions">
              <button className="ghost-button" type="button" onClick={startNextWeek}>
                Start next week
              </button>
              <button className="ghost-button" type="button" onClick={resetWeek}>
                Reset this week
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="stats-grid" aria-label="Plan stats">
        <div className="stat-tile">
          <span>Goal</span>
          <strong>{startWeightValue} to {goalWeightValue} lbs</strong>
        </div>
        <div className="stat-tile">
          <span>Current</span>
          <strong>{currentWeight} lbs</strong>
        </div>
        <div className="stat-tile">
          <span>Down</span>
          <strong>{poundsLost} lbs</strong>
        </div>
        <div className="stat-tile">
          <span>Remaining</span>
          <strong>{poundsRemaining} lbs</strong>
        </div>
      </section>

      <section className="panel workout-panel">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Today</p>
            <h2>Workout Tracker</h2>
          </div>
          <button className={completed[activeDay.day] ? "success-button" : "primary-button"} type="button" onClick={() => toggleDay(activeDay.day)}>
            {completed[activeDay.day] ? "Completed" : "Mark complete"}
          </button>
        </div>

        <div className="day-tabs" role="tablist" aria-label="Workout days">
          {days.map((item) => (
            <button
              className={selectedDay === item.day ? "day-tab day-tab--active" : "day-tab"}
              key={item.day}
              onClick={() => setSelectedDay(item.day)}
              type="button"
            >
              <span>{item.day}</span>
              {completed[item.day] && <small>Done</small>}
            </button>
          ))}
        </div>

        <article className="workout-card">
          <div className="workout-card__header">
            <div>
              <span>{activeDay.day}</span>
              <h3>{activeDay.title}</h3>
              <p>{activeDay.focus}</p>
            </div>
          </div>

          <ul className="exercise-list">
            {activeDay.workout.map((exercise) => (
              <li key={exercise}>{exercise}</li>
            ))}
          </ul>

          <div className="cardio-note">
            <span>Cardio</span>
            <p>{activeDay.cardio}</p>
          </div>
        </article>
      </section>

      <section className="split-grid">
        <div className="panel">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Body weight</p>
              <h2>Weight Tracker</h2>
            </div>
            <button className="ghost-button" type="button" onClick={clearWeightLog}>
              Reset
            </button>
          </div>

          <div className="weight-form">
            <div className="weight-input-grid">
              <label htmlFor="starting-weight">
                Starting
                <input
                  id="starting-weight"
                  inputMode="decimal"
                  min="0"
                  onChange={(event) => setStartingWeight(event.target.value)}
                  placeholder="205"
                  type="number"
                  value={startingWeight}
                />
              </label>

              <label htmlFor="weight">
                Current
                <input
                  id="weight"
                  inputMode="decimal"
                  min="0"
                  onChange={(event) => setWeight(event.target.value)}
                  placeholder="Enter weight"
                  type="number"
                  value={weight}
                />
              </label>

              <label htmlFor="goal-weight">
                Goal
                <input
                  id="goal-weight"
                  inputMode="decimal"
                  min="0"
                  onChange={(event) => setGoalWeight(event.target.value)}
                  placeholder="185"
                  type="number"
                  value={goalWeight}
                />
              </label>
            </div>

            <div className="weight-actions">
              <button className="primary-button" onClick={saveWeightEntry} type="button">
                Save current weight
              </button>
            </div>
          </div>

          <div className="weight-log">
            {weightLog.map((entry, index) => (
              <div className="log-row" key={`${entry.date}-${entry.weight}-${index}`}>
                <span>{entry.date}</span>
                <strong>{entry.weight} lbs</strong>
              </div>
            ))}
          </div>
        </div>

        <div className="panel timer-panel">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Rest periods</p>
              <h2>Rest Timer</h2>
            </div>
            <span className="status-pill">{timerStatus}</span>
          </div>

          <div className="timer-display">
            <div className="timer-ring" style={{ "--timer-progress": `${timerProgress}%` }}>
              <span>{formatTime(timeLeft)}</span>
            </div>
          </div>

          <div className="timer-options" aria-label="Timer length">
            {timerOptions.map((seconds) => (
              <button
                className={timerSeconds === seconds ? "chip chip--active" : "chip"}
                key={seconds}
                onClick={() => selectTimer(seconds)}
                type="button"
              >
                {seconds}s
              </button>
            ))}
          </div>

          <div className="button-row">
            <button className="primary-button" disabled={running || timeLeft === 0} onClick={() => setRunning(true)} type="button">
              {timeLeft < timerSeconds && timeLeft > 0 ? "Resume" : "Start"}
            </button>
            <button className="secondary-button" disabled={!running} onClick={() => setRunning(false)} type="button">
              Pause
            </button>
            <button className="secondary-button" onClick={resetTimer} type="button">
              Reset
            </button>
          </div>
        </div>
      </section>

      <section className="split-grid split-grid--bottom">
        <div className="panel">
          <div className="section-heading">
            <div>
              <p className="eyebrow">8-week arc</p>
              <h2>Progression</h2>
            </div>
          </div>

          <div className="progression-list">
            {progression.map((item) => (
              <article key={item.weeks}>
                <strong>{item.weeks}</strong>
                <p>{item.details}</p>
              </article>
            ))}
          </div>
        </div>

        <div className="panel">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Form guardrails</p>
              <h2>Quick Rules</h2>
            </div>
          </div>

          <ul className="rules-list">
            {tips.map((tip) => (
              <li key={tip}>{tip}</li>
            ))}
          </ul>
        </div>
      </section>
    </main>
  );
}
