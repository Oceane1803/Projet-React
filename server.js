<<<<<<< HEAD
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json());

const db = mysql.createConnection({
  host: '172.20.10.13',
  user: 'root',
  password: '',
  database: 'instafood'
});

db.connect((err) => {
  if (err) {
    console.error('Erreur de connexion à la base de données:', err.stack);
    return;
  }
  console.log('Connecté à la base de données MySQL');
});

app.get('/categories', (req, res) => {
  const query = `
    SELECT 
      c.id_categories,
      c.Nom,
      COUNT(r.id_recettes) AS recipe_count
    FROM categories c
    LEFT JOIN recettes r ON r.id_categories = c.id_categories
    GROUP BY c.id_categories, c.Nom
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error('Erreur lors de la récupération des catégories:', err);
      res.status(500).send('Erreur serveur');
    } else {
      res.json(results);
    }
  });
});

app.get('/recettes', (req, res) => {
  db.query('SELECT * FROM recettes', (err, results) => {
    if (err) {
      console.error('Erreur lors de la récupération des recettes:', err);
      res.status(500).send('Erreur serveur');
    } else {
      res.json(results);
    }
  });
});

app.get('/recettes/:id', (req, res) => {
  const recipeId = req.params.id;

  const query = `
    SELECT r.*, c.Nom AS nom_categorie
    FROM recettes r
    LEFT JOIN categories c ON r.id_categories = c.id_categories
    WHERE r.id_recettes = ?
  `;

  db.query(query, [recipeId], (err, results) => {
    if (err) {
      console.error('Erreur SQL:', err);
      res.status(500).json({ error: 'Erreur serveur', details: err.sqlMessage });
      return;
    }
    if (results.length === 0) {
      res.status(404).json({ error: 'Recette non trouvée' });
      return;
    }
    res.json(results[0]);
  });
});

app.get('/recettes/:id/ingredients', (req, res) => {
  const recipeId = req.params.id;

  const query = `
    SELECT 
      i.*,
      ri.Quantite
    FROM ingredients i
    INNER JOIN recette_ingredient ri ON i.id_ingredients = ri.id_ingredients
    WHERE ri.id_recettes = ?
  `;

  db.query(query, [recipeId], (err, results) => {
    if (err) {
      console.error('Erreur SQL:', err);
      return res.status(500).json({ error: 'Erreur serveur', details: err.sqlMessage || err.message });
    }
    res.json(results);
  });
});

app.listen(port, '0.0.0.0', () => {
  console.log(`API en écoute sur http://172.20.10.13:${port}`);
});
=======
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
>>>>>>> 05ba9fac054491f2f205c28a2de97bbc0178cabd
