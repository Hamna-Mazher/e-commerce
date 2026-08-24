import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

import {
  createMeeting,
  updateMeeting,
} from "../../services/meetingService";

import {
  getAllUsersForMeeting,
} from "../../services/userService";

function MeetingModal({
  isOpen,
  onClose,
  isEdit = false,
  meeting = null,
  onSuccess,
}) {
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingSubmit, setLoadingSubmit] = useState(false);

  const [formData, setFormData] = useState({
    participantOneId: "",
    participantTwoId: "",
    title: "",
    duration: "30",
    mode: "Online",
    meetingDate: "",
    meetingTime: "",
  });

  const [errors, setErrors] = useState({});

  // -----------------------------
  // Load users
  // -----------------------------
  useEffect(() => {
    if (!isOpen) return;

    const fetchUsers = async () => {
      try {
        setLoadingUsers(true);

        const res = await getAllUsersForMeeting();

        setUsers(res.data.users || []);
      } catch (error) {
        console.error("Fetch users error:", error);

        toast.error(
          error.response?.data?.message ||
            "Failed to load users."
        );
      } finally {
        setLoadingUsers(false);
      }
    };

    fetchUsers();
  }, [isOpen]);

  // -----------------------------
  // Populate form for edit
  // -----------------------------
  useEffect(() => {
    if (!isOpen) return;

    if (isEdit && meeting) {
      setFormData({
        participantOneId:
          meeting.participantOneId?.toString() || "",

        participantTwoId:
          meeting.participantTwoId?.toString() || "",

        title: meeting.title || "",

        duration:
          meeting.duration?.toString() || "30",

        mode: meeting.mode || "Online",

        meetingDate:
          meeting.meetingDate
            ? String(meeting.meetingDate).slice(0, 10)
            : "",

        meetingTime:
          meeting.meetingTime
            ? String(meeting.meetingTime).slice(0, 5)
            : "",
      });
    } else {
      setFormData({
        participantOneId: "",
        participantTwoId: "",
        title: "",
        duration: "30",
        mode: "Online",
        meetingDate: "",
        meetingTime: "",
      });
    }

    setErrors({});
  }, [isOpen, isEdit, meeting]);

  // -----------------------------
  // Minimum date = today
  // -----------------------------
  const today = useMemo(() => {
    const date = new Date();

    const year = date.getFullYear();
    const month = String(
      date.getMonth() + 1
    ).padStart(2, "0");
    const day = String(
      date.getDate()
    ).padStart(2, "0");

    return `${year}-${month}-${day}`;
  }, []);

  // -----------------------------
  // Generate 30-minute slots
  // -----------------------------
  const timeSlots = useMemo(() => {
    const slots = [];

    for (let hour = 0; hour < 24; hour++) {
      for (let minute of [0, 30]) {
        const h = String(hour).padStart(2, "0");
        const m = String(minute).padStart(2, "0");

        slots.push(`${h}:${m}`);
      }
    }

    return slots;
  }, []);

  // -----------------------------
  // Participant options
  // -----------------------------
  const userParticipants = users.filter(
    (user) => user.role === "User"
  );

  const participantTwoOptions = users;

  // -----------------------------
  // Change handler
  // -----------------------------
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  // -----------------------------
  // Validation
  // -----------------------------
  const validate = () => {
    const newErrors = {};

    if (!formData.participantOneId) {
      newErrors.participantOneId =
        "Select participant 1.";
    }

    if (!formData.participantTwoId) {
      newErrors.participantTwoId =
        "Select participant 2.";
    }

    if (
      formData.participantOneId &&
      formData.participantTwoId &&
      formData.participantOneId ===
        formData.participantTwoId
    ) {
      newErrors.participantTwoId =
        "Participants must be different.";
    }

    if (!formData.title.trim()) {
      newErrors.title =
        "Meeting title is required.";
    } else if (formData.title.trim().length > 255) {
      newErrors.title =
        "Meeting title cannot exceed 255 characters.";
    }

    if (
      !["30", "60", "90", "120"].includes(
        formData.duration
      )
    ) {
      newErrors.duration =
        "Select a valid duration.";
    }

    if (
      !["Online", "Physical"].includes(
        formData.mode
      )
    ) {
      newErrors.mode =
        "Select a valid meeting mode.";
    }

    if (!formData.meetingDate) {
      newErrors.meetingDate =
        "Select a date.";
   } else if (
  formData.meetingDate.slice(0, 10) < today
) {
      newErrors.meetingDate =
        "Meeting date cannot be in the past.";
    }

    if (!formData.meetingTime) {
      newErrors.meetingTime =
        "Select a time.";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  // -----------------------------
  // Submit
  // -----------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      toast.error(
        "Please correct the highlighted fields."
      );
      return;
    }

 const formattedDate = formData.meetingDate
  ? formData.meetingDate.slice(0, 10)
  : "";

const payload = {
  participantOneId: Number(
    formData.participantOneId
  ),
  participantTwoId: Number(
    formData.participantTwoId
  ),
  title: formData.title.trim(),
  duration: Number(formData.duration),
  mode: formData.mode,
  meetingDate: formattedDate,
  meetingTime: formData.meetingTime,
};
    try {
      setLoadingSubmit(true);

      if (isEdit) {
        await updateMeeting(
          meeting.id,
          payload
        );

        toast.success(
          "Meeting updated successfully."
        );
      } else {
        await createMeeting(payload);

        toast.success(
          "Meeting scheduled successfully."
        );
      }

      onClose();

      if (onSuccess) {
        await onSuccess();
      }
    } catch (error) {
      console.error(
        "Meeting submit error:",
        error
      );

      toast.error(
        error.response?.data?.message ||
          "Failed to save meeting."
      );
    } finally {
      setLoadingSubmit(false);
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 p-6">
          <div>
            <h2 className="text-2xl font-bold text-white">
              {isEdit
                ? "Edit Meeting"
                : "Schedule Meeting"}
            </h2>

            <p className="mt-1 text-sm text-slate-400">
              {isEdit
                ? "Update meeting details."
                : "Schedule a meeting between two participants."}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={loadingSubmit}
            className="text-2xl text-slate-400 hover:text-white"
          >
            ×
          </button>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="space-y-6 p-6"
        >

          {/* Participant 1 */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">
              Participant 1
            </label>

            <select
              name="participantOneId"
              value={formData.participantOneId}
              onChange={handleChange}
              disabled={loadingUsers || loadingSubmit}
              className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none focus:border-blue-500"
            >
              <option value="">
                Select User
              </option>

              {userParticipants.map((user) => (
                <option
                  key={user.id}
                  value={user.id}
                >
                  {user.name} — {user.email}
                </option>
              ))}
            </select>

            {errors.participantOneId && (
              <p className="mt-1 text-sm text-red-400">
                {errors.participantOneId}
              </p>
            )}
          </div>

          {/* Participant 2 */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">
              Participant 2
            </label>

            <select
              name="participantTwoId"
              value={formData.participantTwoId}
              onChange={handleChange}
              disabled={loadingUsers || loadingSubmit}
              className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none focus:border-blue-500"
            >
              <option value="">
                Select User / Admin
              </option>

              {participantTwoOptions.map((user) => (
                <option
                  key={user.id}
                  value={user.id}
                >
                  {user.name} ({user.role})
                </option>
              ))}
            </select>

            {errors.participantTwoId && (
              <p className="mt-1 text-sm text-red-400">
                {errors.participantTwoId}
              </p>
            )}
          </div>

          {/* Title */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">
              Meeting Title
            </label>

            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Enter meeting title"
              disabled={loadingSubmit}
              maxLength={255}
              className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white placeholder-slate-500 outline-none focus:border-blue-500"
            />

            {errors.title && (
              <p className="mt-1 text-sm text-red-400">
                {errors.title}
              </p>
            )}
          </div>

          {/* Duration + Mode */}
          <div className="grid gap-5 md:grid-cols-2">

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">
                Duration
              </label>

              <select
                name="duration"
                value={formData.duration}
                onChange={handleChange}
                disabled={loadingSubmit}
                className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none focus:border-blue-500"
              >
                <option value="30">
                  30 minutes
                </option>

                <option value="60">
                  60 minutes
                </option>

                <option value="90">
                  90 minutes
                </option>

                <option value="120">
                  120 minutes
                </option>
              </select>

              {errors.duration && (
                <p className="mt-1 text-sm text-red-400">
                  {errors.duration}
                </p>
              )}
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">
                Meeting Mode
              </label>

              <select
                name="mode"
                value={formData.mode}
                onChange={handleChange}
                disabled={loadingSubmit}
                className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none focus:border-blue-500"
              >
                <option value="Online">
                  Online
                </option>

                <option value="Physical">
                  Physical
                </option>
              </select>

              {errors.mode && (
                <p className="mt-1 text-sm text-red-400">
                  {errors.mode}
                </p>
              )}
            </div>

          </div>

          {/* Date + Time */}
          <div className="grid gap-5 md:grid-cols-2">

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">
                Date
              </label>

              <input
                type="date"
                name="meetingDate"
                value={formData.meetingDate}
                min={today}
                onChange={handleChange}
                disabled={loadingSubmit}
                className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none focus:border-blue-500"
              />

              {errors.meetingDate && (
                <p className="mt-1 text-sm text-red-400">
                  {errors.meetingDate}
                </p>
              )}
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">
                Time
              </label>

              <select
                name="meetingTime"
                value={formData.meetingTime}
                onChange={handleChange}
                disabled={loadingSubmit}
                className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none focus:border-blue-500"
              >
                <option value="">
                  Select Time
                </option>

                {timeSlots.map((slot) => (
                  <option
                    key={slot}
                    value={slot}
                  >
                    {slot}
                  </option>
                ))}
              </select>

              {errors.meetingTime && (
                <p className="mt-1 text-sm text-red-400">
                  {errors.meetingTime}
                </p>
              )}
            </div>

          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 border-t border-slate-800 pt-6">

            <button
              type="button"
              onClick={onClose}
              disabled={loadingSubmit}
              className="rounded-xl border border-slate-700 px-5 py-3 text-white hover:bg-slate-800 disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loadingSubmit || loadingUsers}
              className="rounded-xl bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loadingSubmit
                ? "Saving..."
                : isEdit
                ? "Update Meeting"
                : "Schedule Meeting"}
            </button>

          </div>
        </form>
      </div>
    </div>
  );
}

export default MeetingModal;