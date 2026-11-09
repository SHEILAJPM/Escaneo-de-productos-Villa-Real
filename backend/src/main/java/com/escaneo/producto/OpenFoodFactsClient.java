package com.escaneo.producto;

import com.fasterxml.jackson.databind.JsonNode;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.util.Optional;

/** Busca marca, nombre e imagen en la base abierta Open Food Facts. No trae precios. */
@Component
public class OpenFoodFactsClient {

    private static final Logger log = LoggerFactory.getLogger(OpenFoodFactsClient.class);
    private static final String CAMPOS = "product_name_es,product_name,generic_name_es,brands,quantity,image_front_small_url";

    public record DatosExternos(String marca, String nombre, String contenido, String imagenUrl) {}

    private final RestClient http;
    private final boolean habilitado;

    public OpenFoodFactsClient(@Value("${app.openfoodfacts.enabled:true}") boolean habilitado) {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(3000);
        factory.setReadTimeout(5000);
        this.http = RestClient.builder()
                .baseUrl("https://world.openfoodfacts.org")
                .defaultHeader("User-Agent", "EscaneoDemoEscolar/1.0")
                .requestFactory(factory)
                .build();
        this.habilitado = habilitado;
    }

    public Optional<DatosExternos> buscar(String gtin) {
        if (!habilitado) return Optional.empty();
        try {
            JsonNode json = http.get()
                    .uri("/api/v2/product/{gtin}.json?fields=" + CAMPOS, gtin)
                    .retrieve()
                    .body(JsonNode.class);
            if (json == null || json.path("status").asInt() != 1) return Optional.empty();
            JsonNode p = json.path("product");
            String nombre = primero(p, "product_name_es", "product_name", "generic_name_es");
            if (nombre == null) return Optional.empty();
            String marca = texto(p, "brands");
            if (marca != null && marca.contains(",")) marca = marca.substring(0, marca.indexOf(',')).trim();
            return Optional.of(new DatosExternos(marca, nombre, texto(p, "quantity"), texto(p, "image_front_small_url")));
        } catch (Exception e) {
            log.warn("Open Food Facts no respondió para {}: {}", gtin, e.getMessage());
            return Optional.empty();
        }
    }

    private static String primero(JsonNode p, String... campos) {
        for (String c : campos) {
            String v = texto(p, c);
            if (v != null) return v;
        }
        return null;
    }

    private static String texto(JsonNode p, String campo) {
        String v = p.path(campo).asText("").trim();
        return v.isEmpty() ? null : v;
    }
}
