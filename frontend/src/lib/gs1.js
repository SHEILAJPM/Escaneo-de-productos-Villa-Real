// Calculo del digito verificador GS1 en el navegador (para la actividad sin esperar al servidor).
export function pasosDigito(sinVerificador) {
  const d = sinVerificador.replace(/\D/g, '').split('').map(Number)
  const n = d.length
  const pasos = d.map((digito, i) => {
    const peso = (n - 1 - i) % 2 === 0 ? 3 : 1
    return { posicion: i + 1, digito, peso, producto: digito * peso }
  })
  const suma = pasos.reduce((s, p) => s + p.producto, 0)
  const decena = Math.ceil(suma / 10) * 10
  return { pasos, suma, decena, digito: (decena - suma) % 10 }
}

export const MATERIALES = [
  { id: 'Cartón', icono: 'bi-box-seam' },
  { id: 'Plástico', icono: 'bi-cup-straw' },
  { id: 'Vidrio', icono: 'bi-cup' },
  { id: 'Aluminio', icono: 'bi-cylinder' },
  { id: 'Hojalata', icono: 'bi-database' },
  { id: 'Tetra Pak', icono: 'bi-bag' },
  { id: 'Madera', icono: 'bi-tree' },
  { id: 'Papel / etiqueta', icono: 'bi-tag' },
  { id: 'Pantalla de celular', icono: 'bi-phone' },
]

const UNIDAD = { titulo: 'Unidad de venta', detalle: 'Producto que el cliente pasa por caja', icono: 'bi-basket', color: '#f08819' }

export const NIVELES = {
  GTIN_13: UNIDAD,
  GTIN_12: { ...UNIDAD, detalle: 'Versión UPC-A (Norteamérica)' },
  GTIN_8: { ...UNIDAD, detalle: 'Envases pequeños' },
  GTIN_14: { titulo: 'Agrupación comercial', detalle: 'Caja o bulto con varias unidades', icono: 'bi-box-seam', color: '#1d1d1d' },
  SSCC: { titulo: 'Unidad logística', detalle: 'Pallet en la cadena de suministro', icono: 'bi-truck', color: '#6b6b6b' },
}
