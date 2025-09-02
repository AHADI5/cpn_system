package com.cpn.app.MedicalInfo.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.cpn.app.MedicalInfo.model.TypeExamen;

public interface ExamenTypeRepository extends JpaRepository<TypeExamen, Long> {
    
}
