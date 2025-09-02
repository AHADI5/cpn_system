package com.cpn.app.MedicalInfo.dtos.responses;

import java.util.Date;
import java.util.List;

import com.cpn.app.MedicalInfo.model.PrenatalConsultationForm;
import com.cpn.app.PatientManagement.dtos.responses.PatientResponse;

public record PrenatalConsultationFormResponse(
    Long id,
    PatientResponse patientResponse,
    Date giveBirthExpectedDate,
    List<ConsultationResponse> consultations
) {

    public static PrenatalConsultationFormResponse fromEntity(
           PrenatalConsultationForm form
    ) {
        return  new PrenatalConsultationFormResponse(
                form.getCpnID(),
                PatientResponse.fromEntity(form.getPatient()),
                form.getGiveBirthExpectedDate(),
                form.getConsultations().stream()
                        .map(ConsultationResponse::from)
                        .toList()
        );
    }

    }
