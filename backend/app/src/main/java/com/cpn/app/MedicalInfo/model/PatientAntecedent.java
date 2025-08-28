package com.cpn.app.MedicalInfo.model;


import com.cpn.app.PatientManagement.models.Patient;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import java.time.OffsetDateTime;
import java.util.Map;

@Entity
@Table(
        name = "patient_antecedent",
        uniqueConstraints = @UniqueConstraint(
                name = "uk_patient_antecedent",
                columnNames = {"patient_id", "antecedent_id"}
        )
)
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class PatientAntecedent {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "antecedent_id", nullable = false)
    private AntecedentDefinition antecedent;

    // Values keyed by field code
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "json") // PostgreSQL -> "jsonb"
    private Map<String, Object> values;

    private OffsetDateTime recordedAt;
    private String recordedBy;
}