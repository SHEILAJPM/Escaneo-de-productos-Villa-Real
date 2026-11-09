export default function Encabezado({ etiqueta, titulo, children, acciones }) {
  return (
    <div className="d-flex flex-wrap align-items-end justify-content-between gap-3 mb-4 pb-3 border-bottom">
      <div>
        <div className="seccion-etiqueta mb-1">{etiqueta}</div>
        <h1 className="seccion-titulo h3 mb-1">{titulo}</h1>
        {children && <p className="text-secondary mb-0" style={{ maxWidth: '72ch' }}>{children}</p>}
      </div>
      {acciones}
    </div>
  )
}
