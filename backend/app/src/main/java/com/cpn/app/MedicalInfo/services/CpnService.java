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
import java.time.temporal.ChronoUnit;
import java.util.Date;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional
public class CpnService extends BaseCrudServiceImpl<PrenatalConsultationForm, Long> {

    private final PatientRepository patientRepository;
    private final PrenatalConsultationFormRepository prenatalConsultationFormRepository;
    private final PatientAntecedentService patientAntecedentService;

    @Override
    protected JpaRepository<PrenatalConsultationForm, Long> getRepository() {
        return prenatalConsultationFormRepository;
    }

    public PrenatalConsultationForm setUpForm(PrenatalConsultationFormRequest request, String recordedBy) {
        if (request == null || request.lastDYSmeNoRRheaDate() == null) {
            throw new IllegalArgumentException("lastDYSmeNoRRheaDate is required");
        }

        // Find the patient (adjust to your repo signature)
        Patient patient = Optional.ofNullable(patientRepository.findByPatientId(request.patientID()))
                .orElseThrow(() -> new IllegalArgumentException("Patient not found: " + request.patientID()));

        // Register all antecedents for this patient
        List<AntecedentRequest> ars = request.antecedentRequest();
        if (ars != null && !ars.isEmpty()) {
            for (AntecedentRequest ar : ars) {
                patientAntecedentService.upsert(request.patientID(), ar, recordedBy);
            }
        }

        // Generate consultations from LMP
        List<Consultation> consultations =
                ConsultationPlanner.generateConsultationsFromLMP(request.lastDYSmeNoRRheaDate());
        // Or: ConsultationPlanner.generateUpcomingConsultationsFromLMP(request.lastDYSmeNoRRheaDate());

        // Optionally compute EDD (LMP + 40 weeks)
        Date edd = Date.from(
                request.lastDYSmeNoRRheaDate().toInstant()
                        .plus(40, ChronoUnit.WEEKS)
        );

        PrenatalConsultationForm form = PrenatalConsultationForm.builder()
                .patient(patient)
                // If your entity has these fields, set them:
                // .lastAmenorrheaDate(request.lastDYSmeNoRRheaDate())
                // .estimatedDueDate(edd)
                .consultations(consultations)
                .build();

        // If Consultation owns a ManyToOne backref to the form, set it:
        // consultations.forEach(c -> c.setForm(form));

        return prenatalConsultationFormRepository.save(form);
    }
}