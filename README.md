# Súper Escaneo

Demostración de códigos de barras GS1 con un lector Argox: escaneas un producto y aparecen su marca, su nombre y su precio, y se suma al total, como en el súper.

```
Lector Argox ──(teclado USB)──> React :5173 ──/api──> Spring Boot :8080 ──> Neon (PostgreSQL)
                                                            └──> Open Food Facts (productos reales)
```

## Iniciar

Doble clic en `iniciar.bat`. Se abren el backend y el frontend, y luego el navegador en http://localhost:5173.

O a mano:

```
cd backend  && mvn spring-boot:run
cd frontend && npm install && npm run dev
```

Requisitos: Java 21, Maven y Node 20 o superior.

## Conectar Neon

1. En la consola de Neon: **Connect → Java (JDBC)**.
2. Copia `backend/.env.example` como `backend/.env` y pega `DB_URL`, `DB_USER` y `DB_PASSWORD`.
3. Reinicia el backend. Flyway crea las tablas y carga los productos de ejemplo solo.

Sin `.env`, la app usa una base H2 local (`backend/data/`), así que la demo funciona aunque falle la red. La barra superior muestra qué base se está usando.

## El lector

El Argox funciona como un teclado: escribe los dígitos y termina con Enter. La app distingue al lector de una persona por la velocidad de las teclas, así que funciona en cualquier pestaña sin hacer clic en un campo.

- Lector **láser**: lee papel, pero casi nunca pantallas. Imprime la pestaña **Etiquetas** a tamaño real.
- Si un producto real no está en la base, se busca en Open Food Facts (marca y nombre). Solo se pide el precio una vez y queda guardado.

## Pestañas y actividades

| Pestaña | Actividad |
|---|---|
| Caja | Demo del súper: escanear, ver el producto, el total y cobrar (la venta se guarda en la base) |
| 1 · ¿Qué esconde? | Prefijo GS1 (país de la organización, no de fabricación), empresa y verificador. ¿Contiene el precio? |
| 2 · Dígito que falta | Cálculo del dígito verificador paso a paso, con la respuesta del grupo |
| 4-5 · Materiales | Registrar intentos por material (vidrio, lata, Tetra Pak…) con estadísticas |
| 6 · Cadena | Juego GTIN-13 / GTIN-14 / SSCC más escaneo de cajas y pallets reales |
| Etiquetas | Códigos imprimibles: bien impreso contra deteriorado, EAN-13, ITF-14 y GS1-128 |
| Base de datos | Catálogo editable y ventas |

Los productos de ejemplo usan el prefijo GS1 `200` (uso interno de tienda), así que no son códigos de ninguna empresa real.

## API

| Método | Ruta | Uso |
|---|---|---|
| GET | `/api/escanear/{codigo}` | Análisis GS1 + producto (base de datos u Open Food Facts) |
| GET | `/api/codigos/{codigo}/analisis` | Tipo, país GS1, dígito verificador paso a paso |
| GET/POST/DELETE | `/api/productos` | Catálogo |
| POST/GET | `/api/ventas` | Cobrar (el total se calcula en el servidor) / historial |
| POST/GET/DELETE | `/api/intentos`, `/api/intentos/resumen` | Intentos de lectura por material |
| GET | `/api/estado` | Base de datos en uso |
