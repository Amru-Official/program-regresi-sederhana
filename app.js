const express = require('express');
const mysql = require('mysql2');
const ejs = require('ejs')
const app = express();
const port = 3000;

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '1234',
    database: 'regresi_linier_sederhana_db'
});

db.connect((err) => {
    if (err) {
        console.error('Error connecting to the database:', err);
        return;
    }
    console.log('Connected to the MySQL database...');
});
const sqlSelect = 'select * from data_regresi'
db.query(sqlSelect,(err,result)=>
console.log('hasil select database', result))

app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});