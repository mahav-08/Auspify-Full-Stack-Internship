
const initSqlJs = require("sql.js");
const fs = require("fs");
const path = require("path");

const dbPath = path.join(__dirname, "jobportal.db");

async function initializeDatabase() {
    const SQL = await initSqlJs();

    let db;

    if (fs.existsSync(dbPath)) {
        const fileBuffer = fs.readFileSync(dbPath);
        db = new SQL.Database(fileBuffer);
    } else {
        db = new SQL.Database();
    }

    db.run(`
        CREATE TABLE IF NOT EXISTS jobs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            company TEXT NOT NULL,
            location TEXT NOT NULL,
            salary TEXT NOT NULL
        )
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS applications (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            job_id INTEGER NOT NULL,
            applicant_name TEXT NOT NULL,
            email TEXT NOT NULL,
            FOREIGN KEY (job_id) REFERENCES jobs(id)
        )
    `);

    const result = db.exec("SELECT COUNT(*) FROM jobs");

    if (result[0].values[0][0] === 0) {
        const jobs = [
            ["Frontend Developer", "Tech Solutions", "Chennai", "₹4 - 6 LPA"],
            ["Python Developer", "Innovate Technologies", "Bangalore", "₹5 - 8 LPA"],
            ["Java Developer", "Code Systems", "Hyderabad", "₹4 - 7 LPA"],
            ["Web Designer", "Creative Studio", "Coimbatore", "₹3 - 5 LPA"],
            ["Data Analyst", "Data World", "Chennai", "₹4 - 6 LPA"],
            ["Full Stack Developer", "Digital Hub", "Bangalore", "₹6 - 9 LPA"]
        ];

        jobs.forEach(job => {
            db.run(
                "INSERT INTO jobs (title, company, location, salary) VALUES (?, ?, ?, ?)",
                job
            );
        });
    }

    fs.writeFileSync(dbPath, Buffer.from(db.export()));

    console.log("JobConnect database initialized successfully!");

    return db;
}

function saveDatabase(db) {
    fs.writeFileSync(dbPath, Buffer.from(db.export()));
}

module.exports = {
    initializeDatabase,
    saveDatabase
};
