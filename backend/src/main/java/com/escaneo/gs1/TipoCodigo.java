package com.escaneo.gs1;

public enum TipoCodigo {
    GTIN_8("GTIN-8", "Unidad de venta (envase pequeño)"),
    GTIN_12("GTIN-12 (UPC-A)", "Unidad de venta (Norteamérica)"),
    GTIN_13("GTIN-13 (EAN-13)", "Unidad de venta al consumidor"),
    GTIN_14("GTIN-14", "Agrupación comercial (caja / bulto)"),
    SSCC("SSCC", "Unidad logística (pallet)"),
    DESCONOCIDO("Desconocido", "No es un identificador GS1 reconocido");

    private final String etiqueta;
    private final String nivel;

    TipoCodigo(String etiqueta, String nivel) {
        this.etiqueta = etiqueta;
        this.nivel = nivel;
    }

    public String getEtiqueta() { return etiqueta; }
    public String getNivel() { return nivel; }
}
