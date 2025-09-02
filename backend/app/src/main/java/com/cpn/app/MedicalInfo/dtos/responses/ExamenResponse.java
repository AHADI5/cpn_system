package com.cpn.app.MedicalInfo.dtos.responses;

import com.cpn.app.MedicalInfo.model.Examen;

public record ExamenResponse(
    Long id,
    String nom,
    String description,
    ExamenTypeResponse examenTypeResponse
) {
    public static ExamenResponse fromEntity(Examen examen) {
        return new ExamenResponse(
            examen.getId(),
            examen.getNom(),
            examen.getDescription(),
            examen.getTypeExamen() != null ? ExamenTypeResponse.fromEntity(examen.getTypeExamen()) : null
        );
    }
}
