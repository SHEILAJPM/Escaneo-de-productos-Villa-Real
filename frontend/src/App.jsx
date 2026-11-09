import { useCallback, useEffect, useRef, useState } from 'react'
import { api } from './api'
import { useLector } from './hooks/useLector'
import { pitido } from './lib/sonido'
import Caja from './components/Caja'
import Decodificar from './components/Decodificar'
import Verificador from './components/Verificador'
import Intentos from './components/Intentos'
import Cadena from './components/Cadena'
import Etiquetas from './components/Etiquetas'
import Catalogo from './components/Catalogo'

const SECCIONES = [
  { id: 'caja', nombre: 'Punto de venta', icono: 'bi-upc-scan' },
  { id: 'decodificar', nombre: 'Estructura del código', icono: 'bi-search' },
  { id: 'verificador', nombre: 'Dígito verificador', icono: 'bi-calculator' },
  { id: 'intentos', nombre: 'Prueba de lectura', icono: 'bi-clipboard-data' },
  { id: 'cadena', nombre: 'Cadena de identificación', icono: 'bi-diagram-3' },
  { id: 'etiquetas', nombre: 'Etiquetas', icono: 'bi-printer' },
  { id: 'catalogo', nombre: 'Base de datos', icono: 'bi-database' },
]

function leerSeccion() {
  try { return localStorage.getItem('seccion') || 'caja' } catch { return 'caja' }
}

export default function App() {
  const [seccion, setSeccion] = useState(leerSeccion)
  const [scan, setScan] = useState(null)
  const [estado, setEstado] = useState(null)
  const [material, setMaterial] = useState(null)
  const [versionIntentos, setVersionIntentos] = useState(0)
  const [modalAbierto, setModalAbierto] = useState(false)
  const [destello, setDestello] = useState(null)
  const contador = useRef(0)

  useEffect(() => {
    try { localStorage.setItem('seccion', seccion) } catch { /* sin almacenamiento */ }
  }, [seccion])

  useEffect(() => {
    const revisar = () => api.estado().then(setEstado).catch(() => setEstado({ estado: 'caido' }))
    revisar()
    const t = setInterval(revisar, 15000)
    return () => clearInterval(t)
  }, [])

  const registrarIntento = useCallback(async (codigo) => {
    if (!material) return
    try {
      const i = await api.registrarIntento(codigo, material)
      pitido(i.exito)
      setDestello(i.exito ? 'ok' : 'mal')
      setTimeout(() => setDestello(null), 700)
      setVersionIntentos((v) => v + 1)
    } catch { /* el error se muestra en la seccion */ }
  }, [material])

  useLector((codigo) => {
    contador.current += 1
    setScan({ codigo, id: contador.current })
    if (seccion === 'intentos') registrarIntento(codigo)
  }, { pausado: modalAbierto })

  const vista = {
    caja: <Caja scan={scan} onModal={setModalAbierto} />,
    decodificar: <Decodificar scan={scan} />,
    verificador: <Verificador scan={scan} />,
    intentos: <Intentos material={material} setMaterial={setMaterial} version={versionIntentos} onRegistrar={registrarIntento} />,
    cadena: <Cadena scan={scan} />,
    etiquetas: <Etiquetas />,
    catalogo: <Catalogo onModal={setModalAbierto} />,
  }[seccion]

  const conectado = estado?.estado === 'ok'

  return (
    <div className={'d-flex flex-column min-vh-100 ' + (destello ? 'destello-' + destello : '')}>
      <header className="cabecera bg-white no-imprimir">
        <div className="container-xxl d-flex flex-wrap align-items-center gap-3 py-3">
          <div className="d-flex flex-column align-items-center">
            <img src="/logo-unfv.png" alt="Universidad Nacional Federico Villarreal" className="cabecera-logo" />
            <span className="grupo">Grupo 6</span>
          </div>
          <div className="cabecera-titulo ps-3 d-none d-md-block">
            <small className="text-secondary text-uppercase d-block">Laboratorio de identificación</small>
            <span className="fw-bold fs-5">Sistema de Códigos de Barras GS1</span>
          </div>
          <div className="ms-auto d-flex align-items-center gap-2 small">
            <span className={'estado-punto ' + (conectado ? 'on' : estado ? 'off' : '')} />
            <div className="lh-sm">
              <div className="fw-semibold">{conectado ? 'Lector listo' : estado ? 'Servidor no disponible' : 'Conectando…'}</div>
              <div className="text-secondary">{conectado ? estado.base : 'Inicie el backend (puerto 8080)'}</div>
            </div>
          </div>
        </div>
        <nav className="menu border-top">
          <div className="container-xxl">
            <ul className="nav">
              {SECCIONES.map((s) => (
                <li className="nav-item" key={s.id}>
                  <button className={'nav-link btn btn-link text-decoration-none' + (seccion === s.id ? ' active' : '')}
                    onClick={() => { setSeccion(s.id); setScan(null) }}>
                    <i className={'bi ' + s.icono + ' me-2'} />{s.nombre}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </nav>
      </header>

      <main className="container-xxl py-4 flex-grow-1">{vista}</main>

      <footer className="pie bg-white py-3 no-imprimir">
        <div className="container-xxl d-flex flex-wrap justify-content-between gap-2 small text-secondary">
          <span>Universidad Nacional Federico Villarreal</span>
          <span>Identificación de productos con estándares GS1</span>
        </div>
      </footer>

      {scan && (
        <div className="toast-escaneo bg-dark text-white rounded px-3 py-2 small no-imprimir" key={scan.id}>
          Último escaneo <span className="font-monospace fw-bold ms-1">{scan.codigo}</span>
        </div>
      )}
    </div>
  )
}
