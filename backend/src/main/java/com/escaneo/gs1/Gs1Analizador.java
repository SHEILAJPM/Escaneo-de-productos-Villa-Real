package com.escaneo.gs1;

import java.util.ArrayList;
import java.util.List;

public final class Gs1Analizador {

    public record PasoCalculo(int posicion, int digito, int peso, int producto) {}

    public record AnalisisCodigo(
            String leido,
            String codigo,
            TipoCodigo tipo,
            String tipoEtiqueta,
            String nivel,
            boolean valido,
            Integer digitoLeido,
            Integer digitoEsperado,
            String prefijoGs1,
            String paisGs1,
            int suma,
            List<PasoCalculo> pasos,
            String mensaje) {}

    private Gs1Analizador() {}

    /** Limpia lo que envia el lector: prefijos de simbologia (]C1, ]E0) e identificadores de aplicacion (00), (01). */
    public static String normalizar(String leido) {
        String s = leido == null ? "" : leido.trim();
        if (s.matches("^\\][A-Za-z][0-9].*")) s = s.substring(3);
        s = s.replaceAll("\\D", "");
        if (s.length() == 20 && s.startsWith("00")) return s.substring(2);   // GS1-128 con AI (00) = SSCC
        if (s.length() == 16 && s.startsWith("01")) return s.substring(2);   // GS1-128 con AI (01) = GTIN-14
        return s;
    }

    public static TipoCodigo tipoPorLongitud(int longitud) {
        return switch (longitud) {
            case 8 -> TipoCodigo.GTIN_8;
            case 12 -> TipoCodigo.GTIN_12;
            case 13 -> TipoCodigo.GTIN_13;
            case 14 -> TipoCodigo.GTIN_14;
            case 18 -> TipoCodigo.SSCC;
            default -> TipoCodigo.DESCONOCIDO;
        };
    }

    /** Digito verificador GS1 (modulo 10): de derecha a izquierda, pesos 3,1,3,1... */
    public static int calcularDigito(String sinVerificador) {
        int suma = 0;
        int n = sinVerificador.length();
        for (int i = 0; i < n; i++) {
            int digito = sinVerificador.charAt(n - 1 - i) - '0';
            suma += digito * (i % 2 == 0 ? 3 : 1);
        }
        return (10 - suma % 10) % 10;
    }

    public static AnalisisCodigo analizar(String leido) {
        String codigo = normalizar(leido);
        TipoCodigo tipo = tipoPorLongitud(codigo.length());

        if (tipo == TipoCodigo.DESCONOCIDO) {
            return new AnalisisCodigo(leido, codigo, tipo, tipo.getEtiqueta(), tipo.getNivel(), false,
                    null, null, null, null, 0, List.of(),
                    "El código tiene " + codigo.length() + " dígitos; un GTIN tiene 8, 12, 13 o 14 y un SSCC 18.");
        }

        String cuerpo = codigo.substring(0, codigo.length() - 1);
        int n = cuerpo.length();
        List<PasoCalculo> pasos = new ArrayList<>();
        int suma = 0;
        for (int i = 0; i < n; i++) {
            int digito = cuerpo.charAt(i) - '0';
            int peso = ((n - 1 - i) % 2 == 0) ? 3 : 1;
            suma += digito * peso;
            pasos.add(new PasoCalculo(i + 1, digito, peso, digito * peso));
        }
        int esperado = (10 - suma % 10) % 10;
        int leidoDigito = codigo.charAt(codigo.length() - 1) - '0';
        boolean valido = esperado == leidoDigito;

        // El prefijo GS1 se lee sobre el GTIN-13 equivalente (sin indicador / extension)
        String prefijo = switch (tipo) {
            case GTIN_12 -> "0" + codigo.substring(0, 2);
            case GTIN_14, SSCC -> codigo.substring(1, 4);
            case GTIN_8 -> codigo.substring(0, 3);
            default -> codigo.substring(0, 3);
        };

        String mensaje = valido
                ? "Lectura correcta: el dígito verificador coincide."
                : "Lectura inválida: el dígito verificador debería ser " + esperado + " y se leyó " + leidoDigito + ".";

        return new AnalisisCodigo(leido, codigo, tipo, tipo.getEtiqueta(), tipo.getNivel(), valido,
                leidoDigito, esperado, prefijo, PaisesGs1.buscar(prefijo), suma, pasos, mensaje);
    }

    /** Convierte un GTIN-12 a GTIN-13 y deja los demas igual. */
    public static String aGtin13(String codigo) {
        return codigo.length() == 12 ? "0" + codigo : codigo;
    }

    /** GTIN-13 de la unidad contenida en un GTIN-14 (quita el indicador y recalcula el verificador). */
    public static String gtin13Contenido(String gtin14) {
        String base = gtin14.substring(1, 13);
        return base + calcularDigito(base);
    }
}
