package com.escaneo.gs1;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class Gs1AnalizadorTest {

    @Test
    void calculaDigitoVerificadorGtin13() {
        assertEquals(2, Gs1Analizador.calcularDigito("200100000001"));
        assertTrue(Gs1Analizador.analizar("2001000000012").valido());
        assertFalse(Gs1Analizador.analizar("2001000000013").valido());
    }

    @Test
    void reconoceTiposPorLongitud() {
        assertEquals(TipoCodigo.GTIN_14, Gs1Analizador.analizar("12001000000019").tipo());
        assertEquals(TipoCodigo.SSCC, Gs1Analizador.analizar("020010000000000012").tipo());
        assertTrue(Gs1Analizador.analizar("020010000000000012").valido());
    }

    @Test
    void limpiaIdentificadoresDeAplicacionGs1128() {
        assertEquals("020010000000000012", Gs1Analizador.normalizar("]C100020010000000000012"));
        assertEquals("12001000000019", Gs1Analizador.normalizar("0112001000000019"));
    }

    @Test
    void prefijoMexico() {
        assertEquals("México", Gs1Analizador.analizar("7501055300075").paisGs1());
    }

    @Test
    void contenidoDeUnaCaja() {
        assertEquals("2001000000012", Gs1Analizador.gtin13Contenido("12001000000019"));
    }
}
