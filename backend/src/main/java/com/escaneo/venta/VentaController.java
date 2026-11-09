package com.escaneo.venta;

import com.escaneo.producto.Producto;
import com.escaneo.producto.ProductoRepository;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/ventas")
public class VentaController {

    public record Linea(String gtin, int cantidad) {}
    public record NuevaVenta(List<Linea> items) {}

    private final VentaRepository ventas;
    private final ProductoRepository productos;

    public VentaController(VentaRepository ventas, ProductoRepository productos) {
        this.ventas = ventas;
        this.productos = productos;
    }

    /** El total se calcula aqui con los precios de la base, no con lo que mande el navegador. */
    @PostMapping
    @Transactional
    public Venta cobrar(@RequestBody NuevaVenta pedido) {
        if (pedido.items() == null || pedido.items().isEmpty()) {
            throw new IllegalArgumentException("El ticket está vacío.");
        }
        Venta venta = new Venta();
        BigDecimal total = BigDecimal.ZERO;
        int articulos = 0;
        for (Linea l : pedido.items()) {
            if (l.cantidad() <= 0) continue;
            Producto p = productos.findById(l.gtin())
                    .orElseThrow(() -> new IllegalArgumentException("Producto " + l.gtin() + " no registrado."));
            if (p.getPrecio() == null) throw new IllegalArgumentException(p.getNombre() + " no tiene precio.");
            BigDecimal subtotal = p.getPrecio().multiply(BigDecimal.valueOf(l.cantidad()));
            VentaItem item = new VentaItem();
            item.setGtin(p.getGtin());
            item.setMarca(p.getMarca());
            item.setNombre(p.getNombre());
            item.setPrecioUnitario(p.getPrecio());
            item.setCantidad(l.cantidad());
            item.setSubtotal(subtotal);
            venta.agregar(item);
            total = total.add(subtotal);
            articulos += l.cantidad();
        }
        venta.setTotal(total);
        venta.setArticulos(articulos);
        return ventas.save(venta);
    }

    @GetMapping
    @Transactional(readOnly = true)
    public List<Venta> recientes() {
        return ventas.findTop20ByOrderByIdDesc();
    }
}
