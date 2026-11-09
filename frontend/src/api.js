async function pedir(ruta, opciones = {}) {
  let res
  try {
    res = await fetch('/api' + ruta, {
      headers: { 'Content-Type': 'application/json' },
      ...opciones,
    })
  } catch {
    throw new Error('No hay conexión con el backend (¿está corriendo Spring Boot en el puerto 8080?)')
  }
  if (res.status === 204) return null
  const datos = await res.json().catch(() => null)
  if (!res.ok) throw new Error(datos?.error || `Error ${res.status} del servidor`)
  return datos
}

const json = (cuerpo) => JSON.stringify(cuerpo)

export const api = {
  estado: () => pedir('/estado'),
  escanear: (codigo) => pedir('/escanear/' + encodeURIComponent(codigo)),
  analizar: (codigo) => pedir('/codigos/' + encodeURIComponent(codigo) + '/analisis'),
  productos: () => pedir('/productos'),
  guardarProducto: (p) => pedir('/productos', { method: 'POST', body: json(p) }),
  eliminarProducto: (gtin) => pedir('/productos/' + gtin, { method: 'DELETE' }),
  cobrar: (items) => pedir('/ventas', { method: 'POST', body: json({ items }) }),
  ventas: () => pedir('/ventas'),
  registrarIntento: (codigo, material, nota) =>
    pedir('/intentos', { method: 'POST', body: json({ codigo, material, nota }) }),
  intentos: () => pedir('/intentos'),
  resumenIntentos: () => pedir('/intentos/resumen'),
  reiniciarIntentos: () => pedir('/intentos', { method: 'DELETE' }),
}

export const dinero = (n) =>
  n == null ? '—' : 'S/ ' + Number(n).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
