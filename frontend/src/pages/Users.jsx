import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getUsers } from "../services/userService";
import DashboardLayout from "../components/layouts/DashboardLayout";

function Users() {
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);

  const fetchUsers = async () => {
    try {
      setLoading(true);

      const res = await getUsers(page, limit);

      setUsers(res.data.users || []);
      setTotalPages(res.data.totalPages || 1);
      setTotalUsers(res.data.totalUsers || 0);
    } catch (error) {
      console.error("Get Users Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page]);

  return (
    <DashboardLayout>
      <div className="rounded-2xl border border-slate-700 bg-slate-900">

        {/* Header */}
        <div className="border-b border-slate-800 p-6">
          <h1 className="text-3xl font-bold text-white">
            Users
          </h1>

          <p className="mt-1 text-sm text-slate-400">
            Manage registered users
          </p>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <p className="text-slate-400">
              Loading users...
            </p>
          ) : users.length === 0 ? (
            <p className="text-slate-400">
              No users found.
            </p>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-800 text-left text-sm uppercase tracking-wider text-slate-400">
                      <th className="px-4 py-4">
                        User
                      </th>

                      <th className="px-4 py-4">
                        Email
                      </th>

                      <th className="px-4 py-4">
                        Role
                      </th>

                      <th className="px-4 py-4">
                        Joined
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {users.map((user) => (
                      <tr
                        key={user.id}
                        onClick={() =>
                          navigate(`/users/${user.id}`)
                        }
                        className="cursor-pointer border-b border-slate-800 transition hover:bg-slate-800/50"
                      >
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            {user.profileImage ? (
                              <img
                                src={user.profileImage}
                                alt={user.name}
                                className="h-10 w-10 rounded-full object-cover"
                              />
                            ) : (
                              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/20 text-sm font-semibold text-blue-400">
                                {user.name
                                  ?.charAt(0)
                                  .toUpperCase()}
                              </div>
                            )}

                            <span className="font-medium text-white">
                              {user.name}
                            </span>
                          </div>
                        </td>

                        <td className="px-4 py-4 text-slate-300">
                          {user.email}
                        </td>

                        <td className="px-4 py-4">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-medium ${
                              user.role === "Admin"
                                ? "bg-red-500/10 text-red-400"
                                : "bg-blue-500/10 text-blue-400"
                            }`}
                          >
                            {user.role}
                          </span>
                        </td>

                        <td className="px-4 py-4 text-slate-400">
                          {user.createdAt
                            ? new Date(
                                user.createdAt
                              ).toLocaleDateString()
                            : "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="mt-6 flex items-center justify-between">
                <p className="text-sm text-slate-400">
                  Total users: {totalUsers}
                </p>

                <div className="flex items-center gap-2">
                  <button
                    disabled={page === 1}
                    onClick={() =>
                      setPage((prev) => prev - 1)
                    }
                    className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-white disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Previous
                  </button>

                  <span className="px-3 text-sm text-slate-300">
                    Page {page} of {totalPages}
                  </span>

                  <button
                    disabled={page === totalPages}
                    onClick={() =>
                      setPage((prev) => prev + 1)
                    }
                    className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-white disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Next
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

export default Users;