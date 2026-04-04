interface StatCardProps {
  title: string;
  value: string | number;
  className?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, className }) => {
  return (
    <div className={`rounded-2xl border border-white/12 bg-white/[0.03] p-4 backdrop-blur ${className ?? ''}`}>
      <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">{title}</h3>
      <p className="mt-2 text-xl font-semibold text-slate-100 sm:text-2xl">{value}</p>
    </div>
  );
};

export default StatCard;
