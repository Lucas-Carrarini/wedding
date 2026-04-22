import { useEffect, useState } from 'react';

type Props = {
  title: string;
  subtitle: string;
  nameLabel: string;
  namePlaceholder: string;
  messageLabel: string;
  messagePlaceholder: string;
  submitLabel: string;
  sendingLabel: string;
  successTitle: string;
  successMessage: string;
  successCloseLabel: string;
  requiredError: string;
};

export default function MessageBoardForm(props: Props) {
  const {
    title,
    subtitle,
    nameLabel,
    namePlaceholder,
    messageLabel,
    messagePlaceholder,
    submitLabel,
    sendingLabel,
    successTitle,
    successMessage,
    successCloseLabel,
    requiredError,
  } = props;

  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (!showSuccess) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [showSuccess]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !message.trim()) {
      setError(requiredError);
      return;
    }
    setError(null);
    setSending(true);
    // TODO: integrar com Supabase
    await new Promise((r) => setTimeout(r, 500));
    setSending(false);
    setName('');
    setMessage('');
    setShowSuccess(true);
  };

  return (
    <div>
      <div className="font-serif text-2xl font-bold text-white sm:text-3xl">{title}</div>
      <p className="mt-2 text-sm text-white/70">{subtitle}</p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
        <div>
          <label className="block text-xs font-medium uppercase tracking-[0.18em] text-white/60" htmlFor="ll-msg-name">
            {nameLabel}
          </label>
          <input
            id="ll-msg-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={namePlaceholder}
            required
            className="mt-2 w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/40 outline-none transition focus:border-white/40 focus:bg-white/10"
          />
        </div>

        <div>
          <label className="block text-xs font-medium uppercase tracking-[0.18em] text-white/60" htmlFor="ll-msg-message">
            {messageLabel}
          </label>
          <textarea
            id="ll-msg-message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={messagePlaceholder}
            required
            rows={4}
            className="mt-2 w-full resize-y rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/40 outline-none transition focus:border-white/40 focus:bg-white/10"
          />
        </div>

        {error ? <div className="text-sm text-red-300">{error}</div> : null}

        <button
          type="submit"
          disabled={sending}
          className="inline-flex rounded-full bg-white px-6 py-3 text-sm font-semibold text-neutral-900 shadow-soft transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {sending ? sendingLabel : submitLabel}
        </button>
      </form>

      {showSuccess ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <button
            type="button"
            aria-label={successCloseLabel}
            onClick={() => setShowSuccess(false)}
            className="absolute inset-0 bg-black/50"
          />
          <div
            role="dialog"
            aria-modal="true"
            className="relative z-10 w-full max-w-md rounded-3xl bg-white p-8 text-center shadow-soft"
          >
            <div className="font-serif text-2xl font-bold text-neutral-900">{successTitle}</div>
            <p className="mt-3 text-sm text-neutral-600">{successMessage}</p>
            <button
              type="button"
              onClick={() => setShowSuccess(false)}
              className="mt-6 inline-flex rounded-full bg-neutral-900 px-5 py-3 text-sm font-semibold text-white shadow-soft transition hover:bg-neutral-800"
            >
              {successCloseLabel}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
