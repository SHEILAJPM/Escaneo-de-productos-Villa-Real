package com.escaneo.venta;

import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "ventas")
public class Venta {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private OffsetDateTime fecha = OffsetDateTime.now();

    @Column(nullable = false)
    private int articulos;

    @Column(nullable = false)
    private BigDecimal total;

    @OneToMany(mappedBy = "venta", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    private List<VentaItem> items = new ArrayList<>();

    public void agregar(VentaItem item) {
        item.setVenta(this);
        items.add(item);
    }

    public Long getId() { return id; }
    public OffsetDateTime getFecha() { return fecha; }
    public int getArticulos() { return articulos; }
    public void setArticulos(int articulos) { this.articulos = articulos; }
    public BigDecimal getTotal() { return total; }
    public void setTotal(BigDecimal total) { this.total = total; }
    public List<VentaItem> getItems() { return items; }
}
