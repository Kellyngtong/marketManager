#!/bin/bash

echo "======================================"
echo "🧪 TEST MULTITENANT - MARKETMANAGER"
echo "======================================"
echo ""

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

BASE_URL="http://localhost:4800"

# Test 1: Login como ADMIN (Tenant 1, Store 1)
echo -e "${YELLOW}TEST 1: Login como ADMIN${NC}"
ADMIN_RESPONSE=$(curl -s $BASE_URL/api/auth/login \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com","password":"admin123"}')

ADMIN_TOKEN=$(echo $ADMIN_RESPONSE | jq -r '.data.token')
ADMIN_DATA=$(echo $ADMIN_RESPONSE | jq '.data | {email, idusuario, id_tenant, id_store}')

echo "Response: $ADMIN_DATA"
echo "Token (primeros 50 chars): ${ADMIN_TOKEN:0:50}..."
echo ""

# Test 2: Login como EMPLEADO (Tenant 2, Store 2)
echo -e "${YELLOW}TEST 2: Login como EMPLEADO${NC}"
EMP_RESPONSE=$(curl -s $BASE_URL/api/auth/login \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"email":"empleado@test.com","password":"emp123"}')

EMP_TOKEN=$(echo $EMP_RESPONSE | jq -r '.data.token')
EMP_DATA=$(echo $EMP_RESPONSE | jq '.data | {email, idusuario, id_tenant, id_store}')

echo "Response: $EMP_DATA"
echo "Token (primeros 50 chars): ${EMP_TOKEN:0:50}..."
echo ""

# Test 3: Ver artículos como ADMIN (debería ver productos de Tenant 1)
echo -e "${YELLOW}TEST 3: Artículos para ADMIN (Tenant 1)${NC}"
ADMIN_PRODUCTS=$(curl -s "$BASE_URL/api/articulos" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json")

PRODUCT_COUNT=$(echo $ADMIN_PRODUCTS | jq '.data.articulos | length')
echo "Cantidad de productos para Admin: $PRODUCT_COUNT"
echo ""

# Test 4: Ver artículos como EMPLEADO (debería ver productos de Tenant 2)
echo -e "${YELLOW}TEST 4: Artículos para EMPLEADO (Tenant 2)${NC}"
EMP_PRODUCTS=$(curl -s "$BASE_URL/api/articulos" \
  -H "Authorization: Bearer $EMP_TOKEN" \
  -H "Content-Type: application/json")

EMP_PRODUCT_COUNT=$(echo $EMP_PRODUCTS | jq '.data.articulos | length')
echo "Cantidad de productos para Empleado: $EMP_PRODUCT_COUNT"
echo ""

# Test 5: Verificar JWT contiene id_tenant e id_store
echo -e "${YELLOW}TEST 5: Decodificar JWT${NC}"
decode_jwt() {
  local token=$1
  python3 << EOF
import json
import base64
import sys

token = "$token"
parts = token.split('.')
if len(parts) != 3:
    print("Token inválido")
    sys.exit(1)

# Agregar padding si es necesario
payload = parts[1]
payload += '=' * (4 - len(payload) % 4)

try:
    decoded = base64.urlsafe_b64decode(payload)
    data = json.loads(decoded)
    print(json.dumps(data, indent=2))
except Exception as e:
    print(f"Error: {e}")
EOF
}

echo "JWT Admin decodificado:"
decode_jwt "$ADMIN_TOKEN"
echo ""

echo "======================================"
echo "✅ Tests completados"
echo "======================================"
