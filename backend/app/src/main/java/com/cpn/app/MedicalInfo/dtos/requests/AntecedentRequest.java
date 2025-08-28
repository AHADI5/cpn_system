package com.cpn.app.MedicalInfo.dtos.requests;


import java.util.Map;

public record AntecedentRequest(
        long antecedentId,
         Map<String, Object> values
) {
}
