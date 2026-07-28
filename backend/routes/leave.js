const express = require("express");
const router = express.Router();
const db = require("../utils/db");
const multer = require("multer");

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.post("/", upload.single("studentSignature"), async (req, res) => {
  const {
    name, rollNumber, branch, year, semester,
    hostelName, roomNumber, date, time, reason,
    studentMobile, parentMobile, informedAdvisor,
    advisorName, advisorMobile, email, userId
  } = req.body;

  try {
    let signatureUrl = null;
    if (req.file) {
      signatureUrl = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;
    }

    const result = await db.query(
      `INSERT INTO public.leave_applications (
        email, user_id, name, roll_number, branch, year, semester, hostel_name, 
        room_number, date_of_stay, time, reason, student_mobile, parent_mobile, 
        informed_advisor, advisor_name, advisor_mobile, student_signature_url, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, 'pending') RETURNING *`,
      [
        email, userId, name, rollNumber, branch, year, semester, hostelName,
        roomNumber, date, time, reason, studentMobile, parentMobile,
        informedAdvisor, advisorName || null, advisorMobile || null, signatureUrl
      ]
    );
    res.status(201).json({ message: "Success", leave: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/upload-signature", upload.single("signature"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }
    const publicUrl = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;
    res.json({ publicUrl });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/", async (req, res) => {
  const { email } = req.query;
  try {
    let result;
    if (email) {
      result = await db.query(
        "SELECT * FROM public.leave_applications WHERE email = $1 ORDER BY created_at DESC",
        [email]
      );
    } else {
      result = await db.query("SELECT * FROM public.leave_applications ORDER BY created_at DESC");
    }
    res.status(200).json(result.rows || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch("/:id", async (req, res) => {
  const { id } = req.params;
  const { status, admin_signature_url } = req.body;
  try {
    const result = await db.query(
      "UPDATE public.leave_applications SET status = $1, admin_signature_url = $2 WHERE id = $3 RETURNING *",
      [status, admin_signature_url, id]
    );
    res.status(200).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;