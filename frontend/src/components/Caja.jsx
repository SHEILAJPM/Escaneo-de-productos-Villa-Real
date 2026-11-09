import { useEffect, useRef, useState } from 'react'
import { api, dinero } from '../api'
import { NIVELES } from '../lib/gs1'
import { pitido } from '../lib/sonido'
import CodigoBarras from './CodigoBarras'
import Modal from './Modal'
import ProductoModal from './ProductoModal'

export default function Caja({ scan, onModal }) {
  const [ticket, setTicket] = useState([])
  const [pantalla, setPantalla] = useState(null)
  const [modal, setModal] = useState(null)
  const [recibo, setRecibo] = useState(null)
  const [manual, setManual] = useState('')
  const [cobrando, setCobrando] = useState(false)
  const procesado = useRef(null)

  useEffect(() => onModal(!!modal || !!recibo), [modal, recibo, onModal])

  useEffect(() => {
    if (scan && procesado.current !== scan.id) {
      procesado.current = scan.id
      procesar(scan.codigo)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scan])

  function agregar(p) {
    pitido(true)
    setTicket((t) => {
      const i = t.findIndex((x) => x.gtin === p.gtin)
      if (i >= 0) return t.map((x, j) => (j === i ? { ...x, cantidad: x.cantidad + 1 } : x))
      return [...t, { ...p, cantidad: 1 }]
    })
    setPantalla({ tipo: 'producto', producto: p, ts: Date.now() })
  }

  async function procesar(codigo) {
    setPantalla({ tipo: 'cargando', codigo })
    let r
    try {
      r = await api.escanear(codigo)
    } catch (e) {
      pitido(false)
      setPantalla({ tipo: 'error', titulo: 'Sin conexión con el servidor', mensaje: e.message })
      return
    }
    const { analisis: a, origen, producto, contenido } = r

    if (origen === 'LECTURA_INVALIDA') {
      pitido(false)
      setPantalla({ tipo: 'error', titulo: 'Lectura inválida', mensaje: a.mensaje, codigo: a.codigo })
      return
    }
    if (a.tipo === 'SSCC') {
      pitido(true)
      setPantalla({ tipo: 'logistica', analisis: a, producto, contenido })
      return
    }
    if (origen === 'BASE_DATOS' && producto.precio != null) {
      agregar(producto)
      return
    }

    pitido(true)
    let inicial = producto ?? { gtin: a.codigo.length === 12 ? '0' + a.codigo : a.codigo }
    let aviso = 'El código no está registrado. Ingrese los datos una vez y quedarán guardados en la base de datos.'
    let titulo = 'Registrar producto'
    if (origen === 'OPEN_FOOD_FACTS') {
      aviso = 'Marca y nombre obtenidos de Open Food Facts. Las bases abiertas no incluyen precios: cada establecimiento define el suyo.'
      titulo = 'Asignar precio'
    } else if (origen === 'BASE_DATOS') {
      aviso = 'El producto está registrado, pero no tiene precio asignado.'
      titulo = 'Asignar precio'
    } else if (a.tipo === 'GTIN_14' && contenido) {
      inicial = {
        gtin: a.codigo, marca: contenido.marca, nombre: 'Caja de ' + contenido.nombre,
        gtinContenido: contenido.gtin, imagenUrl: contenido.imagenUrl,
      }
      aviso = `Código GTIN-14 (agrupación comercial). Contiene: ${contenido.marca ?? ''} ${contenido.nombre}. Indique las unidades por caja y su precio.`
    }
    setPantalla({ tipo: 'cargando', codigo: a.codigo, nota: 'Esperando datos del producto…' })
    setModal({ inicial, aviso, titulo })
  }

  function enviarManual(e) {
    e.preventDefault()
    if (manual.trim()) procesar(manual.trim())
    setManual('')
  }

  const cambiarCantidad = (gtin, delta) =>
    setTicket((t) => t.map((x) => (x.gtin === gtin ? { ...x, cantidad: x.cantidad + delta } : x)).filter((x) => x.cantidad > 0))

  const total = ticket.reduce((s, x) => s + Number(x.precio) * x.cantidad, 0)
  const articulos = ticket.reduce((s, x) => s + x.cantidad, 0)

  async function cobrar() {
    setCobrando(true)
    try {
      setRecibo(await api.cobrar(ticket.map((x) => ({ gtin: x.gtin, cantidad: x.cantidad }))))
    } catch (e) {
      setPantalla({ tipo: 'error', titulo: 'No se pudo registrar la venta', mensaje: e.message })
    }
    setCobrando(false)
  }

  function nuevaVenta() {
    setRecibo(null)
    setTicket([])
    setPantalla(null)
  }

  return (
    <div className="row g-4">
      <div className="col-lg-8 d-flex flex-column gap-4">
        <Pantalla estado={pantalla} />

        <div className="card">
          <div className="card-header bg-white d-flex justify-content-between align-items-center py-3">
            <span className="fw-bold">Detalle de la venta</span>
            <span className="badge text-bg-light border">{articulos} artículo{articulos === 1 ? '' : 's'}</span>
          </div>
          {ticket.length === 0 ? (
            <div className="card-body text-center text-secondary py-5">
              <i className="bi bi-upc-scan fs-2 d-block mb-2" />
              Escanee un producto para iniciar la venta.
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table align-middle mb-0">
                <thead className="table-light small text-uppercase">
                  <tr><th>Producto</th><th className="text-center">Cant.</th><th className="text-end">P. unit.</th><th className="text-end">Importe</th></tr>
                </thead>
                <tbody>
                  {ticket.map((x) => (
                    <tr key={x.gtin}>
                      <td>
                        <div className="fw-semibold">{x.nombre}</div>
                        <div className="small text-secondary">{x.marca}{x.contenido ? ' · ' + x.contenido : ''} · <span className="font-monospace">{x.gtin}</span></div>
                      </td>
                      <td className="text-center text-nowrap">
                        <div className="btn-group btn-group-sm">
                          <button className="btn btn-outline-secondary" onClick={() => cambiarCantidad(x.gtin, -1)} aria-label="Quitar uno"><i className="bi bi-dash" /></button>
                          <span className="btn btn-outline-secondary disabled text-dark fw-semibold">{x.cantidad}</span>
                          <button className="btn btn-outline-secondary" onClick={() => cambiarCantidad(x.gtin, 1)} aria-label="Agregar uno"><i className="bi bi-plus" /></button>
                        </div>
                      </td>
                      <td className="text-end tabular text-nowrap">{dinero(x.precio)}</td>
                      <td className="text-end tabular fw-semibold text-nowrap">{dinero(x.precio * x.cantidad)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <div className="col-lg-4 d-flex flex-column gap-3">
        <div className="card total bg-dark text-white">
          <div className="card-body">
            <div className="small text-uppercase opacity-75 fw-semibold">Total a pagar</div>
            <div className="total-monto">{dinero(total)}</div>
            <div className="small opacity-75">IGV incluido · {articulos} artículos</div>
          </div>
        </div>
        <button className="btn btn-primary btn-lg py-3 fw-semibold" disabled={!ticket.length || cobrando} onClick={cobrar}>
          <i className="bi bi-cash-coin me-2" />{cobrando ? 'Procesando…' : 'Cobrar'}
        </button>
        <button className="btn btn-outline-secondary" disabled={!ticket.length} onClick={nuevaVenta}>Anular venta</button>

        <form className="card" onSubmit={enviarManual}>
          <div className="card-body">
            <label className="form-label small fw-semibold">Ingreso manual del código</label>
            <div className="input-group">
              <input className="form-control font-monospace" value={manual} onChange={(e) => setManual(e.target.value)} inputMode="numeric" placeholder="7751234567890" />
              <button className="btn btn-dark"><i className="bi bi-search" /></button>
            </div>
            <div className="form-text">Use esta opción si el lector no logra leer el código.</div>
          </div>
        </form>
      </div>

      {modal && (
        <ProductoModal
          {...modal}
          onCerrar={() => { setModal(null); setPantalla(null) }}
          onGuardado={(p) => {
            setModal(null)
            if (p.tipo === 'SSCC') setPantalla({ tipo: 'logistica', analisis: { codigo: p.gtin }, producto: p })
            else agregar(p)
          }}
        />
      )}

      {recibo && <Recibo venta={recibo} onNueva={nuevaVenta} />}
    </div>
  )
}

function Pantalla({ estado }) {
  if (!estado) {
    return (
      <div className="card pantalla">
        <div className="card-body d-flex flex-column align-items-center justify-content-center text-center">
          <i className="bi bi-upc-scan display-4 text-primary mb-3" />
          <h2 className="h4 fw-bold">Lector listo</h2>
          <p className="text-secondary mb-0">Pase un producto por el lector para mostrar su marca, nombre y precio.</p>
        </div>
      </div>
    )
  }
  if (estado.tipo === 'cargando') {
    return (
      <div className="card pantalla">
        <div className="card-body d-flex flex-column align-items-center justify-content-center text-center gap-2">
          <div className="spinner-border text-primary" role="status" />
          <div className="font-monospace fs-4">{estado.codigo}</div>
          <div className="text-secondary">{estado.nota ?? 'Consultando base de datos…'}</div>
        </div>
      </div>
    )
  }
  if (estado.tipo === 'error') {
    return (
      <div className="card pantalla estado-error sacude">
        <div className="card-body d-flex flex-column justify-content-center gap-2">
          <h2 className="h4 fw-bold text-danger mb-0"><i className="bi bi-x-octagon me-2" />{estado.titulo}</h2>
          {estado.codigo && <div className="font-monospace fs-4">{estado.codigo}</div>}
          <p className="mb-0">{estado.mensaje}</p>
        </div>
      </div>
    )
  }
  if (estado.tipo === 'logistica') {
    const { analisis, producto, contenido } = estado
    return (
      <div className="card pantalla estado-logistica">
        <div className="card-body d-flex flex-column gap-2">
          <span className="badge text-bg-dark align-self-start"><i className="bi bi-truck me-1" />SSCC · Unidad logística</span>
          <h2 className="h3 fw-bold mb-0">{producto ? producto.nombre : 'Pallet no registrado'}</h2>
          <p className="mb-0">
            El SSCC identifica un pallet específico durante su traslado del proveedor al centro de distribución.
            No se vende en caja: se utiliza para la recepción de mercadería y la trazabilidad del envío.
          </p>
          {producto?.contenido && <p className="mb-0">Contenido: <strong>{producto.contenido}</strong>{contenido ? ` de ${contenido.nombre}` : ''}</p>}
          <div><CodigoBarras codigo={analisis.codigo} modulo={2} alto={60} /></div>
        </div>
      </div>
    )
  }
  const p = estado.producto
  const nivel = NIVELES[p.tipo] ?? NIVELES.GTIN_13
  return (
    <div className="card pantalla estado-ok entra" key={estado.ts}>
      <div className="card-body d-flex flex-wrap align-items-center gap-4">
        <div className="pantalla-img rounded d-flex align-items-center justify-content-center flex-shrink-0">
          <i className={'bi ' + nivel.icono + ' display-5 text-secondary'} />
          {p.imagenUrl && <img src={p.imagenUrl} alt="" onError={(e) => e.currentTarget.remove()} />}
        </div>
        <div className="flex-grow-1" style={{ minWidth: 220 }}>
          <span className="badge rounded-pill mb-2" style={{ background: nivel.color }}>{nivel.titulo}</span>
          <div className="pantalla-marca">{p.marca ?? 'Sin marca'}</div>
          <h2 className="h2 fw-bold mb-1">{p.nombre}</h2>
          <div className="text-secondary">
            {p.contenido}{p.unidadesPorEmpaque && p.tipo === 'GTIN_14' ? ` · ${p.unidadesPorEmpaque} unidades` : ''}
          </div>
          <div className="pantalla-precio">{dinero(p.precio)}</div>
        </div>
        <div className="flex-shrink-0">
          <CodigoBarras codigo={p.gtin} modulo={2} alto={56} />
        </div>
      </div>
    </div>
  )
}

function Recibo({ venta, onNueva }) {
  useEffect(() => {
    const k = (e) => e.key === 'Enter' && onNueva()
    window.addEventListener('keydown', k)
    return () => window.removeEventListener('keydown', k)
  }, [onNueva])

  return (
    <Modal titulo="Venta registrada" onCerrar={onNueva}
      pie={<button className="btn btn-primary w-100 py-2" onClick={onNueva}>Nueva venta</button>}>
      <div className="modal-body">
        <div className="recibo border rounded p-3 bg-light">
          <div className="text-center fw-bold">BOLETA DE VENTA ELECTRÓNICA</div>
          <div className="text-center text-secondary mb-3">
            N.° B001-{String(venta.id).padStart(6, '0')} · {new Date(venta.fecha).toLocaleString('es-PE')}
          </div>
          <table className="table table-sm mb-2">
            <tbody>
              {venta.items.map((i) => (
                <tr key={i.id}>
                  <td>{i.cantidad} × {i.nombre}<br /><small className="text-secondary">{i.gtin}</small></td>
                  <td className="text-end">{dinero(i.subtotal)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="d-flex justify-content-between fs-5 fw-bold"><span>TOTAL</span><span>{dinero(venta.total)}</span></div>
          <div className="text-center text-secondary small mt-2">{venta.articulos} artículos · registrado en la base de datos</div>
        </div>
      </div>
    </Modal>
  )
}
