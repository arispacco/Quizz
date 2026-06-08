# Design — Application Mobile "Le Jeu"

---

## 1. Identité visuelle

### 1.1 Philosophie
L'identité visuelle du Jeu repose sur un contraste fort entre **énergie et lisibilité**. L'application est arc-en-ciel — colorée, vivante, expressive — mais jamais au détriment de la clarté. La couleur est utilisée comme **langage** : chaque mode de jeu, chaque thème, chaque action stratégique a sa teinte.

### 1.2 Thèmes
L'application propose deux thèmes, switchables à tout moment depuis les paramètres :

| | **Thème sombre** *(défaut)* | **Thème clair* |
|---|---|---|
| Fond principal | `#0D0D0D` | `#F5F5F5` |
| Fond secondaire (cartes) | `#1A1A1A` | `#FFFFFF` |
| Texte principal | `#FFFFFF` | `#111111` |
| Texte secondaire | `#A0A0A0` | `#555555` |
| Bordures | `#2A2A2A` | `#E0E0E0` |

### 1.3 Palette arc-en-ciel
Les couleurs vives sont utilisées pour les accents, les modes de jeu, les thèmes et les actions. Elles s'appliquent sur fonds sombres ou clairs via des dégradés lumineux.

| Rôle | Couleur | Hex |
|------|---------|-----|
| Primaire / action principale | Violet électrique | `#7C3AED` |
| Mode Échange | Bleu cyan | `#06B6D4` |
| Mode Enchère | Orange feu | `#F97316` |
| Victoire / succès | Vert émeraude | `#10B981` |
| Défaite / danger | Rouge corail | `#EF4444` |
| Jetons | Or | `#F59E0B` |
| ELO / classement | Bleu roi | `#3B82F6` |
| XP / progression | Rose magenta | `#EC4899` |
| Clubs | Vert lime | `#84CC16` |
| Spectateurs | Gris argenté | `#94A3B8` |

Les dégradés arc-en-ciel (violet → cyan → vert → or) sont utilisés pour les éléments premium : bannières de profil, cadres de titre, écrans de victoire.

### 1.4 Typographie
| Usage | Police | Style |
|-------|--------|-------|
| Titres / scores | **Rajdhani** | Bold, espacé |
| Corps / descriptions | **Inter** | Regular / Medium |
| Chrono / chiffres | **Roboto Mono** | Bold |
| Titres décoratifs | **Bebas Neue** | Uppercase |

### 1.5 Icônes et illustrations
- Icônes : bibliothèque **Phosphor Icons** (style outline, cohérent et léger)
- Illustrations : style flat géométrique avec teintes de la palette arc-en-ciel
- Avatars : système de génération par initiales + couleur assignée, ou upload personnalisé

---

## 2. Composants globaux

### 2.1 Boutons
| Type | Apparence |
|------|-----------|
| Primaire | Fond violet `#7C3AED`, texte blanc, coins arrondis `12px` |
| Secondaire | Contour violet, fond transparent, texte violet |
| Danger | Fond rouge corail `#EF4444` |
| Désactivé | Fond `#2A2A2A`, texte `#555` |
| Action dorée (Jetons) | Dégradé or `#F59E0B` → `#D97706` |

### 2.2 Cartes
Fond secondaire, coins `16px`, ombre légère. En thème sombre : légère lueur colorée sur la bordure selon le contexte (cyan pour Échange, orange pour Enchère, or pour Jetons).

### 2.3 Chrono
Cercle de progression animé. Couleur verte au départ, passe à orange à 50%, rouge à 20%. Chiffres en Roboto Mono Bold, grand format, centré.

### 2.4 Badges et étiquettes
Pills arrondies `(8px)` colorées selon la palette. Utilisées pour les thèmes, modes, niveaux de difficulté.

### 2.5 Notifications et toasts
Apparaissent en haut de l'écran. Fond semi-transparent teinté selon le type (vert succès, rouge erreur, or information).

---

## 3. Écrans — Authentification

### 3.1 Écran de bienvenue
- Fond sombre avec dégradé arc-en-ciel subtil en arrière-plan (mesh gradient)
- Logo centré avec animation d'entrée (scale + fade)
- Tagline sous le logo
- Bouton **"Commencer"** primaire
- Lien **"J'ai déjà un compte"**

### 3.2 Inscription
- Champs : pseudo, email, mot de passe, confirmation
- Boutons OAuth : **Continuer avec Google**, **Continuer avec Apple**
- Indicateur de force du mot de passe (barre colorée)
- Lien vers les CGU

### 3.3 Connexion
- Champs : email, mot de passe
- Bouton **"Mot de passe oublié"**
- Boutons OAuth Google / Apple
- Lien vers l'inscription

---

## 4. Navigation principale

Navigation par **barre d'onglets en bas** avec 5 onglets :

| Onglet | Icône | Label |
|--------|-------|-------|
| Accueil | Maison | Accueil |
| Explorer | Boussole | Explorer |
| Créer | `+` dans un cercle violet | Créer |
| Social | Personnes | Social |
| Profil | Avatar | Moi |

L'onglet actif est mis en valeur par la couleur primaire violette. L'onglet Créer est légèrement surélevé et plus grand — point d'entrée principal.

---

## 5. Écrans — Accueil

- **En-tête** : "Bonjour [pseudo] 👋" + avatar cliquable + icône notifications
- **Carte de reprise** : si une partie est en cours, carte en haut avec CTA "Reprendre"
- **Section "Jouer maintenant"** : trois boutons colorés — Tournoi (violet), Face-to-face (cyan), All-team (vert)
- **Section "Activité"** : fil des actions récentes des personnes suivies (partie jouée, pack publié, tournoi créé)
- **Section "Tournois en cours"** : cartes horizontales scrollables des tournois publics actifs avec bouton "Regarder" pour les rejoindre en spectateur
- **Section "Packs populaires"** : cartes de packs mis en avant

---

## 6. Écrans — Explorer

- **Barre de recherche** en haut (recherche packs, joueurs, clubs, tournois)
- **Filtres** : Packs / Joueurs / Clubs / Tournois en cours
- **Packs** : grille de cartes avec nom du pack, thème, nombre de questions, auteur, note communautaire, badge "Téléchargé" si disponible hors ligne
- **Tournois en cours** : liste avec équipes participantes, phase actuelle, bouton "Spectateur"
- **Joueurs** : cards avec pseudo, ELO, niveau, bouton Follow
- **Clubs** : cards avec nom, membres, activité récente

---

## 7. Écrans — Création

### 7.1 Hub de création
Deux options :
- **Créer une partie** → paramétrage
- **Créer un pack** → éditeur

### 7.2 Paramétrage d'une partie
Écran multi-étapes (stepper en haut) :

**Étape 1 — Format**
- Sélecteur visuel : Tournoi / Face-to-face / All-team (cartes illustrées)
- Sélecteur de connexion : En ligne / Local / Mono-appareil

**Étape 2 — Équipes et joueurs**
- Nombre d'équipes (stepper numérique)
- Nom et couleur de chaque équipe
- Ajout des joueurs par pseudo ou invitation

**Étape 3 — Packs et thèmes**
- Sélection des packs depuis la bibliothèque
- Association thème → phase du tournoi (drag & drop ou liste ordonnée)

**Étape 4 — Chrono et options**
- Slider : temps par tour en Échange (5s → 120s)
- Slider : temps en Enchère (15s → 300s)
- Toggle : spectateurs autorisés
- Format du tournoi (si Tournoi) : élimination directe / double / poules

**Étape 5 — Récapitulatif**
- Résumé de tous les paramètres
- Bouton **"Lancer la partie"**

### 7.3 Création de pack — Éditeur manuel
- Nom du pack, thème principal, description, visuel de couverture
- Liste des questions existantes + bouton **"Ajouter une question"**
- Formulaire par question : intitulé, thème, difficulté (1-5 étoiles), réponses valides (tags), audio optionnel (enregistrement ou import)
- Toggle visibilité : Privé / Public

### 7.4 Création de pack — Import de fichiers sources
- Zone de dépôt de fichiers (texte ou audio)
- Indicateur de progression de l'analyse IA
- Liste des questions générées, chacune éditable
- Validation globale avant enregistrement

---

## 8. Écrans — Social

### 8.1 Onglet Amis
- Onglets internes : **Amis** / **Abonnements** / **Abonnés**
- Chaque entrée : avatar, pseudo, ELO, statut en ligne, bouton action (Suivre / Message / Inviter)
- Bouton **"Trouver des joueurs"** → recherche globale

### 8.2 Onglet Clubs
- Liste des clubs rejoints
- Bouton **"Rejoindre un club"** et **"Créer un club"**

### 8.3 Page d'un club
- Bannière + logo + nom + description
- Membres (liste + rôles)
- Classement interne des membres
- Tournois passés et à venir
- Bouton **"Rejoindre"** / **"Quitter"**

### 8.4 Création d'un club
- Nom, description, logo, couleur du club
- Règles d'accès : ouvert / sur invitation

---

## 9. Écrans — Profil

### 9.1 Profil personnel
- **En-tête** : bannière arc-en-ciel (personnalisable), avatar, pseudo, titre actif
- **Stats rapides** : ELO, niveau XP, victoires, ratio
- **Onglets** : Stats / Historique / Packs / Clubs
- **Stats** : graphiques par mode (Échange vs Enchère), thèmes forts, évolution ELO
- **Historique** : liste des parties avec résultat, adversaire, date
- **Packs** : grille des packs créés
- **Clubs** : liste des clubs

### 9.2 Profil public d'un autre joueur
Identique au profil personnel mais avec :
- Bouton **"Suivre"** / **"Inviter en amis"**
- Bouton **"Défier"** (lance un Face-to-face)
- Valeur actuelle (si tournoi en cours)

---

## 10. Écrans — Lobby

- Code de salle affiché en grand (mode Local)
- Lien spectateurs (bouton copier)
- Liste des équipes et joueurs connectés avec statut (✅ prêt / ⏳ en attente)
- Bouton **"Prêt"** pour chaque joueur
- L'organisateur voit un bouton **"Lancer"** (actif quand tous sont prêts)
- Compte à rebours d'inactivité si un joueur tarde

---

## 11. Écrans — Déroulement du jeu

### 11.1 Écran de duel — Choix stratégique
- En haut : noms et avatars des deux représentants face à face
- Bandeau central : "Au tour de [Joueur A] de choisir"
- **Choix du mode** : deux grandes cartes — Échange (cyan) / Enchère (orange)
- **Choix du thème** : liste des thèmes disponibles pour la phase (badges colorés)
- Bouton **"Confirmer"**

### 11.2 Écran Échange
- Question affichée en grand au centre
- Indicateur du joueur actif (avatar mis en avant)
- **Chrono individuel** : cercle animé, couleur dégradée selon temps restant
- Historique des réponses données (liste scrollable en bas)
- Bouton arbitre : ✅ Réponse valide / ❌ Invalide / ⏭ Passer (temps écoulé)
- Animation de transition entre les tours (slide gauche/droite)

### 11.3 Écran Enchère
**Phase 1 — Les enchères**
- Question affichée
- Indicateur du joueur actif
- Enchère actuelle affichée en grand (chiffre doré)
- Bouton **"Surenchérir"** → champ numérique
- Bouton **"Se coucher"** → rouge, confirmation requise
- Historique des enchères

**Phase 2 — La réponse**
- Annonce du gagnant de l'enchère avec animation
- **Grand chrono** central (Roboto Mono, rouge pulsant sous 10s)
- Compteur de réponses données / attendues
- Bouton arbitre : ✅ Réponse valide / ❌ Invalide
- Résultat automatique à la fin du chrono

### 11.4 Écran de résultat de tour
- Animation victoire (confettis arc-en-ciel) ou défaite (écran qui s'assombrit)
- Score du duel mis à jour (ex. 1 - 0)
- Jetons gagnés par le vainqueur (+X 🟡)
- Bouton **"Tour suivant"** (arbitre uniquement)

### 11.5 Écran de résultat de duel
- Vainqueur mis en avant (grande animation)
- Récap des tours
- Jetons gagnés par chaque joueur
- Bouton **"Retour au bracket"**

---

## 12. Écrans — Tournoi

### 12.1 Bracket
- Vue scrollable du bracket complet
- Chaque case : logos/couleurs des équipes, score, statut (en cours / terminé / à venir)
- Duel en cours mis en surbrillance avec animation pulsante
- Bouton **"Voir le duel"** sur le match actif

### 12.2 Mercato
- Titre : "Fenêtre de mercato — avant les [quarts / demies / finale]"
- Liste des joueurs disponibles : avatar, pseudo, valeur en Jetons, stats clés
- Bouton **"Recruter"** → confirmation avec décompte des Jetons
- Compte à rebours de fermeture du mercato

---

## 13. Écran Spectateur

- Vue en lecture seule, identique à la vue joueur mais sans boutons d'action
- Indicateur **"👁 LIVE"** en rouge pulsant
- Nombre de spectateurs actuels
- Chrono et scores mis à jour en temps réel
- Bracket accessible via onglet

---

## 14. Écrans — Bibliothèque de packs

### 14.1 Liste
- Barre de recherche + filtres (thème, difficulté, langue, téléchargé)
- Cartes de packs : visuel, nom, thème (badge coloré), nombre de questions, auteur, note (étoiles), bouton télécharger / supprimer

### 14.2 Fiche d'un pack
- Visuel de couverture pleine largeur
- Nom, auteur (cliquable → profil), date, thème, difficulté moyenne
- Description
- Aperçu de quelques questions (3-5)
- Bouton **"Télécharger"** ou **"Supprimer du téléphone"**
- Bouton **"Utiliser dans une partie"**
- Note communautaire + commentaires

---

## 15. Écrans — Paramètres

### 15.1 Liste des sections
- **Compte** : email, mot de passe, suppression du compte
- **Profil** : pseudo, avatar, bannière, titre actif
- **Apparence** : thème (clair / sombre), langue
- **Notifications** : toggles par type (invitations, résultats, mercato, activité sociale)
- **Packs téléchargés** : liste avec taille et bouton suppression
- **Confidentialité** : visibilité du profil, statistiques publiques
- **À propos** : version, CGU, politique de confidentialité

---

## 16. Animations et micro-interactions

| Moment | Animation |
|--------|-----------|
| Lancement de l'app | Logo scale-in + fade, mesh gradient animé |
| Transition entre écrans | Slide horizontal (navigation) ou fade (modales) |
| Chrono sous 10s | Pulsation rouge + vibration légère |
| Victoire | Confettis arc-en-ciel + son |
| Défaite | Écran assombri + légère vibration |
| Gain de Jetons | Chiffre doré qui monte avec particules |
| Montée de niveau XP | Barre qui se remplit + flash lumineux |
| Enchère surenchérie | Chiffre qui rebondit avec teinte or |
| Spectateur rejoint | Toast discret en haut |

---

*Document vivant*
