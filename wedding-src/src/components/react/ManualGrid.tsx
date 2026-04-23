import { useEffect, useRef, useState } from 'react';

const AUTO_PLAY_INTERVAL_MS = 3000;

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

const COLS = 3;

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

function renderPanel(it: Item) {
  return (
    <div className="mt-3 rounded-2xl bg-paper p-5 shadow-soft sm:mt-4 sm:p-6">
      <div
        className="prose prose-neutral max-w-none prose-headings:font-serif prose-headings:tracking-tight prose-h2:mt-0 prose-h2:text-xl prose-h2:font-bold sm:prose-h2:text-2xl"
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

  useEffect(() => {
    if (!autoPlay || items.length === 0) return;
    const next = items[autoIndex];
    const curr = openItemRef.current;
    if (curr?.id === next.id) return;
    if (curr) setClosingItem(curr);
    setOpenItem(next);
  }, [autoIndex, autoPlay, items]);

  const onItemClick = (it: Item) => {
    if (autoPlay) setAutoPlay(false);
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
            <div className="grid grid-cols-3 gap-0">
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
                      isOpen ? 'z-10 ring-2 ring-inset ring-gold' : ''
                    }`}
                  >
                    <img
                      src={it.iconUrl}
                      alt=""
                      className="absolute inset-0 h-full w-full object-contain p-3 sm:p-4"
                    />
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
