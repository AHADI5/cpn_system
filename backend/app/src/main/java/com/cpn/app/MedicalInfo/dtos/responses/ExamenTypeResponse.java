package com.cpn.app.MedicalInfo.dtos.responses;

import com.cpn.app.MedicalInfo.model.TypeExamen;

public record ExamenTypeResponse( 
    long id,
    String nom, 
    String description) {
    public static ExamenTypeResponse fromEntity(TypeExamen examenType) {
        return new ExamenTypeResponse(
            examenType.getId(),
            examenType.getNom(),
            examenType.getDescription()
        );
    }
}
