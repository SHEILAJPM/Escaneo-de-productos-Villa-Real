package com.escaneo.intento;

import jakarta.persistence.*;

import java.time.OffsetDateTime;

@Entity
@Table(name = "intentos_escaneo")
public class IntentoEscaneo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String codigo;
    private String tipo;

    @Column(nullable = false)
    private String material;

    @Column(nullable = false)
    private boolean exito;

    private String nota;

    @Column(nullable = false)
    private OffsetDateTime fecha = OffsetDateTime.now();

    public Long getId() { return id; }
    public String getCodigo() { return codigo; }
    public void setCodigo(String codigo) { this.codigo = codigo; }
    public String getTipo() { return tipo; }
    public void setTipo(String tipo) { this.tipo = tipo; }
    public String getMaterial() { return material; }
    public void setMaterial(String material) { this.material = material; }
    public boolean isExito() { return exito; }
    public void setExito(boolean exito) { this.exito = exito; }
    public String getNota() { return nota; }
    public void setNota(String nota) { this.nota = nota; }
    public OffsetDateTime getFecha() { return fecha; }
}
