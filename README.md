# Voisins Connectés - Application Client (Front-end)

## 📝 Présentation du projet
Ce dépôt contient l'interface utilisateur (Front-end) de la plateforme "Voisins Connectés". Pensée pour les habitants de la ville et l'association Lien Urbain, l'application consomme notre API REST pour offrir une expérience fluide, ultra-réactive (SPA) et intuitive.

## 🛠 Technologies Utilisées
* **Framework :** Angular 21 (TypeScript)
* **Stylisation :** TailwindCSS (PostCSS)
* **Tests :** Vitest / JSDOM

## ⚙️ Fonctionnalités Principales (Cahier des charges)
* **Authentification & Profil :** Connexion JWT et gestion du profil avec upload de photo.
* **Tableau de Bord (Kanban) :** Interface visuelle avec **Drag & Drop** pour gérer l'état de ses annonces (*En attente*, *En cours*, *Terminé*).
* **Le Fil d'actualité :** Catalogue dynamique des annonces disponibles.

## 🚀 Fonctionnalités Exclusives & Expérience Utilisateur (UX)
Pour remporter cet appel d'offres, nous avons mis l'accent sur une interface "Premium" et des fonctionnalités inédites pour une plateforme associative :

1. **Expérience UI par "Modales" (Pop-ups) :** Pour éviter les rechargements de page intempestifs, de nombreuses actions (confirmation de suppression, détails rapides, formulaires de réponse) s'ouvrent via des modales élégantes et animées.
2. **Prévisualisation des Images (Upload) :** Lors de la mise à jour de la photo de profil ou de l'ajout d'images, l'utilisateur bénéficie d'une prévisualisation instantanée côté client (via `FileReader`) avant même l'envoi au serveur.
3. **Filtres de Recherche Avancés :** Un système de filtrage multicritères ultra-rapide (par catégories, statuts) pour trouver instantanément l'annonce pertinente dans le fil d'actualité.
4. **Interface de Modération Complète :** Le panel administrateur ne se contente pas de lister les données ; il intègre une interface ergonomique pour le bannissement en un clic et la gestion des utilisateurs problématiques.
5. **Intégration Visuelle des Badges & du Bot :** Restitution graphique sur le profil des récompenses (Badges) gagnées par l'utilisateur, et interface de chat/notification pour communiquer avec le Bot de la plateforme.

## 📦 Installation et Lancement

1. Cloner le dépôt.
2. Installer les dépendances : `npm install`
3. Lancer le serveur de développement : `ng serve`
4. L'application sera accessible sur `http://localhost:4200/`.
5. Pensez à avoir lancé l'API REST au préalable !
