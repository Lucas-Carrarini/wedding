import { useEffect, useMemo, useState } from 'react';

type Labels = {
  days: string;
  hours: string;
  minutes: string;
  seconds: string;
};

type Props = {
  targetISO: string;
  title: string;
  labels: Labels;
};

function pad2(n: number) {
  return String(n).padStart(2, '0');
}

function diffParts(target: Date, now: Date) {
  const diffMs = target.getTime() - now.getTime();
  if (diffMs <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  }

  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);

  return { days, hours, minutes, seconds };
}

export default function Countdown({ targetISO, title, labels }: Props) {
  const target = useMemo(() => new Date(targetISO), [targetISO]);
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const parts = diffParts(target, now);

  return (
    <section className="bg-cloud">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:py-20">
        <div className="text-center">
          <p className="text-xs font-semibold tracking-[0.22em] text-neutral-700 sm:text-sm">{title}</p>
        </div>

        <div className="mx-auto mt-10 max-w-xl">
          <div className="grid grid-cols-4 gap-2 sm:gap-4">
            {[
              { value: pad2(parts.days), label: labels.days },
              { value: pad2(parts.hours), label: labels.hours },
              { value: pad2(parts.minutes), label: labels.minutes },
              { value: pad2(parts.seconds), label: labels.seconds },
            ].map((unit) => (
              <div
                key={unit.label}
                className="flex aspect-square flex-col items-center justify-center rounded-2xl bg-paper p-2 shadow-soft sm:aspect-auto sm:rounded-3xl sm:p-6"
              >
                <div className="font-serif text-3xl font-bold leading-none text-brand-500 sm:text-6xl">{unit.value}</div>
                <div className="mt-1.5 text-center text-[9px] font-medium uppercase tracking-[0.14em] text-neutral-600 sm:mt-3 sm:text-xs sm:tracking-[0.18em]">{unit.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
