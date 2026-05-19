# Hub'Eau - Qualité de l'Eau

Application web permettant de consulter et comparer la qualité de l'eau potable des communes françaises en utilisant les données de l'API Hub'Eau.

## Fonctionnalités

- Recherche par code postal ou via une carte interactive (Leaflet)
- Comparaison côte à côte de deux communes
- Historique des analyses avec graphiques de tendances (Recharts)
- Export des données en formats PDF, CSV et JSON
- Glossaire des paramètres de qualité

## Stack Technique

- **Framework** : Next.js 15 (App Router)
- **Langage** : TypeScript
- **Style** : Tailwind CSS 4
- **Animations** : Framer Motion
- **Gestion d'état** : TanStack Query v5

## Installation

### Prérequis
- Node.js v18+

### Étapes

1. Cloner le projet :
   ```bash
   git clone https://github.com/Kyworn/hubeau.git
   cd hubeau
   ```

2. Installer les dépendances :
   ```bash
   npm install
   ```

3. Lancer le serveur de développement :
   ```bash
   npm run dev
   ```

L'application sera accessible sur `http://localhost:3000`.

## Données
Les données proviennent de l'API Hub'Eau du portail Eau France, sous Licence Ouverte Etalab 2.0.
