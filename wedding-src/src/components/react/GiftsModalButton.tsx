import { useEffect, useState } from 'react';

type Gift = {
  nome: string;
  valor: number;
  fotoUrl: string;
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
        className="rounded-full bg-neutral-900 px-6 py-3 text-sm font-semibold text-white shadow-soft transition hover:bg-neutral-800"
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
            className="relative z-10 flex max-h-[85vh] w-full max-w-2xl flex-col rounded-t-3xl bg-white shadow-soft sm:rounded-3xl"
          >
            <div className="flex items-center justify-between border-b border-neutral-100 px-6 py-4">
              <div className="font-serif text-xl font-bold text-neutral-900">{modalTitle}</div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-full bg-neutral-100 px-4 py-2 text-sm font-semibold text-neutral-900 transition hover:bg-neutral-200"
              >
                {closeLabel}
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-4">
              <ul className="grid gap-4">
                {gifts.map((g, i) => (
                  <li
                    key={`${g.nome}-${i}`}
                    className="flex gap-4 rounded-2xl border border-neutral-100 p-3"
                  >
                    <div
                      className="shrink-0 overflow-hidden rounded-xl bg-neutral-100"
                      style={{ width: 96, height: 96 }}
                    >
                      <img src={g.fotoUrl} alt="" className="h-full w-full object-cover" loading="lazy" />
                    </div>
                    <div className="flex min-w-0 flex-1 flex-col justify-center">
                      <div className="truncate font-semibold text-neutral-900">{g.nome}</div>
                      <div className="mt-1 text-sm font-medium text-brand-600">{formatBRL(g.valor)}</div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="border-t border-neutral-100 px-6 py-4">
              <div className="text-sm text-neutral-700">{wantToGiftText}</div>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-3 inline-flex rounded-full bg-neutral-900 px-5 py-3 text-sm font-semibold text-white shadow-soft transition hover:bg-neutral-800"
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
