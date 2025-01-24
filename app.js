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
const table = 'regression_data'

db.connect((err) => {
    if (err) {
        console.error('Error connecting to the database:', err);
        return;
    }
    console.log('Connected to the MySQL database...');
});

// source code of database mysql
// select database
app.get('/',(req,res)=> {
    const sqlSelect = `select * from regression_data`
    db.query(sqlSelect,(err,result)=> {
        console.log(result, 'berhasil')        
        res.render('index',{result})
    })
})

// insert database
app.post ('/add',(req,res)=>{
    const sqlInsert = `insert into regression_data(independent_variable,dependent_variable) values ('${req.body.independent_variable}','${req.body.dependent_variable}')`
    db.query(sqlInsert,(err,result)=>{
        res.redirect('/')
    })
})
// delete data
app.post ('/delete',(req,res)=>{
    const sqlDelete = `delete from regression_data where data_id=${req.body.data_id}`
    db.query (sqlDelete,(err,result)=>{
        if (err) {
            console.log(err)
        }
        res.redirect('/')
    })
})

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});