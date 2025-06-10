const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
const port = 3000;  // Port que tu veux utiliser pour l'API

const jwt = require('jsonwebtoken');
const SECRET_KEY = process.env.JWT_SECRET;

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

// Endpoint pour récupérer toutes les recettes
app.get('/recettes', (req, res) => {
  db.query('SELECT * FROM recettes', (err, results) => {
    if (err) {
      console.error('Erreur lors de la récupération des catégories:', err);
      res.status(500).send('Erreur serveur');
    } else {
      res.json(results);
    }
  });
});

// Endpoint pour récupérer une recette par ID
app.get('/recettes/:id', (req, res) => {
  const recetteId = req.params.id;

  const sql = `
    SELECT 
      r.*,
      c.Nom as nom_categorie,
      i.Nom as ingredient_nom,
      i.image_url as ingredient_image_url,
      ri.Quantité
    FROM recettes r 
    LEFT JOIN categories c ON r.id_categories = c.id_categories 
    LEFT JOIN recette_ingredient ri ON r.id_recettes = ri.id_recettes
    LEFT JOIN ingredients i ON ri.id_ingredients = i.id_ingredients
    WHERE r.id_recettes = ?
  `;

  db.query(sql, [recetteId], (err, results) => {
    if (err) {
      console.error('Erreur lors de la récupération de la recette:', err);
      res.status(500).send('Erreur serveur');
      return;
    }

    if (results.length === 0) {
      res.status(404).send('Recette non trouvée');
      return;
    }

    // Construire l'objet recette avec les ingrédients
    const recette = {
      id_recettes: results[0].id_recettes,
      Nom: results[0].Nom,
      image_url: results[0].image_url,
      Instruction: results[0].Instruction,
      Description: results[0].Description,
      temps_preparation: results[0].temps_preparation,
      id_categories: results[0].id_categories,
      nom_categorie: results[0].nom_categorie || "Non catégorisé",
      ingredients: []
    };

    // Ajouter les ingrédients (éviter les doublons)
    const ingredientsSet = new Set();
    results.forEach(row => {
      if (row.ingredient_nom && !ingredientsSet.has(row.ingredient_nom)) {
        ingredientsSet.add(row.ingredient_nom);
        recette.ingredients.push({
          nom: row.ingredient_nom,
          image_url: row.ingredient_image_url,
          quantite: row.Quantité
        });
      }
    });

    res.json(recette);
  });
});

// Endpoint pour récupérer les ingrédients d'une recette (CORRIGÉ)
app.get('/recettes/:recipeId/ingredients', (req, res) => {
  console.log('Requête reçue pour les ingrédients de la recette:', req.params.recipeId);
  
  const { recipeId } = req.params;
  
  // Validation de l'ID
  if (!recipeId || isNaN(recipeId)) {
    console.log('ID de recette invalide:', recipeId);
    return res.status(400).json({ 
      error: 'ID de recette invalide',
      received: recipeId
    });
  }

  // Requête SQL pour récupérer les ingrédients avec leurs quantités
  const query = `
    SELECT 
      i.id_ingredients,
      i.Nom as nom,
      i.image_url,
      ri.Quantité as quantite
    FROM ingredients i
    INNER JOIN recette_ingredient ri ON i.id_ingredients = ri.id_ingredients
    WHERE ri.id_recettes = ?
    ORDER BY i.Nom ASC
  `;
  
  console.log('Exécution de la requête SQL avec recipeId:', recipeId);
  
  db.query(query, [parseInt(recipeId)], (err, results) => {
    if (err) {
      console.error('Erreur lors de la récupération des ingrédients:', err);
      return res.status(500).json({ 
        error: 'Erreur serveur', 
        message: 'Impossible de récupérer les ingrédients',
        details: err.message
      });
    }
    
    console.log(`${results.length} ingrédients trouvés pour la recette ${recipeId}`);
    console.log('Résultats:', results);
    
    res.json(results);
  });
});

// Endpoint pour récupérer un ingrédient spécifique (CORRIGÉ)
app.get('/ingredients/:ingredientId', (req, res) => {
  console.log('Requête pour l\'ingrédient:', req.params.ingredientId);
  
  const { ingredientId } = req.params;
  
  if (!ingredientId || isNaN(ingredientId)) {
    return res.status(400).json({ 
      error: 'ID d\'ingrédient invalide',
      received: ingredientId
    });
  }

  const query = `
    SELECT 
      id_ingredients,
      Nom as nom,
      image_url
    FROM ingredients 
    WHERE id_ingredients = ?
  `;
  
  db.query(query, [parseInt(ingredientId)], (err, results) => {
    if (err) {
      console.error('Erreur lors de la récupération de l\'ingrédient:', err);
      return res.status(500).json({ 
        error: 'Erreur serveur', 
        message: 'Impossible de récupérer l\'ingrédient',
        details: err.message
      });
    }
    
    if (results.length === 0) {
      return res.status(404).json({ 
        error: 'Ingrédient non trouvé',
        ingredientId: ingredientId
      });
    }
    
    console.log('Ingrédient trouvé:', results[0]);
    res.json(results[0]);
  });
});

// Ajoutez cet endpoint dans votre server.js après les autres endpoints

// Endpoint pour récupérer TOUS les ingrédients
app.get('/ingredients', (req, res) => {
  console.log('Requête pour récupérer tous les ingrédients');
  
  const query = `
    SELECT 
      id_ingredients,
      Nom as nom,
      image_url
    FROM ingredients 
    ORDER BY Nom ASC
  `;
  
  db.query(query, (err, results) => {
    if (err) {
      console.error('Erreur lors de la récupération des ingrédients:', err);
      return res.status(500).json({ 
        error: 'Erreur serveur', 
        message: 'Impossible de récupérer les ingrédients',
        details: err.message
      });
    }
    
    console.log(`${results.length} ingrédients trouvés`);
    console.log('Premiers résultats:', results.slice(0, 3)); // Affiche les 3 premiers pour debug
    
    // Adapter le format pour correspondre à ce qui est attendu côté client
    const formattedResults = results.map(ingredient => ({
      id: ingredient.id_ingredients,
      name: ingredient.nom,
      image_url: ingredient.image_url
    }));
    
    res.json(formattedResults);
  });
});

// Endpoint pour ajouter une recette complète avec ingrédients
app.post('/recipes/full', authenticateToken, (req, res) => {
  console.log('Requête pour ajouter une recette complète');
  console.log('Données reçues:', req.body);
  
  const { 
    title, 
    instructions, 
    description, 
    prepTime, 
    imageUrl, 
    categoryId, 
    ingredients 
  } = req.body;
  
  // Validation des données
  if (!title || !instructions || !ingredients || ingredients.length === 0) {
    return res.status(400).json({ 
      error: 'Données manquantes', 
      message: 'Titre, instructions et au moins un ingrédient sont requis' 
    });
  }
  
  // Commencer une transaction
  db.beginTransaction((err) => {
    if (err) {
      console.error('Erreur lors du début de transaction:', err);
      return res.status(500).json({ error: 'Erreur serveur' });
    }
    
    // 1. Insérer la recette
    const recipeQuery = `
      INSERT INTO recettes (Nom, Instruction, Description, temps_preparation, image_url, id_categories)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    
    const recipeValues = [
      title,
      instructions,
      description || null,
      prepTime || null,
      imageUrl || null,
      categoryId || null
    ];
    
    db.query(recipeQuery, recipeValues, (err, recipeResult) => {
      if (err) {
        console.error('Erreur lors de l\'insertion de la recette:', err);
        return db.rollback(() => {
          res.status(500).json({ error: 'Erreur lors de l\'ajout de la recette' });
        });
      }
      
      const recipeId = recipeResult.insertId;
      console.log('Recette ajoutée avec ID:', recipeId);
      
      // 2. Traiter les ingrédients
      let processedIngredients = 0;
      const totalIngredients = ingredients.length;
      
      if (totalIngredients === 0) {
        // Commit si pas d'ingrédients (ne devrait pas arriver vu la validation)
        return db.commit((err) => {
          if (err) {
            return db.rollback(() => {
              res.status(500).json({ error: 'Erreur lors de la validation' });
            });
          }
          res.json({ message: 'Recette ajoutée avec succès', recipeId });
        });
      }
      
      let responseSent = false;

      function sendResponseOnce(status, body) {
        if (!responseSent) {
          responseSent = true;
          res.status(status).json(body);
        }
      }


      ingredients.forEach((ingredient, index) => {
        if (ingredient.isNew) {
          // Ajouter un nouvel ingrédient
          const newIngredientQuery = `
            INSERT INTO ingredients (Nom, image_url)
            VALUES (?, ?)
          `;
          
          db.query(newIngredientQuery, [ingredient.name, ingredient.image_url || null], (err, ingredientResult) => {
            if (err) {
              console.error('Erreur lors de l\'ajout du nouvel ingrédient:', err);
              return db.rollback(() => {
                sendResponseOnce(500, { error: 'Erreur lors de l\'ajout d\'un ingrédient' });
              });
            }
            
            const ingredientId = ingredientResult.insertId;
            addRecipeIngredientRelation(recipeId, ingredientId, ingredient.quantity);
          });
        } else {
          // Utiliser un ingrédient existant
          addRecipeIngredientRelation(recipeId, ingredient.id, ingredient.quantity);
        }
      });
      
      function addRecipeIngredientRelation(recipeId, ingredientId, quantity) {
        const relationQuery = `
          INSERT INTO recette_ingredient (id_recettes, id_ingredients, Quantité)
          VALUES (?, ?, ?)
        `;
        
        db.query(relationQuery, [recipeId, ingredientId, quantity], (err) => {
          if (err) {
            console.error('Erreur lors de l\'ajout de la relation recette-ingrédient:', err);
            return db.rollback(() => {
              sendResponseOnce(500, { error: 'Erreur lors de l\'ajout d\'un ingrédient' });
            });
          }
          
          processedIngredients++;
          console.log(`Ingrédient ${processedIngredients}/${totalIngredients} traité`);
          
          if (processedIngredients === totalIngredients) {
            // Tous les ingrédients ont été traités
            db.commit((err) => {
              if (err) {
                console.error('Erreur lors du commit:', err);
                return db.rollback(() => {
                  sendResponseOnce(500, { error: 'Erreur lors de la finalisation' });
                });
              }
              
              console.log('Recette complète ajoutée avec succès');
              sendResponseOnce(200, {
                message: 'Recette ajoutée avec succès',
                recipeId,
                ingredientsCount: totalIngredients
              });
            });
          }
        });
      }
    });
  });
});

// Middleware d'authentification (à ajouter si pas déjà présent)
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token d\'accès requis' });
  }

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Token invalide' });
    }
    req.user = user;
    next();
  });
}

// Endpoint de test
app.get('/test', (req, res) => {
  res.json({ 
    message: 'API fonctionne correctement',
    timestamp: new Date().toISOString(),
    database: 'app_recipes'
  });
});

// Endpoint de debug pour vérifier les tables
app.get('/debug/tables', (req, res) => {
  const queries = [
    'DESCRIBE ingredients',
    'DESCRIBE recette_ingredient', 
    'SELECT COUNT(*) as count FROM ingredients',
    'SELECT COUNT(*) as count FROM recette_ingredient'
  ];
  
  const results = {};
  let completed = 0;
  
  queries.forEach((query, index) => {
    db.query(query, (err, result) => {
      if (err) {
        results[`query_${index}`] = { error: err.message };
      } else {
        results[`query_${index}`] = { query, result };
      }
      
      completed++;
      if (completed === queries.length) {
        res.json(results);
      }
    });
  });
});

// Endpoint pour tester une recette spécifique
app.get('/debug/recette/:id/ingredients', (req, res) => {
  const recipeId = req.params.id;
  
  const query = `
    SELECT 
      ri.id_recettes,
      ri.id_ingredients,
      ri.Quantité,
      i.Nom as ingredient_nom,
      i.image_url
    FROM recette_ingredient ri
    LEFT JOIN ingredients i ON ri.id_ingredients = i.id_ingredients
    WHERE ri.id_recettes = ?
  `;
  
  db.query(query, [recipeId], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    
    res.json({
      recipeId: recipeId,
      count: results.length,
      ingredients: results
    });
  });
});

const bcrypt = require('bcrypt');

app.post('/register', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email et mot de passe requis' });
  }

  try {
    const hash = await bcrypt.hash(password, 10);

    db.query('INSERT INTO users (email, password_hash) VALUES (?, ?)', [email, hash], (err, result) => {
      if (err) {
        if (err.code === 'ER_DUP_ENTRY') {
          return res.status(409).json({ error: 'Cet email est déjà utilisé' });
        }
        return res.status(500).json({ error: 'Erreur serveur' });
      }
      res.status(201).json({ message: 'Utilisateur créé avec succès' });
    });
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

app.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email et mot de passe requis' });
  }

  db.query('SELECT * FROM users WHERE email = ?', [email], async (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Erreur serveur' });
    }

    if (results.length === 0) {
      return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
    }

    const user = results[0];
    const validPassword = await bcrypt.compare(password, user.password_hash);

    if (!validPassword) {
      return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
    }

    // Création du token
    const token = jwt.sign(
      { id: user.id, email: user.email },
      SECRET_KEY,
      { expiresIn: '1h' } // Durée de validité du token
    );

    res.json({
      message: 'Connexion réussie',
      token,
      user: {
        id: user.id,
        email: user.email
      }
    });
  });
});


// Démarrer le serveur
app.listen(port, () => {
  console.log(`API en écoute sur http://localhost:${port}`);
});