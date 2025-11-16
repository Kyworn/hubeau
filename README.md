# Hub'Eau - Qualité de l'Eau en France

Une application web interactive pour visualiser la qualité de l'eau potable en France en temps réel, utilisant les données ouvertes de l'API Hub'Eau.

## Aperçu

Cette application permet aux citoyens français de consulter facilement les analyses de qualité de l'eau potable de leur commune en entrant simplement leur code postal. Les données sont automatiquement catégorisées et présentées de manière claire avec un indicateur de risque global.

### Fonctionnalités

- **Recherche par code postal** : Accédez aux données de qualité d'eau de votre commune
- **Catégorisation automatique** : Les paramètres sont organisés en 9 catégories (Bactériologie, Métaux lourds, Minéraux, etc.)
- **Indicateur de risque global** : Visualisation rapide de la conformité de l'eau
- **Mode sombre** : Interface adaptable pour un confort visuel optimal
- **Filtres par catégorie** : Navigation facile entre les différents types d'analyses
- **Données officielles** : Informations issues de l'API Hub'Eau (Système d'Information sur l'Eau)

## Technologies

- **Frontend** : HTML5, CSS3, JavaScript (Vanilla)
- **Backend** : Python 3 (serveur HTTP simple)
- **API** : Hub'Eau (données ouvertes du gouvernement français)
- **UI Framework** : Bootstrap 5
- **Data** : JSON (cache local)

## Installation

### Prérequis

- Python 3.x
- Un navigateur web moderne

### Étapes

1. **Cloner le repository**
   ```bash
   git clone https://github.com/Kyworn/hubeau.git
   cd hubeau
   ```

2. **Installer les dépendances Python**
   ```bash
   pip install -r requirements.txt
   ```

3. **Lancer le serveur**
   ```bash
   python server.py
   ```

4. **Ouvrir l'application**

   Accédez à [http://localhost:8000](http://localhost:8000) dans votre navigateur

## Utilisation

1. Entrez votre code postal (5 chiffres) dans le champ de recherche
2. Cliquez sur "Rechercher"
3. Consultez les résultats organisés par catégories :
   - **Bactériologie** : E. coli, entérocoques, etc.
   - **Métaux Lourds** : Plomb, cuivre, aluminium, etc.
   - **Minéraux** : Nitrates, fluor, sodium, etc.
   - **Substances Indésirables** : Pesticides, hydrocarbures, etc.
   - **Paramètres Physico-Chimiques** : pH, turbidité, etc.
   - **Radioactivité** : Uranium, radium, etc.
   - **Composés Organiques** : COV, HAP, benzène, etc.
   - **Éléments Nutritifs** : Azote, phosphore, etc.
   - **Autres Contaminants**

4. Utilisez les filtres pour afficher uniquement les catégories qui vous intéressent
5. Consultez l'indicateur de risque global en haut de page

## Structure du Projet

```
hubeau/
├── index.html              # Page principale
├── app.js                  # Logique frontend (recherche, filtres, affichage)
├── styles.css              # Styles personnalisés
├── server.py               # Serveur HTTP Python
├── mentions-legales.html   # Page mentions légales
├── postal_to_insee.json    # Mapping code postal → code INSEE
├── data/
│   └── resultats/          # Cache des résultats (gitignored)
└── requirements.txt        # Dépendances Python
```

## Source des Données

Les données proviennent de **Hub'Eau**, la plateforme nationale des données sur l'eau :
- **API** : [https://hubeau.eaufrance.fr/](https://hubeau.eaufrance.fr/)
- **Licence** : [Licence Ouverte etalab 2.0](https://www.etalab.gouv.fr/licence-ouverte-open-licence)
- **Organisme** : Système d'Information sur l'Eau (SIE)

Les analyses sont réalisées par les Agences Régionales de Santé (ARS) et les laboratoires agréés.

## Catégories d'Analyse

L'application organise les paramètres de qualité d'eau en 9 catégories principales :

| Catégorie | Exemples de paramètres |
|-----------|------------------------|
| **Bactériologie** | Escherichia coli, Entérocoques, Coliformes |
| **Métaux Lourds** | Plomb, Cuivre, Aluminium, Arsenic, Mercure |
| **Minéraux** | Nitrates, Fluor, Sodium, Calcium, Magnésium |
| **Substances Indésirables** | Pesticides, Hydrocarbures, Solvants chlorés |
| **Physico-Chimique** | pH, Turbidité, Conductivité, Température |
| **Radioactivité** | Uranium, Radium, Tritium, Activité alpha/beta |
| **Composés Organiques** | COV, HAP, Benzène, Toluène, Chloroforme |
| **Éléments Nutritifs** | Azote, Phosphore, Ammonium, Nitrites |
| **Autres Contaminants** | Cyanures, Bore, Sélénium, Perturbateurs endocriniens |

## Contribuer

Les contributions sont les bienvenues ! N'hésitez pas à :

1. Fork le projet
2. Créer une branche (`git checkout -b feature/amelioration`)
3. Commit vos changements (`git commit -m 'Ajout d'une fonctionnalité'`)
4. Push vers la branche (`git push origin feature/amelioration`)
5. Ouvrir une Pull Request

## Licence

Ce projet utilise des données publiques sous [Licence Ouverte etalab 2.0](https://www.etalab.gouv.fr/licence-ouverte-open-licence).

Le code source de cette application est libre d'utilisation.

## Avertissement

Cette application est fournie à titre informatif uniquement. Pour toute question concernant la qualité de votre eau potable, veuillez contacter votre mairie ou l'Agence Régionale de Santé (ARS) de votre région.

## Auteur

Développé par [Kyworn](https://github.com/Kyworn)

## Liens Utiles

- [Hub'Eau - API Qualité de l'eau potable](https://hubeau.eaufrance.fr/page/api-qualite-eau-potable)
- [Ministère de la Santé - Qualité de l'eau](https://solidarites-sante.gouv.fr/sante-et-environnement/eaux/eau)
- [Data.gouv.fr](https://www.data.gouv.fr/)
