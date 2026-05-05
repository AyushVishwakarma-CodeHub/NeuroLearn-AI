import React, { useState, useMemo } from 'react';
import './Planner.css';

function Planner({ topics, setActiveTab, setRevisionPickerTopic }) {
  const today = new Date();
  const [viewDate, setViewDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedDate, setSelectedDate] = useState(null);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const monthName = viewDate.toLocaleString('default', { month: 'long' });
  const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0=Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Build a map: "YYYY-MM-DD" -> [topics due that day]
  const topicsByDate = useMemo(() => {
    const map = {};
    topics.forEach(t => {
      if (!t.nextRevisionDate) return;
      const d = new Date(t.nextRevisionDate);
      const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
      if (!map[key]) map[key] = [];
      map[key].push(t);
    });
    return map;
  }, [topics]);

  const todayKey = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;

  const makeDateKey = (d) =>
    `${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;

  const getDotClass = (dateKey) => {
    const d = new Date(dateKey);
    const t = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    if (d < t) return 'dot-overdue';
    if (dateKey === todayKey) return 'dot-today';
    return 'dot-upcoming';
  };

  const prevMonth = () => setViewDate(new Date(year, month - 1, 1));
  const nextMonth = () => setViewDate(new Date(year, month + 1, 1));

  // Topics for selected date panel
  const selectedKey = selectedDate ? makeDateKey(selectedDate) : null;
  const selectedTopics = selectedKey ? (topicsByDate[selectedKey] || []) : [];

  // Today's tasks (overdue + due today)
  const todayTasks = useMemo(() => {
    const t = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    return topics.filter(top => {
      if (!top.nextRevisionDate) return false;
      const d = new Date(top.nextRevisionDate);
      const dDay = new Date(d.getFullYear(), d.getMonth(), d.getDate());
      return dDay <= t;
    });
  }, [topics]);

  // Build calendar grid (pad with nulls for offset)
  const calendarDays = [];
  const startOffset = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1; // Make Mon=0
  for (let i = 0; i < startOffset; i++) calendarDays.push(null);
  for (let d = 1; d <= daysInMonth; d++) calendarDays.push(d);

  return (
    <div className="planner-container">
      <div className="planner-top">
        
        {/* Calendar Card */}
        <div className="glass-card planner-calendar-card">
          <div className="calendar-nav">
            <button className="cal-nav-btn" onClick={prevMonth}>‹</button>
            <h2 className="cal-month-title">{monthName} {year}</h2>
            <button className="cal-nav-btn" onClick={nextMonth}>›</button>
          </div>

          <div className="calendar-weekdays">
            {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(d => (
              <div key={d} className="weekday-label">{d}</div>
            ))}
          </div>

          <div className="calendar-grid">
            {calendarDays.map((day, idx) => {
              if (!day) return <div key={`empty-${idx}`} className="cal-cell empty" />;
              const key = makeDateKey(day);
              const topicsOnDay = topicsByDate[key] || [];
              const isToday = key === todayKey;
              const isSelected = selectedDate === day && 
                viewDate.getMonth() === today.getMonth() ? true : selectedDate === day;

              return (
                <div
                  key={key}
                  className={`cal-cell ${isToday ? 'is-today' : ''} ${isSelected ? 'is-selected' : ''} ${topicsOnDay.length > 0 ? 'has-events' : ''}`}
                  onClick={() => setSelectedDate(day === selectedDate ? null : day)}
                >
                  <span className="day-number">{day}</span>
                  {topicsOnDay.length > 0 && (
                    <div className="event-dots">
                      {topicsOnDay.slice(0, 3).map((_, i) => (
                        <span key={i} className={`event-dot ${getDotClass(key)}`} />
                      ))}
                      {topicsOnDay.length > 3 && <span className="dot-more">+{topicsOnDay.length - 3}</span>}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="cal-legend">
            <span><span className="legend-dot dot-overdue" />Overdue</span>
            <span><span className="legend-dot dot-today" />Due Today</span>
            <span><span className="legend-dot dot-upcoming" />Upcoming</span>
          </div>
        </div>

        {/* Side Panel */}
        <div className="glass-card planner-side-panel">
          {selectedDate ? (
            <>
              <h3 className="side-panel-title">
                📅 {new Date(year, month, selectedDate).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
              </h3>
              {selectedTopics.length === 0 ? (
                <div className="side-empty">
                  <div style={{ fontSize: '2.5rem' }}>🎉</div>
                  <p>No revisions scheduled for this day!</p>
                </div>
              ) : (
                <div className="side-topic-list">
                  {selectedTopics.map((t, i) => {
                    const dKey = makeDateKey(selectedDate);
                    const dotClass = getDotClass(dKey);
                    return (
                      <div key={i} className="side-topic-item">
                        <div className="side-topic-info">
                          <div className={`side-topic-dot ${dotClass}`} />
                          <div>
                            <strong>{t.title}</strong>
                            <p>Retention: {t.retentionScore}%</p>
                          </div>
                        </div>
                        <button
                          className="btn-primary btn-sm"
                          onClick={() => {
                            if (setRevisionPickerTopic) setRevisionPickerTopic(t.title);
                          }}
                        >
                          🔄 Revise
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          ) : (
            <div className="side-empty">
              <div style={{ fontSize: '2.5rem' }}>📆</div>
              <p>Click any highlighted date to see what to revise.</p>
            </div>
          )}
        </div>
      </div>

      {/* Today's Tasks */}
      <div className="glass-card todays-tasks">
        <h3>📋 Today's Revision Tasks
          {todayTasks.length > 0 && <span className="task-badge">{todayTasks.length}</span>}
        </h3>

        {todayTasks.length === 0 ? (
          <div className="tasks-empty">
            <span style={{ fontSize: '2rem' }}>✅</span>
            <p>All caught up! No revisions due today.</p>
          </div>
        ) : (
          <div className="tasks-grid">
            {todayTasks.map((t, i) => {
              const dDate = new Date(t.nextRevisionDate);
              const tDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
              const dDay = new Date(dDate.getFullYear(), dDate.getMonth(), dDate.getDate());
              const isOverdue = dDay < tDay;
              return (
                <div key={i} className={`task-card ${isOverdue ? 'task-overdue' : 'task-due'}`}>
                  <div className="task-header">
                    <span className="task-status-icon">{isOverdue ? '⚠️' : '🔔'}</span>
                    <strong>{t.title}</strong>
                    <span className={`task-retention ${t.retentionScore < 50 ? 'ret-low' : 'ret-mid'}`}>
                      {t.retentionScore}% retention
                    </span>
                  </div>
                  <div className="task-footer">
                    <span className="task-date-label">
                      {isOverdue
                        ? `Overdue since ${dDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}`
                        : 'Due Today'}
                    </span>
                    <button
                      className="btn-primary btn-sm"
                      onClick={() => { if (setRevisionPickerTopic) setRevisionPickerTopic(t.title); }}
                    >
                      🔄 Revise Now
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default Planner;
