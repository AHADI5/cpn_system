package com.cpn.app.MedicalInfo.dtos.responses;

import com.cpn.app.MedicalInfo.model.AntecedentFieldDefinition;
import com.cpn.app.MedicalInfo.model.FieldType;

import java.util.Map;

// import your entity:


public record FieldDefinitionResponse(
        Long id,
        String code,
        String label,
        FieldType type,
        boolean required,
        Integer displayOrder,
        Map<String, Object> constraints,
        Map<String, Object> ui
) {
    public static FieldDefinitionResponse fromEntity(AntecedentFieldDefinition entity) {
        if (entity == null) return null;

        return new FieldDefinitionResponse(
                entity.getId(),
                entity.getCode(),
                entity.getLabel(),
                // If your entity stores a String for type, use:
                // FieldType.valueOf(entity.getType());
                entity.getType(),
                // If the entity uses Boolean getRequired(), use: Boolean.TRUE.equals(entity.getRequired())
                entity.isRequired(),
                entity.getDisplayOrder(),
                entity.getConstraints() == null ? Map.of() : Map.copyOf(entity.getConstraints()),
                entity.getUi() == null ? Map.of() : Map.copyOf(entity.getUi())
        );
    }
}