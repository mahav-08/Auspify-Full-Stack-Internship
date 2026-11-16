
const express = require("express");
const path = require("path");
const fs = require("fs");
const initSqlJs = require("sql.js");

const app = express();

app.use(express.json());
app.use(express.static(__dirname));

const DB_PATH = path.join(__dirname, "students.db");

async function startServer() {

    const SQL = await initSqlJs({
        locateFile: file =>
            path.join(__dirname, "node_modules", "sql.js", "dist", file)
    });

    let db;

    // Load existing database or create a new one
    if (fs.existsSync(DB_PATH)) {
        const fileBuffer = fs.readFileSync(DB_PATH);
        db = new SQL.Database(fileBuffer);
    } else {
        db = new SQL.Database();
    }

    // Create students table
    db.run(`
        CREATE TABLE IF NOT EXISTS students (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            roll TEXT NOT NULL,
            department TEXT NOT NULL,
            email TEXT NOT NULL
        )
    `);

    // Save database permanently
    function saveDatabase() {
        const data = db.export();
        fs.writeFileSync(DB_PATH, Buffer.from(data));
    }

    saveDatabase();

    // Home page
    app.get("/", (req, res) => {
        res.sendFile(path.join(__dirname, "index.html"));
    });

    // Get all students
    app.get("/api/students", (req, res) => {
        const result = db.exec("SELECT * FROM students");

        const students = result.length
            ? result[0].values.map(row => ({
                id: row[0],
                name: row[1],
                roll: row[2],
                department: row[3],
                email: row[4]
            }))
            : [];

        res.json(students);
    });

    // Add student
    app.post("/api/students", (req, res) => {
        const { name, roll, department, email } = req.body;

        if (!name || !roll || !department || !email) {
            return res.status(400).json({
                message: "All fields are required"
            });
        }

        db.run(
            "INSERT INTO students (name, roll, department, email) VALUES (?, ?, ?, ?)",
            [name, roll, department, email]
        );

        saveDatabase();

        res.status(201).json({
            message: "Student added successfully"
        });
    });

    // Edit student
    app.put("/api/students/:id", (req, res) => {
        const id = Number(req.params.id);
        const { name, roll, department, email } = req.body;

        if (!name || !roll || !department || !email) {
            return res.status(400).json({
                message: "All fields are required"
            });
        }

        db.run(
            "UPDATE students SET name = ?, roll = ?, department = ?, email = ? WHERE id = ?",
            [name, roll, department, email, id]
        );

        if (db.getRowsModified() === 0) {
            return res.status(404).json({
                message: "Student not found"
            });
        }

        saveDatabase();

        res.json({
            message: "Student updated successfully"
        });
    });

    // Delete student
    app.delete("/api/students/:id", (req, res) => {
        const id = Number(req.params.id);

        db.run("DELETE FROM students WHERE id = ?", [id]);

        if (db.getRowsModified() === 0) {
            return res.status(404).json({
                message: "Student not found"
            });
        }

        saveDatabase();

        res.json({
            message: "Student deleted successfully"
        });
    });

    const PORT = 3000;

    app.listen(PORT, () => {
        console.log(`Server running at http://localhost:${PORT}`);
        console.log("SQLite database connected successfully!");
    });
}

startServer().catch(error => {
    console.error("Database startup error:", error);
});
