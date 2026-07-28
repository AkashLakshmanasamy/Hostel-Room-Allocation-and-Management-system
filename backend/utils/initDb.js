const fs = require('fs');
const path = require('path');
const db = require('./db');

const init = async () => {
  try {
    const sql = fs.readFileSync(path.join(__dirname, '../../schema.sql'), 'utf8');
    await db.query(sql);
    console.log("Database initialized successfully!");
    process.exit(0);
  } catch (err) {
    console.error("Initialization failed:", err.message);
    process.exit(1);
  }
};

init();
