
const express = require("express");
const path = require("path");
const fs = require("fs");
const initSqlJs = require("sql.js");

const app = express();
const PORT = 3001;

app.use(express.json());
app.use(express.static(__dirname));

const dbPath = path.join(__dirname, "expenses.db");

async function startServer() {
    const SQL = await initSqlJs({
        locateFile: file =>
            path.join(__dirname, "node_modules", "sql.js", "dist", file)
    });

    let db;

    if (fs.existsSync(dbPath)) {
        const fileBuffer = fs.readFileSync(dbPath);
        db = new SQL.Database(fileBuffer);
    } else {
        db = new SQL.Database();
    }

    db.run(`
        CREATE TABLE IF NOT EXISTS transactions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            amount REAL NOT NULL,
            type TEXT NOT NULL,
            category TEXT NOT NULL,
            date TEXT NOT NULL
        )
    `);

    function saveDatabase() {
        const data = db.export();
        fs.writeFileSync(dbPath, Buffer.from(data));
    }

    // Get all transactions
    app.get("/api/transactions", (req, res) => {
        const result = db.exec("SELECT * FROM transactions ORDER BY id DESC");

        const transactions = result.length
            ? result[0].values.map(row => ({
                id: row[0],
                title: row[1],
                amount: row[2],
                type: row[3],
                category: row[4],
                date: row[5]
            }))
            : [];

        res.json(transactions);
    });

    // Add transaction
    app.post("/api/transactions", (req, res) => {
        const { title, amount, type, category, date } = req.body;

        if (!title || !category || !date ||
            !["income", "expense"].includes(type) ||
            !Number.isFinite(Number(amount)) || Number(amount) <= 0) {
            return res.status(400).json({
                message: "Please enter valid transaction details"
            });
        }

        db.run(
            `INSERT INTO transactions (title, amount, type, category, date)
             VALUES (?, ?, ?, ?, ?)`,
            [title, Number(amount), type, category, date]
        );

        saveDatabase();

        res.json({ message: "Transaction added successfully!" });
    });

    // Delete transaction
    app.delete("/api/transactions/:id", (req, res) => {
        db.run(
            "DELETE FROM transactions WHERE id = ?",
            [Number(req.params.id)]
        );

        saveDatabase();

        res.json({ message: "Transaction deleted successfully!" });
    });

    app.listen(PORT, () => {
        console.log(`Expense Tracker running at http://localhost:${PORT}`);
        console.log("SQLite database connected successfully!");
    });
}

startServer().catch(error => {
    console.error("Server startup error:", error);
});
