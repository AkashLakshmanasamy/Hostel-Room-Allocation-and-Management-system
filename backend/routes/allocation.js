const express = require("express");
const router = express.Router();
const db = require("../utils/db");
const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });

router.get("/test", (req, res) => res.json({ message: "Router is connected!" }));

router.get("/configs/all", async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM public.allocations WHERE status = 'system'");
    const configs = result.rows.map(item => {
      let configDetails = {};
      try {
        configDetails = typeof item.department === 'string' ? JSON.parse(item.department) : item.department;
      } catch (e) {
        configDetails = { roomsPerFloor: 0, openTime: null, closeTime: null };
      }
      return {
        hostel: item.hostel,
        reg_no: item.reg_no,
        roomsPerFloor: configDetails.roomsPerFloor || 40,
        openTime: configDetails.openTime,
        closeTime: configDetails.closeTime
      };
    });
    res.json(configs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete("/config/:reg_no", async (req, res) => {
  try {
    await db.query("DELETE FROM public.allocations WHERE reg_no = $1", [req.params.reg_no]);
    res.json({ message: "Session deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/config", async (req, res) => {
  const { hostel, roomsPerFloor, openTime, closeTime } = req.body;
  try {
    const configKey = `CONFIG_${hostel.replace(/\s+/g, '_')}`;
    const configData = { roomsPerFloor, openTime, closeTime };
    const queryStr = `
      INSERT INTO public.allocations (reg_no, department, status, hostel, email, floor, room_number, bed_number)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      ON CONFLICT (reg_no) DO UPDATE SET
        department = EXCLUDED.department,
        status = EXCLUDED.status,
        hostel = EXCLUDED.hostel,
        email = EXCLUDED.email,
        floor = EXCLUDED.floor,
        room_number = EXCLUDED.room_number,
        bed_number = EXCLUDED.bed_number
    `;
    await db.query(queryStr, [
      configKey,
      JSON.stringify(configData),
      "system",
      hostel,
      `admin_${hostel.toLowerCase().replace(/\s+/g, '_')}@system.com`,
      "N/A",
      "CONFIG",
      0
    ]);
    res.status(200).json({ message: "Configuration saved successfully!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/config/:hostel", async (req, res) => {
  try {
    const configKey = `CONFIG_${req.params.hostel.replace(/\s+/g, '_')}`;
    const result = await db.query("SELECT department FROM public.allocations WHERE reg_no = $1 LIMIT 1", [configKey]);
    if (result.rows.length === 0 || !result.rows[0].department) return res.json(null);
    const data = result.rows[0];
    const parsedData = typeof data.department === 'string' ? JSON.parse(data.department) : data.department;
    res.json(parsedData);
  } catch (err) {
    res.json(null);
  }
});

router.get("/requests", async (req, res) => {
  const { status } = req.query;
  try {
    let result;
    if (status && status !== "all") {
      result = await db.query(
        "SELECT * FROM public.allocations WHERE status = $1 AND status <> 'system' ORDER BY created_at DESC",
        [status]
      );
    } else {
      result = await db.query(
        "SELECT * FROM public.allocations WHERE status <> 'system' ORDER BY created_at DESC"
      );
    }
    res.json(result.rows || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch("/:id/status", async (req, res) => {
  const { id } = req.params;
  const { status, regNo } = req.body;
  try {
    await db.query("UPDATE public.allocations SET status = $1 WHERE id = $2", [status, id]);
    const canApplyValue = status === "confirmed" ? false : true;
    await db.query("UPDATE public.student_profiles SET can_apply = $1 WHERE roll_no = $2", [canApplyValue, regNo]);
    res.json({ message: "Status updated" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/status", async (req, res) => {
  const { email } = req.query;
  try {
    const result = await db.query(
      "SELECT * FROM public.allocations WHERE email = $1 AND status <> 'system' ORDER BY created_at DESC LIMIT 1",
      [email]
    );
    res.json({ allocation: result.rows[0] || null });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/occupied", async (req, res) => {
  const { hostel, floor } = req.query;
  try {
    const result = await db.query(
      "SELECT room_number, bed_number FROM public.allocations WHERE hostel = $1 AND floor = $2 AND status <> 'rejected' AND status <> 'system'",
      [hostel, floor]
    );
    res.json(result.rows || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/", upload.single("receipt"), async (req, res) => {
  try {
    const { email, name, regNo, department, hostel, floor, roomNumber, bedNumber } = req.body;
    const file = req.file;
    if (!file) return res.status(400).json({ error: "Payment receipt file is required." });
    const publicUrl = `data:${file.mimetype};base64,${file.buffer.toString("base64")}`;
    await db.query("DELETE FROM public.allocations WHERE reg_no = $1 AND status = 'rejected'", [regNo]);
    const result = await db.query(
      "INSERT INTO public.allocations (email, name, reg_no, department, hostel, floor, room_number, bed_number, status, receipt_url) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'pending', $9) RETURNING *",
      [email, name, regNo, department, hostel, floor, roomNumber, parseInt(bedNumber), publicUrl]
    );
    res.status(201).json({ message: "Success", allocation: result.rows[0] });
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ error: "An active application already exists." });
    res.status(400).json({ error: err.message });
  }
});

router.post("/admin-fill", async (req, res) => {
  try {
    const { email, name, regNo, department, hostel, floor, roomNumber, bedNumber } = req.body;
    const check = await db.query(
      "SELECT id FROM public.allocations WHERE hostel = $1 AND floor = $2 AND room_number = $3 AND bed_number = $4 AND status <> 'rejected' AND status <> 'system' LIMIT 1",
      [hostel, floor, roomNumber, parseInt(bedNumber)]
    );
    if (check.rows.length > 0) return res.status(400).json({ error: "This bed was just taken by someone else!" });
    const result = await db.query(
      "INSERT INTO public.allocations (email, name, reg_no, department, hostel, floor, room_number, bed_number, status, receipt_url) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'approved', 'ADMIN_ALLOCATED') RETURNING *",
      [email, name, regNo, department, hostel, floor, roomNumber, parseInt(bedNumber)]
    );
    res.status(201).json({ message: "Room Allocated Successfully by Admin", allocation: result.rows[0] });
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ error: "Student already has an allocation." });
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;