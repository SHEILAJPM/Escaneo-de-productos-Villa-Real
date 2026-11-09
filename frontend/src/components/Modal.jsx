import { useEffect } from 'react'

/** Modal de Bootstrap controlado por React (sin el JS de Bootstrap). */
export default function Modal({ titulo, onCerrar, children, pie, ancho = '' }) {
  useEffect(() => {
    const esc = (e) => e.key === 'Escape' && onCerrar?.()
    window.addEventListener('keydown', esc)
    document.body.classList.add('modal-open')
    return () => {
      window.removeEventListener('keydown', esc)
      document.body.classList.remove('modal-open')
    }
  }, [onCerrar])

  return (
    <>
      <div className="modal d-block" tabIndex={-1} role="dialog" aria-modal="true"
        onMouseDown={(e) => e.target === e.currentTarget && onCerrar?.()}>
        <div className={'modal-dialog modal-dialog-centered modal-dialog-scrollable ' + ancho}>
          <div className="modal-content border-0 shadow">
            {titulo && (
              <div className="modal-header">
                <h5 className="modal-title fw-bold">{titulo}</h5>
                {onCerrar && <button type="button" className="btn-close" aria-label="Cerrar" onClick={onCerrar} />}
              </div>
            )}
            {children}
            {pie && <div className="modal-footer">{pie}</div>}
          </div>
        </div>
      </div>
      <div className="modal-backdrop show" />
    </>
  )
}
