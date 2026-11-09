package com.escaneo.intento;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface IntentoRepository extends JpaRepository<IntentoEscaneo, Long> {

    List<IntentoEscaneo> findTop30ByOrderByIdDesc();

    interface ResumenMaterial {
        String getMaterial();
        long getTotal();
        long getExitos();
    }

    @Query("""
            select i.material as material,
                   count(i) as total,
                   sum(case when i.exito = true then 1 else 0 end) as exitos
            from IntentoEscaneo i
            group by i.material
            order by i.material
            """)
    List<ResumenMaterial> resumenPorMaterial();
}
