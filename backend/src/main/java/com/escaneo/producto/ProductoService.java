package com.escaneo.producto;

import com.escaneo.gs1.Gs1Analizador;
import com.escaneo.gs1.Gs1Analizador.AnalisisCodigo;
import com.escaneo.gs1.TipoCodigo;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Service
public class ProductoService {

    public enum Origen { BASE_DATOS, OPEN_FOOD_FACTS, NO_ENCONTRADO, LECTURA_INVALIDA }

    /** Respuesta de un escaneo: que se leyo, que producto es y, si es caja o pallet, que contiene. */
    public record ResultadoEscaneo(AnalisisCodigo analisis, Origen origen, Producto producto, Producto contenido) {}

    public record ProductoForm(String gtin, String marca, String nombre, String contenido,
                               BigDecimal precio, String imagenUrl, String gtinContenido,
                               Integer unidadesPorEmpaque) {}

    private final ProductoRepository repo;
    private final OpenFoodFactsClient off;

    public ProductoService(ProductoRepository repo, OpenFoodFactsClient off) {
        this.repo = repo;
        this.off = off;
    }

    @Transactional(readOnly = true)
    public List<Producto> listar() {
        return repo.findAllByOrderByTipoAscNombreAsc();
    }

    public ResultadoEscaneo escanear(String leido) {
        AnalisisCodigo a = Gs1Analizador.analizar(leido);
        if (!a.valido()) return new ResultadoEscaneo(a, Origen.LECTURA_INVALIDA, null, null);

        String clave = Gs1Analizador.aGtin13(a.codigo());
        Optional<Producto> guardado = repo.findById(clave);
        if (guardado.isPresent()) {
            Producto p = guardado.get();
            Producto contenido = p.getGtinContenido() == null ? null : repo.findById(p.getGtinContenido()).orElse(null);
            return new ResultadoEscaneo(a, Origen.BASE_DATOS, p, contenido);
        }

        if (a.tipo() == TipoCodigo.SSCC) return new ResultadoEscaneo(a, Origen.NO_ENCONTRADO, null, null);

        if (a.tipo() == TipoCodigo.GTIN_14) {
            // Caja desconocida: buscamos la unidad que contiene
            String interior = Gs1Analizador.gtin13Contenido(a.codigo());
            Producto contenido = repo.findById(interior).orElseGet(() -> desdeOpenFoodFacts(interior));
            return new ResultadoEscaneo(a, Origen.NO_ENCONTRADO, null, contenido);
        }

        Producto externo = desdeOpenFoodFacts(clave);
        return externo != null
                ? new ResultadoEscaneo(a, Origen.OPEN_FOOD_FACTS, externo, null)
                : new ResultadoEscaneo(a, Origen.NO_ENCONTRADO, null, null);
    }

    /** Producto sin guardar (sin precio) armado con datos de Open Food Facts. */
    private Producto desdeOpenFoodFacts(String gtin) {
        return off.buscar(gtin).map(d -> {
            Producto p = new Producto();
            p.setGtin(gtin);
            p.setTipo(TipoCodigo.GTIN_13.name());
            p.setMarca(d.marca());
            p.setNombre(d.nombre());
            p.setContenido(d.contenido());
            p.setImagenUrl(d.imagenUrl());
            p.setFuente("OPEN_FOOD_FACTS");
            return p;
        }).orElse(null);
    }

    @Transactional
    public Producto guardar(ProductoForm f) {
        AnalisisCodigo a = Gs1Analizador.analizar(f.gtin());
        if (!a.valido()) throw new IllegalArgumentException(a.mensaje());
        if (f.nombre() == null || f.nombre().isBlank()) throw new IllegalArgumentException("El nombre es obligatorio.");
        if (f.precio() != null && f.precio().signum() < 0) throw new IllegalArgumentException("El precio no puede ser negativo.");

        String gtin = Gs1Analizador.aGtin13(a.codigo());
        Producto p = repo.findById(gtin).orElseGet(() -> {
            Producto nuevo = new Producto();
            nuevo.setGtin(gtin);
            nuevo.setFuente("MANUAL");
            return nuevo;
        });
        p.setTipo(a.tipo() == TipoCodigo.GTIN_12 ? TipoCodigo.GTIN_13.name() : a.tipo().name());
        p.setMarca(vacioANull(f.marca()));
        p.setNombre(f.nombre().trim());
        p.setContenido(vacioANull(f.contenido()));
        p.setPrecio(f.precio());
        p.setImagenUrl(vacioANull(f.imagenUrl()));
        p.setGtinContenido(vacioANull(f.gtinContenido()));
        p.setUnidadesPorEmpaque(f.unidadesPorEmpaque());
        return repo.save(p);
    }

    @Transactional
    public void eliminar(String gtin) {
        repo.deleteById(gtin);
    }

    private static String vacioANull(String s) {
        return s == null || s.isBlank() ? null : s.trim();
    }
}
