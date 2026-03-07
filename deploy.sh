#!/bin/bash
# Script para el despliegue automático en Render

echo "Iniciando el despliegue en Render..."

# Reemplaza con tu API key de Render y el ID del servicio
API_KEY="tu_api_key_de_render"
SERVICE_ID="tu_service_id_de_render"

# URL para activar el despliegue en Render
DEPLOY_URL="https://api.render.com/v1/services/${SERVICE_ID}/deploy"

# Comprobar si curl está instalado
if ! command -v curl &> /dev/null
then
  echo "curl no está instalado. Intenta instalarlo con: apt-get update && apt-get install -y curl"
  exit 1
fi

# Envía una solicitud POST a la API de Render para activar el despliegue
curl -X POST $DEPLOY_URL \
  -H "Authorization: Bearer $API_KEY"

# Comprobar el código de retorno del comando curl
if [ $? -ne 0 ]; then
  echo "Error al iniciar el despliegue en Render."
  exit 1
fi

echo "Despliegue iniciado en Render."
