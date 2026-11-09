package com.escaneo.intento;

import com.escaneo.gs1.Gs1Analizador;
import com.escaneo.gs1.Gs1Analizador.AnalisisCodigo;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/intentos")
public class IntentoController {

    /** codigo vacio = el lector no leyo nada (fallo registrado a mano). */
    public record NuevoIntento(String codigo, String material, String nota) {}

    private final IntentoRepository repo;

    public IntentoController(IntentoRepository repo) {
        this.repo = repo;
    }

    @PostMapping
    public IntentoEscaneo registrar(@RequestBody NuevoIntento n) {
        if (n.material() == null || n.material().isBlank()) {
            throw new IllegalArgumentException("Selecciona el material.");
        }
        IntentoEscaneo i = new IntentoEscaneo();
        i.setMaterial(n.material().trim());
        i.setNota(n.nota());
        if (n.codigo() == null || n.codigo().isBlank()) {
            i.setExito(false);
        } else {
            AnalisisCodigo a = Gs1Analizador.analizar(n.codigo());
            i.setCodigo(a.codigo());
            i.setTipo(a.tipo().name());
            i.setExito(a.valido());
        }
        return repo.save(i);
    }

    @GetMapping
    public List<IntentoEscaneo> recientes() {
        return repo.findTop30ByOrderByIdDesc();
    }

    @GetMapping("/resumen")
    public List<IntentoRepository.ResumenMaterial> resumen() {
        return repo.resumenPorMaterial();
    }

    @DeleteMapping
    public ResponseEntity<Void> reiniciar() {
        repo.deleteAllInBatch();
        return ResponseEntity.noContent().build();
    }
}
