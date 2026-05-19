export interface WaterQualityResult {
  code_departement: string;
  nom_departement: string;
  code_prelevement: string;
  code_parametre: string;
  libelle_parametre: string;
  resultat_alphanumerique: string | null;
  resultat_numerique: number | null;
  libelle_unite: string;
  limite_qualite_parametre: string | null;
  reference_qualite_parametre: string | null;
  code_commune: string;
  nom_commune: string;
  date_prelevement: string;
  conclusion_conformite_prelevement: string;
  conformite_limites_bact_prelevement: string;
  conformite_limites_pc_prelevement: string;
  conformite_references_bact_prelevement: string;
  conformite_references_pc_prelevement: string;
  longitude: number;
  latitude: number;
}

export interface HubEauResponse {
  count: number;
  data: WaterQualityResult[];
}

export interface Commune {
  insee: string;
  nom: string;
}

export interface PostalMapping {
  [postalCode: string]: Commune[];
}

export interface ProcessedCommune {
  commune_name: string;
  insee: string;
  data: WaterQualityResult[];
  categorizedData: Record<string, Record<string, WaterQualityResult[]>>;
  categories: string[];
}
