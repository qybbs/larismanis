"use client";

import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";

export interface PlanItem {
    id: string;
    date: Date;
    type: string;
    idea: string;
    format: string;
}

interface CalendarViewProps {
    plan: PlanItem[];
    selectedDate: Date | null;
    onSelectDate: (date: Date) => void;
}

export default function CalendarView({ plan, selectedDate, onSelectDate }: CalendarViewProps) {
    const [currentMonth, setCurrentMonth] = useState(new Date());

    const daysInMonth = useMemo(() => {
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth();
        const date = new Date(year, month, 1);
        const days = [];
        while (date.getMonth() === month) {
            days.push(new Date(date));
            date.setDate(date.getDate() + 1);
        }
        return days;
    }, [currentMonth]);

    const firstDayOfMonth = daysInMonth[0].getDay(); // 0 = Sunday
    // Adjust for Monday start if needed, but let's stick to Sunday start for standard calendar or Monday? 
    // Indonesia usually starts Monday. Let's adjust.
    const startingDayIndex = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

    const prevMonthDays = useMemo(() => {
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth();
        const days = [];
        const date = new Date(year, month, 0); // Last day of prev month
        for (let i = 0; i < startingDayIndex; i++) {
            days.unshift(new Date(date));
            date.setDate(date.getDate() - 1);
        }
        return days;
    }, [currentMonth, startingDayIndex]);

    const nextMonthDays = useMemo(() => {
        const totalSlots = 42; // 6 rows * 7 cols
        const currentCount = prevMonthDays.length + daysInMonth.length;
        const remaining = totalSlots - currentCount;
        const days = [];
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth() + 1;
        const date = new Date(year, month, 1);
        for (let i = 0; i < remaining; i++) {
            days.push(new Date(date));
            date.setDate(date.getDate() + 1);
        }
        return days;
    }, [daysInMonth, prevMonthDays]);

    const allDays = [...prevMonthDays, ...daysInMonth, ...nextMonthDays];

    const nextMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
    };

    const prevMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
    };

    const isSameDay = (d1: Date, d2: Date) => {
        return d1.getDate() === d2.getDate() &&
            d1.getMonth() === d2.getMonth() &&
            d1.getFullYear() === d2.getFullYear();
    };

    const getTasksForDate = (date: Date) => {
        return plan.filter(item => isSameDay(item.date, date));
    };

    return (
        <div className="overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between mb-6 px-2">
                <h2 className="text-2xl font-bold text-secondary capitalize">
                    {currentMonth.toLocaleDateString("id-ID", { month: "long", year: "numeric" })}
                </h2>
                <div className="flex gap-2 bg-white/50 p-1 rounded-full border border-gray-100">
                    <button onClick={prevMonth} className="p-2 hover:bg-white rounded-full transition-all text-gray-600 hover:text-primary hover:shadow-sm">
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button onClick={nextMonth} className="p-2 hover:bg-white rounded-full transition-all text-gray-600 hover:text-primary hover:shadow-sm">
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>
            </div>


            {/* Grid Header */}
            <div className="grid grid-cols-7 mb-2">
                {["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"].map(day => (
                    <div key={day} className="py-2 text-center text-xs font-bold text-gray-400 uppercase tracking-wider">
                        {day}
                    </div>
                ))}
            </div>

            {/* Grid Body */}
            <div className="grid grid-cols-7 gap-1 md:gap-2">
                {allDays.map((date, index) => {
                    const isCurrentMonth = date.getMonth() === currentMonth.getMonth();
                    const isSelected = selectedDate && isSameDay(date, selectedDate);
                    const isToday = isSameDay(date, new Date());
                    const tasks = getTasksForDate(date);
                    const hasTasks = tasks.length > 0;

                    return (
                        <button
                            key={index}
                            onClick={() => onSelectDate(date)}
                            className={`
                                min-h-[80px] md:min-h-[100px] p-2 rounded-2xl text-left relative transition-all group
                                ${!isCurrentMonth ? "opacity-30" : "hover:bg-white hover:shadow-sm"}
                                ${isSelected ? "bg-white ring-2 ring-primary shadow-md z-10" : "bg-white/40 border border-transparent"}
                            `}
                        >
                            <span className={`
                                text-sm font-bold w-7 h-7 flex items-center justify-center rounded-full mb-1 transition-colors
                                ${isToday ? "bg-primary text-white" : "text-gray-600 group-hover:text-primary"}
                            `}>
                                {date.getDate()}
                            </span>

                            {hasTasks && (
                                <div className="flex flex-col gap-1">
                                    {tasks.slice(0, 2).map((task, i) => (
                                        <div key={i} className="text-[10px] truncate px-2 py-1 rounded-md bg-emerald-100/50 text-emerald-800 font-medium border border-emerald-100/50">
                                            {task.type}
                                        </div>
                                    ))}
                                    {tasks.length > 2 && (
                                        <div className="text-[10px] text-gray-400 pl-1">
                                            +{tasks.length - 2} more
                                        </div>
                                    )}
                                </div>
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
