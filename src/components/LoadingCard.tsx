interface LoadingCardProps {
  message?: string;
  minHeight?: string;
}

const LoadingCard: React.FC<LoadingCardProps> = ({
  message = 'Loading...',
  minHeight = 'min-h-[300px]',
}) => {
  return (
    <div className={`flex items-center justify-center rounded-2xl border border-white/10 bg-slate-950/60 p-6 text-slate-100 shadow-xl ${minHeight}`}>
      <div className="flex flex-col items-center gap-3">
        <span className="h-7 w-7 animate-spin rounded-full border-2 border-orange-300/25 border-t-orange-300" aria-hidden="true" />
        <span className="text-sm font-medium uppercase tracking-[0.12em] text-slate-300">{message}</span>
      </div>
    </div>
  );
};

export default LoadingCard;
