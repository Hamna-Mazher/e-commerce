function Divider() {
  return (
    <div className="my-8 flex items-center">

      <div className="h-px flex-1 bg-white/10"></div>

      <span className="mx-5 text-xs uppercase tracking-[0.35em] text-gray-500">
        OR
      </span>

      <div className="h-px flex-1 bg-white/10"></div>

    </div>
  );
}

export default Divider;