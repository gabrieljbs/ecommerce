"use client"

import { useEffect, useState } from "react";
import { Clock } from "lucide-react";

export function CountdownTimer({ endDate }: { endDate: string | Date }) {
    const [timeLeft, setTimeLeft] = useState<{ d: number, h: number, m: number, s: number } | null>(null);

    useEffect(() => {
        const target = new Date(endDate).getTime();

        const updateTimer = () => {
            const now = new Date().getTime();
            const difference = target - now;

            if (difference <= 0) {
                setTimeLeft(null);
                return;
            }

            setTimeLeft({
                d: Math.floor(difference / (1000 * 60 * 60 * 24)),
                h: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
                m: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
                s: Math.floor((difference % (1000 * 60)) / 1000)
            });
        };

        updateTimer();
        const interval = setInterval(updateTimer, 1000);
        return () => clearInterval(interval);
    }, [endDate]);

    if (!timeLeft) return null;

    return (
        <div className="flex items-center gap-1.5 text-[10px] font-bold text-red-600 bg-red-100 dark:bg-red-950 dark:text-red-400 px-2.5 py-1 rounded-full w-fit shadow-sm backdrop-blur-md">
            <Clock size={12} />
            <span>
                {timeLeft.d > 0 && `${timeLeft.d}d `}
                {timeLeft.h.toString().padStart(2, '0')}:
                {timeLeft.m.toString().padStart(2, '0')}:
                {timeLeft.s.toString().padStart(2, '0')}
            </span>
        </div>
    );
}
