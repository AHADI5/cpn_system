package com.cpn.app.MedicalInfo.repository;

import com.cpn.app.MedicalInfo.model.PatientAntecedent;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PatientAntecedentRepository extends JpaRepository<PatientAntecedent, Long> {
    Optional<PatientAntecedent> findByPatientPatientIdAndAntecedentId(Long patient_patientId, Long antecedent_id);
}
