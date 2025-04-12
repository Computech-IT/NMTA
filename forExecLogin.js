const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');

const db = new sqlite3.Database('./members.db');

const insertExecutive = async () => {
  const exeName = "John Doe";
  const exeEmailId = "john@example.com";
  const plainPassword = "securePassword123";
  const role = "admin"; // optional
  const status = "active";

  try {
    const hashedPassword = await bcrypt.hash(plainPassword, 10); // 10 salt rounds

    db.run(`
      INSERT INTO auth_executive_tbl (exeName, exeEmailId, password, role, status)
      VALUES (?, ?, ?, ?, ?)
    `, [exeName, exeEmailId, hashedPassword, role, status], function(err) {
      if (err) {
        return console.error("Insert failed:", err.message);
      }
      console.log(`Inserted new executive with ID: ${this.lastID}`);
    });

  } catch (err) {
    console.error("Hashing error:", err);
  }
};

insertExecutive();
