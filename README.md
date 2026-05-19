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

Cette application exploite les données de l'API **Hub'Eau - Qualité de l'eau potable**, fournies par le portail **Eau France**.

### Nature des données
- **Source** : Résultats du contrôle sanitaire des eaux destinées à la consommation humaine, collectés par les Agences Régionales de Santé (ARS).
- **Contenu** : Analyses microbiologiques, physico-chimiques et radiologiques réalisées sur les réseaux de distribution.
- **Fréquence** : Les données sont mises à jour régulièrement par le Ministère de la Santé et accessibles via les serveurs du BRGM.
- **Licence** : Les données sont mises à disposition sous la **Licence Ouverte Etalab 2.0**.

### Avertissement
L'application affiche les derniers résultats disponibles mais ne se substitue pas aux publications officielles des mairies ou des ARS. Les seuils de conformité affichés sont basés sur les limites et références de qualité fixées par la réglementation française.

## Données Techniques
Le projet utilise un mapping local (`postal_to_insee.json`) pour faire la correspondance entre les codes postaux saisis par l'utilisateur et les codes INSEE requis par l'API Hub'Eau.
