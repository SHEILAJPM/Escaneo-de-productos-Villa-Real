import { useEffect, useRef } from 'react'

/**
 * El lector Argox funciona como teclado (HID): "escribe" los digitos muy rapido y termina con Enter.
 * Este hook junta esas teclas en cualquier parte de la pagina y entrega el codigo completo.
 * Si el foco esta en un campo de texto, ese campo lo maneja por su cuenta.
 */
export function useLector(alLeer, { pausado = false } = {}) {
  const buffer = useRef('')
  const ultimaTecla = useRef(0)
  const callback = useRef(alLeer)
  callback.current = alLeer

  useEffect(() => {
    function onKey(e) {
      if (pausado) return
      const t = e.target
      if (t instanceof HTMLElement && (t.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(t.tagName))) return

      const ahora = performance.now()
      // Un humano tarda >100 ms entre teclas; el lector, menos de 30 ms.
      if (ahora - ultimaTecla.current > 120) buffer.current = ''
      ultimaTecla.current = ahora

      if (e.key === 'Enter' || e.key === 'Tab') {
        const codigo = buffer.current
        buffer.current = ''
        if (codigo.replace(/\D/g, '').length >= 8) {
          e.preventDefault()
          callback.current(codigo)
        }
        return
      }
      if (e.key.length === 1) buffer.current += e.key
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [pausado])
}
