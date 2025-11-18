#!/usr/bin/env python
"""Script para verificar la hora del sistema."""
import time
import datetime

print("=" * 60)
print("VERIFICACIÓN DE HORA DEL SISTEMA")
print("=" * 60)

# Hora actual del sistema
now = datetime.datetime.now()
timestamp = int(time.time())

print(f"\nHora local: {now.strftime('%Y-%m-%d %H:%M:%S')}")
print(f"Timestamp Unix: {timestamp}")

# Del log: 1763416442 < 1763416444
token_time = 1763416442
server_time = 1763416444
diff = server_time - token_time

print(f"\nDel error de Firebase:")
print(f"  Token timestamp: {token_time}")
print(f"  Server timestamp: {server_time}")
print(f"  Diferencia: {diff} segundos")

print(f"\nFecha del token: {datetime.datetime.fromtimestamp(token_time)}")
print(f"Fecha del servidor: {datetime.datetime.fromtimestamp(server_time)}")

print("\n" + "=" * 60)
print("SOLUCIÓN:")
print("  1. Ve a Configuración de Windows → Hora e idioma")
print("  2. Activa 'Establecer la hora automáticamente'")
print("  3. Haz clic en 'Sincronizar ahora'")
print("  4. Reinicia el navegador y vuelve a iniciar sesión")
print("=" * 60)
