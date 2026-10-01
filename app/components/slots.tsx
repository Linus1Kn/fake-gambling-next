"use client";

import { useEffect, useState } from "react";

const icons = ["🍒", "🍋", "🔔", "⭐"];

type SlotsProps = {
  gambling: boolean;
  won: boolean | null;
};

export default function Slots({ gambling, won }: SlotsProps) {
  const [slots, setSlots] = useState<(string | null)[]>([
    null,
    null,
    null,
  ]);

  const [stopped, setStopped] = useState([
    false,
    false,
    false,
  ]);

  useEffect(() => {
    if (!gambling) return;

    // Reset when a new spin starts
    setSlots([null, null, null]);
    setStopped([false, false, false]);

    const timers: ReturnType<typeof setTimeout>[] = [];

    const getRandomIcon = () =>
      icons[Math.floor(Math.random() * icons.length)];

    // Pick the final results before the reels start spinning.
    let finalIcons: string[];

    if (won) {
      // Winning spin: all three are guaranteed to match.
      const winningIcon = getRandomIcon();
      finalIcons = [winningIcon, winningIcon, winningIcon];
    } else {
      // Losing spin: guarantee that the three don't all match.
      finalIcons = [
        getRandomIcon(),
        getRandomIcon(),
        getRandomIcon(),
      ];

      // If pure chance produced 3 matching icons, change the last one.
      if (
        finalIcons[0] === finalIcons[1] &&
        finalIcons[1] === finalIcons[2]
      ) {
        const alternatives = icons.filter(
          (icon) => icon !== finalIcons[0]
        );

        finalIcons[2] =
          alternatives[Math.floor(Math.random() * alternatives.length)];
      }
    }

    // Keep all three reels spinning.
    const intervals = [0, 1, 2].map((index) =>
      setInterval(() => {
        setSlots((current) => {
          const next = [...current];
          next[index] = getRandomIcon();
          return next;
        });
      }, 80)
    );

    // Stop reel 1
    timers.push(
      setTimeout(() => {
        clearInterval(intervals[0]);

        setSlots((current) => {
          const next = [...current];
          next[0] = finalIcons[0];
          return next;
        });

        setStopped((current) => {
          const next = [...current];
          next[0] = true;
          return next;
        });
      }, 1000)
    );

    // Stop reel 2
    timers.push(
      setTimeout(() => {
        clearInterval(intervals[1]);

        setSlots((current) => {
          const next = [...current];
          next[1] = finalIcons[1];
          return next;
        });

        setStopped((current) => {
          const next = [...current];
          next[1] = true;
          return next;
        });
      }, 1500)
    );

    // Stop reel 3
    timers.push(
      setTimeout(() => {
        clearInterval(intervals[2]);

        setSlots((current) => {
          const next = [...current];
          next[2] = finalIcons[2];
          return next;
        });

        setStopped((current) => {
          const next = [...current];
          next[2] = true;
          return next;
        });
      }, 2000)
    );

    return () => {
      intervals.forEach(clearInterval);
      timers.forEach(clearTimeout);
    };
  }, [gambling, won]);

  return (
    <div className="flex gap-2">
      {slots.map((icon, index) => (
        <div
          key={index}
          className={`
            flex h-20 w-20 overflow-hidden items-center justify-center
            border text-4xl transition-colors duration-200 ease-out
            ${
              won && !gambling
                ? "border-slate-900 bg-slate-900"
                : "border-slate-900 bg-black"
            }
          `}
        >
          <div
            className={`
              relative flex items-center justify-center
              ${
                stopped[index]
                  ? "animate-stop-slot"
                  : "animate-spin-slot"
              }
            `}
          >
            <span
              className={`absolute blur-md ${
                won && !gambling ? "opacity-100" : "opacity-0"
              }`}
            >
              {icon}
            </span>

            <span>{icon}</span>
          </div>
        </div>
      ))}
    </div>
  );
}