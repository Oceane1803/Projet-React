const bcrypt = require('bcrypt');
const mysql = require('mysql2/promise');

async function addUser(email, password) {
  const conn = await mysql.createConnection({host:'localhost', user:'root', database:'app_recipes'});
  const hash = await bcrypt.hash(password, 10);
  await conn.execute('INSERT INTO users (email, password_hash) VALUES (?, ?)', [email, hash]);
  await conn.end();
  console.log(`Utilisateur ${email} ajouté avec succès.`);
}

// Usage
addUser('bettaffardoceane@hotmail.com', 'Decembre2004!')
  .catch(err => {
    console.error("Erreur lors de l'ajout de l'utilisateur :", err);
  });