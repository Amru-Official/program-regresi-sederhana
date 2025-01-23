const express = require('express');
const mysql = require('mysql2');
const ejs = require('ejs');
const { json } = require('body-parser');
const app = express();
const port = 3000;

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '1234',
    database: 'regresi_linier_sederhana_db'
});
// setting tamplate engie
app.set('view engine', 'ejs')
app.set('views','views')

//  common variable of database
const database = 'regresi_linier_sederhana_db'
const table = 'data_regresi'

db.connect((err) => {
    if (err) {
        console.error('Error connecting to the database:', err);
        return;
    }
    console.log('Connected to the MySQL database...');
});

// source code of database mysql

const sqlSelect = 'select * from data_regresi'
db.query(sqlSelect,(err,result)=> {
    console.log(result, 'berhasil')
    app.get('/',(req,res)=> {
        res.render('index.ejs',{result})
    })
})

const sqlInsert = `insert into ${table}(variabel_independent,variabel_dependent) values ()`


app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});