package com.cpn.app.MedicalInfo;

import com.cpn.app.PatientManagement.models.Patient;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Date;
import java.util.HashSet;
import java.util.Set;

@Entity
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Data
public class Grossesse {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long pregnancyId;

    @ManyToOne
    @JoinColumn(name = "patient_id")
    private Patient patient;
    private Date lastDYSmeNoRRheaDate;


    @OneToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "cpn_id", referencedColumnName = "cpnID")
    private PrenatalConsultationForm cpn;

}
