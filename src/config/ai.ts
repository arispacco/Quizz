/**
 * Configuration du backend IA (Cloudflare Worker).
 *
 * Ce Worker remplace les Cloud Functions Firebase pour la génération de
 * questions via Gemini, afin d'éviter le plan payant Firebase Blaze.
 *
 * TODO: Après avoir déployé le Worker (`worker/`, voir worker/README.md),
 * remplacez l'URL ci-dessous par celle affichée par `npx wrangler deploy`
 * (ex. https://le-jeu-ai.mon-sous-domaine.workers.dev).
 * @module config/ai
 */
export const AI_BACKEND_URL = 'https://le-jeu-ai.<your-subdomain>.workers.dev';
