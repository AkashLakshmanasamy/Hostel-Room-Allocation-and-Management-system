const express = require('express');
const router = express.Router();
const db = require("../utils/db");

router.get('/', async (req, res) => {
    try {
        const result = await db.query("SELECT * FROM public.hostel_rules WHERE id = 1 LIMIT 1");
        const defaults = {
            id: 1,
            general_rules: [],
            mess_timings: { breakfast: "", lunch: "", snacks: "", dinner: "" },
            gate_timings: { opening: "", curfew_regular: "" },
            prohibited_items: { electrical: [], restricted: [] },
            consequences: []
        };
        res.json(result.rows[0] || defaults);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.put('/', async (req, res) => {
    try {
        const { general_rules, mess_timings, gate_timings, prohibited_items, consequences } = req.body;
        const queryStr = `
            INSERT INTO public.hostel_rules (id, general_rules, mess_timings, gate_timings, prohibited_items, consequences)
            VALUES (1, $1, $2, $3, $4, $5)
            ON CONFLICT (id) DO UPDATE SET
                general_rules = EXCLUDED.general_rules,
                mess_timings = EXCLUDED.mess_timings,
                gate_timings = EXCLUDED.gate_timings,
                prohibited_items = EXCLUDED.prohibited_items,
                consequences = EXCLUDED.consequences
            RETURNING *
        `;
        const result = await db.query(queryStr, [
            JSON.stringify(general_rules || []),
            JSON.stringify(mess_timings || {}),
            JSON.stringify(gate_timings || {}),
            JSON.stringify(prohibited_items || {}),
            JSON.stringify(consequences || [])
        ]);
        res.json({ message: "Success", data: result.rows[0] });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;