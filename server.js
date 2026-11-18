
const express = require("express");
const initSqlJs = require("sql.js");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const app = express();
const PORT = 3004;

app.use(express.json());
app.use(express.static(__dirname));

async function startServer() {
    const SQL = await initSqlJs();

    const dbPath = path.join(__dirname, "learnhub.db");

    let db;

    if (fs.existsSync(dbPath)) {
        const fileBuffer = fs.readFileSync(dbPath);
        db = new SQL.Database(fileBuffer);
    } else {
        db = new SQL.Database();
    }

    // Create Students Table
    db.run(`
        CREATE TABLE IF NOT EXISTS students (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL
        )
    `);

    // Create Courses Table
    db.run(`
        CREATE TABLE IF NOT EXISTS courses (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL
        )
    `);

    // Create Enrollments Table
    db.run(`
        CREATE TABLE IF NOT EXISTS enrollments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            student_id INTEGER NOT NULL,
            course_id INTEGER NOT NULL
        )
    `);

    // Create Messages Table
    db.run(`
        CREATE TABLE IF NOT EXISTS messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT NOT NULL,
            message TEXT NOT NULL
        )
    `);

    // Insert Default Courses
    const courseCheck = db.exec("SELECT COUNT(*) FROM courses");

    if (courseCheck[0].values[0][0] === 0) {
        const defaultCourses = [
            "Python Programming",
            "Web Development",
            "Java Programming",
            "Data Science",
            "Machine Learning",
            "Database Management"
        ];

        defaultCourses.forEach(function(course) {
            db.run(
                "INSERT INTO courses (title) VALUES (?)",
                [course]
            );
        });
    }

    // Save Database
    function saveDatabase() {
        fs.writeFileSync(dbPath, Buffer.from(db.export()));
    }

    saveDatabase();

    // Backend Status API
    app.get("/api/status", (req, res) => {
        res.json({
            message: "LearnHub backend is running successfully!"
        });
    });

    // Student Registration API
    app.post("/api/register", (req, res) => {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                message: "Please fill all fields!"
            });
        }

        try {
            const salt = crypto.randomBytes(16).toString("hex");

            const passwordHash = crypto.scryptSync(
                password,
                salt,
                64
            ).toString("hex");

            const storedHash = salt + ":" + passwordHash;

            db.run(
                "INSERT INTO students (name, email, password_hash) VALUES (?, ?, ?)",
                [name.trim(), email.trim().toLowerCase(), storedHash]
            );

            saveDatabase();

            res.json({
                message: "Registration successful!"
            });

        } catch (error) {
            res.status(400).json({
                message: "Email already registered or invalid details!"
            });
        }
    });

    // Student Login API
    app.post("/api/login", (req, res) => {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "Please enter email and password!"
            });
        }

        try {
            const result = db.exec(
                "SELECT * FROM students WHERE email = ?",
                [email.trim().toLowerCase()]
            );

            if (result.length === 0 || result[0].values.length === 0) {
                return res.status(401).json({
                    message: "Invalid email or password!"
                });
            }

            const student = result[0].values[0];
            const storedHash = student[3];
            const [salt, originalHash] = storedHash.split(":");

            const enteredHash = crypto.scryptSync(
                password,
                salt,
                64
            ).toString("hex");

            if (enteredHash !== originalHash) {
                return res.status(401).json({
                    message: "Invalid email or password!"
                });
            }

            res.json({
                message: "Login successful!",
                student: {
                    id: student[0],
                    name: student[1],
                    email: student[2]
                }
            });

        } catch (error) {
            res.status(500).json({
                message: "Login failed!"
            });
        }
    });

    // Get All Courses API
    app.get("/api/courses", (req, res) => {
        const result = db.exec(
            "SELECT * FROM courses ORDER BY id"
        );

        const courses = result.length
            ? result[0].values.map(row => ({
                id: row[0],
                title: row[1]
            }))
            : [];

        res.json(courses);
    });

    // Add New Course API
    app.post("/api/courses", (req, res) => {
        const { title } = req.body;

        if (!title || !title.trim()) {
            return res.status(400).json({
                message: "Course title is required!"
            });
        }

        db.run(
            "INSERT INTO courses (title) VALUES (?)",
            [title.trim()]
        );

        saveDatabase();

        res.json({
            message: "Course added successfully!"
        });
    });

    // Course Enrollment API
    app.post("/api/enroll", (req, res) => {
        const { student_id, course_id } = req.body;

        if (!student_id || !course_id) {
            return res.status(400).json({
                message: "Student ID and Course ID are required!"
            });
        }

        try {
            db.run(
                "INSERT INTO enrollments (student_id, course_id) VALUES (?, ?)",
                [student_id, course_id]
            );

            saveDatabase();

            res.json({
                message: "Course enrollment successful!"
            });

        } catch (error) {
            res.status(400).json({
                message: "Enrollment failed!"
            });
        }
    });

    // Contact Message API
    app.post("/api/contact", (req, res) => {
        const { name, email, message } = req.body;

        if (!name || !email || !message) {
            return res.status(400).json({
                message: "Please fill all fields!"
            });
        }

        db.run(
            "INSERT INTO messages (name, email, message) VALUES (?, ?, ?)",
            [name.trim(), email.trim(), message.trim()]
        );

        saveDatabase();

        res.json({
            message: "Thank you! Your message has been submitted successfully."
        });
    });

    // Start Server
    app.listen(PORT, () => {
        console.log(
            `LearnHub server running at http://localhost:${PORT}`
        );
    });
}

startServer().catch(error => {
    console.error("Server startup failed:", error);
});
