package com.cpn.app.MedicalInfo.dtos.requests;

import java.util.Date;
import java.util.List;

public record PrenatalConsultationFormRequest(
        long patientID,
        Date lastDYSmeNoRRheaDate,
        List<AntecedentRequest> antecedentRequest
) {
}
