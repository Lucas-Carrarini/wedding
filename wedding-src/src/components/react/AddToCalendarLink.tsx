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

export default function AddToCalendarLink({ label, title, location, description, startISO, endISO, fileName }: Props) {
  const start = new Date(startISO);
  const end = new Date(endISO);

  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//L&L//Wedding//PT-BR',
    'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT',
    `DTSTART:${formatICSDate(start)}`,
    `DTEND:${formatICSDate(end)}`,
    `SUMMARY:${title}`,
    `LOCATION:${location}`,
    `DESCRIPTION:${description}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');

  const href = `data:text/calendar;charset=utf-8,${encodeURIComponent(ics)}`;

  return (
    <a
      className="rounded-full bg-white/90 px-5 py-3 text-sm font-semibold text-neutral-900 shadow-soft transition hover:bg-white"
      href={href}
      download={fileName}
    >
      {label}
    </a>
  );
}
