import { useState } from 'react';
import { MicIcon } from './Visuals';

type Props = {
  onClick: () => void | Promise<void>;
  listening?: boolean;
  disabled?: boolean;
  label?: string;
};

export default function MicButton({
  onClick,
  listening,
  disabled,
  label = 'Speak',
}: Props) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const active = Boolean(listening || pending);

  async function handleClick() {
    setError('');
    setPending(true);
    try {
      await onClick();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'The microphone did not work. Please try again.');
    } finally {
      setPending(false);
    }
  }

  return (
    <>
      <button
        aria-describedby={error ? 'microphone-error' : undefined}
        aria-pressed={active}
        className="big-btn primary mic"
        onClick={() => void handleClick()}
        disabled={disabled || active}
        type="button"
      >
        <MicIcon />
        {active ? 'Listening…' : label}
      </button>
      {error && (
        <p className="small warn" id="microphone-error" role="alert">
          {error}
        </p>
      )}
    </>
  );
}
