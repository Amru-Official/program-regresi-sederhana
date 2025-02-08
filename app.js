const express = require('express');
const mysql = require('mysql2/promise');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const path = require('path');
const { calculateRegression } = require('./regressionCalculator');

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

// Routes
app.get('/', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM regression_data ORDER BY data_id');
        res.render('index', { result: rows });
    } catch (err) {
        console.error('Error fetching data:', err);
        res.status(500).send('Database error');
    }
});

// Calculate regression endpoint (PERBAIKAN)
app.get('/calculate-regression', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM regression_data ORDER BY data_id');

        if (rows.length < 2) {
            return res.status(400).json({ 
                error: 'Minimal diperlukan 2 data untuk melakukan analisis regresi' 
            });
        }

        // Format data
        const data = rows.map(row => ({
            independent_variable: row.independent_variable,
            dependent_variable: row.dependent_variable
        }));

        console.log('Data yang diambil:', data);

        // Panggil fungsi regresi (Harus `await` karena async)
        const regressionResults = await calculateRegression(data);

        console.log('Hasil regresi:', regressionResults);

        // Format response untuk frontend
        const response = {
            equation: regressionResults.equation,
            rSquared: regressionResults.rSquared.toFixed(4),
            n: rows.length,
            
            normalityTest: {
                statistic: regressionResults.ksTest.D.toFixed(4),
                criticalValue: regressionResults.ksTest.criticalValue.toFixed(4),
                isNormal: !regressionResults.ksTest.rejectH0
            },
            
            heteroscedasticityTest: regressionResults.bpTest.skipped 
                ? { 
                    skipped: true, 
                    reason: regressionResults.bpTest.reason 
                }
                : {
                    statistic: regressionResults.bpTest.statistic.toFixed(4),
                    pValue: regressionResults.bpTest.pValue.toFixed(4),
                    isHomoscedastic: !regressionResults.bpTest.rejectH0
                },
            
            autocorrelationTest: regressionResults.dwTest.skipped
                ? { 
                    skipped: true, 
                    reason: regressionResults.dwTest.reason 
                }
                : {
                    statistic: regressionResults.dwTest.statistic.toFixed(4),
                    interpretation: regressionResults.dwTest.interpretation
                }
        };

        res.json(response);
    } catch (err) {
        console.error('Error calculating regression:', err);
        res.status(500).json({ error: 'Gagal menghitung regresi: ' + err.message });
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

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
