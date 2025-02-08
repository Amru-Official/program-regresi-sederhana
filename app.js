// app.js
const express = require('express');
const mysql = require('mysql2/promise');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const path = require('path');

const app = express();
const port = 4000;

// Database Configuration
const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: '1234',
    database: 'regresi_linier_sederhana_db'
};

// Create connection pool
const pool = mysql.createPool(dbConfig);

// Initialize database and create table if not exists
async function initializeDatabase() {
    try {
        const createTableQuery = `
            CREATE TABLE IF NOT EXISTS regression_data (
                data_id INT AUTO_INCREMENT PRIMARY KEY,
                independent_variable DOUBLE NOT NULL,
                dependent_variable DOUBLE NOT NULL
            )
        `;
        await pool.query(createTableQuery);
        console.log('Table "regression_data" is ready.');
    } catch (err) {
        console.error('Error creating table:', err);
    }
}

initializeDatabase();

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Helper function for linear regression calculation
function calculateRegression(data) {
    let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
    const n = data.length;

    if (n < 2) {
        return {
            error: 'Minimal dibutuhkan 2 data point untuk menghitung regresi'
        };
    }

    data.forEach(point => {
        const x = parseFloat(point.independent_variable);
        const y = parseFloat(point.dependent_variable);
        
        sumX += x;
        sumY += y;
        sumXY += x * y;
        sumX2 += x * x;
    });

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;
    
    const yMean = sumY / n;
    let totalSS = 0;
    let residualSS = 0;
    
    data.forEach(point => {
        const x = parseFloat(point.independent_variable);
        const y = parseFloat(point.dependent_variable);
        const yPred = slope * x + intercept;
        
        totalSS += Math.pow(y - yMean, 2);
        residualSS += Math.pow(y - yPred, 2);
    });
    
    const rSquared = 1 - (residualSS / totalSS);

    return {
        slope: slope.toFixed(4),
        intercept: intercept.toFixed(4),
        rSquared: rSquared.toFixed(4),
        equation: `y = ${slope.toFixed(4)}x + ${intercept.toFixed(4)}`,
        n: n
    };
}

// Routes
// READ - Get all data
app.get('/', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM regression_data');
        res.render('index', { result: rows });
    } catch (err) {
        console.error('Error fetching data:', err);
        res.status(500).send('Database error');
    }
});

// CREATE - Add new data
app.post('/add', async (req, res) => {
    const { independent_variable, dependent_variable } = req.body;
    try {
        if (!independent_variable || !dependent_variable) {
            return res.status(400).send('All fields are required');
        }
        await pool.query(
            'INSERT INTO regression_data (independent_variable, dependent_variable) VALUES (?, ?)',
            [independent_variable, dependent_variable]
        );
        res.redirect('/');
    } catch (err) {
        console.error('Error inserting data:', err);
        res.status(500).send('Database error');
    }
});

// UPDATE - Update existing data
app.post('/update', async (req, res) => {
    const { data_id, independent_variable, dependent_variable } = req.body;
    try {
        if (!data_id || !independent_variable || !dependent_variable) {
            return res.status(400).send('All fields are required');
        }
        await pool.query(
            'UPDATE regression_data SET independent_variable = ?, dependent_variable = ? WHERE data_id = ?',
            [independent_variable, dependent_variable, data_id]
        );
        res.redirect('/');
    } catch (err) {
        console.error('Error updating data:', err);
        res.status(500).send('Database error');
    }
});

// DELETE - Delete data
app.post('/delete', async (req, res) => {
    const { data_id } = req.body;
    try {
        if (!data_id) {
            return res.status(400).send('Data ID is required');
        }
        await pool.query('DELETE FROM regression_data WHERE data_id = ?', [data_id]);
        res.redirect('/');
    } catch (err) {
        console.error('Error deleting data:', err);
        res.status(500).send('Database error');
    }
});

// CREATE TABLE - Create new table
app.post('/create-table', async (req, res) => {
    let { table_name, independent_var, dependent_var } = req.body;

    table_name = table_name.replace(/\s+/g, '_');
    independent_var = independent_var.replace(/\s+/g, '_');
    dependent_var = dependent_var.replace(/\s+/g, '_');

    try {
        if (!table_name || !independent_var || !dependent_var) {
            return res.status(400).send('Semua field harus diisi');
        }

        const createTableQuery = `
            CREATE TABLE IF NOT EXISTS \`${table_name}\` (
                data_id INT AUTO_INCREMENT PRIMARY KEY,
                \`${independent_var}\` DOUBLE NOT NULL,
                \`${dependent_var}\` DOUBLE NOT NULL
            )
        `;

        await pool.query(createTableQuery);
        res.redirect('/');
    } catch (err) {
        console.error('Error creating table:', err);
        res.status(500).send('Database error');
    }
});

// Calculate regression endpoint
app.get('/calculate-regression', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM regression_data');
        const regressionResult = calculateRegression(rows);
        res.json(regressionResult);
    } catch (err) {
        console.error('Error calculating regression:', err);
        res.status(500).json({ error: 'Failed to calculate regression' });
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});