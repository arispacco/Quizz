# Composants UI et thème — Le Jeu

Documentation des composants dans `src/ui/` et du système de thème dans `src/theme/`. Spécifications visuelles détaillées : [design.md](./design.md).

---

## Système de thème

### `ThemeProvider`

**Fichier :** `src/theme/ThemeProvider.tsx`

```typescript
interface ThemeContextValue {
  theme: AppTheme;           // Objet thème complet (couleurs, spacing, etc.)
  mode: 'dark' | 'light';
  toggleTheme: () => void;
  setMode: (mode: ThemeMode) => void;
}

const { theme, mode, toggleTheme } = useTheme();
```

- Mode par défaut : **dark**.
- Persistance via `AsyncStorage` clé `@lejeu/theme_mode`.
- Doit envelopper l'app avant les composants consommant `useTheme()`.

### Structure `AppTheme`

```typescript
type AppTheme = {
  mode: 'dark' | 'light';
  colors: { /* voir tokens */ };
  spacing: { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 };
  radius: { sm: 8, md: 12, lg: 16, full: 999 };
  typography: {
    title: TextStyle;
    subtitle: TextStyle;
    body: TextStyle;
    bodyMedium: TextStyle;
    caption: TextStyle;
    mono: TextStyle;
    decorative: TextStyle;
  };
};
```

---

## Tokens couleurs (`palette`)

| Token | Hex | Usage |
|-------|-----|-------|
| `primary` | `#7C3AED` | Actions principales, onglet actif |
| `exchange` | `#06B6D4` | Mode Échange, accent carte |
| `enchere` | `#F97316` | Mode Enchère, chrono < 50% |
| `success` | `#10B981` | Victoire, chrono > 50% |
| `danger` | `#EF4444` | Erreurs, défaite, LIVE spectateur |
| `tokens` | `#F59E0B` | Jetons, bouton gold, toasts info |
| `elo` | `#3B82F6` | Classement ELO |
| `xp` | `#EC4899` | Progression XP |
| `clubs` | `#84CC16` | All-team, clubs |
| `spectators` | `#94A3B8` | Compteur spectateurs |
| `rainbow` | `['#7C3AED', '#06B6D4', '#10B981', '#F59E0B']` | Dégradés premium |

### Couleurs structurelles

| Token | Dark | Light |
|-------|------|-------|
| `background` | `#0D0D0D` | `#F5F5F5` |
| `surface` | `#1A1A1A` | `#FFFFFF` |
| `text` | `#FFFFFF` | `#111111` |
| `textSecondary` | `#A0A0A0` | `#555555` |
| `border` | `#2A2A2A` | `#E0E0E0` |
| `disabled` | `#2A2A2A` | `#E0E0E0` |
| `disabledText` | `#555555` | `#999999` |

### Typographie

| Token | Police | Taille |
|-------|--------|--------|
| `title` | Rajdhani-Bold | 28 |
| `subtitle` | Rajdhani-Bold | 20 |
| `body` | Inter-Regular | 16 |
| `bodyMedium` | Inter-Medium | 16 |
| `caption` | Inter-Regular | 13 |
| `mono` | RobotoMono-Bold | 32 |
| `decorative` | BebasNeue-Regular | 24 (+ letterSpacing 1) |

---

## Composants `src/ui/`

Import barrel : `import { Button, Card, ... } from '@/ui'`.

---

### Button

**Fichier :** `src/ui/Button.tsx`

```typescript
interface ButtonProps extends PressableProps {
  label: string;
  variant?: 'primary' | 'secondary' | 'danger' | 'gold' | 'ghost';
  loading?: boolean;
  fullWidth?: boolean;
  style?: StyleProp<ViewStyle>;
}
```

| Variant | Apparence |
|---------|-----------|
| `primary` | Fond `primary`, texte blanc |
| `secondary` | Transparent, bordure `primary`, texte `primary` |
| `danger` | Fond `danger` |
| `gold` | Fond `tokens` (actions jetons) |
| `ghost` | Transparent, texte `primary` |

**Comportement :**
- `loading` affiche `ActivityIndicator`, désactive le bouton.
- `disabled` ou `loading` → opacité 0.5.
- `fullWidth` → largeur 100%.
- `minHeight: 48`, `borderRadius: theme.radius.md`.

**Exemple :**
```tsx
<Button label="Confirmer" onPress={onConfirm} fullWidth />
<Button label="Se coucher" variant="danger" onPress={onFold} />
<Button label="Surenchérir" variant="gold" loading={bidding} />
```

---

### Card

**Fichier :** `src/ui/Card.tsx`

```typescript
interface CardProps {
  children: React.ReactNode;
  accent?: GameMode | 'tokens' | 'default';
  style?: StyleProp<ViewStyle>;
}
```

| Accent | Bordure |
|--------|---------|
| `default` | `border` |
| `echange` | `exchange` (cyan) |
| `enchere` | `enchere` (orange) |
| `tokens` | `tokens` (or) |

**Style :** fond `surface`, `borderRadius.lg`, padding 16, ombre légère.

**Exemple :**
```tsx
<Card accent="echange">
  <Text>Question...</Text>
</Card>
```

---

### Input

**Fichier :** `src/ui/Input.tsx`

```typescript
interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
}
```

- Label en `typography.caption` + `textSecondary`.
- Bordure `danger` si `error` défini.
- `placeholderTextColor` = `textSecondary`.
- Hérite de toutes les props `TextInput` (`multiline`, `secureTextEntry`, etc.).

**Exemple :**
```tsx
<Input label="Email" value={email} onChangeText={setEmail} keyboardType="email-address" />
<Input label="Contenu" value={text} onChangeText={setText} multiline error={err} />
```

---

### Badge

**Fichier :** `src/ui/Badge.tsx`

```typescript
interface BadgeProps {
  label: string;
  color?: string;  // Défaut : primary
}
```

- Fond semi-transparent (`${color}33`).
- Texte en couleur pleine.
- `alignSelf: flex-start`, `borderRadius.sm`.

**Exemple :**
```tsx
<Badge label="Culture Générale" />
<Badge label="+3 Jetons" color={theme.colors.tokens} />
<Badge label="👁 LIVE" color={theme.colors.danger} />
```

---

### Chrono

**Fichier :** `src/ui/Chrono.tsx`

```typescript
interface ChronoProps {
  totalSeconds: number;
  remainingSeconds: number;
  size?: number;  // Défaut : 140
}
```

**Comportement :**
- Cercle SVG animé via Reanimated (`strokeDashoffset`).
- Couleur dynamique :
  - `> 50%` → `success` (vert)
  - `≤ 50%` → `enchere` (orange)
  - `≤ 20%` → `danger` (rouge)
- Chiffre central en `typography.mono`.

**Exemple :**
```tsx
<Chrono totalSeconds={30} remainingSeconds={duel.exchange?.timeRemaining ?? 0} />
```

---

### Stepper

**Fichier :** `src/ui/Stepper.tsx`

```typescript
interface StepperProps {
  label: string;
  value: number;
  min?: number;   // Défaut : 1
  max?: number;   // Défaut : 99
  onChange: (value: number) => void;
}
```

- Boutons `-` / `+` (icônes Phosphor Minus/Plus).
- Valeur affichée en `typography.subtitle`.

**Exemple :**
```tsx
<Stepper label="Temps Échange (s)" value={30} min={5} max={120} onChange={setTime} />
```

---

### Toast

**Fichier :** `src/ui/Toast.tsx`

**Provider :**
```tsx
<ToastProvider>
  <App />
</ToastProvider>
```

**Hook :**
```typescript
const { showToast } = useToast();
showToast('Message', 'success' | 'error' | 'info');
```

| Type | Fond |
|------|------|
| `success` | `success` |
| `error` | `danger` |
| `info` | `tokens` |

**Comportement :** Apparaît en haut (top: 56), fade in/out, disparition auto après ~2.4s.

---

## Hiérarchie des providers (App.tsx)

```
ThemeProvider
  └── ToastProvider      (dépend de useTheme)
        └── AuthProvider
              └── Bootstrap (SQLite)
                    └── NavigationContainer
                          └── RootNavigator
```

`ToastProvider` doit être **à l'intérieur** de `ThemeProvider` pour accéder aux couleurs.

---

## Icônes

Bibliothèque : **phosphor-react-native**.

Utilisation dans `MainTabs.tsx` :
- `House` (Accueil, weight fill si actif)
- `Compass` (Explorer)
- `PlusCircle` (Créer, size+4)
- `Users` (Social)
- `UserCircle` (Profil)

---

## Bonnes pratiques

1. Toujours utiliser `theme.colors.*` plutôt que des hex en dur dans les écrans.
2. Préférer les composants `@/ui` aux éléments natifs bruts pour la cohérence.
3. Utiliser `Card accent` pour contextualiser le mode de jeu.
4. `Button variant="gold"` réservé aux actions liées aux jetons.
5. Les toasts pour le feedback utilisateur court ; pas de `Alert` natif.
