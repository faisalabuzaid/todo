'use strict';

const express = require('express');
const pg = require('pg');
const methodOverride = require('method-override');
const cors = require('cors');
const path = require('path');
const { response, query } = require('express');
const { render } = require('ejs');

// Environment variables
require('dotenv').config();

// Application Setup
const app = express();
const PORT = process.env.PORT || 3000;

// Express middleware
// Utilize ExpressJS functionality to parse the body of the request
app.use(express.urlencoded({ extended:true}));

// Specify a directory for static resources
app.use(express.static(path.join(__dirname, 'public')));

// define our method-override reference
app.use(methodOverride('_method'));
// Set the view engine for server-side templating
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
// Use app cors
app.use(cors());


// Database Setup
const client = new pg.Client(process.env.DATABASE_URL);

app.get('/', renderHome);
app.get('/new', renderNew);
app.post('/new', addTask);
app.get('/edit/:id', renderEdit);
app.put('/edit/:id', editTask);
app.delete('/delete/:id', deleteTask);
app.get('/indv/:id', renderInd);


function renderHome (req, res) {
    const SQL = 'select * from list';
    client.query(SQL).then(data => {
        if (data.rows) {
            res.render('index', {'data':data.rows} )
        } else { res.send('You have no tasks yet')}
        });
}


function renderNew (req, res) {
    res.render('new')
}

function addTask (req, res) {
    const SQL = 'insert into list(name, description, status) values ($1, $2, $3)';
    const {name, description, status}=req.body;
    client.query(SQL, [name, description, status]).then(data => {
      res.redirect('/');
        });
}

function renderInd (req, res) {
    console.log('ind req', req.params.id);
    const SQL='select * from list where id=$1';
    client.query(SQL, [req.params.id]).then(data => {
        console.log(data.rows);
        res.render('indv', {'data':data.rows[0]})
    })
}

function renderEdit (req, res) {
    const SQL = 'select * from list where id=$1';
    client.query(SQL, [req.params.id]).then(data => {
        console.log(data.rows);
            res.render('edit', {'data':data.rows[0]} );
        });
}


function editTask (req, res) {
    const id = req.params.id;
    const {name, description, status}=req.body;
    const SQL = 'UPDATE list SET name=$1, description=$2, status=$3  where id=$4';
    client.query(SQL, [name, description, status, id]).then(data => {
        res.redirect(`/edit/${id}`);
    })
}

function deleteTask (req, res) {
    const id = req.params.id;
    const SQL='delete from list where id=$1';
    client.query(SQL, [id]).then(() => {
        res.redirect('../');

    });

}

// app start point
client.connect().then(() =>
    app.listen(PORT, () => console.log(`Listening on port: ${PORT}`))
);
