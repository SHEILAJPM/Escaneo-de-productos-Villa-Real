import { useCallback, useEffect, useState } from 'react'
import { api } from '../api'
import { MATERIALES } from '../lib/gs1'
import Encabezado from './Encabezado'

/** Actividades 4 y 5: probar el lector sobre distintos materiales y registrar los resultados. */
export default function Intentos({ material, setMaterial, version, onRegistrar }) {
  const [resumen, setResumen] = useState([])
  const [recientes, setRecientes] = useState([])
  const [error, setError] = useState(null)

  const cargar = useCallback(async () => {
    try {
      const [r, i] = await Promise.all([api.resumenIntentos(), api.intentos()])
      setResumen(r)
      setRecientes(i)
      setError(null)
    } catch (e) {
      setError(e.message)
    }
  }, [])

  useEffect(() => { cargar() }, [cargar, version])

  async function reiniciar() {
    if (!confirm('¿Eliminar todos los intentos registrados?')) return
    await api.reiniciarIntentos()
    cargar()
  }

  const porMaterial = Object.fromEntries(resumen.map((r) => [r.material, r]))
  const ordenado = [...resumen].sort((a, b) => b.exitos / b.total - a.exitos / a.total)

  return (
    <>
      <Encabezado etiqueta="Bloques 2 y 3 · Actividades 4 y 5" titulo="Prueba de lectura por material">
        Seleccione el material, realice el escaneo y, si el lector no responde, registre «No leyó». Los resultados se guardan en la base de datos.
      </Encabezado>

      <div className="row row-cols-3 row-cols-md-5 row-cols-xl-9 g-2 mb-3">
        {MATERIALES.map((m) => {
          const r = porMaterial[m.id]
          return (
            <div className="col" key={m.id}>
              <button className={'material btn btn-outline-secondary w-100 h-100 d-flex flex-column align-items-center justify-content-center gap-1' + (material === m.id ? ' active' : '')}
                onClick={() => setMaterial(m.id)}>
                <i className={'bi ' + m.icono} />
                <span className="small fw-semibold lh-sm">{m.id}</span>
                {r && <span className="badge text-bg-light border">{r.exitos}/{r.total}</span>}
              </button>
            </div>
          )
        })}
      </div>

      <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 border rounded p-3 mb-4 bg-light">
        <span className="fs-5">
          {material ? <>Material seleccionado: <strong>{material}</strong>. Escanee ahora.</> : 'Seleccione un material para comenzar.'}
        </span>
        <button className="btn btn-danger btn-lg" disabled={!material} onClick={() => onRegistrar(null)}>
          <i className="bi bi-x-circle me-2" />No leyó
        </button>
      </div>
      {error && <div className="alert alert-danger">{error}</div>}

      <div className="row g-4 mb-4">
        <div className="col-lg-6">
          <div className="card h-100">
            <div className="card-header bg-white fw-bold py-3 d-flex justify-content-between">
              Tasa de lectura por material
              {resumen.length > 0 && <button className="btn btn-sm btn-link text-secondary p-0" onClick={reiniciar}>Reiniciar</button>}
            </div>
            <div className="card-body">
              {resumen.length === 0 && <p className="text-secondary mb-0">Aún no hay intentos registrados.</p>}
              {ordenado.map((r) => {
                const pct = Math.round((r.exitos / r.total) * 100)
                return (
                  <div key={r.material} className="mb-3">
                    <div className="d-flex justify-content-between small mb-1">
                      <span className="fw-semibold">{r.material}</span>
                      <span className="tabular">{pct}% <span className="text-secondary">({r.exitos}/{r.total})</span></span>
                    </div>
                    <div className="progress" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} style={{ height: 10 }}>
                      <div className={'progress-bar ' + (pct < 40 ? 'bg-danger' : pct < 70 ? 'bg-dark' : '')} style={{ width: pct + '%' }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
        <div className="col-lg-6">
          <div className="card h-100">
            <div className="card-header bg-white fw-bold py-3">Últimos intentos</div>
            <div className="table-responsive" style={{ maxHeight: 340 }}>
              <table className="table table-sm align-middle mb-0 small">
                <tbody>
                  {recientes.map((i) => (
                    <tr key={i.id}>
                      <td style={{ width: 30 }}>
                        <i className={'bi ' + (i.exito ? 'bi-check-circle-fill text-success' : 'bi-x-circle-fill text-danger')} />
                      </td>
                      <td>{i.material}</td>
                      <td className="font-monospace text-secondary">{i.codigo ?? 'sin lectura'}</td>
                      <td className="text-secondary text-end">{new Date(i.fecha).toLocaleTimeString('es-PE')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header bg-white fw-bold py-3">Factores que afectan la lectura</div>
        <div className="card-body">
          <div className="row g-3 small">
            {[
              ['Contraste', 'El lector mide la luz reflejada. Barras claras o fondos oscuros y metálicos (aluminio, hojalata) reducen la lectura.'],
              ['Superficie curva', 'En botellas y latas las barras de los extremos se deforman.'],
              ['Reflejo', 'El vidrio y el plástico brillante devuelven el láser directamente al sensor.'],
              ['Zona de silencio', 'Sin margen blanco a los lados el lector no identifica el inicio del código.'],
              ['Daños', 'Arrugas en Tetra Pak, cartón húmedo o madera rugosa interrumpen las barras.'],
              ['Pantallas', 'Un lector láser como el Argox casi no lee pantallas; los lectores de imagen sí.'],
            ].map(([t, d]) => (
              <div className="col-md-6 col-xl-4" key={t}>
                <div className="fw-semibold">{t}</div>
                <div className="text-secondary">{d}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
