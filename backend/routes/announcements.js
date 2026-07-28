const express = require("express");
const router = express.Router();
const db = require("../utils/db");

router.get("/", async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM public.announcements ORDER BY created_at DESC");
    res.json(result.rows || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const { title, content } = req.body;
    const result = await db.query(
      "INSERT INTO public.announcements (title, content) VALUES ($1, $2) RETURNING *",
      [title, content]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    await db.query("DELETE FROM public.announcements WHERE id = $1", [req.params.id]);
    res.json({ message: "Announcement deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
