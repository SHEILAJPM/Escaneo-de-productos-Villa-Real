package com.escaneo.config;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import javax.sql.DataSource;
import java.sql.Connection;
import java.util.Map;

@RestControllerAdvice
@RestController
public class ApiErrores {

    private final DataSource dataSource;

    public ApiErrores(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, String>> peticionInvalida(IllegalArgumentException e) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", e.getMessage()));
    }

    /** Estado para el indicador del frontend: que base de datos se esta usando. */
    @GetMapping("/api/estado")
    public Map<String, String> estado() throws Exception {
        try (Connection c = dataSource.getConnection()) {
            String url = c.getMetaData().getURL();
            String base = url.contains("neon.tech") ? "Neon (PostgreSQL en la nube)"
                    : url.startsWith("jdbc:h2") ? "H2 local (sin conexión a Neon)"
                    : c.getMetaData().getDatabaseProductName();
            return Map.of("estado", "ok", "base", base);
        }
    }
}
