package com.cpn.app.MedicalInfo.dtos.responses;

import com.cpn.app.MedicalInfo.model.AntecedentDefinition;

import java.util.List;
import java.util.stream.Collectors;

public record AntecedentDefinitionResponse(
        Long id,
        String code,
        String name,
        String description,
        String antecedentType,
        Boolean active,
        List<FieldDefinitionResponse> fields
) {
    public static AntecedentDefinitionResponse fromEntity(AntecedentDefinition entity) {
        if (entity == null) return null;

        return new AntecedentDefinitionResponse(
                entity.getId(),
                entity.getCode(),
                entity.getName(),
                entity.getDescription(),
                // If antecedentType is an enum, use: entity.getAntecedentType().name()
                entity.getAntecedentType(),
                // If your entity uses isActive() and returns boolean, use that instead
                entity.getActive(),
                entity.getFields() == null
                        ? List.of()
                        : entity.getFields().stream()
                        .map(FieldDefinitionResponse::fromEntity)
                        .collect(Collectors.toList())
        );
    }
}