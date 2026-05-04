import { useEffect, useState } from 'react';
import { getSupabase } from '../../lib/supabase';

type Props = {
  nameLabel: string;
  namePlaceholder: string;
  submitLabel: string;
  sendingLabel: string;
  householdNotice: string;
  successTitle: string;
  successMessage: string;
  successCloseLabel: string;
  notFoundTitle?: string;
  notFoundMessage?: string;
  errorTitle?: string;
  errorMessage?: string;
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
    notFoundTitle = 'Nome não encontrado',
    notFoundMessage = 'Não localizamos seu nome na lista de convidados. Verifique a grafia ou entre em contato com os noivos.',
    errorTitle = 'Algo deu errado',
    errorMessage = 'Não foi possível registrar sua confirmação agora. Tente novamente em alguns instantes.',
  } = props;

  type ResultKind = 'success' | 'not_found' | 'error' | null;
  const [name, setName] = useState('');
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<ResultKind>(null);

  const isValid = name.trim().length >= 2;
  const showModal = result !== null;

  useEffect(() => {
    if (!showModal) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [showModal]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid || sending) return;
    setSending(true);
    try {
      const supabase = getSupabase();
      const { data, error } = await supabase.rpc('confirmar_presenca', {
        nome_input: name.trim(),
      });
      if (error) {
        console.error('[RSVP] erro RPC:', error);
        setResult('error');
      } else if (data === true) {
        setName('');
        setResult('success');
      } else {
        setResult('not_found');
      }
    } catch (err) {
      console.error('[RSVP] exceção:', err);
      setResult('error');
    } finally {
      setSending(false);
    }
  };

  const closeModal = () => setResult(null);
  const modalTitle =
    result === 'success' ? successTitle : result === 'not_found' ? notFoundTitle : errorTitle;
  const modalMessage =
    result === 'success' ? successMessage : result === 'not_found' ? notFoundMessage : errorMessage;

  const buttonBase =
    'inline-flex w-full items-center justify-center rounded-full px-6 py-3.5 text-sm font-semibold shadow-soft transition-all duration-300';
  const buttonActive = 'bg-brand-500 text-cloud hover:opacity-90';
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
            className="mt-2 w-full rounded-xl border border-neutral-200 bg-paper px-4 py-3 text-sm text-graphite placeholder-neutral-400 outline-none transition focus:border-neutral-400 focus:ring-2 focus:ring-neutral-200"
          />
        </div>

        <p
          className="text-sm text-neutral-600 [&_strong]:font-semibold [&_strong]:text-graphite"
          dangerouslySetInnerHTML={{ __html: householdNotice }}
        />

        <button
          type="submit"
          disabled={!isValid || sending}
          aria-disabled={!isValid || sending}
          className={`${buttonBase} ${isValid && !sending ? buttonActive : buttonDisabled}`}
        >
          {sending ? sendingLabel : submitLabel}
        </button>
      </form>

      {showModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <button
            type="button"
            aria-label={successCloseLabel}
            onClick={closeModal}
            className="absolute inset-0 bg-black/50"
          />
          <div
            role="dialog"
            aria-modal="true"
            className="relative z-10 w-full max-w-md rounded-3xl bg-paper p-8 text-center shadow-soft"
          >
            <div className="font-serif text-2xl font-bold text-graphite">{modalTitle}</div>
            <p className="mt-3 text-sm text-neutral-600">{modalMessage}</p>
            <button
              type="button"
              onClick={closeModal}
              className="mt-6 inline-flex rounded-full bg-graphite px-5 py-3 text-sm font-semibold text-cloud shadow-soft transition hover:bg-graphite/90"
            >
              {successCloseLabel}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
