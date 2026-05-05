import { useEffect, useState } from 'react';

type Props = {
  label: string;
  title: string;
  location: string;
  description: string;
  startISO: string;
  endISO: string;
  fileName: string;
};

function formatICSDate(dt: Date) {
  const pad = (n: number) => String(n).padStart(2, '0');
  return (
    dt.getUTCFullYear() +
    pad(dt.getUTCMonth() + 1) +
    pad(dt.getUTCDate()) +
    'T' +
    pad(dt.getUTCHours()) +
    pad(dt.getUTCMinutes()) +
    pad(dt.getUTCSeconds()) +
    'Z'
  );
}

// YYYYMMDD (data no fuso local do usuário, para evento de dia inteiro).
function formatDateOnly(dt: Date) {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${dt.getFullYear()}${pad(dt.getMonth() + 1)}${pad(dt.getDate())}`;
}

function addDays(dt: Date, days: number) {
  const d = new Date(dt);
  d.setDate(d.getDate() + days);
  return d;
}

type Platform = 'ios' | 'android' | 'other';

function detectPlatform(): Platform {
  if (typeof navigator === 'undefined') return 'other';
  const ua = navigator.userAgent || '';
  // iPadOS 13+ reporta-se como Mac; detecta via touch.
  const isIOS =
    /iPad|iPhone|iPod/.test(ua) ||
    (/Macintosh/.test(ua) && typeof document !== 'undefined' && 'ontouchend' in document);
  if (isIOS) return 'ios';
  if (/Android/i.test(ua)) return 'android';
  return 'other';
}

export default function AddToCalendarLink({
  label,
  title,
  location,
  description,
  startISO,
  endISO,
  fileName,
}: Props) {
  const start = new Date(startISO);
  // Evento de dia inteiro: ICS espera DTEND = dia seguinte (exclusivo);
  // Google Calendar espera o mesmo padrão na URL de template.
  const allDayStart = formatDateOnly(start);
  const allDayEnd = formatDateOnly(addDays(start, 1));

  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//L&L//Wedding//PT-BR',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:wedding-${allDayStart}@lucascarrarini.com`,
    `DTSTAMP:${formatICSDate(new Date())}`,
    `DTSTART;VALUE=DATE:${allDayStart}`,
    `DTEND;VALUE=DATE:${allDayEnd}`,
    `SUMMARY:${title}`,
    `LOCATION:${location}`,
    `DESCRIPTION:${description}`,
    // Lembretes: 1 mês, 1 semana e 1 dia antes do início do evento.
    'BEGIN:VALARM',
    'ACTION:DISPLAY',
    `DESCRIPTION:${title}`,
    'TRIGGER:-P30D',
    'END:VALARM',
    'BEGIN:VALARM',
    'ACTION:DISPLAY',
    `DESCRIPTION:${title}`,
    'TRIGGER:-P7D',
    'END:VALARM',
    'BEGIN:VALARM',
    'ACTION:DISPLAY',
    `DESCRIPTION:${title}`,
    'TRIGGER:-P1D',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');

  const icsHref = `data:text/calendar;charset=utf-8,${encodeURIComponent(ics)}`;

  const googleParams = new URLSearchParams({
    action: 'TEMPLATE',
    text: title,
    dates: `${allDayStart}/${allDayEnd}`,
    details: description,
    location,
  });
  const googleHref = `https://calendar.google.com/calendar/render?${googleParams.toString()}`;

  // Começa como 'other' para render consistente no SSR; ajusta no client.
  const [platform, setPlatform] = useState<Platform>('other');
  useEffect(() => {
    setPlatform(detectPlatform());
  }, []);

  const useGoogle = platform === 'android' || platform === 'other';
  const href = useGoogle ? googleHref : icsHref;

  const commonClass =
    'rounded-full bg-paper/90 px-5 py-3 text-sm font-semibold text-graphite shadow-soft transition hover:bg-paper';

  if (useGoogle) {
    return (
      <a className={commonClass} href={href} target="_blank" rel="noopener noreferrer">
        {label}
      </a>
    );
  }

  // iOS/macOS: .ics (abre direto no Apple Calendar).
  return (
    <a className={commonClass} href={href} download={fileName}>
      {label}
    </a>
  );
}
