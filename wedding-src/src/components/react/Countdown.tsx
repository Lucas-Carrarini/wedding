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

        <div className="mx-auto mt-10 max-w-3xl">
          <div className="flex items-end justify-center gap-3 sm:gap-5">
            <div className="text-center">
              <div className="font-serif text-6xl font-bold leading-none text-brand-500 sm:text-7xl">{pad2(parts.days)}</div>
              <div className="mt-2 text-[11px] font-medium uppercase tracking-[0.18em] text-neutral-600">{labels.days}</div>
            </div>
            <div className="text-center" aria-hidden="true">
              <div className="font-serif text-6xl font-bold leading-none text-brand-500 sm:text-7xl">-</div>
              <div className="mt-2 select-none text-[11px] opacity-0">.</div>
            </div>
            <div className="text-center">
              <div className="font-serif text-6xl font-bold leading-none text-brand-500 sm:text-7xl">{pad2(parts.hours)}</div>
              <div className="mt-2 text-[11px] font-medium uppercase tracking-[0.18em] text-neutral-600">{labels.hours}</div>
            </div>
            <div className="text-center" aria-hidden="true">
              <div className="font-serif text-6xl font-bold leading-none text-brand-500 sm:text-7xl">:</div>
              <div className="mt-2 select-none text-[11px] opacity-0">.</div>
            </div>
            <div className="text-center">
              <div className="font-serif text-6xl font-bold leading-none text-brand-500 sm:text-7xl">{pad2(parts.minutes)}</div>
              <div className="mt-2 text-[11px] font-medium uppercase tracking-[0.18em] text-neutral-600">{labels.minutes}</div>
            </div>
            <div className="text-center" aria-hidden="true">
              <div className="font-serif text-6xl font-bold leading-none text-brand-500 sm:text-7xl">:</div>
              <div className="mt-2 select-none text-[11px] opacity-0">.</div>
            </div>
            <div className="text-center">
              <div className="font-serif text-6xl font-bold leading-none text-brand-500 sm:text-7xl">{pad2(parts.seconds)}</div>
              <div className="mt-2 text-[11px] font-medium uppercase tracking-[0.18em] text-neutral-600">{labels.seconds}</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
