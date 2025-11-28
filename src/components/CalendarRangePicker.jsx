import React, { useState } from "react";
import PropTypes from "prop-types";

/**
 * CalendarRangePicker - Custom calendar UI for selecting date ranges
 * Props:
 *   startDate: Date | null
 *   endDate: Date | null
 *   onChange: (startDate, endDate) => void
 *   time: boolean - if true, show time selectors
 *   timeStart, timeEnd: default times for start/end
 */
export default function CalendarRangePicker({ startDate, endDate, onChange, time = false, timeStart = "00:00", timeEnd = "23:59" }) {
  // Current view months (show 2 months)
  const [leftMonth, setLeftMonth] = useState(() => {
    const d = startDate ? new Date(startDate) : new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });
  const rightMonth = new Date(leftMonth.getFullYear(), leftMonth.getMonth() + 1, 1);

  // Hover state for preview
  const [hoverDate, setHoverDate] = useState(null);

  // Navigate months
  const prevMonth = () => setLeftMonth(new Date(leftMonth.getFullYear(), leftMonth.getMonth() - 1, 1));
  const nextMonth = () => setLeftMonth(new Date(leftMonth.getFullYear(), leftMonth.getMonth() + 1, 1));

  // Handle date click
  const handleDateClick = (date) => {
    const d = new Date(date);
    if (time && startDate && timeStart) {
      const [h, m] = timeStart.split(":");
      d.setHours(Number(h), Number(m), 0, 0);
    }
    if (!startDate || (startDate && endDate)) {
      // Start new range
      onChange(d, null);
    } else {
      // Complete range
      if (d < startDate) {
        onChange(d, startDate);
      } else {
        const endD = new Date(d);
        if (time && timeEnd) {
          const [h, m] = timeEnd.split(":");
          endD.setHours(Number(h), Number(m), 59, 999);
        }
        onChange(startDate, endD);
      }
    }
  };

  // Check if date is in range
  const isInRange = (date) => {
    if (!startDate) return false;
    const check = endDate || hoverDate;
    if (!check) return false;
    const d = new Date(date).setHours(0, 0, 0, 0);
    const s = new Date(startDate).setHours(0, 0, 0, 0);
    const e = new Date(check).setHours(0, 0, 0, 0);
    return d >= Math.min(s, e) && d <= Math.max(s, e);
  };

  const isStartDate = (date) => {
    if (!startDate) return false;
    return new Date(date).setHours(0, 0, 0, 0) === new Date(startDate).setHours(0, 0, 0, 0);
  };

  const isEndDate = (date) => {
    if (!endDate) return false;
    return new Date(date).setHours(0, 0, 0, 0) === new Date(endDate).setHours(0, 0, 0, 0);
  };

  const isToday = (date) => {
    const today = new Date();
    return date.getDate() === today.getDate() && date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear();
  };

  // Render a single month
  const renderMonth = (month) => {
    const year = month.getFullYear();
    const monthIdx = month.getMonth();
    const firstDay = new Date(year, monthIdx, 1);
    const lastDay = new Date(year, monthIdx + 1, 0);
    const startWeekday = firstDay.getDay(); // 0 = Sunday
    const daysInMonth = lastDay.getDate();

    const days = [];
    // Padding days from previous month
    const prevMonthLastDay = new Date(year, monthIdx, 0).getDate();
    for (let i = startWeekday - 1; i >= 0; i--) {
      days.push({ date: new Date(year, monthIdx - 1, prevMonthLastDay - i), otherMonth: true });
    }
    // Current month days
    for (let d = 1; d <= daysInMonth; d++) {
      days.push({ date: new Date(year, monthIdx, d), otherMonth: false });
    }
    // Padding days from next month
    const remaining = 42 - days.length; // 6 rows * 7 days
    for (let d = 1; d <= remaining; d++) {
      days.push({ date: new Date(year, monthIdx + 1, d), otherMonth: true });
    }

    return (
      <div style={{ flex: 1, padding: "0 8px" }}>
        <div style={{ textAlign: "center", fontWeight: "bold", marginBottom: 12, fontSize: 14 }}>
          {month.toLocaleDateString("en-US", { month: "short", year: "numeric" })}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 2 }}>
          {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
            <div key={day} style={{ textAlign: "center", fontSize: 11, color: "#666", fontWeight: 600, padding: "4px 0" }}>
              {day}
            </div>
          ))}
          {days.map(({ date, otherMonth }, idx) => {
            const inRange = isInRange(date);
            const isStart = isStartDate(date);
            const isEnd = isEndDate(date);
            const isCurrentDay = isToday(date);
            return (
              <div
                key={idx}
                onClick={() => !otherMonth && handleDateClick(date)}
                onMouseEnter={() => !otherMonth && setHoverDate(date)}
                style={{
                  textAlign: "center",
                  padding: "8px 4px",
                  fontSize: 13,
                  cursor: otherMonth ? "default" : "pointer",
                  color: otherMonth ? "#ccc" : isStart || isEnd ? "#fff" : isCurrentDay ? "#1d4ed8" : "#333",
                  fontWeight: isStart || isEnd || isCurrentDay ? "600" : "normal",
                  background: isStart || isEnd ? "#1d4ed8" : inRange ? "#e0f2fe" : "transparent",
                  borderRadius: isStart || isEnd ? "50%" : inRange ? 0 : 4,
                  border: isCurrentDay && !isStart && !isEnd ? "1px solid #1d4ed8" : "none",
                  userSelect: "none",
                  transition: "all 0.15s ease",
                }}
                onMouseOver={(e) => {
                  if (!otherMonth && !isStart && !isEnd) {
                    e.currentTarget.style.background = inRange ? "#bfdbfe" : "#f3f4f6";
                  }
                }}
                onMouseOut={(e) => {
                  if (!otherMonth && !isStart && !isEnd) {
                    e.currentTarget.style.background = inRange ? "#e0f2fe" : "transparent";
                  }
                }}
              >
                {date.getDate()}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div style={{ padding: 16, background: "#fff", border: "1px solid #ccc", borderRadius: 4, boxShadow: "0 4px 12px rgba(0,0,0,0.15)", minWidth: 560 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <button onClick={prevMonth} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", padding: "4px 8px", color: "#333" }}>
          ‹‹
        </button>
        <div style={{ fontWeight: "600", fontSize: 14, color: "#333" }}>
          {leftMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" })} – {rightMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
        </div>
        <button onClick={nextMonth} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", padding: "4px 8px", color: "#333" }}>
          ››
        </button>
      </div>
      <div style={{ display: "flex", gap: 16 }} onMouseLeave={() => setHoverDate(null)}>
        {renderMonth(leftMonth)}
        {renderMonth(rightMonth)}
      </div>
    </div>
  );
}

CalendarRangePicker.propTypes = {
  startDate: PropTypes.instanceOf(Date),
  endDate: PropTypes.instanceOf(Date),
  onChange: PropTypes.func.isRequired,
  time: PropTypes.bool,
  timeStart: PropTypes.string,
  timeEnd: PropTypes.string,
};
