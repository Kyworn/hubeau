document.addEventListener('DOMContentLoaded', () => {
    const postalCodeInput = document.getElementById('postalCodeInput');
    const searchButton = document.getElementById('searchButton');
    const resultsContainer = document.getElementById('resultsContainer');
    const communeTitle = document.getElementById('communeTitle');
    const categoryPillsContainer = document.createElement('div');
    categoryPillsContainer.classList.add('category-pills');
    const globalRiskIndicator = document.getElementById('global-risk-indicator');
    const darkModeToggle = document.getElementById('darkModeToggle');

    // Définition des catégories
    const waterCategories = {
        'Bactériologie': [
            'Escherichia coli', 'Entérocoques', 'Bactéries coliformes', 
            'Germes', 'Microorganismes', 'Spores', 'Coliformes'
        ],
        'Minéraux': [
            'Nitrates', 'Fluor', 'Sodium', 'Potassium', 'Calcium', 'Magnésium', 
            'Chlorures', 'Sulfates', 'Phosphates', 'Bicarbonates', 'Carbonates'
        ],
        'Métaux Lourds': [
            'Plomb', 'Cuivre', 'Aluminium', 'Fer', 'Zinc', 'Chrome', 
            'Cadmium', 'Mercure', 'Arsenic', 'Nickel', 'Manganèse'
        ],
        'Substances Indésirables': [
            'Pesticides', 'Hydrocarbures', 'Solvants chlorés', 'Détergents', 
            'Hydrocarbures aromatiques', 'PCB', 'Phtalates', 'Composés organiques'
        ],
        'Paramètres Physico-Chimiques': [
            'pH', 'Turbidité', 'Conductivité', 'Oxygène dissous', 'Température', 
            'Dureté', 'Alcalinité', 'Salinité', 'Potentiel redox'
        ],
        'Radioactivité': [
            'Radioactivité', 'Uranium', 'Radium', 'Tritium', 'Rayonnements', 
            'Activité alpha', 'Activité beta'
        ],
        'Composés Organiques': [
            'COV', 'HAP', 'Benzène', 'Toluène', 'Éthylbenzène', 'Xylènes', 
            'Chloroforme', 'Trichloréthylène', 'Perchloréthylène'
        ],
        'Éléments Nutritifs': [
            'Azote', 'Phosphore', 'Ammonium', 'Nitrites', 'Matières organiques', 
            'Carbone organique total'
        ],
        'Autres Contaminants': [
            'Cyanures', 'Bore', 'Sélénium', 'Baryum', 'Antimoine', 
            'Substances médicamenteuses', 'Perturbateurs endocriniens'
        ],
        'Autres': []
    };

    // Charger le mapping postal to INSEE
    let postalToInseemap = {};
    fetch('postal_to_insee.json')
        .then(response => response.json())
        .then(data => {
            postalToInseemap = data;
            console.log("Mapping loaded:", Object.keys(postalToInseemap).length);
        });

    function categorizeParameter(parameterName) {
        for (const [category, keywords] of Object.entries(waterCategories)) {
            if (keywords.some(keyword => parameterName.toLowerCase().includes(keyword.toLowerCase()))) {
                return category;
            }
        }
        return 'Autres';
    }

    async function generateCache(postalCode) {
        try {
            const response = await fetch(`/generate_cache?postal_code=${postalCode}`, {
                method: 'GET'
            });

            if (!response.ok) {
                throw new Error(`Erreur lors de la génération du cache: ${response.status}`);
            }

            const result = await response.json();
            console.log("Cache généré:", result);
            return result;
        } catch (error) {
            console.error('Erreur de génération de cache:', error);
            throw error;
        }
    }

    function setupCategoryFilters(categorizedParams) {
        // Réinitialiser les pills de catégorie
        categoryPillsContainer.innerHTML = '';

        // Trier les catégories pour mettre 'Autres' à la fin
        const sortedCategories = Object.keys(categorizedParams)
            .filter(category => category !== 'Autres')
            .sort()
            .concat('Autres')
            .concat('Non Conformes');  // Ajouter la catégorie Non Conformes à la fin

        // Collecter les paramètres non conformes
        const nonConformParams = [];
        Object.values(categorizedParams).forEach(categoryParams => {
            categoryParams.forEach(param => {
                if (!isParameterCompliant(param)) {
                    nonConformParams.push(param);
                }
            });
        });

        // Ajouter les paramètres non conformes s'il y en a
        if (nonConformParams.length > 0) {
            categorizedParams['Non Conformes'] = nonConformParams;
        }

        // Créer des pills pour chaque catégorie
        sortedCategories.forEach(category => {
            // Ne créer la pill que si la catégorie a des paramètres
            if (categorizedParams[category] && categorizedParams[category].length > 0) {
                const pill = document.createElement('div');
                pill.classList.add('category-pill');
                pill.textContent = category === 'Non Conformes' 
                    ? `Non Conformes (${nonConformParams.length})` 
                    : category;
                pill.dataset.category = category;
                categoryPillsContainer.appendChild(pill);
            }
        });

        // Sélectionner la première catégorie par défaut
        const firstCategory = sortedCategories[0];
        if (firstCategory) {
            const firstPill = categoryPillsContainer.querySelector(`[data-category="${firstCategory}"]`);
            firstPill.classList.add('active');
        }

        // Insérer les pills avant les résultats
        resultsContainer.parentNode.insertBefore(categoryPillsContainer, resultsContainer);

        // Ajouter des écouteurs d'événements aux pills
        categoryPillsContainer.addEventListener('click', (e) => {
            const selectedCategory = e.target.dataset.category;
            
            // Mettre à jour l'état des pills
            document.querySelectorAll('.category-pill').forEach(pill => {
                pill.classList.toggle('active', pill.dataset.category === selectedCategory);
            });

            // Filtrer les contenus de catégories
            document.querySelectorAll('.category-content').forEach(content => {
                content.classList.toggle('active', content.dataset.category === selectedCategory);
            });
        });
    }

    function isParameterCompliant(item) {
        // Fonction utilitaire pour convertir les valeurs avec '<' ou '>'
        function parseSpecialNumber(value) {
            if (typeof value !== 'string') return parseFloat(value);
            
            // Supprimer les espaces et convertir les virgules
            value = value.trim().replace(',', '.');
            
            // Gérer les cas avec '<' ou '>'
            if (value.startsWith('<')) {
                return parseFloat(value.slice(1)) || Infinity;
            }
            if (value.startsWith('>')) {
                return parseFloat(value.slice(1)) || -Infinity;
            }
            
            return parseFloat(value);
        }

        // Fonction pour analyser les références avec intervalles
        function parseReference(referenceStr) {
            if (!referenceStr) return { min: -Infinity, max: Infinity };
            
            // Nettoyer la chaîne
            referenceStr = referenceStr.trim().replace(/\s+/g, '');
            
            // Cas avec intervalles (>=180 et <=1000)
            const intervalMatch = referenceStr.match(/(?:>=?(\d+(?:\.\d+)?))?\s*(?:et|,)\s*(?:<=?(\d+(?:\.\d+)?))?/i);
            if (intervalMatch) {
                return {
                    min: intervalMatch[1] ? parseFloat(intervalMatch[1]) : -Infinity,
                    max: intervalMatch[2] ? parseFloat(intervalMatch[2]) : Infinity
                };
            }
            
            // Cas simple avec <= ou >=
            const simpleMatch = referenceStr.match(/(>=?|<=?)(\d+(?:\.\d+)?)/);
            if (simpleMatch) {
                const value = parseFloat(simpleMatch[2]);
                return simpleMatch[1].startsWith('>=') 
                    ? { min: value, max: Infinity }
                    : { min: -Infinity, max: value };
            }
            
            return { min: -Infinity, max: Infinity };
        }

        // Convertir le résultat en nombre si possible
        const result = parseSpecialNumber(
            item.resultat_alphanumerique || item.resultat_numerique
        );
        
        // Analyser la référence
        const reference = parseReference(
            item.reference_qualite_parametre || 
            item.limite_qualite_parametre || 
            ''
        );

        // Si on ne peut pas convertir, considérer comme conforme
        if (isNaN(result)) {
            return true;
        }

        // Logique de comparaison générique
        switch(item.libelle_parametre) {
            case 'pH':
                // Le pH devrait être entre 6.5 et 8.5
                return result >= 6.5 && result <= 8.5;
            case 'Nitrates':
                // Limite de 50 mg/L
                return result <= 50;
            case 'Plomb':
                // Limite de 10 µg/L
                return result <= 10;
            default:
                // Pour tous les autres paramètres, on compare avec la référence
                return result >= reference.min && result <= reference.max;
        }
    }

    // Fonction pour créer une carte de paramètre
    function createParameterCard(param) {
        const card = document.createElement('div');
        card.classList.add('col-md-3');
        
        // Vérifier la conformité du paramètre
        const isCompliant = isParameterCompliant(param);
        
        card.innerHTML = `
            <div class="card water-card shadow-sm ${isCompliant ? 'border-success' : 'border-danger'}">
                <div class="card-body">
                    <h5 class="card-title">${param.libelle_parametre || 'N/A'}</h5>
                    <p class="card-text">
                        <strong>Résultat:</strong> ${param.resultat_alphanumerique || param.resultat_numerique || 'N/A'} ${param.libelle_unite || ''}<br>
                        <strong>Référence:</strong> ${param.reference_qualite_parametre || param.limite_qualite_parametre || 'N/A'}<br>
                        <strong>Date:</strong> ${param.date_prelevement ? new Date(param.date_prelevement).toLocaleDateString() : 'N/A'}
                    </p>
                </div>
            </div>
        `;

        return card;
    }

    // Fonction pour afficher le loader
    function showLoader() {
        const loader = document.createElement('div');
        loader.id = 'data-loader';
        loader.innerHTML = `
            <div class="loader-container">
                <div class="loader-spinner"></div>
                <p>Chargement des données...</p>
            </div>
        `;
        document.body.appendChild(loader);
    }

    // Fonction pour masquer le loader
    function hideLoader() {
        const loader = document.getElementById('data-loader');
        if (loader) {
            loader.remove();
        }
    }

    // Dark Mode Toggle
    darkModeToggle.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        if (currentTheme === 'dark') {
            document.documentElement.removeAttribute('data-theme');
            document.body.classList.remove('dark-mode');
            localStorage.setItem('theme', 'light');
        } else {
            document.documentElement.setAttribute('data-theme', 'dark');
            document.body.classList.add('dark-mode');
            localStorage.setItem('theme', 'dark');
        }
    });

    // Initialisation du thème au chargement
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
        document.body.classList.add('dark-mode');
    }

    function calculateGlobalRiskIndicator(categorizedParams) {
        // Copie des paramètres sans la catégorie "Non Conformes"
        const paramsWithoutNonConform = {...categorizedParams};
        delete paramsWithoutNonConform['Non Conformes'];

        let nonCompliantCount = 0;
        let totalCount = 0;

        // Calculer les non-conformités sans compter la catégorie "Non Conformes"
        Object.values(paramsWithoutNonConform).forEach(categoryParams => {
            categoryParams.forEach(param => {
                totalCount++;
                if (!isParameterCompliant(param)) {
                    nonCompliantCount++;
                }
            });
        });

        // Calculer le taux de non-conformité
        const nonComplianceRate = (nonCompliantCount / totalCount) * 100;

        let riskLevel, riskMessage;
        if (nonComplianceRate <= 10) {
            riskLevel = 'low';
            riskMessage = `Risque Faible (${nonCompliantCount}/${totalCount} non conformes)`;
        } else if (nonComplianceRate <= 30) {
            riskLevel = 'medium';
            riskMessage = `Risque Modéré (${nonCompliantCount}/${totalCount} non conformes)`;
        } else {
            riskLevel = 'high';
            riskMessage = `Risque Élevé (${nonCompliantCount}/${totalCount} non conformes)`;
        }

        // Mettre à jour l'indicateur de risque
        globalRiskIndicator.className = `risk-${riskLevel}`;
        globalRiskIndicator.textContent = riskMessage;
    }

    postalCodeInput.addEventListener('keydown', function(event) {
        if (event.key === 'Enter') {
            event.preventDefault(); // Empêche le comportement par défaut
            searchButton.click(); // Simule un clic sur le bouton de recherche
        }
    });

    searchButton.addEventListener('click', async () => {
        const postalCode = postalCodeInput.value.trim();
        
        // Validation basique
        if (!/^\d{5}$/.test(postalCode)) {
            communeTitle.textContent = `Recherche invalide`;
            resultsContainer.innerHTML = `
                <div class="alert alert-danger text-center" role="alert">
                    <h4>Code postal invalide</h4>
                    <p>Le code postal doit contenir exactement 5 chiffres.</p>
                    <p>Exemple : 93000, 01700, 33000</p>
                </div>
            `;
            return;
        }


        // Trouver le code INSEE
        const inseeCodes = postalToInseemap[postalCode] || [];
        if (inseeCodes.length === 0) {
            communeTitle.textContent = `Recherche pour le code postal ${postalCode}`;
            resultsContainer.innerHTML = `
                <div class="alert alert-warning text-center" role="alert">
                    <h4>Code INSEE non trouvé</h4>
                    <p>Désolé, aucun code INSEE n'a été trouvé pour ce code postal.</p>
                    <p>Vérifiez que le code postal est correct ou réessayez.</p>
                </div>
            `;
            return;
        }


        // Utiliser le premier code INSEE (on pourrait gérer plusieurs codes à l'avenir)
        const inseeCode = inseeCodes[0].insee;
        const communeName = inseeCodes[0].nom;
        const departement = inseeCode.substring(0, 2);


        try {
            // Afficher le loader avant la requête
            showLoader();

            // Chemin relatif pour la récupération des données
            let response = await fetch(`../data/resultats/${departement}/${inseeCode}.json`);
            
            // Si 404, générer le cache
            if (!response.ok) {
                console.log("Données non trouvées dans le cache, génération en cours...");
                await generateCache(postalCode);
                response = await fetch(`../data/resultats/${departement}/${inseeCode}.json`);
            }

            const waterData = await response.json();
            
            // Vérifier si les données sont vides
            if (!waterData.data.data || waterData.data.data.length === 0) {
                // Aucune donnée disponible
                communeTitle.textContent = `Qualité de l'eau à ${communeName} (${postalCode})`;
                resultsContainer.innerHTML = `
                    <div class="alert alert-warning text-center" role="alert">
                        <h4>Données non disponibles</h4>
                        <p>Désolé, aucune information sur la qualité de l'eau n'est disponible pour cette commune.</p>
                        <p>Veuillez réessayer ultérieurement ou contacter les autorités locales.</p>
                    </div>
                `;
                
                // Masquer le loader
                hideLoader();
                return;
            }

            // Extraire les données du bon niveau
            const parametres = waterData.data.data || [];

            // Regrouper les paramètres par catégorie et par libellé, en gardant le plus récent
            const categorizedParams = {};
            const seenParameters = new Set();

            parametres.forEach(param => {
                const category = categorizeParameter(param.libelle_parametre);
                
                // S'assurer que chaque paramètre n'apparaît qu'une seule fois
                const key = `${param.libelle_parametre}_${category}`;
                if (!seenParameters.has(key)) {
                    if (!categorizedParams[category]) {
                        categorizedParams[category] = [];
                    }
                    categorizedParams[category].push(param);
                    seenParameters.add(key);
                }
            });

            // Calculer l'indicateur de risque global
            calculateGlobalRiskIndicator(categorizedParams);

            // Mettre à jour le titre avec le nom de la commune
            communeTitle.textContent = `Qualité de l'eau à ${communeName} (${postalCode})`;

            // Vider les résultats précédents
            resultsContainer.innerHTML = '';

            // Créer des sections pour chaque catégorie
            const sortedCategories = Object.keys(categorizedParams)
                .filter(category => category !== 'Autres')
                .sort()
                .concat('Autres')
                .concat('Non Conformes');

            // Créer les pills de catégorie
            setupCategoryFilters(categorizedParams);

            // Créer les contenus de catégories
            sortedCategories.forEach(category => {
                if (categorizedParams[category]) {
                    const categoryContent = document.createElement('div');
                    categoryContent.classList.add('category-content');
                    categoryContent.dataset.category = category;

                    categorizedParams[category].forEach(param => {
                        const card = createParameterCard(param);
                        categoryContent.appendChild(card);
                    });

                    resultsContainer.appendChild(categoryContent);
                }
            });

            // Activer la première catégorie
            document.querySelectorAll('.category-content')[0].classList.add('active');

        } catch (error) {
            console.error("Erreur de récupération des données:", error);
            alert('Impossible de récupérer les données. Veuillez réessayer.');
        } finally {
            // Masquer le loader
            hideLoader();
        }
    });
});

function filterCardsByCategory(categoryName) {
    document.querySelectorAll('.category-content').forEach(content => {
        content.classList.toggle('active', content.dataset.category === categoryName);
    });
}
