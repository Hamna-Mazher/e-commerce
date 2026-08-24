import { useCallback, useEffect, useState } from "react";
import DashboardLayout from "../components/layouts/DashboardLayout";
import Pagination from "../components/dashboard/Pagination";
import toast from "react-hot-toast";

import {
  getMeetings,
  softDeleteMeeting,
  deleteMeeting,
} from "../services/meetingService";
import MeetingModal from "../components/dashboard/MeetingModal";
function Meetings() {
  const user = JSON.parse(
    localStorage.getItem("user") || "null"
  );

  const isAdmin = user?.role === "Admin";

  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalMeetings, setTotalMeetings] = useState(0);
const formatMeetingDate = (date) => {
  if (!date) return "-";

  const dateString = String(date).slice(0, 10);

  const [year, month, day] = dateString.split("-");

  if (!year || !month || !day) {
    return "-";
  }

  return `${day}/${month}/${year}`;
};
  const [deleteLoading, setDeleteLoading] = useState(false);
const [meetingModalOpen, setMeetingModalOpen] =
  useState(false);

const [editMeeting, setEditMeeting] =
  useState(null);
  const fetchMeetings = useCallback(
    async (page = 1) => {
      try {
        setLoading(true);
        setError("");

        const res = await getMeetings(page, 10);

        setMeetings(res.data.meetings || []);
        setCurrentPage(res.data.currentPage || 1);
        setTotalPages(res.data.totalPages || 1);
        setTotalMeetings(res.data.totalMeetings || 0);
      } catch (err) {
        setError(
          err.response?.data?.message ||
            "Failed to load meetings."
        );
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchMeetings(currentPage);
  }, [currentPage, fetchMeetings]);

  const handleSoftDelete = async (id) => {
    try {
      setDeleteLoading(true);

      await softDeleteMeeting(id);

      toast.success("Meeting removed successfully.");

      await fetchMeetings(currentPage);
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
          "Failed to remove meeting."
      );
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleHardDelete = async (id) => {
    try {
      setDeleteLoading(true);

      await deleteMeeting(id);

      toast.success("Meeting permanently deleted.");

      if (
        meetings.length === 1 &&
        currentPage > 1
      ) {
        setCurrentPage((prev) => prev - 1);
      } else {
        await fetchMeetings(currentPage);
      }
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
          "Failed to delete meeting."
      );
    } finally {
      setDeleteLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center py-20">
          <h2 className="text-xl font-semibold">
            Loading meetings...
          </h2>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="flex justify-center py-20">
          <h2 className="text-xl text-red-500">
            {error}
          </h2>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            Meetings
          </h1>

          <p className="mt-2 text-gray-400">
            {isAdmin
              ? `All Meetings: ${totalMeetings}`
              : `My Meetings: ${totalMeetings}`}
          </p>
        </div>

        {isAdmin && (
          <button
           onClick={() => {
  setEditMeeting(null);
  setMeetingModalOpen(true);
}}
            className="rounded-xl bg-blue-600 px-5 py-3 text-white transition hover:bg-blue-700"
          >
            + Schedule Meeting
          </button>
        )}
      </div>

      {/* Meetings Table */}
      <div className="mt-10 overflow-hidden rounded-2xl border border-slate-700 bg-slate-900">
        {meetings.length === 0 ? (
          <div className="p-10 text-center text-slate-400">
            No meetings found.
          </div>
        ) : (
           <div className="w-full overflow-hidden">
      <table className="w-full table-fixed">
             <thead className="bg-slate-800/50">
  <tr className="text-left text-sm uppercase tracking-wider text-slate-400">
    <th className="px-5 py-4">
      Title
    </th>

    <th className="px-5 py-4">
      Participants
    </th>

    <th className="px-5 py-4">
      Duration
    </th>

    <th className="px-5 py-4">
      Mode
    </th>

    <th className="px-5 py-4">
      Date & Time
    </th>

    {isAdmin && (
      <th className="px-5 py-4">
        Actions
      </th>
    )}
  </tr>
</thead>

            <tbody>
  {meetings.map((meeting) => (
    <tr
      key={meeting.id}
      className="border-t border-slate-800"
    >
      {/* Title */}
      <td className="px-5 py-5">
        <p className="max-w-[180px] truncate font-semibold text-white">
          {meeting.title}
        </p>
      </td>

      {/* Participants */}
      <td className="px-5 py-5">
        <div className="space-y-1">
          <p className="text-sm font-medium text-white">
            {meeting.participantOneName}
          </p>

          <p className="text-sm text-slate-500">
            {meeting.participantTwoName}
          </p>
        </div>
      </td>

      {/* Duration */}
      <td className="px-5 py-5 text-slate-300">
        {meeting.duration} min
      </td>

      {/* Mode */}
      <td className="px-5 py-5">
        <span
          className={`whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium ${
            meeting.mode === "Online"
              ? "bg-blue-500/10 text-blue-400"
              : "bg-orange-500/10 text-orange-400"
          }`}
        >
          {meeting.mode}
        </span>
      </td>

      {/* Date & Time */}
      <td className="px-5 py-5">
        <p className="text-sm text-white">
          {formatMeetingDate(meeting.meetingDate)}
        </p>

        <p className="mt-1 text-sm text-slate-500">
          {meeting.meetingTime
            ? String(meeting.meetingTime).slice(0, 5)
            : "-"}
        </p>
      </td>

      {/* Actions */}
      {isAdmin && (
        <td className="px-5 py-5">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => {
                setEditMeeting(meeting);
                setMeetingModalOpen(true);
              }}
              className="rounded-lg bg-yellow-500 px-3 py-2 text-sm text-white transition hover:bg-yellow-600"
            >
              Edit
            </button>

            <button
              onClick={() =>
                handleSoftDelete(meeting.id)
              }
              disabled={deleteLoading}
              className="rounded-lg bg-orange-600 px-3 py-2 text-sm text-white transition hover:bg-orange-700 disabled:opacity-50"
            >
              Remove
            </button>

            <button
              onClick={() =>
                handleHardDelete(meeting.id)
              }
              disabled={deleteLoading}
              className="rounded-lg bg-red-600 px-3 py-2 text-sm text-white transition hover:bg-red-700 disabled:opacity-50"
            >
              Delete
            </button>
          </div>
        </td>
      )}
    </tr>
  ))}
</tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      <div className="mt-10">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>
      <MeetingModal
  isOpen={meetingModalOpen}
  onClose={() => {
    setMeetingModalOpen(false);
    setEditMeeting(null);
  }}
  isEdit={Boolean(editMeeting)}
  meeting={editMeeting}
  onSuccess={() => {
    setMeetingModalOpen(false);
    setEditMeeting(null);
    return fetchMeetings(currentPage);
  }}
/>
    </DashboardLayout>
  );
}

export default Meetings;