import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DashboardLayout from "../components/layouts/DashboardLayout";
import { getUserById } from "../services/userService";

function UserProfile() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    try {
      setLoading(true);

      const res = await getUserById(id);
      setData(res.data);
    } catch (error) {
      console.error("Get User Profile Error:", error);
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, [id]);

  if (loading) {
    return (
      <DashboardLayout>
        <p className="text-slate-400">
          Loading user profile...
        </p>
      </DashboardLayout>
    );
  }

  if (!data?.user) {
    return (
      <DashboardLayout>
        <div className="rounded-2xl border border-slate-700 bg-slate-900 p-8 text-center">
          <h2 className="text-2xl font-bold text-white">
            User not found
          </h2>

          <button
            onClick={() => navigate("/users")}
            className="mt-5 rounded-lg bg-blue-600 px-5 py-3 text-white hover:bg-blue-700"
          >
            Back to Users
          </button>
        </div>
      </DashboardLayout>
    );
  }

  const {
    user,
    orders = [],
    meetings = [],
  } = data;

  return (
    <DashboardLayout>
      <div className="space-y-8">

        {/* Back */}
        <button
          onClick={() => navigate("/users")}
          className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-white transition hover:bg-slate-800"
        >
          ← Back to Users
        </button>

        {/* =========================
            PROFILE
        ========================== */}
        <div className="rounded-2xl border border-slate-700 bg-slate-900 p-8">
          <h1 className="text-2xl font-bold text-white">
            User Profile
          </h1>

          <div className="mt-8 flex flex-col gap-6 sm:flex-row sm:items-center">
            {user.profileImage ? (
              <img
                src={user.profileImage}
                alt={user.name}
                className="h-24 w-24 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-blue-500/20 text-3xl font-bold text-blue-400">
                {user.name?.charAt(0).toUpperCase()}
              </div>
            )}

            <div>
              <h2 className="text-3xl font-bold text-white">
                {user.name}
              </h2>

              <p className="mt-1 text-slate-400">
                {user.email}
              </p>

              <span
                className={`mt-3 inline-block rounded-full px-3 py-1 text-xs font-medium ${
                  user.role === "Admin"
                    ? "bg-red-500/10 text-red-400"
                    : "bg-blue-500/10 text-blue-400"
                }`}
              >
                {user.role}
              </span>
            </div>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-slate-800 p-4">
              <p className="text-sm text-slate-500">
                Account Created
              </p>

              <p className="mt-1 text-white">
                {user.createdAt
                  ? new Date(
                      user.createdAt
                    ).toLocaleDateString()
                  : "-"}
              </p>
            </div>

            <div className="rounded-xl border border-slate-800 p-4">
              <p className="text-sm text-slate-500">
                Google Account
              </p>

              <p className="mt-1 text-white">
                {user.googleId
                  ? "Connected"
                  : "Not connected"}
              </p>
            </div>
          </div>
        </div>

        {/* =========================
            ORDERS
        ========================== */}
        <div className="rounded-2xl border border-slate-700 bg-slate-900 p-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white">
                Orders
              </h2>

              <p className="mt-1 text-sm text-slate-400">
                Orders placed by this user
              </p>
            </div>

            <span className="rounded-full bg-blue-500/10 px-3 py-1 text-sm text-blue-400">
              {orders.length} Orders
            </span>
          </div>

          {orders.length === 0 ? (
            <div className="mt-6 rounded-xl border border-slate-800 p-6 text-center">
              <p className="text-slate-400">
                No orders found.
              </p>
            </div>
          ) : (
            <div className="mt-6 overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-800 text-left text-sm uppercase tracking-wider text-slate-400">
                    <th className="px-4 py-4">
                      Order #
                    </th>

                    <th className="px-4 py-4">
                      Product
                    </th>

                    <th className="px-4 py-4">
                      Qty
                    </th>

                    <th className="px-4 py-4">
                      Total
                    </th>

                    <th className="px-4 py-4">
                      Status
                    </th>

                    <th className="px-4 py-4">
                      Placed On
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {orders.map((order) => (
                    <tr
                      key={order.id}
                      className="border-b border-slate-800 transition hover:bg-slate-800/30"
                    >
                      <td className="px-4 py-4 font-medium text-white">
                        {order.orderNumber}
                      </td>

                      <td className="px-4 py-4 text-slate-300">
                        {order.productName || "-"}
                      </td>

                      <td className="px-4 py-4 text-slate-300">
                        {order.quantity}
                      </td>

                      <td className="px-4 py-4 font-semibold text-emerald-400">
                        ${order.total}
                      </td>

                      <td className="px-4 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-medium ${
                            order.status === "Completed"
                              ? "bg-emerald-500/10 text-emerald-400"
                              : order.status === "Cancelled"
                              ? "bg-red-500/10 text-red-400"
                              : order.status === "Processing"
                              ? "bg-yellow-500/10 text-yellow-400"
                              : "bg-blue-500/10 text-blue-400"
                          }`}
                        >
                          {order.status}
                        </span>
                      </td>

                      <td className="px-4 py-4 text-slate-400">
                        {order.createdAt
                          ? new Date(
                              order.createdAt
                            ).toLocaleDateString()
                          : "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* =========================
            MEETINGS
        ========================== */}
        <div className="rounded-2xl border border-slate-700 bg-slate-900 p-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white">
                Meetings
              </h2>

              <p className="mt-1 text-sm text-slate-400">
                Meetings involving this user
              </p>
            </div>

            <span className="rounded-full bg-purple-500/10 px-3 py-1 text-sm text-purple-400">
              {meetings.length} Meetings
            </span>
          </div>

          {meetings.length === 0 ? (
            <div className="mt-6 rounded-xl border border-slate-800 p-6 text-center">
              <p className="text-slate-400">
                No meetings found.
              </p>
            </div>
          ) : (
            <div className="mt-6 overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-800 text-left text-sm uppercase tracking-wider text-slate-400">
                    <th className="px-4 py-4">
                      Title
                    </th>

                    <th className="px-4 py-4">
                      Other Participant
                    </th>

                    <th className="px-4 py-4">
                      Duration
                    </th>

                    <th className="px-4 py-4">
                      Mode
                    </th>

                    <th className="px-4 py-4">
                      Date
                    </th>

                    <th className="px-4 py-4">
                      Time
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {meetings.map((meeting) => {
                    const isParticipantOne =
                      Number(meeting.participantOneId) ===
                      Number(user.id);

                    const otherParticipant = isParticipantOne
                      ? meeting.participantTwoName
                      : meeting.participantOneName;

                    return (
                      <tr
                        key={meeting.id}
                        className="border-b border-slate-800 transition hover:bg-slate-800/30"
                      >
                        <td className="px-4 py-4 font-medium text-white">
                          {meeting.title}
                        </td>

                        <td className="px-4 py-4 text-slate-300">
                          {otherParticipant || "-"}
                        </td>

                        <td className="px-4 py-4 text-slate-300">
                          {meeting.duration} min
                        </td>

                        <td className="px-4 py-4">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-medium ${
                              meeting.mode === "Online"
                                ? "bg-blue-500/10 text-blue-400"
                                : "bg-orange-500/10 text-orange-400"
                            }`}
                          >
                            {meeting.mode}
                          </span>
                        </td>

                        <td className="px-4 py-4 text-slate-400">
                          {meeting.meetingDate
                            ? new Date(
                                `${meeting.meetingDate}T00:00:00`
                              ).toLocaleDateString()
                            : "-"}
                        </td>

                        <td className="px-4 py-4 text-slate-400">
                          {meeting.meetingTime
                            ? String(
                                meeting.meetingTime
                              ).slice(0, 5)
                            : "-"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

export default UserProfile;