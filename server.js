const express = require("express");
const mysql = require('mysql2/promise'); // Using promise version
const cors = require("cors");

const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Create connection pool
const pool = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "827864r7",
    database: "RestaurantBooking",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Test DB connection
pool.getConnection()
    .then(connection => {
        console.log("Connected to MySQL!");
        connection.release();
    })
    .catch(err => {
        console.error("Database connection failed:", err);
    });

// Login API
app.post("/login", async (req, res) => {
    try {
        const { username, password, isAdmin } = req.body;
        const table = isAdmin ? "RestaurantTable" : "Customer";
        const sql = `SELECT * FROM ${table} WHERE username = ? AND passwordhash = ?`;
        
        const [results] = await pool.query(sql, [username, password]);
        res.json({ success: results.length > 0 });
    } catch (err) {
        console.error("DB Error:", err);
        res.status(500).json({ success: false });
    }
});

// Diner Signup API
app.post("/signup", async (req, res) => {
    try {
        const { username, phone, password } = req.body;
        const sql = "INSERT INTO Customer (username, phone, balance, passwordhash) VALUES (?, ?, 0.00, ?)";
        
        const [result] = await pool.query(sql, [username, phone, password]);
        res.json({ success: true });
    } catch (err) {
        console.error("Signup error:", err);
        res.status(500).json({ 
            success: false, 
            error: err.sqlMessage || "Signup failed" 
        });
    }
});

// Restaurant Login API
app.post("/login/restaurant", async (req, res) => {
    try {
        const { username, password } = req.body;
        const sql = "SELECT * FROM RestaurantTable WHERE username = ? AND passwordhash = ?";
        
        const [results] = await pool.query(sql, [username, password]);
        if (results.length > 0) {
            res.json({ 
                success: true, 
                restaurant_id: results[0].restaurant_id 
            });
        } else {
            res.json({ 
                success: false, 
                message: "Invalid credentials" 
            });
        }
    } catch (err) {
        console.error("Login error:", err);
        res.status(500).json({ 
            success: false, 
            message: "Server error" 
        });
    }
});

// Restaurant Signup API
app.post("/signup/restaurant", async (req, res) => {
    try {
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

        const [result] = await pool.query(sql, [
            restaurant_name,
            price_per_person,
            seating_capacity,
            opening_time,
            closing_time,
            username,
            passwordhash
        ]);

        res.json({ 
            success: true, 
            message: "Restaurant registered successfully!" 
        });
    } catch (err) {
        console.error("Signup error:", err);
        res.status(500).json({ 
            success: false, 
            message: "Signup failed. Username might already exist." 
        });
    }
});

// Get all available restaurants
app.get('/restaurants', async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT r.*, 
                   COALESCE(ROUND(AVG(f.rating)), 1) as average_rating
            FROM restauranttable r
            LEFT JOIN feedback f ON r.restaurant_id = f.restaurant_id
            GROUP BY r.restaurant_id
        `);
        
        res.json(rows);
    } catch (err) {
        console.error('Error in /restaurants:', err);
        res.status(500).json({ 
            error: 'Database error',
            details: err.message
        });
    }
});

// Get Customer Balance API
app.get("/customer/balance/:username", async (req, res) => {
    try {
        const { username } = req.params;
        const sql = "SELECT balance FROM Customer WHERE username = ?";
        
        const [results] = await pool.query(sql, [username]);
        if (results.length > 0) {
            res.json({ 
                success: true, 
                balance: results[0].balance 
            });
        } else {
            res.status(404).json({ 
                success: false, 
                message: "Customer not found" 
            });
        }
    } catch (err) {
        console.error("Error fetching balance:", err);
        res.status(500).json({ 
            success: false, 
            message: "Error fetching balance" 
        });
    }
});

// API to handle top-up balance
app.post("/customer/topup", async (req, res) => {
    try {
        const { username, amount } = req.body;

        if (!username || !amount || isNaN(amount)) {
            return res.status(400).json({ 
                success: false, 
                message: "Invalid input" 
            });
        }

        // Get customer_id
        const [customer] = await pool.query(
            "SELECT customer_id FROM Customer WHERE username = ?", 
            [username]
        );

        if (customer.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: "Customer not found" 
            });
        }

        const customerId = customer[0].customer_id;

        // Update wallet
        const [result] = await pool.query(
            `UPDATE Wallet SET balance = balance + ? 
             WHERE customer_id = ?`,
            [parseFloat(amount), customerId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ 
                success: false, 
                message: "Wallet not found" 
            });
        }

        res.json({ 
            success: true, 
            message: "Wallet topped up successfully!" 
        });
    } catch (err) {
        console.error("Error in topup:", err);
        res.status(500).json({ 
            success: false, 
            message: "Server error during top-up" 
        });
    }
});

// Reservation API
// Modify your reservation API in server.js to include invoice creation
app.post('/api/reservations', async (req, res) => {
    const connection = await pool.getConnection();
    try {
        const { customer_username, restaurant_id, booking_date, booking_time, number_of_people } = req.body;

        await connection.beginTransaction();

        // 1. Get customer_id
        const [customer] = await connection.query(
            'SELECT customer_id FROM Customer WHERE username = ?', 
            [customer_username]
        );
        
        if (customer.length === 0) {
            await connection.rollback();
            return res.status(404).json({ error: 'Customer not found' });
        }
        const customer_id = customer[0].customer_id;

        // 2. Get restaurant details including price
        const [restaurant] = await connection.query(
            'SELECT restaurant_name, price_per_person FROM RestaurantTable WHERE restaurant_id = ?', 
            [restaurant_id]
        );
        
        if (restaurant.length === 0) {
            await connection.rollback();
            return res.status(404).json({ error: 'Restaurant not found' });
        }

        const price_per_person = parseFloat(restaurant[0].price_per_person);
        const amount = number_of_people * price_per_person;
        const total_amount = amount * 1.18; // Adding 18% tax

        // 3. Check wallet balance
        const [wallet] = await connection.query(
            'SELECT balance FROM Wallet WHERE customer_id = ? FOR UPDATE',
            [customer_id]
        );
        
        if (wallet.length === 0 || wallet[0].balance < total_amount) {
            await connection.rollback();
            return res.status(400).json({ error: 'Insufficient balance' });
        }

        // 4. Deduct from wallet
        await connection.query(
            'UPDATE Wallet SET balance = balance - ? WHERE customer_id = ?',
            [total_amount, customer_id]
        );

        // 5. Insert reservation
        const [reservationResult] = await connection.query(
            'INSERT INTO Reservation (customer_id, restaurant_id, booking_date, booking_time, number_of_people) VALUES (?, ?, ?, ?, ?)',
            [customer_id, restaurant_id, booking_date, booking_time, number_of_people]
        );
        
        const reservation_id = reservationResult.insertId;

        // 6. Insert payment
        const [paymentResult] = await connection.query(
            'INSERT INTO Payment (reservation_id, amount) VALUES (?, ?)',
            [reservation_id, amount]
        );
        
        const payment_id = paymentResult.insertId;

        // 7. Create invoice
        await connection.query(
            'INSERT INTO Invoice (payment_id, customer_id, total_amount) VALUES (?, ?, ?)',
            [payment_id, customer_id, total_amount]
        );

        await connection.commit();

        res.json({ 
            success: true, 
            message: 'Reservation successful',
            reservation_id,
            restaurant_name: restaurant[0].restaurant_name,
            new_balance: wallet[0].balance - total_amount
        });

    } catch (error) {
        await connection.rollback();
        console.error('Reservation error:', error);
        res.status(500).json({ error: 'Database operation failed' });
    } finally {
        connection.release();
    }
});

// Get reservations API
app.get('/api/reservations/:username', async (req, res) => {
    try {
        const { username } = req.params;
        const currentDate = new Date().toISOString().split('T')[0];

        const [customer] = await pool.query(
            'SELECT customer_id FROM Customer WHERE username = ?', 
            [username]
        );
        
        if (customer.length === 0) {
            return res.status(404).json({ 
                error: 'Customer not found'
            });
        }
        
        const customer_id = customer[0].customer_id;

        const [reservations] = await pool.query(`
            SELECT r.reservation_id, rt.restaurant_name, r.booking_date, r.booking_time, 
                   r.number_of_people, CAST(p.amount AS DECIMAL(10,2)) as amount,
                   CASE 
                       WHEN r.booking_date > ? THEN 'upcoming'
                       ELSE 'completed'
                   END AS status
            FROM Reservation r
            JOIN Payment p ON r.reservation_id = p.reservation_id
            JOIN RestaurantTable rt ON r.restaurant_id = rt.restaurant_id
            WHERE r.customer_id = ?
            ORDER BY r.booking_date, r.booking_time
        `, [currentDate, customer_id]);

        res.json(reservations);
    } catch (error) {
        console.error('Reservations error:', error);
        res.status(500).json({ 
            error: 'Database operation failed'
        });
    }
});

// Feedback API
app.post('/api/feedback', async (req, res) => {
    const connection = await pool.getConnection();
    try {
        const { customer_id, restaurant_id, rating, comment } = req.body;
        
        if (rating < 1 || rating > 5) {
            return res.status(400).json({ 
                error: 'Rating must be 1-5' 
            });
        }

        await connection.beginTransaction();

        // Insert feedback
        const [feedbackResult] = await connection.query(
            `INSERT INTO feedback (customer_id, restaurant_id, rating, comment)
             VALUES (?, ?, ?, ?)`,
            [customer_id, restaurant_id, rating, comment]
        );

        // Calculate new average
        const [[avgResult]] = await connection.query(
            `SELECT AVG(rating) as average_rating 
             FROM feedback 
             WHERE restaurant_id = ?`,
            [restaurant_id]
        );

        // Update restaurant rating
        await connection.query(
            `UPDATE restauranttable 
             SET rating = ?
             WHERE restaurant_id = ?`,
            [parseFloat(avgResult.average_rating).toFixed(1), restaurant_id]
        );

        await connection.commit();

        res.json({ 
            success: true, 
            feedback_id: feedbackResult.insertId,
            new_rating: parseFloat(avgResult.average_rating).toFixed(1)
        });
    } catch (err) {
        await connection.rollback();
        console.error('Feedback error:', err);
        res.status(500).json({ 
            error: 'Database error'
        });
    } finally {
        connection.release();
    }
});

// Get customer ID API
app.get('/customer/get-id/:username', async (req, res) => {
    try {
        const { username } = req.params;
        const [[result]] = await pool.query(
            'SELECT customer_id FROM customer WHERE username = ?',
            [username]
        );
        
        if (!result) {
            return res.status(404).json({ 
                error: 'Customer not found' 
            });
        }
        
        res.json({ 
            customer_id: result.customer_id 
        });
    } catch (err) {
        console.error('Customer ID error:', err);
        res.status(500).json({ 
            error: 'Database error'
        });
    }
});

// Test DB connection
app.get('/api/test-db', async (req, res) => {
    try {
        const [results] = await pool.query('SELECT 1+1 AS solution');
        res.json({ 
            success: true, 
            solution: results[0].solution 
        });
    } catch (error) {
        res.status(500).json({ 
            error: 'DB connection failed'
        });
    }
});
// Get invoices for a customer
// Add this to your server.js
app.get('/api/invoices/:username', async (req, res) => {
    try {
        const { username } = req.params;

        // Get customer_id from username
        const [customer] = await pool.query(
            'SELECT customer_id FROM Customer WHERE username = ?', 
            [username]
        );

        if (customer.length === 0) {
            return res.status(404).json({ error: 'Customer not found' });
        }

        const customer_id = customer[0].customer_id;

        // Get invoices with CAST to ensure numeric values
        const [invoices] = await pool.query(`
            SELECT 
                i.invoice_id, 
                i.payment_id, 
                CAST(i.total_amount AS DECIMAL(10,2)) as total_amount,
                i.created_at,
                CAST(p.amount AS DECIMAL(10,2)) as amount,
                r.reservation_id, 
                r.booking_date, 
                r.booking_time, 
                r.number_of_people,
                rt.restaurant_name, 
                CAST(rt.price_per_person AS DECIMAL(10,2)) as price_per_person
            FROM Invoice i
            JOIN Payment p ON i.payment_id = p.payment_id
            JOIN Reservation r ON p.reservation_id = r.reservation_id
            JOIN RestaurantTable rt ON r.restaurant_id = rt.restaurant_id
            WHERE i.customer_id = ?
            ORDER BY i.created_at DESC
        `, [customer_id]);

        res.json(invoices);

    } catch (error) {
        console.error('Error fetching invoices:', error);
        res.status(500).json({ 
            error: 'Database error',
            message: error.message
        });
    }
});
// Get detailed invoice information
app.get('/api/invoices/details/:invoiceId', async (req, res) => {
    try {
        const { invoiceId } = req.params;

        const [invoice] = await pool.query(`
            SELECT i.invoice_id, i.payment_id, i.total_amount, 
                   p.amount, p.payment_date, 
                   r.reservation_id, rt.restaurant_name,
                   r.booking_date, r.booking_time, r.number_of_people
            FROM Invoice i
            JOIN Payment p ON i.payment_id = p.payment_id
            JOIN Reservation r ON p.reservation_id = r.reservation_id
            JOIN RestaurantTable rt ON r.restaurant_id = rt.restaurant_id
            WHERE i.invoice_id = ?
        `, [invoiceId]);

        if (invoice.length === 0) {
            return res.status(404).json({ error: 'Invoice not found' });
        }

        res.json(invoice[0]);
    } catch (error) {
        console.error('Error fetching invoice details:', error);
        res.status(500).json({ error: 'Database error' });
    }
});
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});