package com.cpn.app.MedicalInfo.dtos.responses;

import com.cpn.app.MedicalInfo.model.ResultatExamen;

public record ExamResultResponse(
    long resultId,
    String champ,
    String valeur,
    ExamenResponse examen
    //TODO : consultation response

) {
    public static ExamResultResponse fromEntity(ResultatExamen entity) {
        return new ExamResultResponse(
            entity.getId(),
            entity.getChamp(),
            entity.getValeur(),
            ExamenResponse.fromEntity(entity.getExamen())
        );
    }

}
