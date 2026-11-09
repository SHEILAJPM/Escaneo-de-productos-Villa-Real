package com.escaneo.venta;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface VentaRepository extends JpaRepository<Venta, Long> {
    List<Venta> findTop20ByOrderByIdDesc();
}
