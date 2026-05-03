import { useEffect, useMemo, useRef, useState } from 'react';

type Item = {
  id: string;
  url: string;
  alt: string;
};

type Props = {
  autoplayMs: number;
  images: Item[];
};

// Quantos slides clonados em cada extremidade.
// Deve ser maior que o número máximo de slides visíveis para que o "snap"
// do loop infinito aconteça bem fora da viewport (imperceptível).
const BUFFER = 6;

export default function PhotoCarousel({ autoplayMs, images }: Props) {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const [animate, setAnimate] = useState(true);

  const safeImages = useMemo(() => images.filter(Boolean), [images]);
  const count = safeImages.length;

  // Constrói o array com BUFFER clones em cada lado. Se houver poucas imagens
  // (ex.: 1, 2, 3), repete o conjunto até preencher os clones.
  const { loopImages, startIndex } = useMemo(() => {
    if (count === 0) return { loopImages: [] as Item[], startIndex: 0 };
    if (count === 1) {
      const arr = Array.from({ length: BUFFER * 2 + 1 }, () => safeImages[0]);
      return { loopImages: arr, startIndex: BUFFER };
    }

    const reps = Math.max(1, Math.ceil(BUFFER / count));
    const repeated: Item[] = [];
    for (let i = 0; i < reps; i++) repeated.push(...safeImages);

    const prepend = repeated.slice(repeated.length - BUFFER);
    const append = repeated.slice(0, BUFFER);
    return { loopImages: [...prepend, ...safeImages, ...append], startIndex: BUFFER };
  }, [count, safeImages]);

  const [index, setIndex] = useState(startIndex);

  useEffect(() => {
    setIndex(startIndex);
  }, [startIndex]);

  useEffect(() => {
    if (count <= 1) return;

    let id: number | null = null;
    const start = () => {
      if (id !== null) return;
      id = window.setInterval(() => {
        setIndex((prev) => prev + 1);
      }, autoplayMs);
    };
    const stop = () => {
      if (id !== null) {
        window.clearInterval(id);
        id = null;
      }
    };
    const handleVisibility = () => {
      if (document.hidden) {
        stop();
      } else {
        start();
      }
    };

    if (!document.hidden) start();
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      stop();
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [autoplayMs, count]);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const slide = track.querySelector<HTMLElement>('[data-slide="true"]');
    if (!slide) return;

    const slideW = slide.getBoundingClientRect().width;
    const gapRaw = getComputedStyle(track).gap;
    const gap = Number.parseFloat((gapRaw || '0').split(' ')[0] ?? '0') || 0;
    const step = slideW + gap;
    track.style.transitionProperty = animate ? 'transform' : 'none';
    track.style.transform = `translate3d(${-index * step}px, 0, 0)`;
  }, [animate, index]);

  useEffect(() => {
    if (count <= 1) return;

    const track = trackRef.current;
    if (!track) return;

    const handle = () => {
      // Saiu pela esquerda dos clones — pula para o equivalente real.
      if (index < BUFFER) {
        setAnimate(false);
        setIndex(index + count);
        requestAnimationFrame(() => {
          requestAnimationFrame(() => setAnimate(true));
        });
        return;
      }

      // Avançou para a região de clones à direita — volta para a posição real correspondente.
      if (index >= BUFFER + count) {
        setAnimate(false);
        setIndex(index - count);
        requestAnimationFrame(() => {
          requestAnimationFrame(() => setAnimate(true));
        });
      }
    };

    track.addEventListener('transitionend', handle);
    return () => track.removeEventListener('transitionend', handle);
  }, [count, index]);

  if (count === 0) return null;

  return (
    <div className="mx-auto max-w-6xl px-4">
      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-paper to-transparent sm:w-24" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-paper to-transparent sm:w-24" />

        <div className="overflow-hidden">
          <div
            className="will-change-transform flex gap-4"
            style={{
              transitionDuration: animate ? '700ms' : '0ms',
              transitionTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)',
            }}
            ref={trackRef}
          >
            {loopImages.map((img, i) => (
              <div
                key={`${img.id}-${i}`}
                data-slide="true"
                className="shrink-0 rounded-2xl bg-neutral-100 shadow-soft overflow-hidden"
                style={{ width: '70vw', maxWidth: 420, aspectRatio: '1 / 1' }}
              >
                <img src={img.url} alt={img.alt} className="h-full w-full object-cover" loading="lazy" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
