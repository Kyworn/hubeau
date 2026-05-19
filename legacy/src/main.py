import asyncio
import aiohttp
import json
import argparse
import os
import sys
from datetime import datetime

# API Endpoint
API_URL = "https://hubeau.eaufrance.fr/api/v1/qualite_eau_potable/resultats_dis"

def load_postal_mapping(mapping_file):
    try:
        with open(mapping_file, 'r', encoding='utf-8') as f:
            return json.load(f)
    except FileNotFoundError:
        print(f"Error: Mapping file {mapping_file} not found.", file=sys.stderr)
        sys.exit(1)

async def fetch_water_quality(session, insee_code):
    params = {
        "code_commune": insee_code,
        "size": 1000,  # Fetch more results to ensure we get full analyses
        "fields": "code_departement,nom_departement,code_prelevement,code_parametre,libelle_parametre,resultat_alphanumerique,resultat_numerique,libelle_unite,limite_qualite_parametre,reference_qualite_parametre,code_commune,nom_commune,date_prelevement,conclusion_conformite_prelevement,conformite_limites_bact_prelevement,conformite_limites_pc_prelevement,conformite_references_bact_prelevement,conformite_references_pc_prelevement,longitude,latitude"
    }
    try:
        async with session.get(API_URL, params=params) as response:
            if response.status in [200, 206]:
                return await response.json()
            else:
                print(f"Error fetching data for {insee_code}: {response.status}", file=sys.stderr)
                return None
    except Exception as e:
        print(f"Exception fetching data for {insee_code}: {str(e)}", file=sys.stderr)
        return None

def save_results(data, insee_code):
    if not data or 'data' not in data or not data['data']:
        print(f"No data found for {insee_code}", file=sys.stderr)
        return False

    # Determine department from INSEE code
    departement = insee_code[:2]
    
    # Define output path
    # Assumes script is run from project root or we handle paths relative to this script
    # We will assume output relative to project root: data/resultats/{dept}/{insee}.json
    
    # Get project root (parent of src)
    current_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.dirname(current_dir)
    
    output_dir = os.path.join(project_root, 'data', 'resultats', departement)
    os.makedirs(output_dir, exist_ok=True)
    
    output_file = os.path.join(output_dir, f"{insee_code}.json")
    
    try:
        with open(output_file, 'w', encoding='utf-8') as f:
            # Wrap in a structure compatible with app.js
            # app.js expects: waterData.data.data
            # API returns: { count: ..., data: [...] }
            # So we save the whole API response as 'data' property?
            # app.js: const parametres = waterData.data.data || [];
            # So if we save API response as root, app.js needs waterData.data.data?
            # Wait, app.js says: const waterData = await response.json();
            # then waterData.data.data.
            # If we save the API response directly (which has 'data' key), then waterData.data is the list.
            # So waterData.data.data implies we wrapped it in another 'data' object?
            # Let's look at app.js again.
            # "const parametres = waterData.data.data || [];"
            # This implies the JSON file structure is { data: { data: [...] } } OR { data: API_RESPONSE } where API_RESPONSE has data.
            # Let's wrap it to be safe: { data: api_response }
            
            json.dump({"data": data}, f, ensure_ascii=False, indent=2)
            
        print(f"Saved data for {insee_code} to {output_file}")
        return True
    except Exception as e:
        print(f"Error saving data for {insee_code}: {str(e)}", file=sys.stderr)
        return False

async def main():
    parser = argparse.ArgumentParser(description="Fetch water quality data.")
    parser.add_argument('--code-postal', required=True, help="Postal code to search for")
    args = parser.parse_args()

    postal_code = args.code_postal

    # Path to mapping file (in project root)
    current_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.dirname(current_dir)
    mapping_file = os.path.join(project_root, 'postal_to_insee.json')
    
    mapping = load_postal_mapping(mapping_file)
    
    if postal_code not in mapping:
        print(f"Postal code {postal_code} not found in mapping.", file=sys.stderr)
        sys.exit(1)
        
    communes = mapping[postal_code]
    print(f"Found {len(communes)} communes for {postal_code}")
    
    async with aiohttp.ClientSession() as session:
        tasks = []
        for commune in communes:
            insee = commune['insee']
            print(f"Fetching data for {commune['nom']} ({insee})...")
            data = await fetch_water_quality(session, insee)
            if data:
                save_results(data, insee)

if __name__ == "__main__":
    asyncio.run(main())
