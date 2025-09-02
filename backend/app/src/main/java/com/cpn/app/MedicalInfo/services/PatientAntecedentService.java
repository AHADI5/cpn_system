package com.cpn.app.MedicalInfo.services;

import com.cpn.app.MedicalInfo.dtos.requests.AntecedentRequest;
import com.cpn.app.MedicalInfo.model.AntecedentDefinition;
import com.cpn.app.MedicalInfo.model.PatientAntecedent;
import com.cpn.app.MedicalInfo.repository.PatientAntecedentRepository;
import com.cpn.app.PatientManagement.models.Patient;

import com.cpn.app.MedicalInfo.repository.AntecedentDefinitionRepository;

import com.cpn.app.PatientManagement.repository.PatientRepository;
import com.cpn.app.base.BaseCrudServiceImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
public class PatientAntecedentService extends BaseCrudServiceImpl<PatientAntecedent, Long> {

    private final PatientAntecedentRepository patientAntecedentRepository;
    private final PatientRepository patientRepository;
    private final AntecedentDefinitionRepository antecedentDefinitionRepository;

    @Override
    protected JpaRepository<PatientAntecedent, Long> getRepository() {
        return patientAntecedentRepository;
    }

    @Transactional
    public PatientAntecedent upsert(Long patientId, AntecedentRequest request) {
        Patient patient = patientRepository.findById(Math.toIntExact(patientId))
                .orElseThrow(() -> new IllegalArgumentException("Patient not found: " + patientId));

        AntecedentDefinition def = antecedentDefinitionRepository.findById((int) request.antecedentId())
                .orElseThrow(() -> new IllegalArgumentException("Antecedent Not found: " + request.antecedentId()));

        Map<String, Object> values = request.values() != null
                ? new HashMap<>(request.values())
                : new HashMap<>();

        //validateValues(def, values);

        PatientAntecedent pa = patientAntecedentRepository
                .findByPatientPatientIdAndAntecedentId(patientId, def.getId())
                .orElseGet(() -> PatientAntecedent.builder()
                        .patient(patient)
                        .antecedent(def)
                        .build());

        pa.setValues(values);
        pa.setRecordedAt(OffsetDateTime.now());
        pa.setRecordedBy("system");  

        return patientAntecedentRepository.save(pa);
    }


}