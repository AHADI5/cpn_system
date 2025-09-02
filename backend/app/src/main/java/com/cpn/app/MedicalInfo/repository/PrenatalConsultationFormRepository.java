package com.cpn.app.MedicalInfo.repository;

import com.cpn.app.MedicalInfo.model.PrenatalConsultationForm;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface PrenatalConsultationFormRepository extends JpaRepository<PrenatalConsultationForm, Long> {
}
