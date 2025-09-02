package com.cpn.app.MedicalInfo.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.cpn.app.MedicalInfo.model.Examen;

public interface ExamenRepository extends JpaRepository<Examen, Long> {

}
