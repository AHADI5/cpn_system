package com.cpn.app.MedicalInfo.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.cpn.app.MedicalInfo.model.Consultation;

public interface ConsultationRepository extends JpaRepository<Consultation, Long> {

}
