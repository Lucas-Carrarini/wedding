import { useEffect, useState } from 'react';

type MapItem = {
  id: string;
  label: string;
  alt: string;
  imageUrl: string;
};

type Props = {
  title: string;
  maps: MapItem[];
  closeLabel?: string;
};

export default function MapsCallout({ title, maps, closeLabel = 'Fechar' }: Props) {
  const [open, setOpen] = useState<MapItem | null>(null);

  // Bloqueia o scroll do body enquanto o modal está aberto.
  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(null);
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div>
      <div className="text-center text-sm font-medium text-graphite sm:text-base">{title}</div>

      <div className="mt-3 grid grid-cols-2 gap-3 sm:gap-4">
        {maps.map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => setOpen(m)}
            aria-label={m.alt}
            className="group relative aspect-square overflow-hidden rounded-2xl shadow-soft transition active:scale-[0.98]"
          >
            {/* Fundo: mapa com blur */}
            <span
              aria-hidden="true"
              className="absolute inset-0 scale-110 bg-cover bg-center blur-md"
              style={{ backgroundImage: `url(${m.imageUrl})` }}
            />
            {/* Overlay para contraste */}
            <span aria-hidden="true" className="absolute inset-0 bg-black/35 transition group-hover:bg-black/25" />
            {/* Texto centralizado */}
            <span className="relative flex h-full items-center justify-center px-3">
              <span className="font-serif text-xl font-bold tracking-tight text-cloud drop-shadow-md sm:text-2xl">
                {m.label}
              </span>
            </span>
          </button>
        ))}
      </div>

      {open ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={open.alt}
          className="fixed inset-0 z-50"
        >
          {/* Backdrop clicável */}
          <button
            type="button"
            aria-label={closeLabel}
            onClick={() => setOpen(null)}
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
          />

          {/* Mobile: imagem ocupa quase toda altura, scroll horizontal interno.
              Desktop: imagem centralizada com tamanho contido. */}
          <div className="relative z-10 flex h-full w-full items-center justify-center overflow-x-auto overflow-y-hidden sm:overflow-hidden">
            <img
              src={open.imageUrl}
              alt={open.alt}
              className="h-[88vh] w-auto max-w-none select-none sm:h-auto sm:max-h-[85vh] sm:w-auto sm:max-w-[85vw]"
              draggable={false}
            />
          </div>

          {/* Botão de fechar fixo, sempre visível no canto direito */}
          <button
            type="button"
            onClick={() => setOpen(null)}
            aria-label={closeLabel}
            className="fixed right-4 top-4 z-20 flex h-11 w-11 items-center justify-center rounded-full bg-[#7a8c4a] text-cloud shadow-soft transition hover:bg-[#8a9d56] focus:outline-none focus-visible:ring-2 focus-visible:ring-cloud"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-5 w-5"
              aria-hidden="true"
            >
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </button>
        </div>
      ) : null}
    </div>
  );
}
