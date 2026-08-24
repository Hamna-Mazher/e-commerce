const { pool } = require("../config/pgd");

// =====================================================
// VALIDATION HELPERS
// =====================================================

const allowedModes = ["Online", "Physical"];

const allowedDurations = [30, 60, 90, 120];

const isValidDate = (dateString) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    return false;
  }

  const [year, month, day] = dateString
    .split("-")
    .map(Number);

  const date = new Date(year, month - 1, day);

  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
};
const isPastDateTime = (dateString, timeString) => {
  const meetingDateTime = new Date(
    `${dateString}T${timeString}:00`
  );

  return meetingDateTime < new Date();
};

const isValidHalfHourTime = (timeString) => {
  return /^([01]\d|2[0-3]):(00|30)$/.test(timeString);
};

// =====================================================
// CREATE MEETING
// ADMIN ONLY
// =====================================================

const createMeeting = async (req, res) => {
  try {
    const {
      participantOneId,
      participantTwoId,
      title,
      duration,
      mode,
      meetingDate,
      meetingTime,
    } = req.body;

    // -----------------------------
    // Basic validation
    // -----------------------------

    if (
      !participantOneId ||
      !participantTwoId ||
      !title ||
      !duration ||
      !mode ||
      !meetingDate ||
      !meetingTime
    ) {
      return res.status(400).json({
        message: "All meeting fields are required",
      });
    }

    if (!Number.isInteger(Number(participantOneId))) {
      return res.status(400).json({
        message: "Participant 1 must be a valid user ID",
      });
    }

    if (!Number.isInteger(Number(participantTwoId))) {
      return res.status(400).json({
        message: "Participant 2 must be a valid user ID",
      });
    }

    if (Number(participantOneId) === Number(participantTwoId)) {
      return res.status(400).json({
        message: "Participants must be different",
      });
    }

    if (!title.trim()) {
      return res.status(400).json({
        message: "Meeting title cannot be empty",
      });
    }

    if (title.trim().length > 255) {
      return res.status(400).json({
        message: "Meeting title cannot exceed 255 characters",
      });
    }

    if (!allowedDurations.includes(Number(duration))) {
      return res.status(400).json({
        message:
          "Duration must be 30, 60, 90, or 120 minutes",
      });
    }

    if (!allowedModes.includes(mode)) {
      return res.status(400).json({
        message:
          "Meeting mode must be Online or Physical",
      });
    }

    if (!isValidDate(meetingDate)) {
      return res.status(400).json({
        message: "Invalid meeting date",
      });
    }

    if (!isValidHalfHourTime(meetingTime)) {
      return res.status(400).json({
        message:
          "Meeting time must be a 30-minute slot, e.g. 10:00 or 10:30",
      });
    }

    if (isPastDateTime(meetingDate, meetingTime)) {
      return res.status(400).json({
        message: "Meeting cannot be scheduled in the past",
      });
    }

    // -----------------------------
    // Verify participants
    // -----------------------------

    const participantsResult = await pool.query(
      `
      SELECT id, name, email, role
      FROM users
      WHERE id IN ($1, $2)
      `,
      [participantOneId, participantTwoId]
    );

    if (participantsResult.rows.length !== 2) {
      return res.status(404).json({
        message: "One or both participants were not found",
      });
    }

    const participantOne = participantsResult.rows.find(
      (user) =>
        user.id === Number(participantOneId)
    );

    const participantTwo = participantsResult.rows.find(
      (user) =>
        user.id === Number(participantTwoId)
    );

    // Participant 1 MUST be User
    if (participantOne.role !== "User") {
      return res.status(400).json({
        message:
          "Participant 1 must have the User role",
      });
    }

    // Participant 2 can be User or Admin
    if (
      !["User", "Admin"].includes(
        participantTwo.role
      )
    ) {
      return res.status(400).json({
        message: "Invalid participant 2 role",
      });
    }

    // -----------------------------
    // Check scheduling conflict
    // -----------------------------

    const conflictResult = await pool.query(
      `
      SELECT id
      FROM meetings
      WHERE "deletedAt" IS NULL
        AND (
          "participantOneId" IN ($1, $2)
          OR "participantTwoId" IN ($1, $2)
        )
        AND "meetingDate" = $3
        AND "meetingTime" = $4
      `,
      [
        participantOneId,
        participantTwoId,
        meetingDate,
        meetingTime,
      ]
    );

    if (conflictResult.rows.length > 0) {
      return res.status(409).json({
        message:
          "A participant already has a meeting at this time",
      });
    }

    // -----------------------------
    // Create meeting
    // -----------------------------

    const result = await pool.query(
      `
      INSERT INTO meetings
      (
        "participantOneId",
        "participantTwoId",
        title,
        duration,
        mode,
        "meetingDate",
        "meetingTime"
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
      `,
      [
        participantOneId,
        participantTwoId,
        title.trim(),
        Number(duration),
        mode,
        meetingDate,
        meetingTime,
      ]
    );

    res.status(201).json({
      message: "Meeting scheduled successfully",
      meeting: result.rows[0],
    });
  } catch (error) {
    console.error("Create Meeting Error:", error);

    res.status(500).json({
      message: error.message,
    });
  }
};

// =====================================================
// GET ALL MEETINGS
// ADMIN → ALL
// USER → ONLY THEIR MEETINGS
// SERVER-SIDE PAGINATION
// =====================================================

const getMeetings = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    if (page < 1 || limit < 1 || limit > 100) {
      return res.status(400).json({
        message:
          "Page must be >= 1 and limit must be between 1 and 100",
      });
    }

    const offset = (page - 1) * limit;

    let countResult;
    let result;

    if (req.user.role === "Admin") {
      countResult = await pool.query(`
        SELECT COUNT(*)
        FROM meetings
        WHERE "deletedAt" IS NULL
      `);

      result = await pool.query(
        `
        SELECT
          m.id,
          m.title,
          m.duration,
          m.mode,
          m."meetingDate",
          m."meetingTime",
          m."createdAt",

          u1.id AS "participantOneId",
          u1.name AS "participantOneName",
          u1.email AS "participantOneEmail",
          u1.role AS "participantOneRole",

          u2.id AS "participantTwoId",
          u2.name AS "participantTwoName",
          u2.email AS "participantTwoEmail",
          u2.role AS "participantTwoRole"

        FROM meetings m

        INNER JOIN users u1
          ON m."participantOneId" = u1.id

        INNER JOIN users u2
          ON m."participantTwoId" = u2.id

        WHERE m."deletedAt" IS NULL

        ORDER BY
          m."meetingDate" ASC,
          m."meetingTime" ASC

        LIMIT $1
        OFFSET $2
        `,
        [limit, offset]
      );
    } else {
      countResult = await pool.query(
        `
        SELECT COUNT(*)
        FROM meetings
        WHERE "deletedAt" IS NULL
          AND (
            "participantOneId" = $1
            OR "participantTwoId" = $1
          )
        `,
        [req.user.id]
      );

      result = await pool.query(
        `
        SELECT
          m.id,
          m.title,
          m.duration,
          m.mode,
          m."meetingDate",
          m."meetingTime",
          m."createdAt",

          u1.id AS "participantOneId",
          u1.name AS "participantOneName",
          u1.email AS "participantOneEmail",
          u1.role AS "participantOneRole",

          u2.id AS "participantTwoId",
          u2.name AS "participantTwoName",
          u2.email AS "participantTwoEmail",
          u2.role AS "participantTwoRole"

        FROM meetings m

        INNER JOIN users u1
          ON m."participantOneId" = u1.id

        INNER JOIN users u2
          ON m."participantTwoId" = u2.id

        WHERE m."deletedAt" IS NULL
          AND (
            m."participantOneId" = $1
            OR m."participantTwoId" = $1
          )

        ORDER BY
          m."meetingDate" ASC,
          m."meetingTime" ASC

        LIMIT $2
        OFFSET $3
        `,
        [req.user.id, limit, offset]
      );
    }

    const totalMeetings = parseInt(
      countResult.rows[0].count
    );

    res.status(200).json({
      currentPage: page,
      pageSize: limit,
      totalMeetings,
      totalPages: Math.ceil(
        totalMeetings / limit
      ),
      meetings: result.rows,
    });
  } catch (error) {
    console.error("Get Meetings Error:", error);

    res.status(500).json({
      message: error.message,
    });
  }
};

// =====================================================
// GET SINGLE MEETING
// ADMIN → ANY
// USER → ONLY IF PARTICIPANT
// =====================================================

const getMeetingById = async (req, res) => {
  try {
    let result;

    if (req.user.role === "Admin") {
      result = await pool.query(
        `
        SELECT
          m.*,

          u1.name AS "participantOneName",
          u1.email AS "participantOneEmail",
          u1.role AS "participantOneRole",

          u2.name AS "participantTwoName",
          u2.email AS "participantTwoEmail",
          u2.role AS "participantTwoRole"

        FROM meetings m

        INNER JOIN users u1
          ON m."participantOneId" = u1.id

        INNER JOIN users u2
          ON m."participantTwoId" = u2.id

        WHERE m.id = $1
          AND m."deletedAt" IS NULL
        `,
        [req.params.id]
      );
    } else {
      result = await pool.query(
        `
        SELECT
          m.*,

          u1.name AS "participantOneName",
          u1.email AS "participantOneEmail",
          u1.role AS "participantOneRole",

          u2.name AS "participantTwoName",
          u2.email AS "participantTwoEmail",
          u2.role AS "participantTwoRole"

        FROM meetings m

        INNER JOIN users u1
          ON m."participantOneId" = u1.id

        INNER JOIN users u2
          ON m."participantTwoId" = u2.id

        WHERE m.id = $1
          AND m."deletedAt" IS NULL
          AND (
            m."participantOneId" = $2
            OR m."participantTwoId" = $2
          )
        `,
        [req.params.id, req.user.id]
      );
    }

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Meeting not found",
      });
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error("Get Meeting Error:", error);

    res.status(500).json({
      message: error.message,
    });
  }
};

// =====================================================
// UPDATE MEETING
// ADMIN ONLY
// =====================================================

const updateMeeting = async (req, res) => {
  try {
    const {
      participantOneId,
      participantTwoId,
      title,
      duration,
      mode,
      meetingDate,
      meetingTime,
    } = req.body;

    if (
      !participantOneId ||
      !participantTwoId ||
      !title ||
      !duration ||
      !mode ||
      !meetingDate ||
      !meetingTime
    ) {
      return res.status(400).json({
        message: "All meeting fields are required",
      });
    }

    if (Number(participantOneId) === Number(participantTwoId)) {
      return res.status(400).json({
        message: "Participants must be different",
      });
    }

    if (!title.trim()) {
      return res.status(400).json({
        message: "Meeting title cannot be empty",
      });
    }

    if (title.trim().length > 255) {
      return res.status(400).json({
        message: "Meeting title cannot exceed 255 characters",
      });
    }

    if (!allowedDurations.includes(Number(duration))) {
      return res.status(400).json({
        message:
          "Duration must be 30, 60, 90, or 120 minutes",
      });
    }

    if (!allowedModes.includes(mode)) {
      return res.status(400).json({
        message:
          "Meeting mode must be Online or Physical",
      });
    }

    if (!isValidDate(meetingDate)) {
      return res.status(400).json({
        message: "Invalid meeting date",
      });
    }

    if (!isValidHalfHourTime(meetingTime)) {
      return res.status(400).json({
        message:
          "Meeting time must be a 30-minute slot, e.g. 10:00 or 10:30",
      });
    }

    if (isPastDateTime(meetingDate, meetingTime)) {
      return res.status(400).json({
        message: "Meeting cannot be scheduled in the past",
      });
    }

    const participantsResult = await pool.query(
      `
      SELECT id, role
      FROM users
      WHERE id IN ($1, $2)
      `,
      [participantOneId, participantTwoId]
    );

    if (participantsResult.rows.length !== 2) {
      return res.status(404).json({
        message: "One or both participants were not found",
      });
    }

    const participantOne = participantsResult.rows.find(
      (user) =>
        user.id === Number(participantOneId)
    );

    if (participantOne.role !== "User") {
      return res.status(400).json({
        message:
          "Participant 1 must have the User role",
      });
    }

    const conflictResult = await pool.query(
      `
      SELECT id
      FROM meetings
      WHERE "deletedAt" IS NULL
        AND id <> $1
        AND (
          "participantOneId" IN ($2, $3)
          OR "participantTwoId" IN ($2, $3)
        )
        AND "meetingDate" = $4
        AND "meetingTime" = $5
      `,
      [
        req.params.id,
        participantOneId,
        participantTwoId,
        meetingDate,
        meetingTime,
      ]
    );

    if (conflictResult.rows.length > 0) {
      return res.status(409).json({
        message:
          "A participant already has a meeting at this time",
      });
    }

    const result = await pool.query(
      `
      UPDATE meetings
      SET
        "participantOneId" = $1,
        "participantTwoId" = $2,
        title = $3,
        duration = $4,
        mode = $5,
        "meetingDate" = $6,
        "meetingTime" = $7,
        "updatedAt" = CURRENT_TIMESTAMP
      WHERE id = $8
        AND "deletedAt" IS NULL
      RETURNING *
      `,
      [
        participantOneId,
        participantTwoId,
        title.trim(),
        Number(duration),
        mode,
        meetingDate,
        meetingTime,
        req.params.id,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Meeting not found",
      });
    }

    res.status(200).json({
      message: "Meeting updated successfully",
      meeting: result.rows[0],
    });
  } catch (error) {
    console.error("Update Meeting Error:", error);

    res.status(500).json({
      message: error.message,
    });
  }
};

// =====================================================
// SOFT DELETE
// ADMIN ONLY
// =====================================================

const softDeleteMeeting = async (req, res) => {
  try {
    const result = await pool.query(
      `
      UPDATE meetings
      SET
        "deletedAt" = CURRENT_TIMESTAMP,
        "updatedAt" = CURRENT_TIMESTAMP
      WHERE id = $1
        AND "deletedAt" IS NULL
      RETURNING *
      `,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Meeting not found",
      });
    }

    res.status(200).json({
      message: "Meeting soft deleted successfully",
      meeting: result.rows[0],
    });
  } catch (error) {
    console.error(
      "Soft Delete Meeting Error:",
      error
    );

    res.status(500).json({
      message: error.message,
    });
  }
};

// =====================================================
// HARD DELETE
// ADMIN ONLY
// =====================================================

const deleteMeeting = async (req, res) => {
  try {
    const result = await pool.query(
      `
      DELETE FROM meetings
      WHERE id = $1
      RETURNING *
      `,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Meeting not found",
      });
    }

    res.status(200).json({
      message: "Meeting permanently deleted",
    });
  } catch (error) {
    console.error(
      "Delete Meeting Error:",
      error
    );

    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  createMeeting,
  getMeetings,
  getMeetingById,
  updateMeeting,
  softDeleteMeeting,
  deleteMeeting,
};