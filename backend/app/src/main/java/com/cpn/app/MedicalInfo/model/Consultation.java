package com.cpn.app.MedicalInfo.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;

@Entity
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Data
public class Consultation {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Temporal(TemporalType.DATE) // Good practice for java.util.Date
    private Date date;

    @ManyToOne
    @JoinColumn(name = "cpn_id", nullable = false) // explicit join column
    private PrenatalConsultationForm prenatalConsultationForm;
}

