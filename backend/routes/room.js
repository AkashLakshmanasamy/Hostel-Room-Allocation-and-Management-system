const express = require("express");
const router = express.Router();
const db = require("../utils/db");

router.get("/allocations", async (req, res) => {
    const { hostel, floor } = req.query;
    if (!hostel || !floor) {
        return res.status(400).json({ error: "Hostel and floor parameters are required" });
    }
    try {
        const result = await db.query(
            "SELECT room_number, bed_number, status FROM public.allocations WHERE hostel = $1 AND floor = $2 AND status <> 'rejected'",
            [hostel, floor]
        );
        res.status(200).json(result.rows || []);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch room data" });
    }
});

module.exports = router;