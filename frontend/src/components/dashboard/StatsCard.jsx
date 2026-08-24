function StatsCard({ title, value, icon, color }) {
  return (
    <div
      className="
        rounded-2xl
        border
        border-slate-700
        bg-slate-900
        p-6
        transition-all
        duration-300
        hover:-translate-y-1
        hover:shadow-xl
      "
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-400">{title}</p>

          <h2 className="mt-2 text-3xl font-bold text-white">
            {value}
          </h2>
        </div>

        <div className={`rounded-xl p-4 ${color}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

export default StatsCard;