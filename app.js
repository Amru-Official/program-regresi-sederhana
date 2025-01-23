const express = require('express');
const mysql = require('mysql2');
const ejs = require('ejs');
const bodyParser= require('body-parser');
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

// setting for format input use bodyParser
app.use(bodyParser.urlencoded({extended:true}))

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
// select database
const sqlSelect = 'select * from data_regresi'
db.query(sqlSelect,(err,result)=> {
    console.log(result, 'berhasil')
    app.get('/',(req,res)=> {
        res.render('index',{result})
    })
})

// insert database
app.post ('/add',(req,res)=>{
    const sqlInsert = `insert into data_regresi(variabel_independent,variabel_dependent) values ('${req.body.variabel_independent}','${req.body.variabel_dependent}')`
    db.query(sqlInsert,(err,result)=>{
        res.redirect('/')
    })
})

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});