import { useEffect, useMemo, useState } from 'react'
import { api } from '../api'
import { NIVELES } from '../lib/gs1'
import { pitido } from '../lib/sonido'
import Encabezado from './Encabezado'

const TARJETAS = [
  { id: 'GTIN_13', nombre: 'GTIN-13', digitos: '13 dígitos' },
  { id: 'GTIN_14', nombre: 'GTIN-14', digitos: '14 dígitos' },
  { id: 'SSCC', nombre: 'SSCC', digitos: '18 dígitos' },
]
const ORDEN = ['GTIN_13', 'GTIN_14', 'SSCC']

/** Actividad 6: Arma la cadena de identificacion */
export default function Cadena({ scan }) {
  const [seleccion, setSeleccion] = useState(null)
  const [asignado, setAsignado] = useState({})
  const [escaneado, setEscaneado] = useState(null)
  const [error, setError] = useState(null)

  const tarjetasMezcladas = useMemo(() => [...TARJETAS].sort(() => Math.random() - 0.5), [])

  useEffect(() => {
    if (!scan) return
    api.escanear(scan.codigo)
      .then((r) => {
        const tipo = r.analisis.tipo === 'GTIN_12' || r.analisis.tipo === 'GTIN_8' ? 'GTIN_13' : r.analisis.tipo
        setEscaneado({ ...r, tipo })
        pitido(r.analisis.valido)
        setError(null)
      })
      .catch((e) => setError(e.message))
  }, [scan])

  function asignar(nivel) {
    if (!seleccion) return
    const nuevo = Object.fromEntries(Object.entries(asignado).filter(([, t]) => t !== seleccion))
    nuevo[nivel] = seleccion
    setAsignado(nuevo)
    setSeleccion(null)
  }

  const completo = ORDEN.every((n) => asignado[n])
  const correctas = ORDEN.filter((n) => asignado[n] === n).length
  const pendientes = tarjetasMezcladas.filter((t) => !Object.values(asignado).includes(t.id))

  return (
    <>
      <Encabezado etiqueta="Bloque 3 · Actividad 6" titulo="Cadena de identificación">
        Seleccione una tarjeta y luego el nivel que identifica. Después, escanee las etiquetas para comprobar.
      </Encabezado>

      <div className="d-flex flex-wrap justify-content-center gap-3 mb-4" style={{ minHeight: 76 }}>
        {pendientes.map((t) => (
          <button key={t.id} className={'tarjeta-gs1 btn btn-outline-dark py-2 px-4' + (seleccion === t.id ? ' active' : '')} onClick={() => setSeleccion(t.id)}>
            <div className="fw-bold fs-5">{t.nombre}</div>
            <div className="small">{t.digitos}</div>
          </button>
        ))}
        {pendientes.length === 0 && !completo && <span className="text-secondary align-self-center">Todas las tarjetas asignadas</span>}
      </div>

      <div className="row g-3 mb-4">
        {ORDEN.map((nivel) => {
          const n = NIVELES[nivel]
          const t = TARJETAS.find((x) => x.id === asignado[nivel])
          const clases = [
            'nivel card h-100 text-center w-100',
            seleccion ? 'esperando' : '',
            escaneado?.tipo === nivel ? 'escaneado' : '',
            completo ? (asignado[nivel] === nivel ? 'correcto' : 'incorrecto') : '',
          ].join(' ')
          return (
            <div className="col-md-4" key={nivel}>
              <button className={clases} style={{ '--color': n.color }} onClick={() => asignar(nivel)}>
                <div className="card-body w-100">
                  <i className={'bi nivel-icono ' + n.icono} />
                  <div className="fw-bold fs-5 mt-2">{n.titulo}</div>
                  <div className="small text-secondary mb-3">{n.detalle}</div>
                  {t ? <span className="badge text-bg-dark fs-6">{t.nombre}</span> : <span className="small text-secondary">Sin asignar</span>}
                  {completo && asignado[nivel] !== nivel && (
                    <div className="small mt-2 text-danger">Correcto: {TARJETAS.find((x) => x.id === nivel).nombre}</div>
                  )}
                </div>
              </button>
            </div>
          )
        })}
      </div>

      {completo && (
        <div className={'card mb-4 entra ' + (correctas === 3 ? 'border-success' : 'border-warning')}>
          <div className="card-body">
            <h3 className={'h5 fw-bold ' + (correctas === 3 ? 'text-success' : 'text-warning')}>
              {correctas === 3 ? 'Cadena correcta' : `${correctas} de 3 respuestas correctas`}
            </h3>
            <p className="mb-2"><strong>GTIN-13</strong> identifica el producto que se vende al consumidor. <strong>GTIN-14</strong> identifica la caja que se solicita al proveedor; su primer dígito (indicador) distingue los tipos de empaque. <strong>SSCC</strong> identifica un pallet concreto: dos pallets idénticos tienen SSCC distintos.</p>
            <p className="text-secondary small mb-3">Identificación comercial (qué es el producto) frente a identificación logística (qué envío es).</p>
            <button className="btn btn-outline-dark btn-sm" onClick={() => setAsignado({})}>Reiniciar</button>
          </div>
        </div>
      )}

      {error && <div className="alert alert-danger">{error}</div>}
      {escaneado && (
        <div className="card">
          <div className="card-header bg-white fw-bold py-3">Último código escaneado · {escaneado.analisis.tipoEtiqueta}</div>
          <div className="card-body">
            {!escaneado.analisis.valido ? <p className="text-danger mb-0">{escaneado.analisis.mensaje}</p> : (
              <>
                <div className="font-monospace fs-4 mb-1">{escaneado.analisis.codigo}</div>
                <div>
                  <strong>{NIVELES[escaneado.tipo]?.titulo}</strong>
                  {escaneado.producto && <> · {escaneado.producto.marca} {escaneado.producto.nombre} {escaneado.producto.contenido && `(${escaneado.producto.contenido})`}</>}
                </div>
                {escaneado.contenido && <div className="text-secondary small mt-1">Contiene: {escaneado.contenido.nombre} <span className="font-monospace">{escaneado.contenido.gtin}</span></div>}
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}
