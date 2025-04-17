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
        const sql = "SELECT * FROM (SELECT * FROM RestaurantTable) AS subquery WHERE username = ? AND passwordhash = ?;";
        
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
        const sql = "SELECT balance FROM (SELECT username, balance FROM Customer) AS subquery WHERE username = ?;";
        
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

app.post('/api/reservations', async (req, res) => {
    try {
        const { customer_username, restaurant_id, booking_date, booking_time, 
                number_of_people, amount, update_restaurant_balance } = req.body;

        // Start transaction
        await db.beginTransaction();

        // 1. Create the reservation
        const reservationResult = await db.query(
            `INSERT INTO reservations (customer_id, restaurant_id, booking_date, booking_time, 
             number_of_people, amount, status)
             SELECT c.customer_id, ?, ?, ?, ?, ?, 'upcoming'
             FROM customers c WHERE c.username = ?`,
            [restaurant_id, booking_date, booking_time, number_of_people, amount, customer_username]
        );

        // 2. Deduct from customer balance
        await db.query(
            `UPDATE customers SET balance = balance - ? WHERE username = ?`,
            [amount, customer_username]
        );

        // 3. Add to restaurant balance if flag is set
        if (update_restaurant_balance) {
            await db.query(
                `UPDATE restauranttable SET balance = balance + ? WHERE restaurant_id = ?`,
                [amount, restaurant_id]
            );
        }

        // Commit transaction
        await db.commit();

        // Create invoice (optional)
        const invoiceResult = await db.query(
            `INSERT INTO invoices (reservation_id, total_amount, payment_status)
             VALUES (?, ?, 'paid')`,
            [reservationResult.insertId, amount]
        );

        res.json({
            success: true,
            reservation_id: reservationResult.insertId,
            invoice_id: invoiceResult.insertId
        });
    } catch (error) {
        await db.rollback();
        console.error('Error creating reservation:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get reservations API
app.get('/api/reservations/:username', async (req, res) => {
    try {
        const { username } = req.params;
        const currentDate = new Date().toISOString().split('T')[0];

        const [customer] = await pool.query(
            'SELECT customer_id FROM (SELECT customer_id, username FROM Customer) AS subquery WHERE username = ?;', 
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
// Get restaurant reservations
// Get restaurant reservations (updated version)
app.get('/api/restaurant/reservations/:restaurantId', async (req, res) => {
    try {
        const { restaurantId } = req.params;
        
        const [reservations] = await pool.query(`
            SELECT 
                r.reservation_id,
                r.booking_date,
                r.booking_time,
                r.number_of_people,
                CAST(p.amount AS DECIMAL(10,2)) as amount,
                CONCAT(c.first_name, ' ', c.last_name) as customer_name,
                c.phone,
                c.email
            FROM Reservation r
            JOIN Payment p ON r.reservation_id = p.reservation_id
            JOIN Customer c ON r.customer_id = c.customer_id
            WHERE r.restaurant_id = ?
            ORDER BY r.booking_date DESC, r.booking_time DESC
        `, [restaurantId]);
        
        if (reservations.length === 0) {
            return res.json([]); // Return empty array instead of error
        }
        
        res.json(reservations);
    } catch (error) {
        console.error('Error fetching restaurant reservations:', error);
        res.status(500).json({ 
            error: 'Database error',
            message: error.message
        });
    }
});

// Update this endpoint in server.js
app.get('/api/restaurant/reservations/:restaurantId', async (req, res) => {
    try {
        const { restaurantId } = req.params;
        
        const [reservations] = await pool.query(`
            SELECT 
                r.reservation_id,
                r.booking_date,
                r.booking_time,
                r.number_of_people,
                CAST(p.amount AS DECIMAL(10,2)) as amount,
                c.username as customer_name,
                c.phone
            FROM Reservation r
            JOIN Payment p ON r.reservation_id = p.reservation_id
            JOIN Customer c ON r.customer_id = c.customer_id
            WHERE r.restaurant_id = ?
            ORDER BY r.booking_date DESC, r.booking_time DESC
        `, [restaurantId]);
        
        res.json(reservations);
    } catch (error) {
        console.error('Error fetching restaurant reservations:', error);
        res.status(500).json({ 
            error: 'Database error',
            message: error.message
        });
    }
});
// Get restaurant ID by username
app.get('/api/restaurant/by-username', async (req, res) => {
    try {
        const { username } = req.query;
        
        const [results] = await pool.query(
            'SELECT restaurant_id FROM RestaurantTable WHERE username = ?', 
            [username]
        );
        
        if (results.length === 0) {
            return res.status(404).json({ error: 'Restaurant not found' });
        }
        
        res.json({ restaurant_id: results[0].restaurant_id });
    } catch (error) {
        console.error('Error fetching restaurant ID:', error);
        res.status(500).json({ error: 'Database error' });
    }
});
// Get restaurant details by username
app.get('/api/restaurant', async (req, res) => {
    try {
        const { username } = req.query;
        
        const [results] = await pool.query(`
            SELECT 
                restaurant_id,
                restaurant_name,
                price_per_person,
                seating_capacity,
                opening_time,
                closing_time,
                cuisine,
                rating,
                description
            FROM RestaurantTable 
            WHERE username = ?`, 
            [username]
        );
        
        if (results.length === 0) {
            return res.status(404).json({ error: 'Restaurant not found' });
        }
        
        res.json(results[0]);
    } catch (error) {
        console.error('Error fetching restaurant details:', error);
        res.status(500).json({ error: 'Database error' });
    }
});

// Get restaurant balance (total payments received)
// Get restaurant balance
app.post('/api/restaurant/balance/:restaurantId', async (req, res) => {
    try {
        const { restaurantId } = req.params;
        
        // Get balance directly from RestaurantTable
        const [results] = await pool.query(
            'SELECT balance FROM RestaurantTable WHERE restaurant_id = ?', 
            [restaurantId]
        );
        
        if (results.length === 0) {
            return res.status(404).json({ error: 'Restaurant not found' });
        }
        
        res.json({ balance: results[0].balance });
    } catch (error) {
        console.error('Error fetching restaurant balance:', error);
        res.status(500).json({ error: 'Database error' });
    }
});

// Get available seats for a restaurant
app.get('/api/restaurant/available-seats/:restaurantId', async (req, res) => {
    try {
        const { restaurantId } = req.params;
        const { date } = req.query;
        
        // Get total capacity
        const [capacityResult] = await pool.query(
            'SELECT seating_capacity FROM RestaurantTable WHERE restaurant_id = ?',
            [restaurantId]
        );
        
        if (capacityResult.length === 0) {
            return res.status(404).json({ error: 'Restaurant not found' });
        }
        
        const capacity = capacityResult[0].seating_capacity;
        
        // Get reserved seats for the date
        const [reservedResult] = await pool.query(`
            SELECT COALESCE(SUM(number_of_people), 0) as reserved_seats
            FROM Reservation
            WHERE restaurant_id = ? AND booking_date = ?`,
            [restaurantId, date]
        );
        
        const availableSeats = capacity - reservedResult[0].reserved_seats;
        
        res.json({ 
            capacity,
            reservedSeats: reservedResult[0].reserved_seats,
            availableSeats
        });
    } catch (error) {
        console.error('Error fetching available seats:', error);
        res.status(500).json({ error: 'Database error' });
    }
});

// Update restaurant pricing and capacity
app.put('/api/restaurant/:restaurantId', async (req, res) => {
    const connection = await pool.getConnection();
    try {
        const { restaurantId } = req.params;
        const { price_per_person, seating_capacity } = req.body;
        
        await connection.beginTransaction();
        
        // Build update query dynamically based on provided fields
        let updates = [];
        let params = [];
        
        if (price_per_person !== undefined) {
            updates.push('price_per_person = ?');
            params.push(price_per_person);
        }
        
        if (seating_capacity !== undefined) {
            updates.push('seating_capacity = ?');
            params.push(seating_capacity);
        }
        
        if (updates.length === 0) {
            return res.status(400).json({ error: 'No fields to update' });
        }
        
        params.push(restaurantId);
        
        const query = `
            UPDATE RestaurantTable 
            SET ${updates.join(', ')} 
            WHERE restaurant_id = ?`;
        
        const [result] = await connection.query(query, params);
        
        if (result.affectedRows === 0) {
            await connection.rollback();
            return res.status(404).json({ error: 'Restaurant not found' });
        }
        
        await connection.commit();
        
        // Get updated restaurant data
        const [restaurant] = await pool.query(
            'SELECT * FROM RestaurantTable WHERE restaurant_id = ?',
            [restaurantId]
        );
        
        res.json({ 
            success: true,
            restaurant: restaurant[0]
        });
    } catch (error) {
        await connection.rollback();
        console.error('Error updating restaurant:', error);
        res.status(500).json({ error: 'Database error' });
    } finally {
        connection.release();
    }
});

// Get restaurant reservations with customer details
app.get('/api/restaurant/reservations/:restaurantId', async (req, res) => {
    try {
        const { restaurantId } = req.params;
        
        const [reservations] = await pool.query(`
            SELECT 
                r.reservation_id,
                r.booking_date,
                r.booking_time,
                r.number_of_people,
                CAST(p.amount AS DECIMAL(10,2)) as total,
                c.username as customer_name,
                c.phone
            FROM Reservation r
            JOIN Payment p ON r.reservation_id = p.reservation_id
            JOIN Customer c ON r.customer_id = c.customer_id
            WHERE r.restaurant_id = ?
            ORDER BY r.booking_date DESC, r.booking_time DESC`,
            [restaurantId]
        );
        
        res.json(reservations);
    } catch (error) {
        console.error('Error fetching reservations:', error);
        res.status(500).json({ error: 'Database error' });
    }
});
// Comprehensive restaurant dashboard endpoint
app.get('/api/restaurant/dashboard', async (req, res) => {
    try {
        const { username } = req.query;
        const today = new Date().toISOString().split('T')[0];

        // 1. Get basic restaurant info
        const [restaurant] = await pool.query(`
            SELECT 
                restaurant_id,
                restaurant_name,
                price_per_person,
                seating_capacity,
                balance
            FROM RestaurantTable 
            WHERE username = ?`, 
            [username]
        );

        if (restaurant.length === 0) {
            return res.status(404).json({ error: 'Restaurant not found' });
        }

        const restaurantId = restaurant[0].restaurant_id;

        // 2. Get available seats for today
        const [seats] = await pool.query(`
            SELECT 
                seating_capacity - COALESCE(SUM(number_of_people), 0) AS availableSeats
            FROM RestaurantTable rt
            LEFT JOIN Reservation r ON rt.restaurant_id = r.restaurant_id 
                AND r.booking_date = ?
            WHERE rt.restaurant_id = ?
            GROUP BY rt.restaurant_id`,
            [today, restaurantId]
        );

        // 3. Get reservations
        const [reservations] = await pool.query(`
            SELECT 
                r.reservation_id,
                r.booking_date,
                r.booking_time,
                r.number_of_people,
                CAST(p.amount AS DECIMAL(10,2)) as total,
                c.username as customer_name,
                c.phone
            FROM Reservation r
            JOIN Payment p ON r.reservation_id = p.reservation_id
            JOIN Customer c ON r.customer_id = c.customer_id
            WHERE r.restaurant_id = ?
            ORDER BY r.booking_date DESC, r.booking_time DESC`,
            [restaurantId]
        );

        res.json({
            ...restaurant[0],
            availableSeats: seats[0]?.availableSeats || restaurant[0].seating_capacity,
            reservations: reservations
        });

    } catch (error) {
        console.error('Dashboard error:', error);
        res.status(500).json({ error: 'Database error' });
    }
});


app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});