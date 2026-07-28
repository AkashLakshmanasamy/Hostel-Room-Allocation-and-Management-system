const express = require('express');
const router = express.Router();
const multer = require('multer');
const db = require('../utils/db'); 
const upload = multer({ storage: multer.memoryStorage() });

router.get('/', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM public.student_profiles ORDER BY created_at DESC');
    res.json(result.rows || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM public.student_profiles WHERE id = $1', [req.params.id]);
    res.json({ message: 'Profile deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/profile/:userId', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM public.student_profiles WHERE user_id = $1', [req.params.userId]);
    res.json(result.rows[0] || {}); 
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/update', upload.fields([
  { name: 'passportPhoto', maxCount: 1 },
  { name: 'idCardPhoto', maxCount: 1 },
  { name: 'feesReceipt', maxCount: 1 }
]), async (req, res) => {
  try {
    const { userId, name, rollNo, dob, bloodGroup, department, year, section, admissionMode, mobile, whatsapp, fatherName, fatherContact, motherName, motherContact, address, district, floor, roomNo, feeMode } = req.body;
    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }
    const files = req.files;
    
    let passportUrl = null;
    let idCardUrl = null;
    let feesReceiptUrl = null;

    if (files?.passportPhoto) {
      passportUrl = `data:${files.passportPhoto[0].mimetype};base64,${files.passportPhoto[0].buffer.toString("base64")}`;
    }
    if (files?.idCardPhoto) {
      idCardUrl = `data:${files.idCardPhoto[0].mimetype};base64,${files.idCardPhoto[0].buffer.toString("base64")}`;
    }
    if (files?.feesReceipt) {
      feesReceiptUrl = `data:${files.feesReceipt[0].mimetype};base64,${files.feesReceipt[0].buffer.toString("base64")}`;
    }

    const queryStr = `
      INSERT INTO public.student_profiles (
        user_id, name, roll_no, dob, blood_group, department, year, section, 
        admission_mode, mobile, whatsapp, father_name, father_contact, 
        mother_name, mother_contact, address, district, floor, room_no, fee_mode,
        passport_photo_url, id_card_photo_url, fees_receipt_url
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23
      )
      ON CONFLICT (user_id) DO UPDATE SET
        name = EXCLUDED.name,
        roll_no = EXCLUDED.roll_no,
        dob = EXCLUDED.dob,
        blood_group = EXCLUDED.blood_group,
        department = EXCLUDED.department,
        year = EXCLUDED.year,
        section = EXCLUDED.section,
        admission_mode = EXCLUDED.admission_mode,
        mobile = EXCLUDED.mobile,
        whatsapp = EXCLUDED.whatsapp,
        father_name = EXCLUDED.father_name,
        father_contact = EXCLUDED.father_contact,
        mother_name = EXCLUDED.mother_name,
        mother_contact = EXCLUDED.mother_contact,
        address = EXCLUDED.address,
        district = EXCLUDED.district,
        floor = COALESCE(EXCLUDED.floor, student_profiles.floor),
        room_no = COALESCE(EXCLUDED.room_no, student_profiles.room_no),
        fee_mode = COALESCE(EXCLUDED.fee_mode, student_profiles.fee_mode),
        passport_photo_url = COALESCE(EXCLUDED.passport_photo_url, student_profiles.passport_photo_url),
        id_card_photo_url = COALESCE(EXCLUDED.id_card_photo_url, student_profiles.id_card_photo_url),
        fees_receipt_url = COALESCE(EXCLUDED.fees_receipt_url, student_profiles.fees_receipt_url)
    `;

    await db.query(queryStr, [
      userId, name, rollNo, dob || null, bloodGroup, department, year, section,
      admissionMode, mobile, whatsapp, fatherName, fatherContact,
      motherName, motherContact, address, district, 
      floor && !isNaN(parseInt(floor)) ? parseInt(floor) : null, roomNo || null, feeMode || null,
      passportUrl, idCardUrl, feesReceiptUrl
    ]);

    res.json({ success: true, message: 'Profile Updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;