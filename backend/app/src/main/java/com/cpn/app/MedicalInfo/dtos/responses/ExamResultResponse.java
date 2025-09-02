package com.cpn.app.MedicalInfo.dtos.responses;

import com.cpn.app.MedicalInfo.model.ResultatExamen;

public record ExamResultResponse(
    long resultId,
    String champ,
    String valeur,
    long examenId,
    String examenName,
    long consultationId

) {
    public static ExamResultResponse fromEntity(ResultatExamen entity) {
        return new ExamResultResponse(
            entity.getId(),
            entity.getChamp(),
            entity.getValeur(),
            entity.getExamen().getId(),
            entity.getExamen().getNom(),
            entity.getConsultation().getId()
        );
    }

}
