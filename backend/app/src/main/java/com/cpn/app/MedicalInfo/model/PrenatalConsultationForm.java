package com.cpn.app.MedicalInfo.model;

import com.cpn.app.PatientManagement.models.Patient;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

@Entity
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Data
public class PrenatalConsultationForm {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY) // add generation strategy
    private Long cpnID;

    @ManyToOne
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    @Temporal(TemporalType.DATE) // Good practice
    private Date giveBirthExpectedDate;

    @OneToMany(mappedBy = "prenatalConsultationForm", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Consultation> consultations = new ArrayList<>();
}

