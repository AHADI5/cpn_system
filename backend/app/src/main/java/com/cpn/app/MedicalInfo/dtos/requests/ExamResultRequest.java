package com.cpn.app.MedicalInfo.dtos.requests;

public record ExamResultRequest(
    long examenId,
    String champ,
    String valeur,
    long consultationId
) {
    
}
