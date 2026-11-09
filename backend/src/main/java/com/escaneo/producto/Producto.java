package com.escaneo.producto;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

@Entity
@Table(name = "productos")
public class Producto {

    @Id
    private String gtin;

    @Column(nullable = false)
    private String tipo;

    private String marca;

    @Column(nullable = false)
    private String nombre;

    private String contenido;
    private BigDecimal precio;

    @Column(name = "imagen_url")
    private String imagenUrl;

    @Column(name = "gtin_contenido")
    private String gtinContenido;

    @Column(name = "unidades_por_empaque")
    private Integer unidadesPorEmpaque;

    @Column(nullable = false)
    private String fuente;

    @Column(name = "creado_en", insertable = false, updatable = false)
    private OffsetDateTime creadoEn;

    public String getGtin() { return gtin; }
    public void setGtin(String gtin) { this.gtin = gtin; }
    public String getTipo() { return tipo; }
    public void setTipo(String tipo) { this.tipo = tipo; }
    public String getMarca() { return marca; }
    public void setMarca(String marca) { this.marca = marca; }
    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }
    public String getContenido() { return contenido; }
    public void setContenido(String contenido) { this.contenido = contenido; }
    public BigDecimal getPrecio() { return precio; }
    public void setPrecio(BigDecimal precio) { this.precio = precio; }
    public String getImagenUrl() { return imagenUrl; }
    public void setImagenUrl(String imagenUrl) { this.imagenUrl = imagenUrl; }
    public String getGtinContenido() { return gtinContenido; }
    public void setGtinContenido(String gtinContenido) { this.gtinContenido = gtinContenido; }
    public Integer getUnidadesPorEmpaque() { return unidadesPorEmpaque; }
    public void setUnidadesPorEmpaque(Integer unidadesPorEmpaque) { this.unidadesPorEmpaque = unidadesPorEmpaque; }
    public String getFuente() { return fuente; }
    public void setFuente(String fuente) { this.fuente = fuente; }
    public OffsetDateTime getCreadoEn() { return creadoEn; }
}
