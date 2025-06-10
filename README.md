📱 InstaFood

InstaFood est une application mobile de partage et de consultation de recettes de cuisine, développée en React Native pour le front-end. Elle communique avec une API backend développée en Express.js et utilise une base de données MySQL pour stocker les recettes et les informations utilisateur.

🔧 Technologies utilisées

Frontend :

React Native
Expo
React Navigation
Axios

Backend :

Node.js
Express.js
MySQL

⚙️ Fonctionnalités

✅ Affichage des recettes avec images, ingrédients et étapes
✅ Création de recettes
✅ Authentification des utilisateurs
✅ Communication via API Express
✅ Stockage des données dans MySQL

🚀 Installation et lancement du projet

1. Cloner le dépôt
   
https://github.com/Oceane1803/Projet-React.git /!\ Ne pas oublier de récupérer le serveur d'API dans la branche "backend"

3. Installer les dépendances
   
Frontend :

cd client
npm install

Backend :

cd ../server
npm install

4. Configuration de la base de données
   
Créer une base MySQL nommée instafood (ou autre, selon votre fichier .env)

Créer un fichier .env dans /server avec les variables suivantes :

DB_HOST=localhost
DB_USER=root
DB_PASSWORD=yourpassword
DB_NAME=instafood
PORT=3000

6. Lancer le backend
   
cd server
npm start

8. Lancer l'application mobile
   
cd ../client
npm start
