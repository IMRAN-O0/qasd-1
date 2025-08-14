import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, Plus } from 'lucide-react';

const Calendar = ({
  value = new Date(),
  onChange = () => {},
  events = [],
  onEventClick = () => {},
  onDateClick = () => {},
  onEventAdd = () => {},
  view = 'month', // month, week, day
  className = '',
  locale = 'ar',
  showWeekNumbers = false,
  allowEventAdd = true,
  minDate = null,
  maxDate = null,
  ...props
}) => {
  const [currentDate, setCurrentDate] = useState(new Date(value));
  const [selectedDate, setSelectedDate] = useState(new Date(value));

  const monthNames = [
    'يناير',
    'فبراير',
    'مارس',
    'أبريل',
    'مايو',
    'يونيو',
    'يوليو',
    'أغسطس',
    'سبتمبر',
    'أكتوبر',
    'نوفمبر',
    'ديسمبر'
  ];

  const dayNames = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
  const dayNamesShort = ['أح', 'إث', 'ث', 'أر', 'خ', 'ج', 'س'];

  // حساب أيام الشهر
  const monthDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);

    // البداية من الأحد السابق
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const days = [];
    const current = new Date(startDate);

    // 42 يوم (6 أسابيع)
    for (let i = 0; i < 42; i++) {
      days.push({
        date: new Date(current),
        isCurrentMonth: current.getMonth() === month,
        isToday: isToday(current),
        isSelected: isSameDay(current, selectedDate),
        events: getEventsForDate(current)
      });
      current.setDate(current.getDate() + 1);
    }

    return days;
  }, [currentDate, selectedDate, events]);

  const isToday = date => {
    const today = new Date();
    return isSameDay(date, today);
  };

  const isSameDay = (date1, date2) => {
    return (
      date1.getDate() === date2.getDate() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getFullYear() === date2.getFullYear()
    );
  };

  const getEventsForDate = date => {
    return events.filter(event => {
      const eventDate = new Date(event.date);
      return isSameDay(eventDate, date);
    });
  };

  const isDateDisabled = date => {
    if (minDate && date < minDate) {
      return true;
    }
    if (maxDate && date > maxDate) {
      return true;
    }
    return false;
  };

  const navigateMonth = direction => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + direction);
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(today);
    onChange(today);
  };

  const handleDateClick = date => {
    if (isDateDisabled(date)) {
      return;
    }

    setSelectedDate(date);
    onChange(date);
    onDateClick(date);
  };

  const handleEventClick = (event, e) => {
    e.stopPropagation();
    onEventClick(event);
  };

  const handleAddEvent = (date, e) => {
    e.stopPropagation();
    onEventAdd(date);
  };

  const getEventColor = event => {
    switch (event.type) {
      case 'production':
        return 'bg-blue-500';
      case 'maintenance':
        return 'bg-orange-500';
      case 'meeting':
        return 'bg-green-500';
      case 'deadline':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const renderMonthView = () => (
    <div className='grid grid-cols-7 gap-1'>
      {/* أسماء الأيام */}
      {dayNamesShort.map(day => (
        <div key={day} className='p-2 text-center text-sm font-medium text-gray-600 bg-gray-50'>
          {day}
        </div>
      ))}

      {/* أيام الشهر */}
      {monthDays.map((day, index) => (
        <div
          key={index}
          className={`
            min-h-24 p-1 border border-gray-200 cursor-pointer transition-colors
            ${day.isCurrentMonth ? 'bg-white' : 'bg-gray-50'}
            ${day.isToday ? 'bg-blue-50 border-blue-300' : ''}
            ${day.isSelected ? 'bg-blue-100 border-blue-500' : ''}
            ${isDateDisabled(day.date) ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100'}
          `}
          onClick={() => handleDateClick(day.date)}
        >
          <div className='flex items-center justify-between mb-1'>
            <span
              className={`
              text-sm font-medium
              ${day.isCurrentMonth ? 'text-gray-900' : 'text-gray-400'}
              ${day.isToday ? 'text-blue-600' : ''}
            `}
            >
              {day.date.getDate()}
            </span>
            {allowEventAdd && day.isCurrentMonth && (
              <button
                onClick={e => handleAddEvent(day.date, e)}
                className='opacity-0 group-hover:opacity-100 text-gray-400 hover:text-blue-500 transition-opacity'
              >
                <Plus size={12} />
              </button>
            )}
          </div>

          {/* الأحداث */}
          <div className='space-y-1'>
            {day.events.slice(0, 3).map((event, eventIndex) => (
              <div
                key={eventIndex}
                className={`
                  ${getEventColor(event)} text-white text-xs px-1 py-0.5 rounded cursor-pointer
                  hover:opacity-80 transition-opacity
                `}
                onClick={e => handleEventClick(event, e)}
                title={event.title}
              >
                <div className='truncate'>{event.title}</div>
              </div>
            ))}
            {day.events.length > 3 && <div className='text-xs text-gray-500'>+{day.events.length - 3} أكثر</div>}
          </div>
        </div>
      ))}
    </div>
  );

  const renderWeekView = () => {
    const weekStart = new Date(selectedDate);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());

    const weekDays = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(weekStart);
      day.setDate(day.getDate() + i);
      weekDays.push(day);
    }

    return (
      <div className='grid grid-cols-8 gap-1'>
        {/* عمود الساعات */}
        <div className='border-r border-gray-200'>
          <div className='h-12 border-b border-gray-200'></div>
          {Array.from({ length: 24 }, (_, hour) => (
            <div key={hour} className='h-12 border-b border-gray-200 p-1 text-xs text-gray-500'>
              {hour.toString().padStart(2, '0')}:00
            </div>
          ))}
        </div>

        {/* أعمدة الأيام */}
        {weekDays.map(day => (
          <div key={day.toISOString()} className='border-r border-gray-200'>
            <div className='h-12 border-b border-gray-200 p-2 text-center'>
              <div className='text-sm font-medium'>{dayNamesShort[day.getDay()]}</div>
              <div className={`text-lg ${isToday(day) ? 'text-blue-600 font-bold' : ''}`}>{day.getDate()}</div>
            </div>
            {Array.from({ length: 24 }, (_, hour) => (
              <div key={hour} className='h-12 border-b border-gray-200 p-1 relative'>
                {getEventsForDate(day)
                  .filter(event => {
                    const eventHour = new Date(event.date).getHours();
                    return eventHour === hour;
                  })
                  .map((event, index) => (
                    <div
                      key={index}
                      className={`
                        ${getEventColor(event)} text-white text-xs p-1 rounded cursor-pointer
                        absolute inset-1 hover:opacity-80 transition-opacity
                      `}
                      onClick={e => handleEventClick(event, e)}
                    >
                      <div className='truncate font-medium'>{event.title}</div>
                      {event.time && <div className='truncate'>{event.time}</div>}
                    </div>
                  ))}
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  };

  const renderDayView = () => {
    const dayEvents = getEventsForDate(selectedDate);

    return (
      <div className='grid grid-cols-1 gap-1'>
        {Array.from({ length: 24 }, (_, hour) => (
          <div key={hour} className='flex border-b border-gray-200 min-h-12'>
            <div className='w-16 p-2 text-sm text-gray-500 border-r border-gray-200'>
              {hour.toString().padStart(2, '0')}:00
            </div>
            <div className='flex-1 p-2 relative'>
              {dayEvents
                .filter(event => {
                  const eventHour = new Date(event.date).getHours();
                  return eventHour === hour;
                })
                .map((event, index) => (
                  <div
                    key={index}
                    className={`
                      ${getEventColor(event)} text-white p-2 rounded cursor-pointer mb-1
                      hover:opacity-80 transition-opacity
                    `}
                    onClick={e => handleEventClick(event, e)}
                  >
                    <div className='font-medium'>{event.title}</div>
                    {event.description && <div className='text-sm opacity-90'>{event.description}</div>}
                    {event.time && (
                      <div className='text-xs opacity-75 flex items-center gap-1'>
                        <Clock size={10} />
                        {event.time}
                      </div>
                    )}
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className={`bg-white rounded-lg shadow border ${className}`} {...props}>
      {/* شريط التنقل */}
      <div className='flex items-center justify-between p-4 border-b border-gray-200'>
        <div className='flex items-center gap-4'>
          <h2 className='text-lg font-semibold text-gray-900'>
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h2>
          <div className='flex items-center gap-1'>
            <button onClick={() => navigateMonth(-1)} className='p-1 rounded hover:bg-gray-100 transition-colors'>
              <ChevronRight size={20} />
            </button>
            <button onClick={() => navigateMonth(1)} className='p-1 rounded hover:bg-gray-100 transition-colors'>
              <ChevronLeft size={20} />
            </button>
          </div>
        </div>

        <div className='flex items-center gap-2'>
          <button
            onClick={goToToday}
            className='px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors'
          >
            اليوم
          </button>
          <div className='flex items-center bg-gray-100 rounded'>
            <button
              onClick={() => setView('month')}
              className={`px-3 py-1 text-sm rounded transition-colors ${
                view === 'month' ? 'bg-blue-500 text-white' : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              شهر
            </button>
            <button
              onClick={() => setView('week')}
              className={`px-3 py-1 text-sm rounded transition-colors ${
                view === 'week' ? 'bg-blue-500 text-white' : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              أسبوع
            </button>
            <button
              onClick={() => setView('day')}
              className={`px-3 py-1 text-sm rounded transition-colors ${
                view === 'day' ? 'bg-blue-500 text-white' : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              يوم
            </button>
          </div>
        </div>
      </div>

      {/* محتوى التقويم */}
      <div className='p-4'>
        {view === 'month' && renderMonthView()}
        {view === 'week' && renderWeekView()}
        {view === 'day' && renderDayView()}
      </div>
    </div>
  );
};

export default Calendar;
