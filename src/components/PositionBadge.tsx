interface PositionBadgeProps {
  position: string | number;
  className?: string;
}

function getBadgeClasses(position: string): string {
  if (position === '1') {
    return 'bg-amber-300 text-amber-950';
  }

  if (position === '2') {
    return 'bg-slate-300 text-slate-900';
  }

  if (position === '3') {
    return 'bg-[#cd7f32] text-[#1a1104]';
  }

  return 'bg-white/10 text-white';
}

const PositionBadge: React.FC<PositionBadgeProps> = ({ position, className }) => {
  const normalizedPosition = String(position).trim();

  return (
    <span
      className={`inline-flex min-w-8 justify-center rounded-md px-2 py-0.5 text-xs font-semibold ${getBadgeClasses(
        normalizedPosition,
      )} ${className ?? ''}`}
    >
      {normalizedPosition}
    </span>
  );
};

export default PositionBadge;