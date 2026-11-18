
const express = require("express");
const path = require("path");
const { initializeDatabase, saveDatabase } = require("./database");

const app = express();
const PORT = 3003;

app.use(express.json());
app.use(express.static(__dirname));

let db;

// Home route
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

// Server status
app.get("/api/status", (req, res) => {
    res.json({
        message: "JobConnect server is running successfully!"
    });
});

// Get all jobs
app.get("/api/jobs", (req, res) => {
    const result = db.exec("SELECT * FROM jobs ORDER BY id");

    const jobs = result.length
        ? result[0].values.map(row => ({
            id: row[0],
            title: row[1],
            company: row[2],
            location: row[3],
            salary: row[4]
        }))
        : [];

    res.json(jobs);
});

// Delete a job
app.delete("/api/jobs/:id", (req, res) => {
    const jobId = Number(req.params.id);

    if (!Number.isInteger(jobId) || jobId <= 0) {
        return res.status(400).json({
            message: "Invalid job ID."
        });
    }

    db.run("DELETE FROM jobs WHERE id = ?", [jobId]);

    saveDatabase(db);

    res.json({
        message: "Job deleted successfully!"
    });
});

app.put("/api/jobs/:id", (req, res) => {
    const jobId = Number(req.params.id);
    const { title, company, location, salary } = req.body;

    if (
        !Number.isInteger(jobId) || jobId <= 0 ||
        typeof title !== "string" || !title.trim() ||
        typeof company !== "string" || !company.trim() ||
        typeof location !== "string" || !location.trim() ||
        typeof salary !== "string" || !salary.trim()
    ) {
        return res.status(400).json({
            message: "Please provide valid job details."
        });
    }

    db.run(
        `UPDATE jobs
         SET title = ?, company = ?, location = ?, salary = ?
         WHERE id = ?`,
        [
            title.trim(),
            company.trim(),
            location.trim(),
            salary.trim(),
            jobId
        ]
    );

    if (db.getRowsModified() === 0) {
        return res.status(404).json({
            message: "Job not found."
        });
    }

    saveDatabase(db);

    res.json({
        message: "Job updated successfully!"
    });
});



// Admin: Add a new job
app.post("/api/jobs", (req, res) => {
    const { title, company, location, salary } = req.body;

    if (
        typeof title !== "string" || !title.trim() ||
        typeof company !== "string" || !company.trim() ||
        typeof location !== "string" || !location.trim() ||
        typeof salary !== "string" || !salary.trim()
    ) {
        return res.status(400).json({
            message: "Please fill in all job details."
        });
    }

    db.run(
        `INSERT INTO jobs (title, company, location, salary)
         VALUES (?, ?, ?, ?)`,
        [
            title.trim(),
            company.trim(),
            location.trim(),
            salary.trim()
        ]
    );

    saveDatabase(db);

    res.status(201).json({
        message: "New job added successfully!"
    });
});


// Apply for a job
app.post("/api/applications", (req, res) => {
    const { job_id, applicant_name, email } = req.body;

    if (
        !Number.isInteger(Number(job_id)) ||
        !applicant_name?.trim() ||
        !email?.trim() ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
    ) {
        return res.status(400).json({
            message: "Please provide valid application details."
        });
    }

    const job = db.exec(
        "SELECT id FROM jobs WHERE id = ?",
        [Number(job_id)]
    );

    if (!job.length || !job[0].values.length) {
        return res.status(404).json({
            message: "Job not found."
        });
    }

    db.run(
        "INSERT INTO applications (job_id, applicant_name, email) VALUES (?, ?, ?)",
        [Number(job_id), applicant_name.trim(), email.trim()]
    );

    saveDatabase(db);

    res.status(201).json({
        message: "Job application submitted successfully!"
    });
});


// Get all job applications
app.get("/api/applications", (req, res) => {
    const result = db.exec(`
        SELECT
            applications.id,
            applications.applicant_name,
            applications.email,
            jobs.title,
            jobs.company
       FROM applications
LEFT JOIN jobs ON applications.job_id = jobs.id
    `);

    const applications = result.length
        ? result[0].values.map(row => ({
            id: row[0],
            applicant_name: row[1],
            email: row[2],
            job_title: row[3],
            company: row[4]
        }))
        : [];

    res.json(applications);
});


// Start server after database initialization
async function startServer() {
    try {
        db = await initializeDatabase();

        app.listen(PORT, () => {
            console.log(`JobConnect server running at http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error("Server startup failed:", error);
    }
}

startServer();
