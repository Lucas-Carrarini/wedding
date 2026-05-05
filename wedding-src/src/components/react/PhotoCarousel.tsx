import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

type Item = {
  id: string;
  url: string;
  alt: string;
};

type Props = {
  autoplayMs: number;
  images: Item[];
};

// Quantidade de blocos embaralhados mantidos simultaneamente no DOM.
// Cada bloco = uma cópia shuffled de todas as imagens. Ao chegar perto das bordas,
// novos blocos embaralhados são gerados nas extremidades, mantendo o total constante.
const BLOCK_COUNT = 15;
// Tempo de inatividade após interação para retomar autoplay.
const RESUME_AUTOPLAY_MS = 3000;
// Velocidade mínima (px/ms) pra considerar "flick" e avançar um slide.
const FLICK_VELOCITY = 0.4;
// Fração do slide arrastado para considerar avanço por distância.
const DRAG_DISTANCE_RATIO = 0.2;
// Duração da transição normal (animação entre slides).
const TRANSITION_MS = 700;

function shuffle<T>(arr: T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function PhotoCarousel({ autoplayMs, images }: Props) {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const [animate, setAnimate] = useState(true);

  const safeImages = useMemo(() => images.filter(Boolean), [images]);
  const count = safeImages.length;

  // Blocos embaralhados; cada bloco é uma cópia shuffled das imagens.
  // A ordem inicial é aleatória; conforme o usuário avança/volta, blocos novos
  // (também embaralhados, cada um diferente) substituem os das extremidades.
  const [blocks, setBlocks] = useState<Item[][]>(() => {
    if (count === 0) return [];
    return Array.from({ length: BLOCK_COUNT }, () => shuffle(safeImages));
  });

  useEffect(() => {
    if (count === 0) {
      setBlocks([]);
      return;
    }
    setBlocks(Array.from({ length: BLOCK_COUNT }, () => shuffle(safeImages)));
  }, [safeImages, count]);

  const flat = useMemo(() => blocks.flat(), [blocks]);
  const totalSlides = flat.length;

  // Índice absoluto dentro do flat. Começa no meio para permitir arraste p/ ambos os lados.
  const startIndex = Math.floor(BLOCK_COUNT / 2) * count;
  const [index, setIndex] = useState(startIndex);

  // Estado de arraste (refs para evitar re-render a cada move).
  const isPointerDownRef = useRef(false);
  const isDraggingRef = useRef(false);
  const pointerIdRef = useRef<number | null>(null);
  const startXRef = useRef(0);
  const startYRef = useRef(0);
  const lastXRef = useRef(0);
  const lastTRef = useRef(0);
  const velocityRef = useRef(0);
  const dragOffsetRef = useRef(0);
  const stepRef = useRef(0);

  const [isDragging, setIsDragging] = useState(false);
  const [autoplayPaused, setAutoplayPaused] = useState(false);
  const resumeTimerRef = useRef<number | null>(null);

  // Reseta index ao meio quando as imagens mudam (não a cada troca interna de blocos).
  useEffect(() => {
    setIndex(Math.floor(BLOCK_COUNT / 2) * count);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [safeImages]);

  // Recalcula step (largura de um slide + gap) sempre que layout mudar.
  const recomputeStep = useCallback(() => {
    const track = trackRef.current;
    if (!track) return 0;
    const slide = track.querySelector<HTMLElement>('[data-slide="true"]');
    if (!slide) return 0;
    const slideW = slide.getBoundingClientRect().width;
    const gapRaw = getComputedStyle(track).gap;
    const gap = Number.parseFloat((gapRaw || '0').split(' ')[0] ?? '0') || 0;
    const step = slideW + gap;
    stepRef.current = step;
    return step;
  }, []);

  useEffect(() => {
    recomputeStep();
    const handler = () => recomputeStep();
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, [recomputeStep]);

  // Aplica transform atual a partir de index + dragOffset.
  const applyTransform = useCallback(
    (withTransition: boolean) => {
      const track = trackRef.current;
      if (!track) return;
      const step = stepRef.current || recomputeStep();
      const px = -index * step + dragOffsetRef.current;
      track.style.transitionDuration = withTransition ? `${TRANSITION_MS}ms` : '0ms';
      track.style.transform = `translate3d(${px}px, 0, 0)`;
    },
    [index, recomputeStep]
  );

  useEffect(() => {
    applyTransform(animate);
  }, [animate, index, applyTransform]);

  // Autoplay (pausa durante drag / pós-interação).
  useEffect(() => {
    if (count <= 1 || autoplayPaused) return;
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
      if (document.hidden) stop();
      else start();
    };
    if (!document.hidden) start();
    document.addEventListener('visibilitychange', handleVisibility);
    return () => {
      stop();
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [autoplayMs, count, autoplayPaused]);

  // Loop infinito com blocos embaralhados: ao se aproximar das bordas,
  // adiciona um novo bloco shuffled na extremidade oposta à direção e
  // descarta o bloco da borda, mantendo o total constante. O índice é
  // ajustado sem animação para preservar a posição visual.
  useEffect(() => {
    if (count <= 1) return;
    const track = trackRef.current;
    if (!track) return;

    const handle = () => {
      if (isDraggingRef.current) return;
      // Perto da borda esquerda: adiciona bloco novo no início, descarta o último.
      if (index < count) {
        setAnimate(false);
        setBlocks((bs) => [shuffle(safeImages), ...bs.slice(0, bs.length - 1)]);
        setIndex((i) => i + count);
        requestAnimationFrame(() => {
          requestAnimationFrame(() => setAnimate(true));
        });
        return;
      }
      // Perto da borda direita: adiciona bloco novo no final, descarta o primeiro.
      if (index >= totalSlides - count) {
        setAnimate(false);
        setBlocks((bs) => [...bs.slice(1), shuffle(safeImages)]);
        setIndex((i) => i - count);
        requestAnimationFrame(() => {
          requestAnimationFrame(() => setAnimate(true));
        });
      }
    };

    track.addEventListener('transitionend', handle);
    return () => track.removeEventListener('transitionend', handle);
  }, [count, index, totalSlides, safeImages]);

  // Agenda retomada do autoplay após inatividade.
  const scheduleResume = useCallback(() => {
    if (resumeTimerRef.current !== null) {
      window.clearTimeout(resumeTimerRef.current);
    }
    resumeTimerRef.current = window.setTimeout(() => {
      setAutoplayPaused(false);
      resumeTimerRef.current = null;
    }, RESUME_AUTOPLAY_MS);
  }, []);

  const cancelResume = useCallback(() => {
    if (resumeTimerRef.current !== null) {
      window.clearTimeout(resumeTimerRef.current);
      resumeTimerRef.current = null;
    }
  }, []);

  useEffect(() => () => cancelResume(), [cancelResume]);

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (count <= 1) return;
    // Ignora cliques não primários (só botão esquerdo / touch / pen).
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    recomputeStep();
    isPointerDownRef.current = true;
    isDraggingRef.current = false;
    pointerIdRef.current = e.pointerId;
    startXRef.current = e.clientX;
    startYRef.current = e.clientY;
    lastXRef.current = e.clientX;
    lastTRef.current = performance.now();
    velocityRef.current = 0;
    dragOffsetRef.current = 0;
    setAutoplayPaused(true);
    cancelResume();
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isPointerDownRef.current) return;
    const dx = e.clientX - startXRef.current;
    const dy = e.clientY - startYRef.current;

    // Só começa a arrastar depois de um limiar para não conflitar com scroll vertical.
    if (!isDraggingRef.current) {
      if (Math.abs(dx) < 8) return;
      if (Math.abs(dy) > Math.abs(dx)) {
        // Gesto vertical — desiste do drag.
        isPointerDownRef.current = false;
        scheduleResume();
        return;
      }
      isDraggingRef.current = true;
      setIsDragging(true);
      // Captura o ponteiro para continuar recebendo eventos mesmo fora do elemento.
      try {
        (e.currentTarget as Element).setPointerCapture(e.pointerId);
      } catch {}
    }

    // Atualiza velocidade (px/ms) com uma amostra simples do último movimento.
    const now = performance.now();
    const dt = Math.max(1, now - lastTRef.current);
    velocityRef.current = (e.clientX - lastXRef.current) / dt;
    lastXRef.current = e.clientX;
    lastTRef.current = now;

    dragOffsetRef.current = dx;
    applyTransform(false);

    // Evita scroll/selection enquanto arrasta horizontalmente.
    e.preventDefault();
  };

  const finishDrag = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isPointerDownRef.current) return;
    isPointerDownRef.current = false;

    const wasDragging = isDraggingRef.current;
    isDraggingRef.current = false;
    setIsDragging(false);
    try {
      if (pointerIdRef.current !== null) {
        (e.currentTarget as Element).releasePointerCapture(pointerIdRef.current);
      }
    } catch {}
    pointerIdRef.current = null;

    if (!wasDragging) {
      dragOffsetRef.current = 0;
      applyTransform(false);
      scheduleResume();
      return;
    }

    const step = stepRef.current || 1;
    const delta = dragOffsetRef.current;
    const v = velocityRef.current; // positivo = arrastou pra direita

    let slidesMoved = 0;
    const byDistance = Math.round(-delta / step);
    if (Math.abs(delta) / step >= DRAG_DISTANCE_RATIO) {
      slidesMoved = byDistance;
    }
    // Flick sobrescreve: se velocidade alta, move 1 na direção oposta ao sinal da velocidade.
    if (Math.abs(v) >= FLICK_VELOCITY) {
      slidesMoved = v < 0 ? Math.max(slidesMoved, 1) : Math.min(slidesMoved, -1);
    }

    dragOffsetRef.current = 0;
    if (slidesMoved !== 0) {
      setIndex((prev) => prev + slidesMoved);
    } else {
      // Volta ao slide atual com animação.
      applyTransform(true);
    }
    scheduleResume();
  };

  if (count === 0) return null;

  return (
    <div className="mx-auto max-w-6xl px-4">
      <div className="relative">
        <div
          className="overflow-hidden touch-pan-y select-none"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={finishDrag}
          onPointerCancel={finishDrag}
          onPointerLeave={(e) => {
            if (isPointerDownRef.current) finishDrag(e);
          }}
          style={{ cursor: isDragging ? 'grabbing' : count > 1 ? 'grab' : 'default' }}
        >
          <div
            className="will-change-transform flex gap-4"
            style={{
              transitionProperty: 'transform',
              transitionDuration: animate ? `${TRANSITION_MS}ms` : '0ms',
              transitionTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)',
            }}
            ref={trackRef}
          >
            {flat.map((img, i) => {
              // Preload eager somente perto do index atual; o resto lazy.
              const eager = Math.abs(i - index) <= count;
              return (
                <div
                  key={`${img.id}-${i}`}
                  data-slide="true"
                  className="shrink-0 rounded-2xl bg-neutral-100 shadow-soft overflow-hidden"
                  style={{ width: '70vw', maxWidth: 420, aspectRatio: '1 / 1' }}
                >
                  <img
                    src={img.url}
                    alt={img.alt}
                    className="h-full w-full object-cover pointer-events-none"
                    draggable={false}
                    loading={eager ? 'eager' : 'lazy'}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
