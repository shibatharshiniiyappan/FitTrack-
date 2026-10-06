import { useEffect, useState, useRef } from 'react'
import {
  Activity,
  BarChart3,
  CalendarDays,
  Flame,
  Goal,
  HeartPulse,
  History,
  Home,
  Menu,
  Play,
  Target,
  Trophy,
  Dumbbell,
  UserRound,
} from 'lucide-react'
import './App.css'

const achievements = [
  {
    id: 'first-workout',
    icon: '🏋️',
    title: 'First Step',
    description: 'Complete your first workout',
    requirement: 1,
  },
  {
    id: 'five-workouts',
    icon: '🔥',
    title: 'Getting Strong',
    description: 'Complete 5 workouts',
    requirement: 5,
  },
  {
    id: 'ten-workouts',
    icon: '⚡',
    title: 'Consistency',
    description: 'Complete 10 workouts',
    requirement: 10,
  },
  {
    id: 'twenty-workouts',
    icon: '🏆',
    title: 'Fitness Warrior',
    description: 'Complete 20 workouts',
    requirement: 20,
  },
]

function App() {
  const defaultFitnessData = {
    steps: 6842,
    calories: 1420,
    activeMinutes: 42,
    workouts: 3,
    water: 4,
    goals: {
      steps: 10000,
      calories: 2000,
      activeMinutes: 60,
      workouts: 5,
      water: 8,
    },
  }

  const [fitnessData, setFitnessData] = useState(() => {
    const savedData = localStorage.getItem('fittrack-data')

    if (!savedData) {
      return defaultFitnessData
    }

    try {
      const parsedData = JSON.parse(savedData)

      return {
        ...defaultFitnessData,
        ...parsedData,
        goals: {
          ...defaultFitnessData.goals,
          ...(parsedData.goals || {}),
        },
      }
    } catch {
      return defaultFitnessData
    }
  })

  const [workoutStarted, setWorkoutStarted] = useState(false)
  const [workoutSeconds, setWorkoutSeconds] = useState(0)
  const [workoutType, setWorkoutType] = useState('Strength')

  // Load completed workout history
  const [workoutHistory, setWorkoutHistory] = useState(() => {
    const savedHistory = localStorage.getItem('fittrack-workouts')

    if (!savedHistory) {
      return []
    }

    try {
      return JSON.parse(savedHistory)
    } catch {
      return []
    }
  })

  // Achievement calculations must happen AFTER workoutHistory exists
  const completedWorkouts = workoutHistory.length

  const unlockedAchievements = achievements.filter(
    (achievement) =>
      completedWorkouts >= achievement.requirement,
  )

  const [showGoals, setShowGoals] = useState(false)
  const [activePage, setActivePage] = useState('Dashboard')
const [achievementPopup, setAchievementPopup] = useState(null)
  // Dynamic weekly activity based on completed workouts
  const weeklyActivity = (() => {
    const today = new Date()

    return Array.from({ length: 7 }, (_, index) => {
      const date = new Date(today)

      date.setDate(today.getDate() - (6 - index))

      const dateKey = date.toLocaleDateString()

      const minutes = workoutHistory
        .filter((workout) => workout.date === dateKey)
        .reduce(
          (total, workout) => total + workout.duration,
          0,
        )

      return {
        day: date.toLocaleDateString('en-US', {
          weekday: 'short',
        }),
        value: Math.min(minutes, 100),
      }
    })
  })()

  const [goalForm, setGoalForm] = useState(
    fitnessData.goals,
  )

  const workoutTimerRef = useRef(null)

  // Save fitness data
  useEffect(() => {
    localStorage.setItem(
      'fittrack-data',
      JSON.stringify(fitnessData),
    )
  }, [fitnessData])

  // Save workout history
  useEffect(() => {
    localStorage.setItem(
      'fittrack-workouts',
      JSON.stringify(workoutHistory),
    )
  }, [workoutHistory])

  // Workout timer
  useEffect(() => {
    if (workoutStarted) {
      workoutTimerRef.current = setInterval(() => {
        setWorkoutSeconds((seconds) => seconds + 1)
      }, 1000)
    }

    return () => {
      if (workoutTimerRef.current) {
        clearInterval(workoutTimerRef.current)
      }
    }
  }, [workoutStarted])

  const today = new Date()

  const formattedDate = today.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })

  const navItems = [
    { label: 'Dashboard', icon: Home },
    { label: 'Workouts', icon: Dumbbell },
    { label: 'History', icon: History },
    { label: 'Goals', icon: Target },
  ]

  // Daily progress percentage
  const activityPercentage = Math.min(
    Math.round(
      ((fitnessData.steps / fitnessData.goals.steps +
        fitnessData.calories /
          fitnessData.goals.calories +
        fitnessData.activeMinutes /
          fitnessData.goals.activeMinutes) /
        3) *
        100,
    ),
    100,
  )

  const metrics = [
    {
      label: 'Steps',
      value: fitnessData.steps.toLocaleString(),
      target: fitnessData.goals.steps.toLocaleString(),
      icon: Activity,
      accent: 'lime',
    },
    {
      label: 'Calories',
      value: fitnessData.calories.toLocaleString(),
      target: `${fitnessData.goals.calories.toLocaleString()} kcal`,
      icon: Flame,
      accent: 'coral',
    },
    {
      label: 'Active Time',
      value: fitnessData.activeMinutes,
      target: `${fitnessData.goals.activeMinutes} min`,
      icon: HeartPulse,
      accent: 'cyan',
    },
    {
      label: 'Workouts',
      value: fitnessData.workouts,
      target: `${fitnessData.goals.workouts} this week`,
      icon: Dumbbell,
      accent: 'purple',
    },
  ]

  // Save customized goals
  const saveGoals = () => {
    setFitnessData((current) => ({
      ...current,
      goals: {
        steps: Number(goalForm.steps),
        calories: Number(goalForm.calories),
        activeMinutes: Number(goalForm.activeMinutes),
        workouts: Number(goalForm.workouts),
        water: Number(goalForm.water),
      },
    }))

    setShowGoals(false)
  }

  // Progress percentage helper
  const getMetricProgress = (label) => {
    let progress = 0

    if (label === 'Steps') {
      progress =
        (fitnessData.steps / fitnessData.goals.steps) * 100
    } else if (label === 'Calories') {
      progress =
        (fitnessData.calories /
          fitnessData.goals.calories) *
        100
    } else if (label === 'Active Time') {
      progress =
        (fitnessData.activeMinutes /
          fitnessData.goals.activeMinutes) *
        100
    } else if (label === 'Workouts') {
      progress =
        (fitnessData.workouts /
          fitnessData.goals.workouts) *
        100
    }

    return Math.min(progress, 100)
  }

  // Weekly workout progress
  const workoutGoalPercentage = Math.min(
    Math.round(
      (fitnessData.workouts /
        fitnessData.goals.workouts) *
        100,
    ),
    100,
  )

  // Start / stop workout
  const handleWorkoutToggle = () => {
    if (workoutStarted) {
      const completedMinutes = Math.max(
        Math.floor(workoutSeconds / 60),
        1,
      )

      // Estimated calories burned per minute
      const calorieRates = {
        Strength: 7,
        Cardio: 10,
        Yoga: 4,
        HIIT: 12,
      }

      const caloriesBurned =
        completedMinutes * calorieRates[workoutType]

      // Update fitness totals
      setFitnessData((current) => ({
        ...current,
        workouts: current.workouts + 1,
        activeMinutes:
          current.activeMinutes + completedMinutes,
        calories: current.calories + caloriesBurned,
      }))

      // Save completed workout
      setWorkoutHistory((current) => [
        {
          id: Date.now(),
          type: workoutType,
          duration: completedMinutes,
          calories: caloriesBurned,
          date: new Date().toLocaleDateString(),
        },
        ...current,
      ])

      setWorkoutStarted(false)
      setWorkoutSeconds(0)
    } else {
      setWorkoutSeconds(0)
      setWorkoutStarted(true)
    }
  }

  const handleNavigation = (label) => {
  if (label === 'Goals') {
    setGoalForm(fitnessData.goals)
    setShowGoals(true)
    return
  }

  if (label === 'History') {
    setActivePage('History')
    return
  }

  if (label === 'Workouts') {
    setActivePage('Workouts')

    setTimeout(() => {
      document
        .getElementById('workout-section')
        ?.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        })
    }, 50)

    return
  }

  setActivePage('Dashboard')
}

  return (
    <div className="app-shell">
      <div className="ambient ambient-one"></div>
      <div className="ambient ambient-two"></div>

      {/* TOP BAR */}
      <header className="topbar">
        <div className="brand">
          <div className="brand-icon">
            <Activity size={22} strokeWidth={2.5} />
          </div>

          <div>
            <div className="brand-name">FitTrack</div>

            <div className="brand-tagline">
              Move. Track. Improve.
            </div>
          </div>
        </div>

        <nav className="desktop-nav">
          {navItems.map(({ label, icon: Icon }) => (
            <button
              key={label}
              className={`nav-item ${
                label === activePage ? 'active' : ''
              }`}
              onClick={() => handleNavigation(label)}
            >
              <Icon size={17} />
              <span>{label}</span>
            </button>
          ))}
        </nav>

        <div className="profile-button">
          <UserRound size={18} />
        </div>

        <button
          className="mobile-menu"
          aria-label="Open navigation"
        >
          <Menu size={22} />
        </button>
      </header>

      {/* MAIN CONTENT */}
      <main className="dashboard">
        {activePage === 'History' ? (
          /* HISTORY PAGE */
          <section className="glass-card history-card">
            <div className="card-header">
              <div>
                <span className="section-label">
                  WORKOUT LOG
                </span>

                <h2>Workout History</h2>
                <div className="history-stats">
                  <div className="history-activity">
  <div className="history-activity-header">
    <span>Weekly Activity</span>
    <small>Minutes</small>
  </div>

  <div className="activity-bars">
    {weeklyActivity.map((item) => (
      <div className="activity-bar-item" key={item.day}>
        <div className="activity-bar-track">
          <div
            className="activity-bar-fill"
            style={{ height: `${Math.max(item.value, 4)}%` }}
          />
        </div>

        <span>{item.day}</span>
      </div>
    ))}
  </div>
</div>
  <div>
    <strong>{workoutHistory.length}</strong>
    <span>Workouts</span>
  </div>

  <div>
    <strong>
      {workoutHistory.reduce(
        (total, workout) => total + workout.duration,
        0,
      )}
    </strong>
    <span>Minutes</span>
  </div>

  <div>
    <strong>
      {workoutHistory.length
        ? Math.round(
            workoutHistory.reduce(
              (total, workout) => total + workout.duration,
              0,
            ) / workoutHistory.length,
          )
        : 0}
    </strong>
    <span>Avg. Minutes</span>
  </div>
</div><h2>Workout History</h2>
              </div>

              <History size={22} />
            </div>

            {workoutHistory.length === 0 ? (
              <div className="history-empty">
                <Dumbbell size={34} />

                <h3>No workouts yet</h3>

                <p>
                  Complete your first workout and it will
                  appear here.
                </p>
              </div>
            ) : (
              <div className="history-list">
                {workoutHistory.map((workout) => (
                  <div
                    className="history-item"
                    key={workout.id}
                  >
                    <div className="history-icon">
                      <Dumbbell size={18} />
                    </div>

                    <div className="history-details">
                      <strong>{workout.type}</strong>
                      <span>{workout.date}</span>
                    </div>

                    <div className="history-duration">
                      {workout.duration} min
                    </div>
                  </div>
                ))}
              </div>
            )}

            <button
              className="secondary-button history-back"
              onClick={() => setActivePage('Dashboard')}
            >
              <Home size={16} />
              Back to Dashboard
            </button>
          </section>
        ) : (
          <>
            {/* WELCOME */}
            <section className="welcome-section">
              <div>
                <div className="eyebrow">
                  <CalendarDays size={15} />
                  {formattedDate}
                </div>

                <h1>
                  Ready to <span>move?</span>
                </h1>

                <p>
                  Keep going. Every small step today brings
                  you closer to your goals.
                </p>
              </div>

              <div className="streak-card">
                <div className="streak-icon">
                  <Flame size={23} />
                </div>

                <div>
                  <strong>7 day streak</strong>
                  <span>Keep it going!</span>
                </div>
              </div>
            </section>

            {/* METRICS */}
            <section className="metrics-grid">
              {metrics.map(
                ({
                  label,
                  value,
                  target,
                  icon: Icon,
                  accent,
                }) => (
                  <article
                    className={`metric-card ${accent}`}
                    key={label}
                  >
                    <div className="metric-top">
                      <div className="metric-icon">
                        <Icon size={20} />
                      </div>

                      <span className="metric-label">
                        {label}
                      </span>
                    </div>

                    <div className="metric-value">
                      {value}

                      {label === 'Active Time' && (
                        <small> min</small>
                      )}
                    </div>

                    <div className="metric-footer">
                      <span>Goal: {target}</span>
                      <BarChart3 size={15} />
                    </div>

                    <div className="progress-track">
                      <div
                        className="progress-fill"
                        style={{
                          width: `${getMetricProgress(
                            label,
                          )}%`,
                        }}
                      ></div>
                    </div>
                  </article>
                ),
              )}
            </section>

            {/* MAIN CARDS */}
            <section className="main-grid">
              {/* DAILY ACTIVITY */}
              <article className="glass-card activity-card">
                <div className="card-header">
                  <div>
                    <span className="section-label">
                      TODAY'S ACTIVITY
                    </span>

                    <h2>Daily Progress</h2>
                  </div>

                  <button className="icon-button">
                    <BarChart3 size={18} />
                  </button>
                </div>

                <div className="activity-content">
                  <div
                    className="progress-ring"
                    style={{
                      '--progress': `${activityPercentage}%`,
                    }}
                  >
                    <div className="ring-inner">
                      <strong>
                        {activityPercentage}%
                      </strong>

                      <span>completed</span>
                    </div>
                  </div>

                  <div className="activity-details">
                    <div className="activity-row">
                      <span>
                        <i className="dot lime"></i>
                        Steps
                      </span>

                      <strong>
                        {fitnessData.steps.toLocaleString()} /{' '}
                        {fitnessData.goals.steps.toLocaleString()}
                      </strong>
                    </div>

                    <div className="activity-row">
                      <span>
                        <i className="dot coral"></i>
                        Calories
                      </span>

                      <strong>
                        {fitnessData.calories.toLocaleString()} /{' '}
                        {fitnessData.goals.calories.toLocaleString()}
                      </strong>
                    </div>

                    <div className="activity-row">
                      <span>
                        <i className="dot cyan"></i>
                        Active minutes
                      </span>

                      <strong>
                        {fitnessData.activeMinutes} /{' '}
                        {fitnessData.goals.activeMinutes}
                      </strong>
                    </div>
                  </div>
                </div>
              </article>

              {/* WORKOUT */}
              <article
  id="workout-section"
  className="glass-card workout-card"
>
                <div className="card-header">
                  <div>
                    <span className="section-label">
                      QUICK START
                    </span>

                    <h2>Workout</h2>
                  </div>

                  <Dumbbell size={21} />
                </div>

                <div className="workout-types">
                  {[
                    'Strength',
                    'Cardio',
                    'Yoga',
                    'HIIT',
                  ].map((type) => (
                    <button
                      key={type}
                      className={`workout-type ${
                        workoutType === type
                          ? 'selected'
                          : ''
                      }`}
                      onClick={() =>
                        setWorkoutType(type)
                      }
                      disabled={workoutStarted}
                    >
                      {type}
                    </button>
                  ))}
                </div>

                <div
                  className={`workout-placeholder ${
                    workoutStarted
                      ? 'workout-active'
                      : ''
                  }`}
                >
                  <div className="workout-icon">
                    <Play
                      size={25}
                      fill="currentColor"
                    />
                  </div>

                  <h3>
                    {workoutStarted
                      ? 'Workout in progress'
                      : 'Ready for your next workout?'}
                  </h3>

                  <p>
                    {workoutStarted
                      ? `${workoutType} • Elapsed time: ${Math.floor(
                          workoutSeconds / 60,
                        )
                          .toString()
                          .padStart(2, '0')}:${(
                          workoutSeconds % 60
                        )
                          .toString()
                          .padStart(2, '0')}`
                      : `Ready for ${workoutType.toLowerCase()} workout.`}
                  </p>

                  <button
                    className="primary-button"
                    onClick={handleWorkoutToggle}
                  >
                    <Play
                      size={17}
                      fill="currentColor"
                    />

                    {workoutStarted
                      ? 'Stop Workout'
                      : 'Start Workout'}
                  </button>
                </div>
              </article>
            </section>

            {/* WEEKLY SECTION */}
            <section className="bottom-grid">
              {/* WEEKLY ACTIVITY */}
              <article className="glass-card weekly-card">
                <div className="card-header">
                  <div>
                    <span className="section-label">
                      OVERVIEW
                    </span>

                    <h2>Weekly Activity</h2>
                  </div>

                  <span className="coming-soon">
                    Live data
                  </span>
                </div>

                <div className="weekly-chart">
                  <div className="chart-bars">
                    {weeklyActivity.map((item) => (
                      <div
                        className="chart-column"
                        key={item.day}
                      >
                        <div className="chart-value">
                          {item.value}
                        </div>

                        <div className="chart-bar-track">
                          <div
                            className="chart-bar-fill"
                            style={{
                              height: `${item.value}%`,
                            }}
                          ></div>
                        </div>

                        <span>{item.day}</span>
                      </div>
                    ))}
                  </div>

                  <div className="chart-summary">
                    <div>
                      <strong>
                        Weekly Activity
                      </strong>

                      <span>Minutes active</span>
                    </div>

                    <div className="chart-average">
                      <strong>
                        {Math.round(
                          weeklyActivity.reduce(
                            (total, item) =>
                              total + item.value,
                            0,
                          ) /
                            weeklyActivity.length,
                        )}
                      </strong>

                      <span>avg / day</span>
                    </div>
                  </div>
                </div>
              </article>

              {/* ACHIEVEMENTS */}
              <section className="dashboard-card achievements-card">
                <div className="section-heading">
                  <div>
                    <span className="section-eyebrow">
                      MILESTONES
                    </span>

                    <h2>Achievements</h2>
                  </div>

                  <span className="achievement-count">
                    {unlockedAchievements.length}/
                    {achievements.length}
                  </span>
                </div>

                <div className="achievements-grid">
                  {achievements.map((achievement) => {
                    const unlocked =
                      completedWorkouts >=
                      achievement.requirement

                    return (
                      <div
                        key={achievement.id}
                        className={`achievement-item ${
                          unlocked
                            ? 'unlocked'
                            : 'locked'
                        }`}
                      >
                        <div className="achievement-icon">
                          {achievement.icon}
                        </div>

                        <div className="achievement-info">
                          <strong>
                            {achievement.title}
                          </strong>

                          <span>
                            {achievement.description}
                          </span>
                        </div>

                        <div className="achievement-status">
                          {unlocked
                            ? '✓'
                            : `${completedWorkouts}/${achievement.requirement}`}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </section>

              {/* WEEKLY GOAL */}
              <article className="glass-card goal-card">
                <div className="card-header">
                  <div>
                    <span className="section-label">
                      YOUR TARGET
                    </span>

                    <h2>Weekly Goal</h2>
                  </div>

                  <Goal size={21} />
                </div>

                <div className="goal-content">
                  <div className="goal-number">
                    <strong>
                      {fitnessData.workouts}
                    </strong>

                    <span>
                      / {fitnessData.goals.workouts}{' '}
                      workouts
                    </span>
                  </div>

                  <div className="goal-progress">
                    <div
                      className="goal-progress-fill"
                      style={{
                        width: `${workoutGoalPercentage}%`,
                      }}
                    ></div>
                  </div>

                  <div className="goal-percentage">
                    {workoutGoalPercentage}% complete
                  </div>

                  <p>
                    {fitnessData.workouts >=
                    fitnessData.goals.workouts
                      ? 'Weekly workout goal complete! 🎉'
                      : `${Math.max(
                          fitnessData.goals.workouts -
                            fitnessData.workouts,
                          0,
                        )} more workouts to reach your weekly goal.`}
                  </p>
                </div>
              </article>
            </section>

            {/* HYDRATION */}
            <section className="glass-card hydration-card">
              <div className="card-header">
                <div>
                  <span className="section-label">
                    HYDRATION
                  </span>

                  <h2>Water Intake</h2>
                </div>

                <span className="hydration-count">
                  {fitnessData.water} /{' '}
                  {fitnessData.goals.water} glasses
                </span>
              </div>

              <div className="water-glasses">
                {Array.from(
                  {
                    length: fitnessData.goals.water,
                  },
                  (_, index) => (
                    <button
                      key={index}
                      className={`water-glass ${
                        index < fitnessData.water
                          ? 'filled'
                          : ''
                      }`}
                      aria-label={`Glass ${index + 1}`}
                      onClick={() =>
                        setFitnessData((current) => ({
                          ...current,
                          water: index + 1,
                        }))
                      }
                    >
                      💧
                    </button>
                  ),
                )}
              </div>

              <p className="hydration-message">
                {fitnessData.water >=
                fitnessData.goals.water
                  ? 'Hydration goal complete! 💧'
                  : `${
                      fitnessData.goals.water -
                      fitnessData.water
                    } more glasses to reach your goal.`}
              </p>
            </section>

            {/* ACHIEVEMENT FOOTER */}
            <section className="achievement-preview">
              <Trophy size={18} />

              <span>
                <strong>Achievements</strong> and personal
                milestones will be unlocked as you
                progress.
              </span>
            </section>
          </>
        )}
      </main>

      {/* GOALS MODAL */}
      {showGoals && (
        <div
          className="goals-overlay"
          onClick={() => setShowGoals(false)}
        >
          <div
            className="goals-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <div className="goals-modal-header">
              <div>
                <span className="section-label">
                  PERSONALIZE
                </span>

                <h2>Fitness Goals</h2>

                <p>
                  Set targets that match your routine.
                </p>
              </div>

              <button
                className="goals-close"
                onClick={() => setShowGoals(false)}
                aria-label="Close goals"
              >
                ×
              </button>
            </div>

            <div className="goals-form">
              <label>
                <span>👟 Daily Steps</span>

                <input
                  type="number"
                  min="100"
                  value={goalForm.steps}
                  onChange={(event) =>
                    setGoalForm({
                      ...goalForm,
                      steps: event.target.value,
                    })
                  }
                />
              </label>

              <label>
                <span>🔥 Daily Calories</span>

                <input
                  type="number"
                  min="100"
                  value={goalForm.calories}
                  onChange={(event) =>
                    setGoalForm({
                      ...goalForm,
                      calories: event.target.value,
                    })
                  }
                />
              </label>

              <label>
                <span>❤️ Active Minutes</span>

                <input
                  type="number"
                  min="1"
                  value={goalForm.activeMinutes}
                  onChange={(event) =>
                    setGoalForm({
                      ...goalForm,
                      activeMinutes: event.target.value,
                    })
                  }
                />
              </label>

              <label>
                <span>🏋️ Weekly Workouts</span>

                <input
                  type="number"
                  min="1"
                  value={goalForm.workouts}
                  onChange={(event) =>
                    setGoalForm({
                      ...goalForm,
                      workouts: event.target.value,
                    })
                  }
                />
              </label>

              <label>
                <span>💧 Daily Water Glasses</span>

                <input
                  type="number"
                  min="1"
                  max="20"
                  value={goalForm.water}
                  onChange={(event) =>
                    setGoalForm({
                      ...goalForm,
                      water: event.target.value,
                    })
                  }
                />
              </label>
            </div>

            <div className="goals-modal-actions">
              <button
                className="secondary-button"
                onClick={() => setShowGoals(false)}
              >
                Cancel
              </button>

              <button
                className="primary-button"
                onClick={saveGoals}
              >
                Save Goals
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MOBILE NAVIGATION */}
      <nav className="mobile-nav">
        {navItems.map(({ label, icon: Icon }) => (
          <button
            key={label}
            className={
              label === activePage ? 'active' : ''
            }
            onClick={() => handleNavigation(label)}
          >
            <Icon size={19} />
            <span>{label}</span>
          </button>
        ))}
      </nav>
    </div>
  )
}

export default App