package com.cpn.app.PatientManagement.models;

import com.cpn.app.MedicalInfo.model.Grossesse;
import com.cpn.app.MedicalInfo.model.PatientAntecedent;
import com.cpn.app.MedicalInfo.model.PrenatalConsultationForm;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.Type;

import java.util.List;
import java.util.Map;

@Entity
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Data
public class Patient {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long patientId;
    private String firstName;
    private String lastName;
    private String email;
    private String phoneNumber;
    private String gender;
    private String birthDate;
    private String address;
    private String maritalStatus;
    private String nationality;
    private String dossierID;


    @OneToMany(mappedBy = "patient", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Grossesse> pregnancies;

    @OneToMany(mappedBy = "patient", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<PrenatalConsultationForm> cpnLists;
    @OneToMany(mappedBy = "patient", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<PatientAntecedent> antecedents;
}
