<<<<<<< HEAD
require("dotenv").config();
const mysql = require("mysql");

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
});

db.connect(err => {
    if (err) {
        console.error("Erreur de connexion à MySQL : " + err.message);
    } else {
        console.log("Connecté à MySQL !");
    }
});

module.exports = db;
=======
require("dotenv").config();
const mysql = require("mysql");

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
});

db.connect(err => {
    if (err) {
        console.error("Erreur de connexion à MySQL : " + err.message);
    } else {
        console.log("Connecté à MySQL !");
    }
});

module.exports = db;
>>>>>>> 05ba9fac054491f2f205c28a2de97bbc0178cabd
