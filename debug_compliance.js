const item = {
    libelle_parametre: 'Tétrachloroéthylèn+Trichloroéthylène',
    resultat_alphanumerique: '<SEUIL',
    resultat_numerique: 0.0,
    limite_qualite_parametre: '<=10 µg/L',
    reference_qualite_parametre: null
};

function isParameterCompliant(item) {
    // Helper to parse values with '<' or '>'
    function parseSpecialNumber(value) {
        if (typeof value !== 'string') return parseFloat(value);
        value = value.trim().replace(',', '.');
        if (value.startsWith('<')) return parseFloat(value.slice(1)) || 0; // Treat as small value
        if (value.startsWith('>')) return parseFloat(value.slice(1)) || Infinity; // Treat as large value
        return parseFloat(value);
    }

    // Helper to parse references
    function parseReference(referenceStr) {
        if (!referenceStr) return { min: -Infinity, max: Infinity };
        referenceStr = referenceStr.trim().replace(/\s+/g, '');

        // Interval (>=180 et <=1000)
        const intervalMatch = referenceStr.match(/(?:>=?(\d+(?:\.\d+)?))?\s*(?:et|,)\s*(?:<=?(\d+(?:\.\d+)?))?/i);
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

    console.log('Parsed Result:', result);
    console.log('Parsed Reference:', reference);

    if (isNaN(result)) return true; // Assume compliant if no result

    // Specific logic
    switch (item.libelle_parametre) {
        case 'pH': return result >= 6.5 && result <= 8.5;
        case 'Nitrates': return result <= 50;
        case 'Plomb': return result <= 10;
        default: return result >= reference.min && result <= reference.max;
    }
}

console.log('Is Compliant:', isParameterCompliant(item));
