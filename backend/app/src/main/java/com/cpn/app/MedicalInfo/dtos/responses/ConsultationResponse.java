package com.cpn.app.MedicalInfo.dtos.responses;

import java.util.Date;
import java.util.List;

import com.cpn.app.MedicalInfo.model.Consultation;

public record ConsultationResponse(
    Long id,
    Date date,
    List<ExamResultResponse> examenTypeResponses
){
    public static ConsultationResponse from(Consultation consultation) {
        if (consultation == null) return null;

        List<ExamResultResponse> examenResponses = consultation.getResultatExamens().stream()
                .map(ExamResultResponse::fromEntity)
                .toList();

        return new ConsultationResponse(
                consultation.getId(),
                consultation.getDate(),
                examenResponses
        );
    }

}
