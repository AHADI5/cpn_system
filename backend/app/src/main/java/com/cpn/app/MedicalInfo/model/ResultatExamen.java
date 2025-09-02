package com.cpn.app.MedicalInfo.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ResultatExamen {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String champ;   // ex: "globules blancs"
    private String valeur;  // ex: "4500"

    @ManyToOne
    private Examen examen;

    @ManyToOne
    private Consultation consultation;

}

