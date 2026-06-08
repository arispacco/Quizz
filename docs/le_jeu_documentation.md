# Le Jeu — Documentation du jeu

---

## C'est quoi "Le Jeu" ?

Le Jeu est un jeu de culture générale et de stratégie. Son originalité : il ne suffit pas de savoir, il faut aussi **savoir jouer**. Chaque confrontation est un duel où le choix du mode de jeu est aussi décisif que la réponse elle-même.

Tout tourne autour de deux mécanismes : l'**Échange** et l'**Enchère**. Trois formats de jeu sont disponibles : **Tournoi**, **Face-to-face** et **All-team**.

---

## Les deux mécanismes fondamentaux

### ⚔️ L'Échange

Les deux joueurs (ou équipes) s'affrontent sur une question ouverte de type *listing* — une question qui appelle plusieurs réponses.

**Exemple :** *"Citez des fruits de couleur jaune."*

Les joueurs répondent **tour à tour**, chacun donnant une réponse valide. Un **chrono individuel** est lancé à chaque tour de parole. Passé ce délai, le joueur est considéré comme n'ayant plus rien à dire et **perd le tour**.

l'abbitre peut aussi être humain et il y a un buzzeur sur l'ecran qui declancle le temps de l'autre

> Le temps imparti par tour en Échange est **configurable séparément** du temps imparti en Enchère.

---

### 🎰 L'Enchère

Ici, les joueurs ne répondent pas encore. Ils **parient** d'abord.

La question est posée. Chaque joueur annonce à tour de rôle **combien de réponses** il est capable de donner dans le temps imparti. Les enchères montent jusqu'à ce qu'un joueur se **couche** (renonce à surenchérir).

Le joueur qui a remporté l'enchère doit alors **tenir sa promesse** : le chrono est lancé, il doit donner le nombre de réponses annoncé dans le temps imparti.

- S'il y parvient → **il gagne**
- S'il échoue → **l'adversaire qui s'est couché gagne**

> Le temps imparti en Enchère est **configurable séparément** du temps imparti en Échange.

---

## Les trois formats de jeu

### 🏆 Tournoi
Format compétitif principal. Des équipes s'affrontent en envoyant un représentant par duel. Les Jetons, le mercato et la rotation des représentants sont actifs. **Chaque équipe fournit sa propre banque de questions** au début de la compétition. Lors de chaque tour, l'adversaire pioche une question dans la banque de l'équipe qui a choisi le mode et le thème.

### ⚡ Face-to-face
Deux joueurs seuls s'affrontent directement, sans équipe. Les questions sont soit issues des **packs préchargés** de l'application, soit **générées en temps réel** par l'IA selon le thème choisi. Pas de mercato. ELO actif en mode En ligne.

### 👥 All-team
Toute l'équipe participe à chaque tour — plus de représentant désigné. L'équipe se concerte librement et désigne son **porte-parole** pour annoncer la réponse. Le porte-parole peut changer librement à chaque tour. **Chaque équipe fournit sa propre banque de questions**, comme en Tournoi. Pas de mercato.

on doit choisir un domaine principal au debut et les question et reponse qui sont dans le domaine rapporte plus de point a moins que le domaine ne soit pas préciser et qu'on part sur culture générale; exemple: pour le premier tour du tournoir on décide la programmation en C et les question sont sur la programmation en C et valent peut-être 1 point au deuxième tour on peut agrandir le domaine et poser par exemple des question sur l'informatique qui valent un point et si tu pose une question sur la programmation en C ça vaut 1.5 point et si au 3e tour on agrandit et on dit culture général et que les question valent 1 point par exemple 3 animés isekai : re zero, i reborn in vending machine, i reborn in 7th prince et que tu pose une question en rapport avec l'informatique tu as 1.5 point et en raport avec la programmation en C tu as 2 points.
---

| | **Tournoi** | **Face-to-face** | **All-team** |
|---|---|---|---|
| Joueurs | Équipes | 2 joueurs seuls | Équipes complètes |
| Représentant | 1 par équipe, rotation obligatoire | Sans objet | Porte-parole libre |
| Source des questions | Banque fournie par les équipes | Packs préchargés ou IA live | Banque fournie par les équipes |
| Mercato | ✅ | ❌ | ❌ |
| Jetons | ✅ individuels | ✅ | ✅ collectifs |
| ELO | ✅ | ✅ | ✅ |

---

## Les Jetons — moteur stratégique du jeu

Les **Jetons** sont la monnaie individuelle du jeu. Ils se gagnent par la performance et se dépensent pour des avantages stratégiques.

### Gagner des Jetons

| Action | Jetons gagnés |
|--------|--------------|
| Gagner un tour dans un duel | +1 |
| Gagner un duel en phase de poules | +1 bonus |
| Gagner un duel en quarts de finale | +2 bonus |
| Gagner un duel en demi-finale | +3 bonus |
| Gagner un duel en finale | +5 bonus |
| Gagner une enchère avec une annonce élevée | +1 bonus |
| Choisir un thème plus large que la phase ne l'exige et gagner | +1 bonus |

### Dépenser des Jetons

| Action | Coût |
|--------|------|
| Accès aux quarts de finale | 2 jetons |
| Accès aux demi-finales | 4 jetons |
| Accès à la finale | 6 jetons |
| Racheter un joueur éliminé (mercato) | valeur du joueur en jetons |

> Les poules sont gratuites. Une équipe sans jetons suffisants pour payer le péage de phase peut quand même jouer, mais perd son droit au mercato.

### La valeur d'un joueur

**Valeur = nombre de duels gagnés × multiplicateur de phase**

Publique, mise à jour en temps réel, utilisée comme coût de rachat au mercato.

---

## Le Mercato *(Tournoi uniquement)*

Quand une équipe est éliminée, ses joueurs deviennent **disponibles au rachat**, uniquement **entre deux phases du tournoi**. N'importe quelle équipe encore en vie peut recruter un joueur éliminé en payant sa valeur en Jetons.

> **Défaite = défaite.** Aucune équipe ne peut être repêchée. Seuls les joueurs individuels peuvent être rachetés.

---

## Structure d'une compétition *(Tournoi & All-team)*

### Les équipes

La composition de chaque équipe est **publique et connue de tous** dès le début.

### Banque de questions

Avant le début de la compétition, chaque équipe soumet sa propre banque de questions organisée par thème et par niveau de difficulté. Ces questions seront posées par l'adversaire lors des duels.

### Règle de rotation des représentants *(Tournoi)*

1. Les représentants sont révélés **simultanément**.
2. Un joueur ne peut pas représenter son équipe deux fois avant que tous ses coéquipiers aient joué au moins une fois.

### Les thèmes

Les thèmes sont **annoncés et connus de tous** avant le début de la compétition. Ils s'élargissent au fil des phases.

**Exemple de progression :**
`React Native CLI` → `Informatique` → `Culture Générale`

---

## Déroulement d'un duel

### Le choix stratégique

Au début de chaque tour, le joueur dont c'est le tour choisit simultanément :

1. **Le mode** — Échange ou Enchère
2. **Le thème** — parmi ceux disponibles pour la phase en cours

L'adversaire pioche ensuite une question dans la banque du joueur correspondant au thème choisi *(Tournoi / All-team)*, ou le système en fournit une *(Face-to-face)*.

### Les trois tours

| Tour | Qui choisit le mode et le thème | Qui pose la question |
|------|---------------------------------|----------------------|
| 1 | Joueur A | Joueur B |
| 2 | Joueur B | Joueur A |
| 3 (si égalité 1-1) | Le système choisit automatiquement | Tirage au sort |

**Règle du tour 3 :** Si un mode n'a pas encore été joué, c'est lui qui s'impose. Si les deux modes ont déjà été joués, le système choisit aléatoirement.

Le joueur qui remporte **2 tours** gagne le duel.

---

## Format du tournoi

| Format | Description |
|--------|-------------|
| **Élimination directe** | Une défaite = éliminé. Simple et intense. |
| **Double élimination** | Éliminé après deux défaites. Tableau principal + tableau des repêchés. |
| **Poules + Élimination directe** *(recommandé)* | Phase de groupes puis bracket éliminatoire. |

---

## Classement long terme

- **ELO** — classement compétitif global. Actif en mode En ligne uniquement.
- **XP** — progression de type RPG. Actif dans tous les modes. Débloque des titres et cosmétiques.

---

## Vision

Le Jeu a vocation à devenir une plateforme grand public ouverte, avec des classements, des profils, une communauté, des clubs et un système de spectateurs — à l'image de ce que Lichess est pour les échecs.

---

*Document vivant*
