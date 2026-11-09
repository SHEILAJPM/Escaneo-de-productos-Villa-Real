import { useEffect, useState } from 'react'
import { api, dinero } from '../api'
import CodigoBarras from './CodigoBarras'
import Encabezado from './Encabezado'

const EJEMPLO = '7501055300075'

/** Actividad 1: ¿Que informacion esconde el codigo? */
export default function Decodificar({ scan }) {
  const [entrada, setEntrada] = useState(EJEMPLO)
  const [r, setR] = useState(null)
  const [error, setError] = useState(null)
  const [revelar, setRevelar] = useState(false)

  async function analizar(codigo) {
    setError(null)
    try {
      setR(await api.escanear(codigo))
    } catch (e) {
      setError(e.message)
    }
  }

  useEffect(() => {
    if (scan) {
      setEntrada(scan.codigo)
      setRevelar(false)
      analizar(scan.codigo)
    }
  }, [scan])

  useEffect(() => { analizar(EJEMPLO) }, [])

  const a = r?.analisis
  const codigo13 = a && a.codigo.length === 12 ? '0' + a.codigo : a?.codigo

  return (
    <>
      <Encabezado etiqueta="Bloque 1 · Actividad 1" titulo="¿Qué información contiene el código?">
        Escanee un producto o ingrese su código. El grupo responde primero; luego se muestran las respuestas.
      </Encabezado>

      <form className="input-group input-group-lg mb-4" onSubmit={(e) => { e.preventDefault(); setRevelar(false); analizar(entrada) }}>
        <input className="form-control font-monospace input-codigo" value={entrada} onChange={(e) => setEntrada(e.target.value)} inputMode="numeric" />
        <button className="btn btn-dark px-4">Analizar</button>
      </form>
      {error && <div className="alert alert-danger">{error}</div>}

      {a && (
        <>
          <div className="row g-4 align-items-center mb-4">
            <div className="col-lg-7">
              {a.tipo === 'GTIN_13' || a.tipo === 'GTIN_12' ? (
                <div className="d-flex flex-wrap gap-3">
                  <Segmento clase="seg-pais" digitos={codigo13.slice(0, 3)} titulo="Prefijo GS1" detalle={revelar ? a.paisGs1 : '?'} />
                  <Segmento clase="seg-empresa flex-grow-1" digitos={codigo13.slice(3, 12)} titulo="Empresa + producto" detalle={revelar ? 'Asignado por la empresa' : '?'} />
                  <Segmento clase="seg-verif" digitos={codigo13.slice(12)} titulo="Verificador" detalle={revelar ? 'Control de lectura' : '?'} />
                </div>
              ) : (
                <div className="alert alert-light border">Código <strong>{a.tipoEtiqueta}</strong> ({a.nivel}). Para esta actividad utilice un GTIN-13.</div>
              )}
            </div>
            <div className="col-lg-5 text-center">
              <div className="border rounded p-3 bg-white d-inline-block"><CodigoBarras codigo={a.codigo} modulo={3} alto={100} /></div>
            </div>
          </div>

          <div className="row g-3 mb-4">
            <Pregunta q="¿Contiene el precio?" revelar={revelar}
              a={<>No. El código solo identifica el producto. El precio se registra en la <strong>base de datos del establecimiento</strong>
                {r.producto?.precio != null && <> (aquí: <strong>{dinero(r.producto.precio)}</strong>)</>}; por eso cada tienda puede tener un precio distinto.</>} />
            <Pregunta q="¿Indica el país de fabricación?" revelar={revelar}
              a={<>No. <strong>{a.prefijoGs1}</strong> corresponde a {a.paisGs1}: es la organización GS1 que asignó el código a la empresa, no el lugar de fabricación.</>} />
            <Pregunta q="¿Qué producto es?" revelar={revelar}
              a={r.producto
                ? <><strong>{r.producto.marca}</strong> · {r.producto.nombre} {r.producto.contenido && `(${r.producto.contenido})`}<br /><small className="text-secondary">Fuente: {r.origen === 'BASE_DATOS' ? 'base de datos propia' : 'Open Food Facts'}</small></>
                : <>No está registrado. El código por sí solo no contiene el nombre: debe consultarse en una base de datos.</>} />
            <Pregunta q="¿La lectura es válida?" revelar={revelar}
              a={<>{a.valido ? 'Sí' : 'No'}: el dígito verificador esperado es <strong>{a.digitoEsperado}</strong> y se leyó <strong>{a.digitoLeido}</strong>.</>} />
          </div>

          <div className="text-center">
            <button className="btn btn-primary btn-lg px-5" onClick={() => setRevelar(!revelar)}>
              <i className={'bi me-2 ' + (revelar ? 'bi-eye-slash' : 'bi-eye')} />{revelar ? 'Ocultar respuestas' : 'Mostrar respuestas'}
            </button>
          </div>
        </>
      )}
    </>
  )
}

function Segmento({ clase, digitos, titulo, detalle }) {
  return (
    <div className={'segmento card text-center ' + clase}>
      <div className="card-body py-3">
        <div className="segmento-digitos font-monospace">{digitos}</div>
        <div className="fw-semibold">{titulo}</div>
        <div className="small text-secondary">{detalle}</div>
      </div>
    </div>
  )
}

function Pregunta({ q, a, revelar }) {
  return (
    <div className="col-md-6 col-xl-3">
      <div className={'card h-100' + (revelar ? ' border-primary' : '')}>
        <div className="card-body">
          <h3 className="h6 fw-bold">{q}</h3>
          <p className={'mb-0 small ' + (revelar ? 'entra' : 'text-secondary')}>{revelar ? a : 'Respuesta oculta'}</p>
        </div>
      </div>
    </div>
  )
}
