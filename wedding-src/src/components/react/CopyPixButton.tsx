import { useState } from 'react';

type Props = {
  payload: string;
  cpf: string;
  copiedLabel: string;
};

export default function CopyPixButton({ payload, cpf, copiedLabel }: Props) {
  const [copied, setCopied] = useState(false);

  const copyText = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      try {
        document.execCommand('copy');
      } catch {
        // noop
      }
      document.body.removeChild(ta);
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex justify-center">
      <div className="relative inline-flex items-stretch overflow-hidden rounded-full border-2 border-olive bg-cloud text-sm font-semibold shadow-soft">
        <button
          type="button"
          onClick={() => copyText(cpf)}
          aria-label={`Copiar CPF ${cpf}`}
          className="bg-cloud px-4 py-2 text-graphite transition hover:bg-cloud/80"
        >
          {cpf}
        </button>
        <button
          type="button"
          onClick={() => copyText(payload)}
          aria-label="Copiar chave PIX"
          className="flex items-center justify-center bg-olive px-3 py-2 text-cloud transition hover:bg-olive/90"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
          </svg>
        </button>
        {copied ? (
          <div
            className="pointer-events-none absolute inset-0 flex items-center justify-center bg-olive text-sm font-semibold text-cloud"
            aria-live="polite"
          >
            {copiedLabel}
          </div>
        ) : null}
      </div>
    </div>
  );
}
