package com.cpn.app.PatientManagement.models;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Data
public class Dossier {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long dossierId;
    private String uniqueID;
    @OneToOne
    private Patient patient;

    @PrePersist
    public void generateUniqueID() {
        if (this.uniqueID == null) {
            this.uniqueID = "DOS-" + System.currentTimeMillis();
        }
    }

}
