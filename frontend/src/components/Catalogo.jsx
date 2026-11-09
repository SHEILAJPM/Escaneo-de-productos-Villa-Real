import { useEffect, useState } from 'react'
import { api, dinero } from '../api'
import { NIVELES } from '../lib/gs1'
import Encabezado from './Encabezado'
import ProductoModal from './ProductoModal'

export default function Catalogo({ onModal }) {
  const [productos, setProductos] = useState([])
  const [ventas, setVentas] = useState([])
  const [editar, setEditar] = useState(null)
  const [filtro, setFiltro] = useState('')
  const [error, setError] = useState(null)

  const cargar = () =>
    Promise.all([api.productos(), api.ventas()])
      .then(([p, v]) => { setProductos(p); setVentas(v); setError(null) })
      .catch((e) => setError(e.message))

  useEffect(() => { cargar() }, [])
  useEffect(() => onModal(!!editar), [editar, onModal])

  async function eliminar(p) {
    if (!confirm(`¿Eliminar ${p.nombre}?`)) return
    await api.eliminarProducto(p.gtin)
    cargar()
  }

  const f = filtro.toLowerCase()
  const visibles = productos.filter((p) => !f || [p.gtin, p.nombre, p.marca].some((x) => x?.toLowerCase().includes(f)))
  const vendido = ventas.reduce((s, v) => s + Number(v.total), 0)

  return (
    <>
      <Encabezado etiqueta="Administración" titulo="Catálogo de productos"
        acciones={<button className="btn btn-primary" onClick={() => setEditar({ titulo: 'Nuevo producto', inicial: {} })}><i className="bi bi-plus-lg me-2" />Nuevo producto</button>}>
        El código de barras es la clave que vincula cada producto con su precio en la base de datos.
      </Encabezado>

      <div className="row g-3 mb-4">
        {[
          ['Productos registrados', productos.length],
          ['Ventas registradas', ventas.length],
          ['Monto vendido (últimas 20)', dinero(vendido)],
        ].map(([t, v]) => (
          <div className="col-md-4" key={t}>
            <div className="card h-100 border-start border-4 border-primary">
              <div className="card-body">
                <div className="small text-secondary">{t}</div>
                <div className="fs-3 fw-bold tabular">{v}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="input-group mb-3" style={{ maxWidth: 420 }}>
        <span className="input-group-text bg-white"><i className="bi bi-search" /></span>
        <input className="form-control" placeholder="Buscar por código, nombre o marca" value={filtro} onChange={(e) => setFiltro(e.target.value)} />
      </div>
      {error && <div className="alert alert-danger">{error}</div>}

      <div className="card">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light small text-uppercase">
              <tr><th>Código</th><th>Tipo</th><th>Marca</th><th>Producto</th><th>Contenido</th><th className="text-end">Precio</th><th>Origen</th><th></th></tr>
            </thead>
            <tbody>
              {visibles.map((p) => (
                <tr key={p.gtin}>
                  <td className="font-monospace small">{p.gtin}</td>
                  <td><span className="badge" style={{ background: NIVELES[p.tipo]?.color }}>{p.tipo.replace('_', '-')}</span></td>
                  <td>{p.marca}</td>
                  <td className="fw-semibold">{p.nombre}</td>
                  <td className="text-secondary">{p.contenido}</td>
                  <td className="text-end tabular text-nowrap">{dinero(p.precio)}</td>
                  <td className="small text-secondary">{p.fuente}</td>
                  <td className="text-end text-nowrap">
                    <button className="btn btn-sm btn-outline-secondary me-1" onClick={() => setEditar({ titulo: 'Editar producto', inicial: p })} aria-label="Editar"><i className="bi bi-pencil" /></button>
                    <button className="btn btn-sm btn-outline-danger" onClick={() => eliminar(p)} aria-label="Eliminar"><i className="bi bi-trash" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {editar && <ProductoModal {...editar} onCerrar={() => setEditar(null)} onGuardado={() => { setEditar(null); cargar() }} />}
    </>
  )
}
