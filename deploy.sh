#!/bin/bash
# Script para el despliegue automático en Render

echo "Iniciando el despliegue en Render..."

# URL del Deploy Hook (reemplaza con la URL de Render)
DEPLOY_URL="https://api.render.com/deploy/srv-d6lu9lftskes73dkqfp0?key=dPFCdL1ZTRY"

# Comprobar si curl está instalado
if ! command -v curl &> /dev/null
then
  echo "curl no está instalado. Intenta instalarlo con: apt-get update && apt-get install -y curl"
  exit 1
fi

# Envía una solicitud POST a la URL del Deploy Hook
curl -X POST $DEPLOY_URL

# Comprobar el código de retorno del comando curl
if [ $? -ne 0 ]; then
  echo "Error al iniciar el despliegue en Render."
  exit 1
fi

echo "Despliegue iniciado en Render."

