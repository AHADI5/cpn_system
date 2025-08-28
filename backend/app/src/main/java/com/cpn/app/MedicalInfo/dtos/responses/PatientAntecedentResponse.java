package com.cpn.app.MedicalInfo.dtos.responses;

import com.cpn.app.MedicalInfo.model.PatientAntecedent;

import java.time.OffsetDateTime;
import java.util.Map;

public record PatientAntecedentResponse(
        Long id,
        Long patientId,
        AntecedentDefinitionResponse antecedent,
        Map<String, Object> values,
        OffsetDateTime recordedAt,
        String recordedBy
) {
    public static PatientAntecedentResponse fromEntity(PatientAntecedent pa) {
        if (pa == null) return null;

        Long pid = null;
        if (pa.getPatient() != null) {
            Object raw = pa.getPatient().getPatientId();
            if (raw instanceof Number n) {
                pid = n.longValue();
            }
        }

        return new PatientAntecedentResponse(
                pa.getId(),
                pid,
                AntecedentDefinitionResponse.fromEntity(pa.getAntecedent()),
                pa.getValues(),
                pa.getRecordedAt(),
                pa.getRecordedBy()
        );
    }
}