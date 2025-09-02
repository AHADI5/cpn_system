package com.cpn.app.MedicalInfo.model;

import jakarta.persistence.*;
import lombok.*;
import java.util.*;

@Entity
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Data
@ToString(exclude = {"prenatalConsultationForm", "resultatExamens"})
@EqualsAndHashCode(exclude = {"prenatalConsultationForm", "resultatExamens"})
public class Consultation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Temporal(TemporalType.DATE)
    private Date date;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "cpn_id", nullable = false)
    private PrenatalConsultationForm prenatalConsultationForm;

    @OneToMany(mappedBy = "consultation", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<ResultatExamen> resultatExamens = new ArrayList<>();
}