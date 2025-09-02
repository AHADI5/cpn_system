package com.cpn.app.MedicalInfo.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.cpn.app.MedicalInfo.model.ResultatExamen;

public interface ExamenResultatRepository extends JpaRepository<ResultatExamen, Long> {
    // Custom query methods (if needed) can be defined here
}
