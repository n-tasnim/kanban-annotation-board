import { useState, useRef, useEffect } from 'react';
import { formatDateForApi, useTaskStore } from '../store/useTaskStore';
import { ChevronLeft, ChevronRight, Calendar, ChevronDown } from 'lucide-react';

export default function DateSelector() {
  const { selectedDate, setSelectedDate } = useTaskStore();
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  const currentDateObj = new Date(selectedDate);
  const currentYear = currentDateObj.getFullYear();
  const currentMonth = currentDateObj.getMonth();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsPopoverOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatDateString = (year: number, month: number, day: number) => {
    const mm = String(month + 1).padStart(2, '0');
    const dd = String(day).padStart(2, '0');
    return `${year}-${mm}-${dd}`;
  };

  const getDaysWindow = () => {
    const days = [];
    for (let i = -3; i <= 3; i++) {
      const targetDate = new Date(selectedDate);
      targetDate.setDate(currentDateObj.getDate() + i);
      days.push(targetDate);
    }
    return days;
  };

  const daysWindow = getDaysWindow();

  const handleStepNavigation = (direction: number) => {
    const updated = new Date(selectedDate);
    updated.setDate(currentDateObj.getDate() + direction);
    setSelectedDate(formatDateForApi(updated));
  };

  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfWeek = (year: number, month: number) => new Date(year, month, 1).getDay();

  const totalDaysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDayIndexOffset = getFirstDayOfWeek(currentYear, currentMonth);

  const monthLabel = currentDateObj.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <div className="bg-slate-950/90 px-4 py-2 border-b border-slate-800/40 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shrink-0 select-none relative z-40">
      
      <div className="relative" ref={popoverRef}>
        <button 
          onClick={() => setIsPopoverOpen(!isPopoverOpen)}
          className="flex items-center space-x-2 bg-slate-900/80 border border-slate-800 px-3 py-1.5 rounded-lg text-sm font-medium text-slate-200 hover:border-cyan-500/40 transition-all active:scale-95"
        >
          <Calendar size={15} className="text-cyan-600" />
          <span>{monthLabel}</span>
          <ChevronDown size={14} className={`text-slate-500 transition-transform duration-200 ${isPopoverOpen ? 'rotate-180' : ''}`} />
        </button>

        {isPopoverOpen && (
          <div className="absolute left-0 mt-2 w-72 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-4 animate-in fade-in slide-in-from-top-2 duration-150">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800/60">
              <span className="text-xs font-semibold text-slate-400 tracking-wider uppercase">Select Target Date</span>
              <span className="text-xs font-mono text-cyan-400 font-medium">{selectedDate}</span>
            </div>

            <div className="grid grid-cols-7 gap-1 text-center mb-1">
              {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
                <span key={d} className="text-[10px] font-bold text-slate-600 uppercase tracking-wider py-1">{d}</span>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: firstDayIndexOffset }).map((_, i) => (
                <div key={`empty-${i}`} />
              ))}

              {Array.from({ length: totalDaysInMonth }).map((_, i) => {
                const dayNum = i + 1;
                const loopingDateStr = formatDateString(currentYear, currentMonth, dayNum);
                const isCurrentSelection = loopingDateStr === selectedDate;

                return (
                  <button
                    key={dayNum}
                    onClick={() => {
                      setSelectedDate(loopingDateStr);
                      setIsPopoverOpen(false);
                    }}
                    className={`text-xs h-8 w-8 rounded-lg flex items-center justify-center transition-all font-medium ${
                      isCurrentSelection
                        ? 'bg-cyan-800 text-white font-bold shadow-lg shadow-cyan-500/20'
                        : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                    }`}
                  >
                    {dayNum}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>


      <div className="flex items-center space-x-2 self-end sm:self-auto">
        
        <button 
          onClick={() => handleStepNavigation(-1)}
          className="flex items-center justify-center w-8 h-12 rounded-xl border bg-slate-900/40 border-slate-800/60 text-slate-400 hover:border-slate-700/80 hover:text-cyan-400 hover:bg-slate-900 transition-all shrink-0"
        >
          <ChevronLeft size={16} />
        </button>

  
        <div className="flex items-center space-x-2 overflow-x-auto overflow-y-hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden pb-1 sm:pb-0">
          {daysWindow.map((date, index) => {
            const dateStr = formatDateForApi(date);
            const isSelected = dateStr === selectedDate;
            const weekdayName = date.toLocaleDateString('en-US', { weekday: 'short' });
            const calendarDayNumber = date.getDate();

            return (
              <button
                key={index}
                onClick={() => setSelectedDate(dateStr)}
                className={`flex flex-col items-center justify-center w-11 h-12 rounded-xl border transition-all shrink-0 ${
                  isSelected 
                    ? 'bg-cyan-800 border-cyan-700 text-white shadow-lg shadow-cyan-500/20 scale-105 font-semibold' 
                    : 'bg-slate-900/40 border-slate-800/60 text-slate-400 hover:border-slate-700/80 hover:text-slate-200'
                }`}
              >
                <span className={`text-[9px] uppercase tracking-widest font-medium ${isSelected ? 'text-indigo-100' : 'text-slate-500'}`}>
                  {weekdayName}
                </span>
                <span className="text-sm font-bold mt-0.5">
                  {calendarDayNumber}
                </span>
              </button>
            );
          })}
        </div>

        <button 
          onClick={() => handleStepNavigation(1)}
          className="flex items-center justify-center w-8 h-12 rounded-xl border bg-slate-900/40 border-slate-800/60 text-slate-400 hover:border-slate-700/80 hover:text-cyan-400 hover:bg-slate-900 transition-all shrink-0"
        >
          <ChevronRight size={16} />
        </button>

      </div>
    </div>
  );
}