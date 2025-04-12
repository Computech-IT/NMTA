const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./members.db', (err) => {
  if (err) {
    return console.error('Database connection error:', err.message);
  }
  console.log('Connected to SQLite database');
  createTables();
});
function createTables() {
  db.run(`CREATE TABLE IF NOT EXISTS members (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    memberName TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    phone TEXT NOT NULL UNIQUE,
    businessDetails TEXT,
    registrationDate DATETIME DEFAULT CURRENT_TIMESTAMP,
    profileImage TEXT
  )`, handleError);

  db.run(`CREATE TABLE IF NOT EXISTS auth_executive_tbl (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    exeName TEXT NOT NULL,
    exeEmailId TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    role TEXT DEFAULT 'executive',
    status TEXT DEFAULT 'active',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`, handleError);
}

function handleError(err) {
  if (err) {
    console.error('Table creation error:', err.message);
  }
}


module.exports = db;