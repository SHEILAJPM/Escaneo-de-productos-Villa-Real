package com.escaneo.gs1;

import java.util.ArrayList;
import java.util.List;

/**
 * Prefijos GS1: indican la organizacion GS1 que asigno el codigo a la empresa,
 * NO el pais donde se fabrico el producto.
 */
public final class PaisesGs1 {

    private record Rango(int desde, int hasta, String nombre) {}

    private static final List<Rango> RANGOS = new ArrayList<>();

    static {
        r(0, 19, "Estados Unidos y Canadá"); r(20, 29, "Uso interno de tienda");
        r(30, 39, "Estados Unidos"); r(40, 49, "Uso interno de tienda"); r(50, 59, "Cupones");
        r(60, 139, "Estados Unidos y Canadá"); r(200, 299, "Uso interno de tienda (productos pesables / propios)");
        r(300, 379, "Francia y Mónaco"); r(380, 380, "Bulgaria"); r(383, 383, "Eslovenia"); r(385, 385, "Croacia");
        r(387, 387, "Bosnia y Herzegovina"); r(400, 440, "Alemania"); r(450, 459, "Japón");
        r(460, 469, "Rusia"); r(471, 471, "Taiwán"); r(474, 474, "Estonia"); r(475, 475, "Letonia");
        r(477, 477, "Lituania"); r(480, 480, "Filipinas"); r(489, 489, "Hong Kong"); r(490, 499, "Japón");
        r(500, 509, "Reino Unido"); r(520, 521, "Grecia"); r(528, 528, "Líbano"); r(529, 529, "Chipre");
        r(535, 535, "Malta"); r(539, 539, "Irlanda"); r(540, 549, "Bélgica y Luxemburgo"); r(560, 560, "Portugal");
        r(569, 569, "Islandia"); r(570, 579, "Dinamarca"); r(590, 590, "Polonia"); r(594, 594, "Rumania");
        r(599, 599, "Hungría"); r(600, 601, "Sudáfrica"); r(611, 611, "Marruecos"); r(619, 619, "Túnez");
        r(622, 622, "Egipto"); r(628, 628, "Arabia Saudita"); r(629, 629, "Emiratos Árabes Unidos");
        r(640, 649, "Finlandia"); r(690, 699, "China"); r(700, 709, "Noruega"); r(729, 729, "Israel");
        r(730, 739, "Suecia"); r(740, 740, "Guatemala"); r(741, 741, "El Salvador"); r(742, 742, "Honduras");
        r(743, 743, "Nicaragua"); r(744, 744, "Costa Rica"); r(745, 745, "Panamá"); r(746, 746, "República Dominicana");
        r(750, 750, "México"); r(754, 755, "Canadá"); r(759, 759, "Venezuela"); r(760, 769, "Suiza");
        r(770, 771, "Colombia"); r(773, 773, "Uruguay"); r(775, 775, "Perú"); r(777, 777, "Bolivia");
        r(778, 779, "Argentina"); r(780, 780, "Chile"); r(784, 784, "Paraguay"); r(786, 786, "Ecuador");
        r(789, 790, "Brasil"); r(800, 839, "Italia"); r(840, 849, "España y Andorra"); r(850, 850, "Cuba");
        r(858, 858, "Eslovaquia"); r(859, 859, "República Checa"); r(860, 860, "Serbia"); r(868, 869, "Turquía");
        r(870, 879, "Países Bajos"); r(880, 880, "Corea del Sur"); r(885, 885, "Tailandia"); r(888, 888, "Singapur");
        r(890, 890, "India"); r(893, 893, "Vietnam"); r(899, 899, "Indonesia"); r(900, 919, "Austria");
        r(930, 939, "Australia"); r(940, 949, "Nueva Zelanda"); r(955, 955, "Malasia");
        r(977, 977, "Publicaciones seriadas (ISSN)"); r(978, 979, "Libros (ISBN)"); r(980, 980, "Recibos de devolución");
        r(981, 984, "Cupones"); r(990, 999, "Cupones");
    }

    private static void r(int desde, int hasta, String nombre) {
        RANGOS.add(new Rango(desde, hasta, nombre));
    }

    private PaisesGs1() {}

    public static String buscar(String prefijo3) {
        int p = Integer.parseInt(prefijo3);
        for (Rango rango : RANGOS) {
            if (p >= rango.desde() && p <= rango.hasta()) return rango.nombre();
        }
        return "Prefijo no asignado o reservado";
    }
}
