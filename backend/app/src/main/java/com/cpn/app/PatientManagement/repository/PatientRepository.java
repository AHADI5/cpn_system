package com.cpn.app.PatientManagement.repository;

import com.cpn.app.PatientManagement.models.Patient;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PatientRepository extends JpaRepository<Patient, Integer> {
    Patient findByPatientId(Long patientId);
}
