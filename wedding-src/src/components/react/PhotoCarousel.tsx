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

export default function PhotoCarousel({ autoplayMs, images }: Props) {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const [index, setIndex] = useState(1);
  const [animate, setAnimate] = useState(true);

  const safeImages = useMemo(() => images.filter(Boolean), [images]);
  const count = safeImages.length;

  const loopImages = useMemo(() => {
    if (count === 0) return [];
    if (count === 1) return [safeImages[0]];

    const first = safeImages[0];
    const last = safeImages[count - 1];
    return [last, ...safeImages, first];
  }, [count, safeImages]);

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
      if (index === 0) {
        setAnimate(false);
        setIndex(count);
        requestAnimationFrame(() => {
          requestAnimationFrame(() => setAnimate(true));
        });
        return;
      }

      if (index === count + 1) {
        setAnimate(false);
        setIndex(1);
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
    <section className="bg-paper">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:py-20">
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

        <div className="mt-10 prose prose-neutral mx-auto max-w-3xl">
          {/* markdown entra no Astro, não aqui (sem conteúdo hardcoded em TSX) */}
        </div>
      </div>
    </section>
  );
}
