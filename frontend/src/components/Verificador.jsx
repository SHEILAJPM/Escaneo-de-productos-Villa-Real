import { useEffect, useState } from 'react'
import { pasosDigito } from '../lib/gs1'
import Encabezado from './Encabezado'

/** Actividad 2: Descubre el numero que falta */
export default function Verificador({ scan }) {
  const [base, setBase] = useState('775123456789')
  const [respuesta, setRespuesta] = useState('')
  const [mostrar, setMostrar] = useState(false)

  useEffect(() => {
    if (!scan) return
    const d = scan.codigo.replace(/\D/g, '')
    if (d.length >= 8) {
      setBase(d.slice(0, -1))
      setRespuesta('')
      setMostrar(false)
    }
  }, [scan])

  const limpio = base.replace(/\D/g, '')
  const valido = [7, 11, 12, 13, 17].includes(limpio.length)
  const { pasos, suma, decena, digito } = pasosDigito(limpio)
  const acierto = respuesta !== '' && Number(respuesta) === digito

  return (
    <>
      <Encabezado etiqueta="Bloque 1 · Actividad 2" titulo="Cálculo del dígito verificador">
        Se muestran los primeros {limpio.length} dígitos. Multiplique de derecha a izquierda por 3, 1, 3, 1… y calcule cuánto falta para la siguiente decena.
      </Encabezado>

      <div className="d-flex gap-3 align-items-center mb-4">
        <input className="form-control form-control-lg font-monospace input-codigo" value={base} maxLength={17} inputMode="numeric"
          onChange={(e) => { setBase(e.target.value); setMostrar(false); setRespuesta('') }} />
        <div className="digito-faltante rounded d-flex align-items-center justify-content-center font-monospace flex-shrink-0">
          {mostrar && valido ? digito : '?'}
        </div>
      </div>
      {!valido && <div className="alert alert-light border">Ingrese 12 dígitos (GTIN-13), 13 (GTIN-14), 7 (GTIN-8) o 17 (SSCC).</div>}

      {valido && (
        <>
          <div className="table-responsive mb-4">
            <table className="table table-bordered text-center font-monospace align-middle pasos mb-0">
              <tbody>
                <tr><th className="table-light small font-sans">Dígito</th>{pasos.map((p) => <td key={p.posicion} className="fw-bold">{p.digito}</td>)}</tr>
                <tr><th className="table-light small">Peso</th>{pasos.map((p) => <td key={p.posicion} className={'peso-' + p.peso}>×{p.peso}</td>)}</tr>
                <tr><th className="table-light small">Resultado</th>{pasos.map((p) => <td key={p.posicion}>{mostrar ? p.producto : '·'}</td>)}</tr>
              </tbody>
            </table>
          </div>

          <div className="d-flex flex-wrap justify-content-center align-items-end gap-3 mb-4">
            <div>
              <label className="form-label small fw-semibold">Respuesta del grupo</label>
              <input className="form-control form-control-lg text-center font-monospace" style={{ width: 90 }} maxLength={1} inputMode="numeric"
                value={respuesta} onChange={(e) => setRespuesta(e.target.value.replace(/\D/g, ''))} />
            </div>
            <button className="btn btn-primary btn-lg px-5" onClick={() => setMostrar(true)}>Comprobar</button>
          </div>

          {mostrar && (
            <div className={'card text-center entra ' + (respuesta === '' ? '' : acierto ? 'border-success' : 'border-warning')}>
              <div className="card-body">
                <p className="font-monospace fs-5 mb-2">
                  Suma = {suma} → siguiente decena = {decena} → {decena} − {suma} = <strong>{digito}</strong>
                </p>
                <p className="font-monospace fs-3 mb-2">{limpio}<span className="resaltado">{digito}</span></p>
                {respuesta !== '' && (
                  <p className={'fs-4 fw-bold mb-2 ' + (acierto ? 'text-success' : 'text-warning')}>
                    {acierto ? 'Respuesta correcta' : `Respuesta incorrecta: el dígito es ${digito}`}
                  </p>
                )}
                <p className="text-secondary small mb-0">Si el lector interpreta mal un dígito, el cálculo no coincide y el sistema rechaza la lectura en lugar de registrar otro producto.</p>
              </div>
            </div>
          )}
        </>
      )}
    </>
  )
}
