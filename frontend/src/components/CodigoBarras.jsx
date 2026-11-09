import { useEffect, useRef, useState } from 'react'
import JsBarcode from 'jsbarcode'

/** Simbologia GS1 correcta segun el identificador. */
export function formatoPara(codigo) {
  switch (codigo.length) {
    case 8: return { format: 'EAN8', value: codigo }
    case 12: return { format: 'UPC', value: codigo }
    case 13: return { format: 'EAN13', value: codigo }
    case 14: return { format: 'ITF14', value: codigo }
    // SSCC en GS1-128 con identificador de aplicacion (00); ean128 agrega el FNC1 inicial
    case 18: return { format: 'CODE128', value: '00' + codigo, ean128: true, text: '(00) ' + codigo }
    default: return { format: 'CODE128', value: codigo }
  }
}

/**
 * Codigo de barras real y escaneable. Para que el Argox lo lea:
 * barras negras sobre fondo blanco, zona de silencio (margen) a los lados y modulo >= 2 px.
 */
export default function CodigoBarras({ codigo, modulo = 2, alto = 80, colorBarras = '#000', margen = 14, className = '' }) {
  const ref = useRef(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!ref.current || !codigo) return
    const { format, value, ean128, text } = formatoPara(codigo)
    try {
      JsBarcode(ref.current, value, {
        format,
        ean128,
        text,
        width: modulo,
        height: alto,
        margin: margen,
        lineColor: colorBarras,
        background: '#ffffff',
        font: 'Consolas, Menlo, monospace',
        fontSize: 16,
        textMargin: 4,
        flat: format === 'EAN13' ? false : undefined,
      })
      setError(null)
    } catch {
      setError('Código no válido para ' + format)
    }
  }, [codigo, modulo, alto, colorBarras, margen])

  if (error) return <div className="cb-error">{error}</div>
  return <svg ref={ref} className={'codigo-barras ' + className} role="img" aria-label={'Código de barras ' + codigo} />
}
