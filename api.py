from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import sys
import os
import json
import asyncio
import subprocess

# Add src to path to import main.py logic if needed, 
# but better to import it as a module.
sys.path.append(os.path.join(os.path.dirname(__file__), 'src'))

app = FastAPI(title="Hubeau API", description="API for Hubeau Water Quality App")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For dev, allow all
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Data paths
DATA_DIR = os.path.join(os.path.dirname(__file__), 'data', 'resultats')

@app.get("/api/quality/{postal_code}")
async def get_water_quality(postal_code: str):
    try:
        # Load mapping
        mapping_path = os.path.join(os.path.dirname(__file__), 'postal_to_insee.json')
        if not os.path.exists(mapping_path):
             raise HTTPException(status_code=500, detail="Mapping file not found")
             
        with open(mapping_path, 'r') as f:
            mapping = json.load(f)
            
        if postal_code not in mapping:
            raise HTTPException(status_code=404, detail="Code postal non trouvé")
            
        communes = mapping[postal_code]
        results = []
        
        for commune in communes:
            insee = commune['insee']
            dept = insee[:2]
            
            # Try to fetch/update cache
            # We use the existing script for now
            proc = await asyncio.create_subprocess_exec(
                sys.executable, 'src/main.py', '--code-postal', postal_code,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE
            )
            stdout, stderr = await proc.communicate()
            
            # Even if script fails (e.g. network error), check if we have cache
            file_path = os.path.join(DATA_DIR, dept, f"{insee}.json")
            
            if os.path.exists(file_path):
                with open(file_path, 'r') as f:
                    file_content = json.load(f)
                    # The file content is { "data": API_RESPONSE }
                    # API_RESPONSE is { "count": N, "data": [ ... ] }
                    # We want the list of parameters
                    water_data = file_content.get('data', {}).get('data', [])
                    
                    results.append({
                        "commune_name": commune['nom'],
                        "insee": insee,
                        "data": water_data
                    })
            else:
                # If no cache and script failed
                if proc.returncode != 0:
                     print(f"Script failed for {insee}: {stderr.decode()}")
        
        if not results:
            raise HTTPException(status_code=404, detail="Aucune donnée disponible pour ce code postal")
            
        return {"results": results}

    except Exception as e:
        print(f"Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# Serve frontend (when built)
# app.mount("/", StaticFiles(directory="frontend/dist", html=True), name="static")
