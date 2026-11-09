package com.escaneo.producto;

import com.escaneo.gs1.Gs1Analizador;
import com.escaneo.gs1.Gs1Analizador.AnalisisCodigo;
import com.escaneo.producto.ProductoService.ProductoForm;
import com.escaneo.producto.ProductoService.ResultadoEscaneo;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class ProductoController {

    private final ProductoService service;

    public ProductoController(ProductoService service) {
        this.service = service;
    }

    @GetMapping("/escanear/{codigo}")
    public ResultadoEscaneo escanear(@PathVariable String codigo) {
        return service.escanear(codigo);
    }

    @GetMapping("/codigos/{codigo}/analisis")
    public AnalisisCodigo analizar(@PathVariable String codigo) {
        return Gs1Analizador.analizar(codigo);
    }

    @GetMapping("/productos")
    public List<Producto> listar() {
        return service.listar();
    }

    @PostMapping("/productos")
    public Producto guardar(@RequestBody ProductoForm form) {
        return service.guardar(form);
    }

    @DeleteMapping("/productos/{gtin}")
    public ResponseEntity<Void> eliminar(@PathVariable String gtin) {
        service.eliminar(gtin);
        return ResponseEntity.noContent().build();
    }
}
