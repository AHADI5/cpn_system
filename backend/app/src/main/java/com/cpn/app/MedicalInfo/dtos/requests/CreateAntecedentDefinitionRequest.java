package com.cpn.app.MedicalInfo.dtos.requests;

import java.util.List;

public record CreateAntecedentDefinitionRequest(
        String code,              // ex: "PREV_PREGNANCIES"
        String name,              // ex: "Grossesses précédentes"
        String description,
        String antecedentType,    // ex: "OBSTETRICS"
        List<FieldDefinitionRequest> fields
) {
}
