function DashboardHeader() {
  const hour = new Date().getHours();

  let greeting = "Good Evening";
  let emoji = "🌙";

  if (hour >= 5 && hour < 12) {
    greeting = "Good Morning";
    emoji = "☀️";
  } else if (hour >= 12 && hour < 17) {
    greeting = "Good Afternoon";
    emoji = "🌤️";
  }

  const user = JSON.parse(localStorage.getItem("user"));

  return (
    <div className="mb-10 flex items-center justify-between">
      <div>
        <h1 className="text-4xl font-bold text-white">
          {greeting}, {user?.name}! {emoji}
        </h1>

        <p className="mt-3 text-slate-400">
          Welcome back! Here's what's happening today.
        </p>
      </div>
    </div>
  );
}

export default DashboardHeader;