export const waterCategories = {
    'Bactériologie': [
        'Escherichia coli', 'Entérocoques', 'Bactéries coliformes',
        'Germes', 'Microorganismes', 'Spores', 'Coliformes', 'Bact.'
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

export function categorizeParameter(parameterName) {
    if (!parameterName) return 'Autres';

    for (const [category, keywords] of Object.entries(waterCategories)) {
        if (keywords.some(keyword => parameterName.toLowerCase().includes(keyword.toLowerCase()))) {
            return category;
        }
    }
    return 'Autres';
}

export function filterAndCategorizeData(data) {
    const categorized = {};

    // Initialize categories
    Object.keys(waterCategories).forEach(cat => {
        categorized[cat] = [];
    });

    data.forEach(param => {
        // Filtering logic
        const result = param.resultat_alphanumerique || '';
        const name = param.libelle_parametre || '';

        // Filter out "SANS OBJET" and "Aucun changement anormal"
        if (result.toUpperCase().includes('SANS OBJET') ||
            result.toUpperCase().includes('AUCUN CHANGEMENT ANORMAL') ||
            name.toUpperCase().includes('SANS OBJET')) {
            return;
        }

        const category = categorizeParameter(name);
        if (!categorized[category]) {
            categorized[category] = [];
        }
        categorized[category].push(param);
    });

    // Remove empty categories
    Object.keys(categorized).forEach(key => {
        if (categorized[key].length === 0) {
            delete categorized[key];
        }
    });

    return categorized;
}

export function isParameterCompliant(item) {
    // Helper to parse values with '<' or '>'
    function parseSpecialNumber(value) {
        if (typeof value !== 'string') return parseFloat(value);
        value = value.trim().replace(',', '.');

        // Explicitly handle SEUIL or detection limits
        if (value.toUpperCase().includes('SEUIL') || value.toUpperCase().includes('DETECT')) return 0;

        if (value.startsWith('<')) return parseFloat(value.slice(1)) || 0; // Treat as small value
        if (value.startsWith('>')) return parseFloat(value.slice(1)) || Infinity; // Treat as large value
        return parseFloat(value);
    }

    // Helper to parse references
    function parseReference(referenceStr) {
        if (!referenceStr) return { min: -Infinity, max: Infinity };
        // Handle commas and spaces
        referenceStr = referenceStr.trim().replace(/\s+/g, '').replace(',', '.');

        // Interval (>=180 et <=1000)
        const intervalMatch = referenceStr.match(/(?:>=?(\d+(?:\.\d+)?))?(?:et|and|to|-)(?:<=?(\d+(?:\.\d+)?))?/i);
        if (intervalMatch) {
            return {
                min: intervalMatch[1] ? parseFloat(intervalMatch[1]) : -Infinity,
                max: intervalMatch[2] ? parseFloat(intervalMatch[2]) : Infinity
            };
        }

        // Simple <= or >=
        const simpleMatch = referenceStr.match(/(>=?|<=?)(\d+(?:\.\d+)?)/);
        if (simpleMatch) {
            const value = parseFloat(simpleMatch[2]);
            return simpleMatch[1].startsWith('>=')
                ? { min: value, max: Infinity }
                : { min: -Infinity, max: value };
        }

        return { min: -Infinity, max: Infinity };
    }

    const result = parseSpecialNumber(item.resultat_alphanumerique || item.resultat_numerique);
    const reference = parseReference(item.reference_qualite_parametre || item.limite_qualite_parametre || '');

    if (isNaN(result)) return true; // Assume compliant if no result

    // Specific logic
    switch (item.libelle_parametre) {
        case 'pH': return result >= 6.5 && result <= 8.5;
        case 'Nitrates': return result <= 50;
        case 'Plomb': return result <= 10;
        default: return result >= reference.min && result <= reference.max;
    }
}

export function groupDataByParameter(data) {
    const grouped = {};
    data.forEach(item => {
        const name = item.libelle_parametre;
        if (!grouped[name]) {
            grouped[name] = [];
        }
        grouped[name].push(item);
    });

    // Sort each group by date descending
    Object.keys(grouped).forEach(key => {
        grouped[key].sort((a, b) => new Date(b.date_prelevement) - new Date(a.date_prelevement));
    });

    return grouped;
}

export function formatResultValue(value) {
    if (typeof value !== 'string') return value;
    if (value.toUpperCase().includes('SEUIL') || value.toUpperCase().includes('DETECT')) {
        return '< Seuil de détection';
    }
    return value;
}
