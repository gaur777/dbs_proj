// server.js

const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");

const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// MySQL connection
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "827864r7",
    database: "RestaurantBooking" // Your database name
});

// Test DB connection
db.connect(err => {
    if (err) {
        console.error("Database connection failed:", err);
    } else {
        console.log("Connected to MySQL!");
    }
});

// Login API
// Login API with diner/admin support
app.post("/login", (req, res) => {
    const { username, password, isAdmin } = req.body;

    const table = isAdmin ? "RestaurantTable" : "Customer";
    const sql = `SELECT * FROM ${table} WHERE username = ? AND passwordhash = ?`;

    db.query(sql, [username, password], (err, results) => {
        if (err) {
            console.error("DB Error:", err);
            return res.status(500).json({ success: false });
        }

        if (results.length > 0) {
            res.json({ success: true });
        } else {
            res.json({ success: false });
        }
    });
});
// Diner Signup API
app.post("/signup", (req, res) => {
    const { username, phone, password } = req.body;

    const sql = "INSERT INTO Customer (username, phone, balance, passwordhash) VALUES (?, ?, 0.00, ?)";
    db.query(sql, [username, phone, password], (err, result) => {
        if (err) {
            console.error("Signup error:", err.sqlMessage); // 👈 clearer error log
            return res.status(500).json({ success: false, error: err.sqlMessage });
        }
        res.json({ success: true });
    });
});
// Restaurant Login API
app.post("/login/restaurant", (req, res) => {
    const { username, password } = req.body;

    const sql = "SELECT * FROM RestaurantTable WHERE username = ? AND passwordhash = ?";
    db.query(sql, [username, password], (err, results) => {
        if (err) {
            console.error("Login error:", err);
            return res.status(500).json({ success: false, message: "Server error" });
        }

        if (results.length > 0) {
            res.json({ success: true, restaurant_id: results[0].restaurant_id });
        } else {
            res.json({ success: false, message: "Invalid credentials" });
        }
    });
});

// Restaurant Signup API
app.post("/signup/restaurant", (req, res) => {
    const {
        restaurant_name,
        price_per_person,
        seating_capacity,
        opening_time,
        closing_time,
        username,
        passwordhash
    } = req.body;

    const sql = `
        INSERT INTO RestaurantTable 
        (restaurant_name, price_per_person, seating_capacity, opening_time, closing_time, username, passwordhash)
        VALUES (?, ?, ?, ?, ?, ?, ?)`;

    db.query(sql, [
        restaurant_name,
        price_per_person,
        seating_capacity,
        opening_time,
        closing_time,
        username,
        passwordhash
    ], (err, result) => {
        if (err) {
            console.error("Signup error:", err);
            return res.status(500).json({ success: false, message: "Signup failed. Username might already exist." });
        }

        res.json({ success: true, message: "Restaurant registered successfully!" });
    });
});




app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
