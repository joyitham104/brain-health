type Props = {
  children: React.ReactNode;
  onClick?: () => void;
  primary?: boolean;
  disabled?: boolean;
  className?: string;
};

export default function BigButton({
  children,
  onClick,
  primary,
  disabled,
  className = '',
}: Props) {
  return (
    <button
      className={`big-btn ${primary ? 'primary' : ''} ${className}`}
      onClick={onClick}
      disabled={disabled}
      type="button"
    >
      {children}
    </button>
  );
}
