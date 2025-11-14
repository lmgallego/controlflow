#!/usr/bin/env python3
"""
Servidor HTTP simple para servir el frontend de ControlFlow.
"""
import http.server
import socketserver
import os
import sys

# Puerto para el servidor del frontend
PORT = 8000

# Cambiar al directorio raíz del proyecto
os.chdir(os.path.dirname(os.path.abspath(__file__)))

class MyHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    """Handler personalizado para manejar mejor las rutas."""

    def end_headers(self):
        # Permitir CORS para desarrollo
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        super().end_headers()

def main():
    """Inicia el servidor HTTP."""
    handler = MyHTTPRequestHandler

    with socketserver.TCPServer(("", PORT), handler) as httpd:
        print("=" * 60)
        print(f"  ControlFlow Frontend Server")
        print("=" * 60)
        print(f"  Servidor corriendo en: http://localhost:{PORT}")
        print(f"  Landing page: http://localhost:{PORT}/landing/index.html")
        print(f"  Login: http://localhost:{PORT}/landing/login.html")
        print(f"  Dashboard: http://localhost:{PORT}/frontend/dashboard.html")
        print("=" * 60)
        print(f"  Presiona CTRL+C para detener el servidor")
        print("=" * 60)
        print()

        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n\nServidor detenido.")
            sys.exit(0)

if __name__ == "__main__":
    main()
