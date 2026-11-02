import { MicIcon } from './Visuals';

type Props = {
  onClick: () => void;
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
  return (
    <button
      className="big-btn primary mic"
      onClick={onClick}
      disabled={disabled}
      type="button"
    >
      <MicIcon />
      {listening ? 'Listening…' : label}
    </button>
  );
}
