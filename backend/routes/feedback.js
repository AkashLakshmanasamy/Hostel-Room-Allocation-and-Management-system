const express = require("express");
const router = express.Router();
const db = require("../utils/db");

router.get("/", async (req, res) => {
  const { status, urgency } = req.query;
  try {
    let query = "SELECT * FROM public.feedbacks";
    let params = [];
    let conditions = [];

    if (status && status !== "all") {
      params.push(status);
      conditions.push(`status = $${params.length}`);
    }
    if (urgency && urgency !== "all") {
      params.push(urgency);
      conditions.push(`urgency = $${params.length}`);
    }

    if (conditions.length > 0) {
      query += " WHERE " + conditions.join(" AND ");
    }
    query += " ORDER BY created_at DESC";

    const result = await db.query(query, params);
    res.json(result.rows || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/", async (req, res) => {
  const { name, roll_no, department, room_no, feedback_type, message, urgency } = req.body;
  try {
    await db.query(
      "INSERT INTO public.feedbacks (name, roll_no, department, room_no, feedback_type, message, urgency, status) VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending')",
      [name, roll_no, department, room_no, feedback_type, message, urgency]
    );
    res.status(201).json({ message: "Feedback submitted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch("/:id/status", async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  try {
    await db.query("UPDATE public.feedbacks SET status = $1 WHERE id = $2", [status, id]);
    res.json({ message: "Status updated" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await db.query("DELETE FROM public.feedbacks WHERE id = $1", [id]);
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;