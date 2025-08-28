package com.cpn.app.MedicalInfo.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.annotations.Type;
import org.hibernate.type.SqlTypes;

import java.util.Map;

@Entity
@Table(
        name = "antecedent_field_definition",
        uniqueConstraints = @UniqueConstraint(
                name = "uk_antecedent_field_code",
                columnNames = {"antecedent_id", "code"}
        )
)
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class AntecedentFieldDefinition {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "antecedent_id", nullable = false)
    private AntecedentDefinition antecedent;

    @Column(nullable = false, length = 100)
    private String code; // stable key used in values JSON

    @Column(nullable = false)
    private String label;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private FieldType type;

    @Builder.Default
    private boolean required = false;

    private Integer displayOrder;

    // Validation constraints: { "min": 0 }, { "max": 10 }, { "options": ["A","B"] }, etc.
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "json") // PostgreSQL -> "jsonb"
    private Map<String, Object> constraints;

    // UI metadata: { "visibleIf": { "field": "NEWBORN_ALIVE", "equals": true } }
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "json") // PostgreSQL -> "jsonb"
    private Map<String, Object> ui;

}