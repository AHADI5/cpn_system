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
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.Date;

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

    /**
     * Sets up a prenatal consultation form:
     * - Validates request and finds the patient
     * - Registers antecedents
     * - Generates consultations from LMP
     * - Optionally computes EDD (uncomment if the entity has the fields)
     */
    public PrenatalConsultationForm setUpForm(PrenatalConsultationFormRequest request) {
        Objects.requireNonNull(request, "request must not be null");

        final Date lmpDate = request.lastDYSmeNoRRheaDate();
        if (lmpDate == null) {
            throw new IllegalArgumentException("lastDYSmeNoRRheaDate is required");
        }

        // Find the patient
        final Patient patient = Optional.ofNullable(patientRepository.findByPatientId(request.patientID()))
                .orElseThrow(() -> new IllegalArgumentException("Patient not found: " + request.patientID()));

        // Register all antecedents for this patient
        final List<AntecedentRequest> antecedents = request.antecedentRequest();
        if (antecedents != null && !antecedents.isEmpty()) {
            antecedents.forEach(ar -> patientAntecedentService.upsert(request.patientID(), ar));
        }

        // Generate consultations from LMP
        final List<Consultation> consultations = new ArrayList<>(
                Optional.ofNullable(ConsultationPlanner.generateConsultationsFromLMP(lmpDate))
                        .orElseGet(Collections::emptyList)
        );

        // Compute EDD (LMP + 40 weeks) - use ZonedDateTime to support plusWeeks
        // Uncomment below if your entity has .estimatedDueDate(...) and .lastAmenorrheaDate(...)
        // final Date edd = Date.from(
        //         lmpDate.toInstant()
        //                 .atZone(ZONE)
        //                 .plusWeeks(DEFAULT_GESTATIONAL_WEEKS)
        //                 .toInstant()
        // );

        PrenatalConsultationForm form = PrenatalConsultationForm.builder()
                .patient(patient)
                // If your entity has these fields, set them:
                // .lastAmenorrheaDate(lmpDate)
                // .estimatedDueDate(edd)
                .consultations(consultations)
                .build();

        // If Consultation has a ManyToOne back-ref to the form, keep both sides in sync:
        // consultations.forEach(c -> c.setForm(form));

        // Ensure cascade settings on PrenatalConsultationForm.consultations include PERSIST/MERGE
        return prenatalConsultationFormRepository.save(form);
    }
}