package com.cpn.app.MedicalInfo.model;

import com.cpn.app.PatientManagement.models.Patient;
import jakarta.persistence.*;
import lombok.*;
import java.util.*;

@Entity
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Data
@ToString(exclude = {"patient", "consultations"})
@EqualsAndHashCode(exclude = {"patient", "consultations"})
public class PrenatalConsultationForm {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long cpnID;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    @Temporal(TemporalType.DATE)
    private Date giveBirthExpectedDate;

    @OneToMany(
        mappedBy = "prenatalConsultationForm",
        cascade = CascadeType.ALL,
        orphanRemoval = true
    )
    @Builder.Default
    private List<Consultation> consultations = new ArrayList<>();

    // Helpers to keep both sides in sync
    public void addConsultation(Consultation c) {
        if (c == null) return;
        consultations.add(c);
        c.setPrenatalConsultationForm(this);
    }

    public void addConsultations(Collection<Consultation> cs) {
        if (cs == null) return;
        cs.forEach(this::addConsultation);
    }

    public void removeConsultation(Consultation c) {
        if (c == null) return;
        consultations.remove(c);
        if (c.getPrenatalConsultationForm() == this) {
            c.setPrenatalConsultationForm(null);
        }
    }
}