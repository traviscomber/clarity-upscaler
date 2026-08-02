# Hugging Face Setup Guide

## 1. Crear una Cuenta en Hugging Face

### Paso 1: Ir al sitio web
1. Abre https://huggingface.co
2. Haz clic en **"Sign Up"** (Registrarse)

### Paso 2: Crear la cuenta
- **Opción A: Email**
  - Ingresa tu email
  - Crea una contraseña segura
  - Verifica tu email
  
- **Opción B: Social Login (recomendado)**
  - Google
  - GitHub
  - Microsoft

### Paso 3: Completar el perfil
- Username (nombre de usuario único)
- Full name (nombre completo)
- Organization (opcional)

---

## 2. Generar Access Token

### Paso 1: Ir a Settings
1. Haz clic en tu avatar (esquina superior derecha)
2. Selecciona **"Settings"**
3. En el menú izquierdo, ve a **"Access Tokens"**

### Paso 2: Crear nuevo token
1. Haz clic en **"New token"**
2. Dale un nombre (ej: "Clarity Upscaler")
3. Selecciona el tipo:
   - **read**: Solo lectura (recomendado para modelos)
   - **write**: Lectura y escritura

### Paso 3: Copiar el token
```
hf_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```
⚠️ **IMPORTANTE**: Copia y guarda el token en un lugar seguro. No podrás verlo de nuevo.

---

## 3. Usar Modelos de Hugging Face

### Modelos Soportados para ONNX

#### Real-ESRGAN 4x (Recomendado)
```
Repository: xinntao/Real-ESRGAN-4x-plus-onnx
Scale: 4x
Use Case: Upscaling general, detalles finos
URL: https://huggingface.co/xinntao/Real-ESRGAN-4x-plus-onnx
```

#### Real-ESRGAN 2x
```
Repository: xinntao/Real-ESRGAN-2x-onnx
Scale: 2x
Use Case: Upscaling rápido, imágenes ya de buena calidad
URL: https://huggingface.co/xinntao/Real-ESRGAN-2x-onnx
```

---

## 4. Configurar en el Proyecto

### Opción A: Variables de Entorno Locales

#### Archivo: `.env.development.local`

```bash
# Hugging Face Configuration
N3URALIA_SR_BACKEND=onnx
N3URALIA_ONNX_MODEL_ID=realesrgan-x4plus-onnx
N3URALIA_ONNX_MODEL_URL=https://huggingface.co/xinntao/Real-ESRGAN-4x-plus-onnx/resolve/main/RealESRGAN_x4plus.onnx

# Opcional: Modelo alternativo (2x)
N3URALIA_ONNX_MODEL_ID_2=realesrgan-x2plus-onnx
N3URALIA_ONNX_MODEL_URL_2=https://huggingface.co/xinntao/Real-ESRGAN-2x-onnx/resolve/main/RealESRGAN_x2plus.onnx

# Token de Hugging Face (si es necesario para repositorios privados)
HUGGINGFACE_ACCESS_TOKEN=hf_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

### Opción B: Vercel Environment Variables

#### Dashboard de Vercel:
1. Ve a tu proyecto: https://vercel.com/dashboard
2. Selecciona **"Clarity Upscaler"**
3. Haz clic en **"Settings"**
4. Ve a **"Environment Variables"**
5. Agrega las variables:

```bash
Name: N3URALIA_SR_BACKEND
Value: onnx

Name: N3URALIA_ONNX_MODEL_ID
Value: realesrgan-x4plus-onnx

Name: N3URALIA_ONNX_MODEL_URL
Value: https://huggingface.co/xinntao/Real-ESRGAN-4x-plus-onnx/resolve/main/RealESRGAN_x4plus.onnx

Name: HUGGINGFACE_ACCESS_TOKEN
Value: hf_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

6. Despliega nuevamente (**Redeploy**)

---

## 5. Usar el Token en el Código

### Descargar Modelo Privado

```typescript
// lib/n3uralia/huggingface-loader.ts
import { Readable } from 'stream';

async function downloadModelWithAuth(
  modelUrl: string,
  token?: string
): Promise<Buffer> {
  const headers: Record<string, string> = {};
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(modelUrl, { headers });
  
  if (!response.ok) {
    throw new Error(`Failed to download model: ${response.statusText}`);
  }

  const buffer = await response.arrayBuffer();
  return Buffer.from(buffer);
}
```

### En tu API:

```typescript
// app/api/neural-status/route.ts
const token = process.env.HUGGINGFACE_TOKEN;
const modelUrl = process.env.N3URALIA_ONNX_MODEL_URL || '';

const isAccessible = await verifyModelAccessibility(
  modelUrl,
  token
);
```

---

## 6. Estructura de Directorios (Modelos en Caché)

### Local Development:
```
project/
├── .huggingface/
│   └── models/
│       ├── realesrgan-x4plus/
│       │   ├── RealESRGAN_x4plus.onnx
│       │   └── metadata.json
│       └── realesrgan-x2plus/
│           ├── RealESRGAN_x2plus.onnx
│           └── metadata.json
```

### En Vercel (Blob Storage):
```
vercel-blob/
└── models/
    ├── realesrgan-x4plus-onnx.bin
    └── realesrgan-x2plus-onnx.bin
```

---

## 7. Testear la Integración

### Con Token:
```bash
# Verificar configuración
pnpm test:huggingface

# O manual:
curl -s http://localhost:3000/api/neural-status | jq .

# Con probe (requiere token):
curl -s "http://localhost:3000/api/neural-status?probe=1" | jq .probe
```

### Resultado Esperado:
```json
{
  "ready": true,
  "configured": true,
  "backend": "onnx",
  "model": {
    "id": "realesrgan-x4plus-onnx",
    "name": "Real-ESRGAN x4plus (ONNX)",
    "scale": 4
  },
  "modelLocation": {
    "configured": true,
    "type": "huggingface-cdn",
    "reachable": true
  }
}
```

---

## 8. Solucionar Problemas

### Problema: "Model not found"
**Solución**: Verifica que:
- La URL sea correcta
- El repositorio existe en HF (public)
- El archivo `RealESRGAN_x4plus.onnx` existe

### Problema: "401 Unauthorized"
**Solución**:
- Token expirado o incorrecto
- Repositorio privado sin acceso
- Regenera el token en HF

### Problema: "503 Service Unavailable"
**Solución**:
- HF temporalmente no disponible
- Conexión a internet interrumpida
- Reintentar en 5 minutos

### Problema: Modelo descargado pero lento
**Solución**:
- Usar modelo 2x en lugar de 4x
- Configurar caché más agresivo
- Usar CDN local/cache

---

## 9. URLs Públicas de Modelos

No necesitas token para modelos públicos. Usa estas URLs directamente:

### Real-ESRGAN 4x
```
https://huggingface.co/xinntao/Real-ESRGAN-4x-plus-onnx/resolve/main/RealESRGAN_x4plus.onnx
```

### Real-ESRGAN 2x
```
https://huggingface.co/xinntao/Real-ESRGAN-2x-onnx/resolve/main/RealESRGAN_x2plus.onnx
```

### Real-ESRGAN 4x Plus (más potente)
```
https://huggingface.co/xinntao/Real-ESRGAN-4x-plus-plus-onnx/resolve/main/RealESRGAN_x4plus_plus.onnx
```

---

## 10. Modelos Alternativos (Experimenta)

### CodeFormer (Restauración facial)
```
https://huggingface.co/sczhou/CodeFormer/resolve/main/codeformer.onnx
```

### SwinIR (Super-resolution versátil)
```
https://huggingface.co/YukangWang/SwinIR/resolve/main/SwinIR_x4_s64w8d6e180_ps1_195k.onnx
```

### RealESRGAN-Video (Optimizado para video)
```
https://huggingface.co/xinntao/Real-ESRGAN-VideoV3/resolve/main/RealESRGAN_VideoV3.onnx
```

---

## 11. Límites y Cuotas

### Acceso Público (Sin Token):
- Descargas: Ilimitadas
- Velocidad: Estándar (CDN global)
- Repositorios: Solo públicos

### Con Token:
- Descargas: Ilimitadas
- Velocidad: Prioridad
- Repositorios: Públicos + privados

---

## Checklist Final

- [ ] Cuenta de Hugging Face creada
- [ ] Access Token generado
- [ ] Token guardado en lugar seguro
- [ ] Variables de entorno configuradas
- [ ] `.env.development.local` actualizado
- [ ] Vercel env vars configuradas
- [ ] Proyecto desplegado/redesplegado
- [ ] Tests pasando (`pnpm test:huggingface`)
- [ ] API `/api/neural-status` respondiendo
- [ ] Modelo detectado en probe

---

## Recursos Útiles

- Hugging Face: https://huggingface.co
- Documentación ONNX: https://onnx.ai
- Real-ESRGAN Repo: https://github.com/xinntao/Real-ESRGAN
- Model Hub: https://huggingface.co/models?library=onnx

