import { useState, useRef, useEffect, useCallback } from "react";
import {
  IoCalendarOutline,
  IoChevronBackOutline,
  IoChevronForwardOutline,
} from "react-icons/io5";

const DAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function isSameDay(a, b) {
  return (
    a &&
    b &&
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function startOfDay(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function MonthGrid({
  year,
  month,
  startDate,
  endDate,
  hoverDate,
  onSelect,
  onHover,
}) {
  const today = startOfDay(new Date());
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));

  return (
    <div>
      <div className="grid grid-cols-7 mb-1">
        {DAYS.map((d) => (
          <div
            key={d}
            className="text-center text-[11px] font-medium text-zinc-400 dark:text-gray-200 py-1"
          >
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {cells.map((date, idx) => {
          if (!date) return <div key={`empty-${idx}`} />;

          const isToday = isSameDay(date, today);
          const isFuture = date > today;
          const isStart = isSameDay(date, startDate);
          const isEnd = isSameDay(date, endDate);
          const isSelected = isStart || isEnd;

          const rangeEnd = endDate || hoverDate;
          const hasRange =
            startDate && rangeEnd && !isSameDay(startDate, rangeEnd);
          const inRange =
            hasRange &&
            date > startOfDay(startDate) &&
            date < startOfDay(rangeEnd);
          const isRangeStart = isStart && hasRange;
          const isRangeEnd =
            (isEnd && hasRange) ||
            (!endDate &&
              startDate &&
              hoverDate &&
              isSameDay(date, hoverDate) &&
              date > startDate);

          let cellBg = "";
          if (inRange) cellBg = "bg-violet-50 dark:bg-violet-800/50";
          if (isRangeStart)
            cellBg =
              "bg-gradient-to-r from-transparent via-violet-50 to-violet-50 dark:bg-gradient-to-r dark:from-transparent via-violet-800/50 to-violet-800/50";
          if (isRangeEnd)
            cellBg =
              "bg-gradient-to-l from-transparent via-violet-50 to-violet-50 dark:from-transparent via-violet-800/50 to-violet-800/50";

          return (
            <div
              key={date.toISOString()}
              className={`relative h-8 flex items-center justify-center ${cellBg} ${isFuture ? "cursor-not-allowed" : "cursor-pointer"}`}
              onClick={() => !isFuture && onSelect(date)}
              onMouseEnter={() => !isFuture && onHover(date)}
              onMouseLeave={() => onHover(null)}
            >
              <span
                className={[
                  "w-[30px] h-[30px] flex items-center justify-center dark:text-gray-200 rounded-full text-[13px] relative z-10 transition-colors",
                  isSelected
                    ? "bg-violet-600 text-white font-medium"
                    : isToday
                      ? "border border-violet-400 text-violet-600"
                      : isFuture
                        ? "text-zinc-300"
                        : "text-zinc-700 hover:bg-violet-50 hover:text-violet-700",
                ].join(" ")}
              >
                {date.getDate()}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function DatePicker({
  startDate,
  endDate,
  onChange,
  placeholder = "Select date range",
}) {
  const today = new Date();
  const [open, setOpen] = useState(false);
  const [hoverDate, setHoverDate] = useState(null);
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const containerRef = useRef(null);

  // Build year options: 10 years back to current year
  const yearOptions = [];
  for (let y = today.getFullYear(); y >= today.getFullYear() - 10; y--) {
    yearOptions.push(y);
  }

  // Cap forward navigation: can't go past current month
  const canGoForward =
    viewYear < today.getFullYear() ||
    (viewYear === today.getFullYear() && viewMonth < today.getMonth());

  const goBack = useCallback(() => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else setViewMonth((m) => m - 1);
  }, [viewMonth]);

  const goForward = useCallback(() => {
    if (!canGoForward) return;
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else setViewMonth((m) => m + 1);
  }, [viewMonth, canGoForward]);

  const handleMonthChange = (e) => {
    const m = parseInt(e.target.value);
    // If switching to current year and chosen month is in future, clamp
    if (viewYear === today.getFullYear() && m > today.getMonth()) return;
    setViewMonth(m);
  };

  const handleYearChange = (e) => {
    const y = parseInt(e.target.value);
    setViewYear(y);
    // If new year is current year and current viewMonth is future, reset to current month
    if (y === today.getFullYear() && viewMonth > today.getMonth()) {
      setViewMonth(today.getMonth());
    }
  };

  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const handleSelect = useCallback(
    (date) => {
      if (!startDate || (startDate && endDate)) {
        onChange(startOfDay(date), null);
      } else {
        if (date < startDate) {
          onChange(startOfDay(date), startOfDay(startDate));
          setOpen(false);
        } else if (isSameDay(date, startDate)) {
          onChange(null, null);
        } else {
          onChange(startDate, startOfDay(date));
          setOpen(false);
        }
      }
    },
    [startDate, endDate, onChange],
  );

  const formatLabel = () => {
    if (!startDate) return placeholder;
    const fmt = (d) =>
      d.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    if (!endDate) return fmt(startDate);
    return `${fmt(startDate)} – ${fmt(endDate)}`;
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onChange(null, null);
  };

  const statusText = !startDate
    ? "Pick a start date"
    : !endDate
      ? "Now pick an end date"
      : (() => {
          const diff = Math.round((endDate - startDate) / 86400000);
          return diff === 0
            ? "Same day selected"
            : `${diff} day${diff !== 1 ? "s" : ""} selected`;
        })();

  return (
    <div ref={containerRef} className="relative">
      {/* Trigger button */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={[
          "flex items-center gap-2 border rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-950 dark:border dark:border-slate-800 transition-colors min-w-[200px]",
          open
            ? "border-violet-400 text-zinc-800 dark:text-gray-200"
            : "border-gray-200 text-zinc-500 hover:border-violet-300",
        ].join(" ")}
      >
        <IoCalendarOutline
          size={15}
          className="text-violet-600 flex-shrink-0"
        />
        <span className="flex-1 text-left truncate">{formatLabel()}</span>
        {(startDate || endDate) && (
          <span
            onClick={handleClear}
            className="text-gray-400 hover:text-gray-600 text-base leading-none flex-shrink-0 cursor-pointer"
            aria-label="Clear dates"
          >
            ×
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute top-[calc(100%+6px)] left-0 z-50 bg-white dark:bg-slate-950 dark:border dark:border-slate-800 border border-gray-200 rounded-xl shadow-lg p-4 w-[280px]">
          {/* Header: month/year selects + nav arrows */}
          <div className="flex items-center gap-1.5 mb-3">
            <button
              onClick={goBack}
              className="w-7 h-7 flex items-center justify-center rounded-md border border-gray-200 dark:border dark:border-slate-800 text-gray-500 dark:text-gray-400 hover:border-violet-300 dark:hover:border-violet-800 hover:text-violet-600 dark:hover:text-violet-900 transition-colors flex-shrink-0"
              aria-label="Previous month"
            >
              <IoChevronBackOutline size={13} />
            </button>

            <div className="flex gap-1.5 flex-1">
              {/* Month select */}
              <select
                value={viewMonth}
                onChange={handleMonthChange}
                className="flex-1 text-xs font-medium text-zinc-800 dark:text-gray-200 border border-gray-200 rounded-md px-1.5 py-1 bg-white dark:bg-slate-950 dark:border dark:border-slate-800 hover:border-violet-300 dark:hover:border-violet-800 focus:outline-none focus:border-violet-400 cursor-pointer appearance-none text-center"
              >
                {MONTHS.map((m, i) => {
                  const isFutureMonth =
                    viewYear === today.getFullYear() && i > today.getMonth();
                  return (
                    <option key={m} value={i} disabled={isFutureMonth}>
                      {m}
                    </option>
                  );
                })}
              </select>

              {/* Year select */}
              <select
                value={viewYear}
                onChange={handleYearChange}
                className="w-[64px] text-xs font-medium text-zinc-800 dark:text-gray-200 border border-gray-200 dark:border dark:border-slate-800 rounded-md px-1.5 py-1 bg-white dark:bg-slate-950 hover:border-violet-300 dark:hover:border-violet-800 focus:outline-none focus:border-violet-400 cursor-pointer appearance-none text-center"
              >
                {yearOptions.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={goForward}
              disabled={!canGoForward}
              className={[
                "w-7 h-7 flex items-center justify-center rounded-md border transition-colors flex-shrink-0",
                canGoForward
                  ? "border-gray-200 dark:border-slate-800 text-gray-500 dark:text-gray-400  hover:border-violet-300 dark:hover:border-violet-800 hover:text-violet-600 dark:hover:text-violet-900"
                  : "border-gray-100 text-gray-300 cursor-not-allowed",
              ].join(" ")}
              aria-label="Next month"
            >
              <IoChevronForwardOutline size={13} />
            </button>
          </div>

          {/* Calendar grid */}
          <MonthGrid
            year={viewYear}
            month={viewMonth}
            startDate={startDate}
            endDate={endDate}
            hoverDate={hoverDate}
            onSelect={handleSelect}
            onHover={setHoverDate}
          />

          {/* Footer */}
          <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
            <span className="text-[11px] text-zinc-400 dark:text-gray-400">{statusText}</span>
            {(startDate || endDate) && (
              <button
                onClick={() => onChange(null, null)}
                className="text-[11px] text-red-400 hover:text-red-500 transition-colors"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default DatePicker;
