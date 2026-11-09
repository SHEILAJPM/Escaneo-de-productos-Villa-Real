import { useEffect, useRef, useState } from 'react'
import { api } from '../api'
import Modal from './Modal'

/** Alta / edicion de producto. Se abre cuando el codigo no existe en la base o no tiene precio. */
export default function ProductoModal({ inicial, titulo, aviso, onGuardado, onCerrar }) {
  const [f, setF] = useState(() => ({
    gtin: '', marca: '', nombre: '', contenido: '', precio: '', imagenUrl: '',
    gtinContenido: '', unidadesPorEmpaque: '',
    ...Object.fromEntries(Object.entries(inicial || {}).map(([k, v]) => [k, v ?? ''])),
  }))
  const [error, setError] = useState(null)
  const [guardando, setGuardando] = useState(false)
  const precioRef = useRef(null)
  const nombreRef = useRef(null)

  useEffect(() => {
    ;(f.nombre ? precioRef : nombreRef).current?.focus()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const set = (k) => (e) => setF({ ...f, [k]: e.target.value })
  const esCaja = f.gtin.length === 14
  const esPallet = f.gtin.length === 18

  async function guardar(e) {
    e.preventDefault()
    setGuardando(true)
    setError(null)
    try {
      const p = await api.guardarProducto({
        ...f,
        precio: f.precio === '' ? null : Number(f.precio),
        unidadesPorEmpaque: f.unidadesPorEmpaque === '' ? null : Number(f.unidadesPorEmpaque),
      })
      onGuardado(p)
    } catch (err) {
      setError(err.message)
      setGuardando(false)
    }
  }

  return (
    <Modal titulo={titulo} onCerrar={onCerrar}>
      <form onSubmit={guardar}>
        <div className="modal-body">
          {aviso && <div className="alert alert-light border small">{aviso}</div>}
          <div className="row g-3">
            <div className="col-12">
              <label className="form-label small fw-semibold">Código</label>
              <input className="form-control font-monospace" value={f.gtin} onChange={set('gtin')} inputMode="numeric" readOnly={!!inicial?.gtin} required />
            </div>
            <div className="col-md-6">
              <label className="form-label small fw-semibold">Marca</label>
              <input className="form-control" value={f.marca} onChange={set('marca')} />
            </div>
            <div className="col-md-6">
              <label className="form-label small fw-semibold">Contenido</label>
              <input className="form-control" value={f.contenido} onChange={set('contenido')} placeholder="1 L, 500 g…" />
            </div>
            <div className="col-12">
              <label className="form-label small fw-semibold">Nombre del producto</label>
              <input ref={nombreRef} className="form-control" value={f.nombre} onChange={set('nombre')} required />
            </div>
            {!esPallet && (
              <div className="col-12">
                <label className="form-label small fw-semibold">Precio</label>
                <div className="input-group input-group-lg">
                  <span className="input-group-text">S/</span>
                  <input ref={precioRef} className="form-control fw-bold" type="number" min="0" step="0.01" value={f.precio} onChange={set('precio')} required placeholder="0.00" />
                </div>
              </div>
            )}
            {(esCaja || esPallet) && (
              <>
                <div className="col-md-6">
                  <label className="form-label small fw-semibold">{esCaja ? 'GTIN-13 contenido' : 'GTIN-14 contenido'}</label>
                  <input className="form-control font-monospace" value={f.gtinContenido} onChange={set('gtinContenido')} />
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-semibold">{esCaja ? 'Unidades por caja' : 'Cajas por pallet'}</label>
                  <input className="form-control" type="number" min="1" value={f.unidadesPorEmpaque} onChange={set('unidadesPorEmpaque')} />
                </div>
              </>
            )}
          </div>
          {error && <div className="alert alert-danger mt-3 mb-0 py-2 small">{error}</div>}
        </div>
        <div className="modal-footer">
          <button type="button" className="btn btn-outline-secondary" onClick={onCerrar}>Cancelar</button>
          <button className="btn btn-primary" disabled={guardando}>
            {guardando ? 'Guardando…' : 'Guardar producto'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
