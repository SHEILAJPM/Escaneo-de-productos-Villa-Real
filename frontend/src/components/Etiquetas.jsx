import { useEffect, useState } from 'react'
import { api, dinero } from '../api'
import { NIVELES } from '../lib/gs1'
import CodigoBarras from './CodigoBarras'
import Encabezado from './Encabezado'

const DEFECTOS = [
  { id: 'bien', nombre: 'Impresión correcta', ok: true },
  { id: 'contraste', nombre: 'Bajo contraste' },
  { id: 'margen', nombre: 'Sin zona de silencio' },
  { id: 'rayado', nombre: 'Barras dañadas' },
  { id: 'curva', nombre: 'Superficie curva' },
  { id: 'chico', nombre: 'Tamaño insuficiente' },
]

const SIMBOLOGIA = { GTIN_14: 'ITF-14', SSCC: 'GS1-128 (00)' }

/** Etiquetas imprimibles y escaneables + versiones deterioradas para la actividad 4. */
export default function Etiquetas() {
  const [productos, setProductos] = useState([])
  const [error, setError] = useState(null)
  const [comparar, setComparar] = useState('2001000000012')

  useEffect(() => {
    api.productos().then(setProductos).catch((e) => setError(e.message))
  }, [])

  return (
    <>
      <div className="no-imprimir">
        <Encabezado etiqueta="Material de apoyo" titulo="Etiquetas de prueba"
          acciones={<button className="btn btn-primary" onClick={() => window.print()}><i className="bi bi-printer me-2" />Imprimir</button>}>
          Imprima a tamaño real (sin «ajustar a la página»). El lector Argox es láser: lee mejor sobre papel que sobre una pantalla.
        </Encabezado>
      </div>
      {error && <div className="alert alert-danger">{error}</div>}

      <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-3">
        <h2 className="h5 fw-bold mb-0">Comparación de calidad de impresión</h2>
        <select className="form-select w-auto no-imprimir" value={comparar} onChange={(e) => setComparar(e.target.value)}>
          {productos.filter((p) => p.tipo === 'GTIN_13').map((p) => <option key={p.gtin} value={p.gtin}>{p.nombre}</option>)}
        </select>
      </div>
      <div className="row g-3 mb-5 etiquetas-grid">
        {DEFECTOS.map((d) => (
          <div className="col-sm-6 col-lg-4" key={d.id}>
            <figure className={'etiqueta card h-100 text-center mb-0 defecto-' + d.id}>
              <div className="card-body d-flex flex-column align-items-center justify-content-center">
                <div className="etiqueta-codigo">
                  <CodigoBarras codigo={comparar} modulo={d.id === 'chico' ? 1 : 2} alto={d.id === 'chico' ? 30 : 70}
                    margen={d.id === 'margen' ? 0 : 14} colorBarras={d.id === 'contraste' ? '#b9c2cc' : '#000'} />
                </div>
              </div>
              <figcaption className={'card-footer bg-white small fw-semibold ' + (d.ok ? 'text-success' : 'text-danger')}>
                <i className={'bi me-1 ' + (d.ok ? 'bi-check-circle' : 'bi-x-circle')} />{d.nombre}
              </figcaption>
            </figure>
          </div>
        ))}
      </div>

      <h2 className="h5 fw-bold mb-3">Productos registrados</h2>
      <div className="row g-3 etiquetas-grid">
        {productos.map((p) => (
          <div className="col-sm-6 col-lg-4 col-xl-3" key={p.gtin}>
            <figure className="etiqueta card h-100 text-center mb-0">
              <div className="card-body d-flex flex-column align-items-center gap-1">
                <span className="badge rounded-pill" style={{ background: NIVELES[p.tipo]?.color }}>{NIVELES[p.tipo]?.titulo}</span>
                <div className="fw-semibold small">{p.marca} · {p.nombre}</div>
                <div className="small text-secondary">{p.contenido} {p.precio != null && '· ' + dinero(p.precio)}</div>
                <div className="etiqueta-codigo mt-2"><CodigoBarras codigo={p.gtin} modulo={2} alto={64} /></div>
              </div>
              <figcaption className="card-footer bg-white small text-secondary">{SIMBOLOGIA[p.tipo] ?? 'EAN-13'}</figcaption>
            </figure>
          </div>
        ))}
      </div>
    </>
  )
}
