const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;  // Port que tu veux utiliser pour l'API

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Configuration de la connexion MySQL
const db = mysql.createConnection({
  host: 'localhost',  // Adresse de ton serveur MySQL
  user: 'root',       // Utilisateur de ta base de données
  password: '',       // Mot de passe
  database: 'app_recipes' // Nom de ta base de données
});

// Vérifier la connexion à la base de données
db.connect((err) => {
  if (err) {
    console.error('Erreur de connexion à la base de données:', err.stack);
    return;
  }
  console.log('Connecté à la base de données MySQL');
});

// Endpoint pour récupérer toutes les catégories
app.get('/categories', (req, res) => {
  db.query('SELECT * FROM categories', (err, results) => {
    if (err) {
      console.error('Erreur lors de la récupération des catégories:', err);
      res.status(500).send('Erreur serveur');
    } else {
      res.json(results);
    }
  });
});

// Démarrer le serveur
app.listen(port, () => {
  console.log(`API en écoute sur http://localhost:${port}`);
});