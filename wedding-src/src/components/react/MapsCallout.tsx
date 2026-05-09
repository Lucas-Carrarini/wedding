import { useEffect, useRef, useState } from 'react';

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
  const mobileScrollRef = useRef<HTMLDivElement | null>(null);

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

  // Quando o modal abre no mobile, posiciona o scroll horizontal num ponto
  // levemente à direita do centro (a parte de interesse dos mapas fica
  // ligeiramente deslocada). O usuário ainda pode arrastar pros dois lados.
  const INITIAL_SCROLL_BIAS = 0.72; // 0.5 = centro; mais alto = mais à direita.
  const onMobileImgLoad = () => {
    const el = mobileScrollRef.current;
    if (!el) return;
    el.scrollLeft = Math.max(0, (el.scrollWidth - el.clientWidth) * INITIAL_SCROLL_BIAS);
  };

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

          {/* Mobile: container com scroll horizontal real. Imagem em altura fixa
              e o usuário pode arrastar pra ambos os lados (centralizamos o
              scrollLeft no load). Esse layout fica oculto no desktop. */}
          <div
            ref={mobileScrollRef}
            className="relative z-10 flex h-full w-full items-center overflow-x-auto overflow-y-hidden sm:hidden"
          >
            <img
              src={open.imageUrl}
              alt={open.alt}
              onLoad={onMobileImgLoad}
              className="h-[70vh] w-auto max-w-none flex-none select-none"
              draggable={false}
            />
          </div>

          {/* Desktop: imagem contida e centralizada, com X colado no canto. */}
          <div className="relative z-10 hidden h-full w-full items-center justify-center sm:flex">
            <div className="relative">
              <img
                src={open.imageUrl}
                alt={open.alt}
                className="block max-h-[85vh] max-w-[85vw] select-none rounded-lg"
                draggable={false}
              />
              <button
                type="button"
                onClick={() => setOpen(null)}
                aria-label={closeLabel}
                className="absolute -right-3 -top-3 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-paper text-graphite shadow-soft ring-1 ring-black/10 transition hover:bg-neutral-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-graphite"
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
          </div>

          {/* Mobile: botão fixo no canto direito da viewport. */}
          <button
            type="button"
            onClick={() => setOpen(null)}
            aria-label={closeLabel}
            className="fixed right-4 top-4 z-20 flex h-11 w-11 items-center justify-center rounded-full bg-paper text-graphite shadow-soft ring-1 ring-black/10 transition hover:bg-neutral-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-graphite sm:hidden"
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
