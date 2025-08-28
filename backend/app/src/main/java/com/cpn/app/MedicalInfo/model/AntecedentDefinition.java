package com.cpn.app.MedicalInfo.model;


import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Entity
@Table(name = "antecedent_definition")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class AntecedentDefinition {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false, length = 100)
    private String code; // e.g. "PREV_PREGNANCIES"

    @Column(nullable = false)
    private String name; // e.g. "Grossesses précédentes"

    private String description;

    private String antecedentType; // optional grouping/category

    @Builder.Default
    private Boolean active = true;

    @OneToMany(mappedBy = "antecedent", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("displayOrder ASC")
    @Builder.Default
    private List<AntecedentFieldDefinition> fields = new ArrayList<>();
}