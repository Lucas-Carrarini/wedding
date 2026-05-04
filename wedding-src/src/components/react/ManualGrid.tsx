import { useEffect, useRef, useState } from 'react';

const AUTO_PLAY_INTERVAL_MS = 1500;
const AUTO_PLAY_RESTART_DELAY_MS = 3000;
const MAX_AUTO_PLAY_CYCLES = 3;

type Item = {
  id: string;
  title: string;
  iconUrl: string;
  contentHtml: string;
  redirectTo?: string;
  redirectLabel?: string;
};

type Props = {
  items: Item[];
};

const COLS = 2;

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

function renderPanel(it: Item) {
  return (
    <div className="mt-3 rounded-2xl bg-paper p-5 shadow-soft sm:mt-4 sm:p-6">
      <div
        className="text-[15px] leading-relaxed text-neutral-700 sm:text-base [&_h2]:mt-0 [&_h2]:mb-3 [&_h2]:font-serif [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:tracking-tight [&_h2]:text-graphite sm:[&_h2]:mb-4 sm:[&_h2]:text-3xl [&_strong]:font-semibold [&_strong]:text-graphite [&_p]:mb-0"
        dangerouslySetInnerHTML={{ __html: it.contentHtml }}
      />
      {it.redirectTo && it.redirectLabel ? (
        <div className="mt-5">
          <a
            href={it.redirectTo}
            className="inline-flex rounded-full bg-graphite px-5 py-3 text-sm font-semibold text-cloud shadow-soft transition hover:bg-graphite/90"
          >
            {it.redirectLabel}
          </a>
        </div>
      ) : null}
    </div>
  );
}

export default function ManualGrid({ items }: Props) {
  const [openItem, setOpenItem] = useState<Item | null>(null);
  const [closingItem, setClosingItem] = useState<Item | null>(null);
  const [autoPlay, setAutoPlay] = useState(true);
  const [autoIndex, setAutoIndex] = useState(0);
  const [autoPlayCycles, setAutoPlayCycles] = useState(0);
  const [lastInteractionTime, setLastInteractionTime] = useState<number>(Date.now());
  const openItemRef = useRef<Item | null>(null);
  openItemRef.current = openItem;

  const rows = chunk(items, COLS);

  useEffect(() => {
    if (!autoPlay || items.length === 0) return;
    const id = window.setInterval(() => {
      setAutoIndex((i) => (i + 1) % items.length);
    }, AUTO_PLAY_INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [autoPlay, items.length]);

  // Timer para reiniciar auto-play após 10s sem interação
  useEffect(() => {
    if (autoPlay || autoPlayCycles >= MAX_AUTO_PLAY_CYCLES) return;
    
    const checkRestart = () => {
      const now = Date.now();
      const timeSinceLastInteraction = now - lastInteractionTime;
      
      if (timeSinceLastInteraction >= AUTO_PLAY_RESTART_DELAY_MS && !openItem) {
        setAutoPlay(true);
        setAutoPlayCycles(prev => prev + 1);
      }
    };

    const id = window.setInterval(checkRestart, 1000);
    return () => window.clearInterval(id);
  }, [autoPlay, autoPlayCycles, lastInteractionTime, openItem, items.length]);

  useEffect(() => {
    if (!autoPlay || items.length === 0) return;
    const next = items[autoIndex];
    const curr = openItemRef.current;
    if (curr?.id === next.id) return;
    if (curr) setClosingItem(curr);
    setOpenItem(next);
  }, [autoIndex, autoPlay, items]);

  const onItemClick = (it: Item) => {
    setLastInteractionTime(Date.now());
    
    if (autoPlay) {
      setAutoPlay(false);
      setAutoPlayCycles(0); // Reset contador quando há interação manual
    }
    
    if (openItem?.id === it.id) {
      setClosingItem(it);
      setOpenItem(null);
      return;
    }
    if (openItem) {
      setClosingItem(openItem);
    }
    setOpenItem(it);
  };

  const onCloseAnimEnd = () => setClosingItem(null);

  return (
    <div className="mx-auto max-w-md sm:max-w-lg">
      {rows.map((row, rowIdx) => {
        return (
          <div key={`row-${rowIdx}`}>
            <div className="grid grid-cols-2 gap-0">
              {row.map((it) => {
                const isOpen = openItem?.id === it.id;
                return (
                  <button
                    key={it.id}
                    type="button"
                    onClick={() => onItemClick(it)}
                    aria-label={it.title}
                    aria-expanded={isOpen}
                    className={`relative z-0 aspect-square overflow-hidden bg-paper shadow-soft transition active:scale-[0.98] ${
                      isOpen ? 'z-10 ring-2 ring-inset ring-[#BFC893]' : ''
                    }`}
                  >
                    <span className="absolute inset-0 flex items-center justify-center p-1">
                      <img src={it.iconUrl} alt={it.title} className="h-full w-full object-contain" />
                    </span>
                  </button>
                );
              })}
            </div>

            {(() => {
              const openInRow = row.find((it) => it.id === openItem?.id) ? openItem : null;
              const closingInRow = row.find((it) => it.id === closingItem?.id) ? closingItem : null;
              return (
                <>
                  {closingInRow ? (
                    <div
                      key={`close-${closingInRow.id}`}
                      className="ll-manual-panel-close overflow-hidden"
                      onAnimationEnd={onCloseAnimEnd}
                    >
                      <div className="min-h-0">{renderPanel(closingInRow)}</div>
                    </div>
                  ) : null}
                  {openInRow ? (
                    <div key={`open-${openInRow.id}`} className="ll-manual-panel-open overflow-hidden">
                      <div className="min-h-0">{renderPanel(openInRow)}</div>
                    </div>
                  ) : null}
                </>
              );
            })()}
          </div>
        );
      })}

      <style>{`
        @keyframes ll-manual-panel-open-kf {
          from { grid-template-rows: 0fr; opacity: 0; }
          to { grid-template-rows: 1fr; opacity: 1; }
        }
        .ll-manual-panel-open {
          display: grid;
          grid-template-rows: 1fr;
          animation: ll-manual-panel-open-kf 450ms cubic-bezier(0.22, 1, 0.36, 1);
        }

        @keyframes ll-manual-panel-close-kf {
          from { grid-template-rows: 1fr; opacity: 1; }
          to { grid-template-rows: 0fr; opacity: 0; }
        }
        .ll-manual-panel-close {
          display: grid;
          grid-template-rows: 0fr;
          animation: ll-manual-panel-close-kf 450ms cubic-bezier(0.22, 1, 0.36, 1);
        }
      `}</style>
    </div>
  );
}
