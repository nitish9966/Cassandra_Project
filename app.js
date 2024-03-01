// app.js
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const { Client } = require('cassandra-driver');

const app = express();
const port = 3000;

const client = new Client({
    contactPoints: ['localhost'], // Update with your Cassandra cluster information
    localDataCenter: 'datacenter1',
    keyspace: 'nitish',
});

app.use(express.static(path.join(__dirname, 'public')));

// Set 'views' directory for EJS templates
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Parse request body
app.use(bodyParser.urlencoded({ extended: true }));


// Routes
app.get('/register', (req, res) => {
    res.render('register');
});

app.post('/register', async (req, res) => {
    const { username, email, password } = req.body;

    // Insert user data into Cassandra database
    const query = 'INSERT INTO user (username, email, password) VALUES (?, ?, ?)';
    await client.execute(query, [username, email, password], { prepare: true });

    res.redirect('/login');
});

app.get('/login', (req, res) => {
    res.render('login');
});

// app.js
// ...

app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    // Query user data from Cassandra database with email
    const query = 'SELECT * FROM user WHERE email = ? AND password = ? ALLOW FILTERING';
    const result = await client.execute(query, [email, password], { prepare: true });

    if (result.rows.length > 0) {
        res.render('dashboard', { username: result.rows[0].username });
    } else {
        res.redirect('/login');
    }
});
// ...


app.get('/logout', (req, res) => {
    res.redirect('/login');
});

// Start server
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
