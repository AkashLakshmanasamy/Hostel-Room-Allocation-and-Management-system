const express = require("express");
const router = express.Router();
const db = require("../utils/db"); 

router.get("/", async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM public.weekly_menu");
    res.status(200).json(result.rows || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/:day", async (req, res) => {
  const { day } = req.params;
  const { morning, breakfast, lunch, evening, dinner } = req.body;
  try {
    const queryStr = `
      INSERT INTO public.weekly_menu (day, morning, breakfast, lunch, evening, dinner)
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (day) DO UPDATE SET
        morning = EXCLUDED.morning,
        breakfast = EXCLUDED.breakfast,
        lunch = EXCLUDED.lunch,
        evening = EXCLUDED.evening,
        dinner = EXCLUDED.dinner
      RETURNING *
    `;
    const result = await db.query(queryStr, [day, morning, breakfast, lunch, evening, dinner]);
    res.status(200).json({ 
      message: `Menu for ${day} updated successfully`, 
      data: result.rows[0]
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;