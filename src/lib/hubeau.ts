import { 
  WaterQualityResult, 
  HubEauResponse, 
  PostalMapping, 
  Commune, 
  ProcessedCommune 
} from './types';
import postalMappingData from '@/data/postal_to_insee.json';

const API_URL = "https://hubeau.eaufrance.fr/api/v1/qualite_eau_potable/resultats_dis";

export const waterCategories: Record<string, string[]> = {
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

export function categorizeParameter(parameterName: string): string {
  if (!parameterName) return 'Autres';

  for (const [category, keywords] of Object.entries(waterCategories)) {
    if (keywords.some(keyword => parameterName.toLowerCase().includes(keyword.toLowerCase()))) {
      return category;
    }
  }
  return 'Autres';
}

export function isParameterCompliant(item: WaterQualityResult): boolean {
  function parseSpecialNumber(value: string | number | null): number {
    if (value === null) return NaN;
    if (typeof value !== 'string') return value;
    const strValue = value.trim().replace(',', '.');

    if (strValue.toUpperCase().includes('SEUIL') || strValue.toUpperCase().includes('DETECT')) return 0;
    if (strValue.startsWith('<')) return parseFloat(strValue.slice(1)) || 0;
    if (strValue.startsWith('>')) return parseFloat(strValue.slice(1)) || Infinity;
    return parseFloat(strValue);
  }

  function parseReference(referenceStr: string | null): { min: number; max: number } {
    if (!referenceStr) return { min: -Infinity, max: Infinity };
    const str = referenceStr.trim().replace(/\s+/g, '').replace(',', '.');

    const intervalMatch = str.match(/(?:>=?(\d+(?:\.\d+)?))?(?:et|and|to|-)(?:<=?(\d+(?:\.\d+)?))?/i);
    if (intervalMatch) {
      return {
        min: intervalMatch[1] ? parseFloat(intervalMatch[1]) : -Infinity,
        max: intervalMatch[2] ? parseFloat(intervalMatch[2]) : Infinity
      };
    }

    const simpleMatch = str.match(/(>=?|<=?)(\d+(?:\.\d+)?)/);
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

  if (isNaN(result)) return true;

  switch (item.libelle_parametre) {
    case 'pH': return result >= 6.5 && result <= 8.5;
    case 'Nitrates': return result <= 50;
    case 'Plomb': return result <= 10;
    default: return result >= reference.min && result <= reference.max;
  }
}

export function processHubEauData(communeName: string, insee: string, rawData: WaterQualityResult[]): ProcessedCommune {
  const filteredData = rawData.filter(param => {
    const result = (param.resultat_alphanumerique || '').toUpperCase();
    const name = (param.libelle_parametre || '').toUpperCase();
    return !result.includes('SANS OBJET') && 
           !result.includes('AUCUN CHANGEMENT ANORMAL') && 
           !name.includes('SANS OBJET');
  });

  const categorized: Record<string, WaterQualityResult[]> = {};
  filteredData.forEach(param => {
    const cat = categorizeParameter(param.libelle_parametre);
    if (!categorized[cat]) categorized[cat] = [];
    categorized[cat].push(param);
  });

  const categorizedAndGrouped: Record<string, Record<string, WaterQualityResult[]>> = {};
  Object.entries(categorized).forEach(([cat, items]) => {
    const grouped: Record<string, WaterQualityResult[]> = {};
    items.forEach(item => {
      if (!grouped[item.libelle_parametre]) grouped[item.libelle_parametre] = [];
      grouped[item.libelle_parametre].push(item);
    });
    
    // Sort each group by date descending
    Object.keys(grouped).forEach(key => {
      grouped[key].sort((a, b) => new Date(b.date_prelevement).getTime() - new Date(a.date_prelevement).getTime());
    });
    
    categorizedAndGrouped[cat] = grouped;
  });

  return {
    commune_name: communeName,
    insee,
    data: rawData,
    categorizedData: categorizedAndGrouped,
    categories: Object.keys(categorizedAndGrouped).sort()
  };
}

export async function fetchCommuneQuality(postalCode: string): Promise<ProcessedCommune[]> {
  const mapping = postalMappingData as PostalMapping;
  const communes = mapping[postalCode];

  if (!communes) {
    throw new Error(`Code postal ${postalCode} non trouvé.`);
  }

  const results = await Promise.all(communes.map(async (commune) => {
    const params = new URLSearchParams({
      code_commune: commune.insee,
      size: '1000',
      fields: 'code_departement,nom_departement,code_prelevement,code_parametre,libelle_parametre,resultat_alphanumerique,resultat_numerique,libelle_unite,limite_qualite_parametre,reference_qualite_parametre,code_commune,nom_commune,date_prelevement,conclusion_conformite_prelevement,conformite_limites_bact_prelevement,conformite_limites_pc_prelevement,conformite_references_bact_prelevement,conformite_references_pc_prelevement,longitude,latitude'
    });

    const response = await fetch(`${API_URL}?${params.toString()}`);
    if (!response.ok) {
      throw new Error(`Erreur lors de la récupération des données pour ${commune.nom}`);
    }

    const json: HubEauResponse = await response.json();
    return processHubEauData(commune.nom, commune.insee, json.data);
  }));

  return results;
}

export function formatResultValue(value: string | number | null): string {
  if (value === null) return '-';
  const strValue = String(value);
  if (strValue.toUpperCase().includes('SEUIL') || strValue.toUpperCase().includes('DETECT')) {
    return '< Seuil de détection';
  }
  return strValue;
}
