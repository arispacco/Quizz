# Cahier des charges — Application Mobile "Le Jeu"

---

## 1. Présentation du projet

### 1.1 Contexte
"Le Jeu" est une application mobile de culture générale et de stratégie basée sur deux mécanismes originaux : l'**Échange** et l'**Enchère**. L'application est la plateforme numérique officielle du jeu, conçue pour un usage grand public.

### 1.2 Objectifs
- Offrir une expérience de jeu fluide dans trois modes de connexion
- Permettre la création et le partage de contenu par les utilisateurs
- Proposer un système de compétition structuré avec classement global
- Intégrer une dimension sociale (amis, clubs, spectateurs)
- Être accessible sur iOS et Android

### 1.3 Stack technique
| Composant | Technologie |
|-----------|-------------|
| Framework mobile | React Native CLI |
| Plateformes | iOS et Android |
| Temps réel | Firebase Realtime Database |
| Authentification | Firebase Auth |
| Génération de questions | IA (API externe) |
| Stockage hors ligne | SQLite / AsyncStorage |

---

## 2. Comptes et profils utilisateurs

### 2.1 Compte obligatoire
Tout accès à l'application nécessite un compte utilisateur. Aucun mode invité n'est disponible.

### 2.2 Inscription / Connexion
- Inscription par email + mot de passe
- Connexion via Google ou Apple
- Récupération de mot de passe par email

### 2.3 Profil public
Chaque compte dispose d'un profil public comprenant :
- Pseudo et avatar personnalisable
- Titre actif (débloqué via XP)
- Niveau XP et barre de progression
- Classement ELO
- Statistiques globales (victoires, défaites, ratio)
- Statistiques par mode (Échange / Enchère)
- Thèmes de prédilection
- Valeur actuelle (dans le contexte des tournois)
- Historique des parties
- Packs de questions créés et publiés
- Nombre d'abonnés / abonnements
- Club(s) d'appartenance

---

## 3. Modes de connexion

### 3.1 Mode En ligne
- Connexion internet requise
- Matchmaking entre joueurs distants
- Classement ELO global actif
- Accès à la bibliothèque complète de packs
- Spectateurs autorisés

### 3.2 Mode Local (LAN)
- Connexion internet non requise
- Joueurs connectés sur le même réseau Wi-Fi
- Un joueur crée la salle, les autres rejoignent via un code
- Classement ELO non affecté
- Seuls les packs téléchargés au préalable sont disponibles
- Spectateurs autorisés sur le même réseau

### 3.3 Mode Mono-appareil
- Un seul téléphone tenu par un arbitre
- Les joueurs et équipes jouent à tour de rôle devant l'écran
- Aucune connexion requise
- Classement ELO non affecté
- Seuls les packs téléchargés au préalable sont disponibles
- Pas de spectateurs distants

---

## 4. Formats de jeu

### 4.1 Tournoi
- Équipes avec représentants tournants
- Chaque équipe fournit sa propre banque de questions
- Jetons et mercato actifs
- Trois sous-formats : élimination directe, double élimination, poules + élimination directe

### 4.2 Face-to-face
- Deux joueurs seuls, sans équipe
- Questions issues des packs préchargés ou générées en temps réel par l'IA
- ELO actif en mode En ligne
- Pas de mercato

### 4.3 All-team
- Toute l'équipe participe à chaque tour
- Porte-parole désigné librement par l'équipe
- Chaque équipe fournit sa propre banque de questions
- Pas de mercato

---

## 5. Paramétrage d'une partie

| Paramètre | Description |
|-----------|-------------|
| Format de jeu | Tournoi / Face-to-face / All-team |
| Mode de connexion | En ligne / Local / Mono-appareil |
| Format du tournoi | Élimination directe / Double / Poules |
| Nombre d'équipes | Configurable |
| Nombre de joueurs par équipe | Configurable |
| Thèmes de la compétition | Sélectionnés parmi les packs disponibles |
| Progression des thèmes | Association thème → phase du tournoi |
| Temps imparti en Échange | Configurable en secondes (par tour de parole) |
| Temps imparti en Enchère | Configurable en secondes (pour la réponse finale) |
| Visibilité aux spectateurs | Activé / désactivé |

---

## 6. Contenu — Les packs de questions

### 6.1 Packs intégrés
L'application est livrée avec des packs préchargés couvrant des sujets variés, disponibles hors connexion par défaut.

### 6.2 Bibliothèque communautaire
Une bibliothèque en ligne permet de parcourir, rechercher et télécharger les packs publiés par la communauté. Les packs téléchargés sont disponibles hors connexion.

### 6.3 Création manuelle
L'utilisateur crée ses questions via un éditeur dédié. Chaque question comprend :
- L'intitulé de la question
- Le thème associé
- Le niveau de difficulté
- Les réponses valides attendues
- Un fichier audio optionnel

### 6.4 Création assistée par fichiers sources
L'utilisateur importe des fichiers sources (documents texte, fichiers audio) et le système génère automatiquement des questions à partir du contenu, à la manière de NotebookLM. L'utilisateur révise et valide les questions générées avant publication.

### 6.5 Visibilité d'un pack
- **Privé** — usage personnel uniquement
- **Public** — publié dans la bibliothèque communautaire

La visibilité est modifiable à tout moment par le créateur.

---

## 7. Système de Jetons

Les Jetons sont la monnaie individuelle du jeu, gagnés par la performance et dépensés pour des avantages stratégiques en Tournoi.

### Gains
| Action | Jetons |
|--------|--------|
| Gagner un tour dans un duel | +1 |
| Gagner un duel (poules) | +1 bonus |
| Gagner un duel (quarts) | +2 bonus |
| Gagner un duel (demies) | +3 bonus |
| Gagner un duel (finale) | +5 bonus |
| Enchère gagnée avec annonce élevée | +1 bonus |
| Thème plus large que la phase + victoire | +1 bonus |

### Dépenses
| Action | Coût |
|--------|------|
| Accès aux quarts de finale | 2 jetons |
| Accès aux demi-finales | 4 jetons |
| Accès à la finale | 6 jetons |
| Rachat d'un joueur (mercato) | valeur du joueur |

---

## 8. Dimension sociale

### 8.1 Amis / Abonnements
- Système follow / follower (abonnement unilatéral)
- Système d'amis (abonnement mutuel)
- Fil d'activité des personnes suivies (parties jouées, tournois rejoints, packs publiés)
- Invitation d'amis à rejoindre une partie

### 8.2 Clubs
- Création et gestion de clubs
- Membres, administrateurs, rôles
- Espace de discussion interne
- Organisation de tournois privés entre membres
- Page publique du club avec classement interne

### 8.3 Spectateurs
- En mode En ligne et Local, une partie peut être ouverte aux spectateurs
- Les spectateurs suivent la partie en temps réel (chrono, scores, bracket)
- Les spectateurs ne peuvent pas interagir avec le déroulement de la partie
- Lien de partage généré pour inviter des spectateurs

---

## 9. Classement et progression

### 9.1 ELO
Classement compétitif global, actif uniquement en mode En ligne. Mis à jour après chaque partie.

### 9.2 XP et niveaux
Système de progression actif dans tous les modes. Récompense l'assiduité. Débloque des titres et éléments de personnalisation (avatars, cadres de profil, thèmes visuels).

---

## 10. Liste des écrans

### Authentification
- Écran de bienvenue
- Connexion (email / Google / Apple)
- Inscription
- Récupération de mot de passe

### Navigation principale (onglets)
- Accueil
- Explorer (bibliothèque de packs, tournois en cours)
- Créer (partie ou pack)
- Social (amis, clubs, activité)
- Profil

### Profil
- Profil personnel et profil public d'un autre joueur
- Statistiques, historique, packs, abonnés

### Social
- Liste d'amis / abonnements / abonnés
- Recherche d'utilisateurs
- Page d'un club
- Création / gestion d'un club
- Fil d'activité

### Création et paramétrage de partie
- Sélection du format et du mode de connexion
- Configuration des équipes et joueurs
- Sélection des packs et thèmes
- Paramétrage des chronos et options

### Lobby
- Salle d'attente avant la partie
- Équipes et joueurs connectés
- Code de salle (mode Local)
- Lien spectateurs

### Tournoi
- Bracket interactif temps réel
- Scores et progression
- Statut du mercato

### Duel
- Affichage du tour en cours
- Choix du mode et du thème
- Interface Échange (tour à tour + chrono individuel)
- Interface Enchère (phase d'enchères + chrono final)
- Validation des réponses

### Résultat de duel
- Résultat et Jetons gagnés
- Passage au duel suivant ou au mercato

### Mercato
- Joueurs disponibles au rachat
- Valeur de chaque joueur
- Confirmation d'achat

### Vue spectateur
- Bracket, chrono, scores en temps réel
- Indicateur de mode en cours (Échange / Enchère)

### Bibliothèque de packs
- Parcourir, rechercher, filtrer
- Télécharger pour usage hors ligne
- Fiche détaillée d'un pack

### Création de packs
- Éditeur de questions manuel
- Import de fichiers sources (texte / audio)
- Révision des questions générées par l'IA
- Gestion de la visibilité

### Paramètres
- Compte et sécurité
- Préférences de l'application
- Thème visuel (clair / sombre)
- Gestion des packs téléchargés
- Notifications

---

## 11. Contraintes techniques

| Contrainte | Détail |
|------------|--------|
| Framework | React Native CLI (pas Expo) |
| Plateformes | iOS et Android |
| Temps réel | Firebase Realtime Database |
| Hors ligne | Packs téléchargés accessibles sans connexion |
| Audio | Support des fichiers audio dans les questions et à l'import |
| Génération de contenu | IA intégrée pour création assistée depuis fichiers sources |
| Réseau local | Découverte et communication pair-à-pair sur LAN |

---

## 12. Points en suspens

- Nom définitif de l'application
- Nom définitif des Jetons
- Liste des titres et cosmétiques débloquables par XP
- Modèle économique (gratuit, freemium, packs payants)
- Politique de modération des packs communautaires

---

*Document vivant*
