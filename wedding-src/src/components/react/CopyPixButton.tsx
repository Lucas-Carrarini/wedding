import { useState } from 'react';

type Props = {
  payload: string;
  label: string;
  copiedLabel: string;
};

export default function CopyPixButton({ payload, label, copiedLabel }: Props) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(payload);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = payload;
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
    <button
      type="button"
      onClick={handleCopy}
      className="inline-flex w-full items-center justify-center rounded-full bg-neutral-900 px-4 py-3 text-sm font-semibold text-white shadow-soft transition hover:bg-neutral-800"
    >
      {copied ? copiedLabel : label}
    </button>
  );
}
