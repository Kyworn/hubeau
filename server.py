import http.server
import socketserver
import json
import subprocess
import os
import urllib.parse

PORT = 8000

class CustomHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        # Parsing the URL
        parsed_path = urllib.parse.urlparse(self.path)
        
        # Check if the request is for cache generation
        if parsed_path.path == '/generate_cache':
            query_params = urllib.parse.parse_qs(parsed_path.query)
            postal_code = query_params.get('postal_code', [None])[0]
            
            if not postal_code:
                self.send_error(400, "Code postal manquant")
                return
            
            try:
                # Run the main script to generate cache
                result = subprocess.run(
                    ['python3', '../src/main.py', '--code-postal', postal_code], 
                    capture_output=True, 
                    text=True, 
                    cwd=os.path.dirname(os.path.abspath(__file__))
                )
                
                if result.returncode == 0:
                    self.send_response(200)
                    self.send_header('Content-type', 'application/json')
                    self.end_headers()
                    response = {'status': 'success', 'message': result.stdout}
                    self.wfile.write(json.dumps(response).encode())
                else:
                    self.send_error(500, f"Erreur de génération de cache: {result.stderr}")
            
            except Exception as e:
                self.send_error(500, f"Erreur serveur: {str(e)}")
        
        else:
            # Default behavior for other requests
            super().do_GET()

# Use socketserver to create the server
with socketserver.TCPServer(("", PORT), CustomHandler) as httpd:
    print(f"Serving at port {PORT}")
    httpd.serve_forever()
