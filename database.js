const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./members.db', (err) => {
  if (err) {
    return console.error('Database connection error:', err.message);
  }
  console.log('Connected to SQLite database');
  createTable();
});

function createTable() {
  db.run(`CREATE TABLE IF NOT EXISTS members (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    memberName TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    phone TEXT NOT NULL UNIQUE,
    businessDetails TEXT,
    registrationDate DATETIME DEFAULT CURRENT_TIMESTAMP
  )`, (err) => {
    if (err) {
      console.error('Table creation error:', err.message);
    }
  });
}

module.exports = db;