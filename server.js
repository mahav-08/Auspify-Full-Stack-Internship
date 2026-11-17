
const express = require("express");
const initSqlJs = require("sql.js");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const app = express();

app.use(express.json());
app.use(express.static(__dirname));
app.use(express.static(__dirname));

const dbPath = path.join(__dirname, "mahakart.db");
console.log("DATABASE PATH:", dbPath);

async function startServer() {
    const SQL = await initSqlJs();

    let db;

    if (fs.existsSync(dbPath)) {
        const file = fs.readFileSync(dbPath);
        db = new SQL.Database(file);
    } else {
        db = new SQL.Database();
    }

    // Create database tables
    db.run(`
        CREATE TABLE IF NOT EXISTS orders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            total REAL NOT NULL,
            date TEXT NOT NULL
        )
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL
        )
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            price REAL NOT NULL,
            category TEXT NOT NULL
        )
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS order_items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            order_id INTEGER,
            product_id INTEGER,
            product_name TEXT,
            price REAL,
            quantity INTEGER
        )
    `);

    // Initial products
    const initialProducts = [
        { name: "Wireless Headphones", price: 999, category: "Electronics" },
        { name: "Smart Watch", price: 1499, category: "Electronics" },
        { name: "Running Shoes", price: 1299, category: "Fashion" },
        { name: "Backpack", price: 799, category: "Fashion" },
        { name: "Coffee Mug", price: 299, category: "Home" },
        { name: "Desk Lamp", price: 599, category: "Home" }
    ];

    const productCount = db.exec(
        "SELECT COUNT(*) FROM products"
    )[0].values[0][0];

    if (productCount === 0) {
        for (const product of initialProducts) {
            db.run(
                "INSERT INTO products (name, price, category) VALUES (?, ?, ?)",
                [product.name, product.price, product.category]
            );
        }

        fs.writeFileSync(dbPath, Buffer.from(db.export()));
    }

    // GET: View all products
    app.get("/api/products", (req, res) => {
        const result = db.exec("SELECT * FROM products");

        const products = result.length
            ? result[0].values.map(row => ({
                id: row[0],
                name: row[1],
                price: row[2],
                category: row[3]
            }))
            : [];

        res.json(products);
    });

    // POST: Add a product
    app.post("/api/products", (req, res) => {
        const { name, price, category } = req.body;
        const productPrice = Number(price);

        if (
            typeof name !== "string" || !name.trim() ||
            typeof category !== "string" || !category.trim() ||
            price === "" || !Number.isFinite(productPrice) ||
            productPrice <= 0
        ) {
            return res.status(400).json({
                message: "Please provide valid product details"
            });
        }

        db.run(
            "INSERT INTO products (name, price, category) VALUES (?, ?, ?)",
            [name.trim(), productPrice, category.trim()]
        );

        const productId = db.exec(
            "SELECT last_insert_rowid()"
        )[0].values[0][0];

        fs.writeFileSync(dbPath, Buffer.from(db.export()));

        res.status(201).json({
            message: "Product added successfully!",
            id: productId
        });
    });

    // PUT: Update a product
    app.put("/api/products/:id", (req, res) => {
        const { name, price, category } = req.body;
        const id = Number(req.params.id);
        const productPrice = Number(price);

        if (
            !Number.isInteger(id) || id <= 0 ||
            typeof name !== "string" || !name.trim() ||
            typeof category !== "string" || !category.trim() ||
            price === "" || !Number.isFinite(productPrice) ||
            productPrice <= 0
        ) {
            return res.status(400).json({
                message: "Please provide valid product details"
            });
        }

        const existing = db.exec(
            "SELECT id FROM products WHERE id = ?",
            [id]
        );

        if (existing.length === 0 || existing[0].values.length === 0) {
            return res.status(404).json({
                message: "Product not found"
            });
        }

        db.run(
            "UPDATE products SET name = ?, price = ?, category = ? WHERE id = ?",
            [name.trim(), productPrice, category.trim(), id]
        );

        fs.writeFileSync(dbPath, Buffer.from(db.export()));

        res.json({
            message: "Product updated successfully!"
        });
    });

    // DELETE: Delete a product
    app.delete("/api/products/:id", (req, res) => {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({
                message: "Invalid product ID"
            });
        }

        const existing = db.exec(
            "SELECT id FROM products WHERE id = ?",
            [id]
        );

        if (existing.length === 0 || existing[0].values.length === 0) {
            return res.status(404).json({
                message: "Product not found"
            });
        }

        db.run(
            "DELETE FROM products WHERE id = ?",
            [id]
        );

        fs.writeFileSync(dbPath, Buffer.from(db.export()));

        res.json({
            message: "Product deleted successfully!"
        });
    });

    // POST: User registration
    app.post("/api/register", (req, res) => {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                message: "All fields are required"
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                message: "Password must contain at least 6 characters"
            });
        }

        const normalizedEmail = email.trim().toLowerCase();
        const salt = crypto.randomBytes(16).toString("hex");

        const hashedPassword = crypto.scryptSync(
            password,
            salt,
            64
        ).toString("hex");

        try {
            db.run(
                "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
                [name.trim(), normalizedEmail, salt + ":" + hashedPassword]
            );

            fs.writeFileSync(dbPath, Buffer.from(db.export()));

            res.status(201).json({
                message: "Registration successful!"
            });
        } catch (error) {
            res.status(409).json({
                message: "Email already registered"
            });
        }
    });

    // POST: User login
    app.post("/api/login", (req, res) => {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required"
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        const result = db.exec(
            "SELECT * FROM users WHERE email = ?",
            [normalizedEmail]
        );

        if (result.length === 0 || result[0].values.length === 0) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        const user = result[0].values[0];
        const [salt, storedHash] = user[3].split(":");

        const enteredHash = crypto.scryptSync(
            password,
            salt,
            64
        ).toString("hex");

        const isValid =
            storedHash.length === enteredHash.length &&
            crypto.timingSafeEqual(
                Buffer.from(storedHash, "hex"),
                Buffer.from(enteredHash, "hex")
            );

        if (!isValid) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        res.json({
            message: "Login successful!",
            user: {
                id: user[0],
                name: user[1],
                email: user[2]
            }
        });
    });

    // POST: Place an order
    app.post("/api/orders", (req, res) => {
        const { items } = req.body;

        if (!Array.isArray(items) || items.length === 0) {
            return res.status(400).json({
                message: "Cart is empty"
            });
        }

        let total = 0;
        const validItems = [];

        for (const item of items) {
            if (
                !Number.isInteger(item.id) ||
                !Number.isInteger(item.quantity) ||
                item.quantity < 1
            ) {
                return res.status(400).json({
                    message: "Invalid order item"
                });
            }

            const result = db.exec(
                "SELECT * FROM products WHERE id = ?",
                [item.id]
            );

            if (result.length === 0 || result[0].values.length === 0) {
                return res.status(400).json({
                    message: "Product not found"
                });
            }

            const row = result[0].values[0];

            const product = {
                id: row[0],
                name: row[1],
                price: row[2],
                category: row[3],
                quantity: item.quantity
            };

            total += product.price * product.quantity;
            validItems.push(product);
        }

        db.run(
            "INSERT INTO orders (total, date) VALUES (?, ?)",
            [total, new Date().toISOString()]
        );

        const orderId = db.exec(
            "SELECT last_insert_rowid()"
        )[0].values[0][0];

        for (const item of validItems) {
            db.run(
                `INSERT INTO order_items
                (order_id, product_id, product_name, price, quantity)
                VALUES (?, ?, ?, ?, ?)`,
                [
                    orderId,
                    item.id,
                    item.name,
                    item.price,
                    item.quantity
                ]
            );
        }

        fs.writeFileSync(dbPath, Buffer.from(db.export()));

        res.status(201).json({
            message: "Order saved successfully!",
            order: {
                id: orderId,
                total,
                items: validItems
            }
        });
    });

    // GET: View order history
    app.get("/api/orders", (req, res) => {
        const result = db.exec(`
            SELECT
                orders.id,
                orders.total,
                orders.date,
                order_items.product_name,
                order_items.price,
                order_items.quantity
            FROM orders
            LEFT JOIN order_items
            ON orders.id = order_items.order_id
            ORDER BY orders.id DESC
        `);

        if (result.length === 0) {
            return res.json([]);
        }

        const rows = result[0].values;
        const orders = {};

        rows.forEach(row => {
            const [id, total, date, productName, price, quantity] = row;

            if (!orders[id]) {
                orders[id] = {
                    id,
                    total,
                    date,
                    items: []
                };
            }

            if (productName !== null) {
                orders[id].items.push({
                    productName,
                    price,
                    quantity
                });
            }
        });

        res.json(Object.values(orders));
    });

    // Start server
    const PORT = 3002;

    app.listen(PORT, () => {
        console.log(`MahaKart server running at http://localhost:${PORT}`);
    });
}

startServer().catch(error => {
    console.error("Unable to start MahaKart server:", error);
});
