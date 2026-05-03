import { useEffect, useState } from 'react';

type Gift = {
  nome: string;
  valor: number;
};

type Props = {
  openLabel: string;
  closeLabel: string;
  modalTitle: string;
  wantToGiftText: string;
  whatsappLabel: string;
  whatsappUrl: string;
  gifts: Gift[];
};

function formatBRL(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export default function GiftsModalButton({
  openLabel,
  closeLabel,
  modalTitle,
  wantToGiftText,
  whatsappLabel,
  whatsappUrl,
  gifts,
}: Props) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-full bg-graphite px-6 py-3 text-sm font-semibold text-cloud shadow-soft transition hover:bg-graphite/90"
      >
        {openLabel}
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
          <button
            type="button"
            aria-label={closeLabel}
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-black/40"
          />
          <div
            role="dialog"
            aria-modal="true"
            className="relative z-10 flex max-h-[90vh] w-full max-w-lg flex-col overflow-y-auto rounded-t-3xl bg-paper shadow-soft sm:rounded-3xl"
          >
            <div className="relative flex items-center justify-center border-b border-neutral-100 px-6 py-4">
              <div className="font-serif text-xl font-bold text-graphite">{modalTitle}</div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label={closeLabel}
                className="absolute right-4 flex h-8 w-8 items-center justify-center rounded-full bg-neutral-100 text-graphite transition hover:bg-neutral-200"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <div className="flex-1 px-6 py-4">
              <ul className="grid gap-4">
                {gifts.map((g, i) => (
                  <li
                    key={`${g.nome}-${i}`}
                    className="flex items-center justify-center gap-3 rounded-2xl border border-neutral-100 px-4 py-3 text-center"
                  >
                    <div className="min-w-0 break-words font-semibold text-graphite">{g.nome}:</div>
                    <div className="shrink-0 whitespace-nowrap text-sm font-medium text-brand-600">Em torno de {formatBRL(g.valor)}</div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="border-t border-neutral-100 px-6 py-4 text-center">
              <div className="text-sm text-neutral-700">{wantToGiftText}</div>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-3 inline-flex rounded-full bg-graphite px-5 py-3 text-sm font-semibold text-cloud shadow-soft transition hover:bg-graphite/90"
              >
                {whatsappLabel}
              </a>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
