package com.cpn.app.MedicalInfo.services;

import com.cpn.app.MedicalInfo.dtos.requests.AntecedentRequest;
import com.cpn.app.MedicalInfo.dtos.requests.PrenatalConsultationFormRequest;
import com.cpn.app.MedicalInfo.model.Consultation;
import com.cpn.app.MedicalInfo.model.PrenatalConsultationForm;
import com.cpn.app.MedicalInfo.repository.PrenatalConsultationFormRepository;
import com.cpn.app.PatientManagement.models.Patient;
import com.cpn.app.PatientManagement.repository.PatientRepository;
import com.cpn.app.base.BaseCrudServiceImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.ZoneId;
import java.util.*;

@Service
@RequiredArgsConstructor
@Transactional
public class CpnService extends BaseCrudServiceImpl<PrenatalConsultationForm, Long> {

    private static final int DEFAULT_GESTATIONAL_WEEKS = 40;
    private static final ZoneId ZONE = ZoneId.systemDefault();

    private final PatientRepository patientRepository;
    private final PrenatalConsultationFormRepository prenatalConsultationFormRepository;
    private final PatientAntecedentService patientAntecedentService;

    @Override
    protected JpaRepository<PrenatalConsultationForm, Long> getRepository() {
        return prenatalConsultationFormRepository;
    }

    public PrenatalConsultationForm setUpForm(PrenatalConsultationFormRequest request) {
        if (request == null || request.lastDYSmeNoRRheaDate() == null) {
            throw new IllegalArgumentException("lastDYSmeNoRRheaDate is required");
        }

        // Load patient
        Patient patient = Optional.ofNullable(patientRepository.findByPatientId(request.patientID()))
                .orElseThrow(() -> new IllegalArgumentException("Patient not found: " + request.patientID()));

        // Upsert antecedents
        List<AntecedentRequest> antecedents = request.antecedentRequest();
        if (antecedents != null && !antecedents.isEmpty()) {
            for (AntecedentRequest ar : antecedents) {
                patientAntecedentService.upsert(request.patientID(), ar);
            }
        }

        Date lmpDate = request.lastDYSmeNoRRheaDate();

        // Generate consultations from LMP (may return null)
        List<Consultation> consultations = Optional
                .ofNullable(ConsultationPlanner.generateConsultationsFromLMP(lmpDate))
                .orElseGet(Collections::emptyList);

        // Compute EDD (LMP + 40 weeks) using date-safe math
        Date edd = Date.from(lmpDate.toInstant().atZone(ZONE).plusWeeks(DEFAULT_GESTATIONAL_WEEKS).toInstant());

        // Build parent
        PrenatalConsultationForm form = PrenatalConsultationForm.builder()
                .patient(patient)
                .giveBirthExpectedDate(edd)
                .build();

        // Important: set back-reference on every consultation
        form.addConsultations(consultations);

        // Persist parent; children are cascaded
        return prenatalConsultationFormRepository.save(form);
    }
}