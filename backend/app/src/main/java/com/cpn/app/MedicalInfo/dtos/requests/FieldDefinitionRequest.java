package com.cpn.app.MedicalInfo.dtos.requests;

import com.cpn.app.MedicalInfo.model.FieldType;

import java.util.Map;

public record FieldDefinitionRequest(
        String code,              // stable; utilisé comme clé dans values
        String label,
        FieldType type,           // BOOLEAN, INTEGER, DECIMAL, TEXT, DATE, ENUM, MULTI_ENUM
        Boolean required,
        Integer displayOrder,
        Map<String, Object> constraints, // ex: { "min": 0 }, { "options": ["A","B"] }
        Map<String, Object> ui           // ex: { "visibleIf": { "field": "X", "equals": true } }

) {}
