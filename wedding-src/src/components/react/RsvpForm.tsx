import { useEffect, useState } from 'react';

type Props = {
  nameLabel: string;
  namePlaceholder: string;
  submitLabel: string;
  sendingLabel: string;
  householdNotice: string;
  successTitle: string;
  successMessage: string;
  successCloseLabel: string;
};

export default function RsvpForm(props: Props) {
  const {
    nameLabel,
    namePlaceholder,
    submitLabel,
    sendingLabel,
    householdNotice,
    successTitle,
    successMessage,
    successCloseLabel,
  } = props;

  const [name, setName] = useState('');
  const [sending, setSending] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const isValid = name.trim().length >= 2;

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
    if (!isValid || sending) return;
    setSending(true);
    // TODO: integrar com Supabase
    await new Promise((r) => setTimeout(r, 500));
    setSending(false);
    setName('');
    setShowSuccess(true);
  };

  const buttonBase =
    'inline-flex w-full items-center justify-center rounded-full px-6 py-3.5 text-sm font-semibold shadow-soft transition-all duration-300';
  const buttonActive = 'bg-brand-500 text-white hover:opacity-90';
  const buttonDisabled = 'bg-neutral-200 text-neutral-400 opacity-60 grayscale cursor-not-allowed';

  return (
    <div>
      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        <div>
          <label htmlFor="ll-rsvp-name" className="block text-xs font-medium uppercase tracking-[0.18em] text-neutral-500">
            {nameLabel}
          </label>
          <input
            id="ll-rsvp-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={namePlaceholder}
            required
            autoComplete="name"
            className="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-900 placeholder-neutral-400 outline-none transition focus:border-neutral-400 focus:ring-2 focus:ring-neutral-200"
          />
        </div>

        <p className="text-sm text-neutral-600">{householdNotice}</p>

        <button
          type="submit"
          disabled={!isValid || sending}
          aria-disabled={!isValid || sending}
          className={`${buttonBase} ${isValid && !sending ? buttonActive : buttonDisabled}`}
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
