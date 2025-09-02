package com.cpn.app.MedicalInfo.controllers;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.cpn.app.MedicalInfo.dtos.requests.ExamenTypeRequest;
import com.cpn.app.MedicalInfo.dtos.responses.ExamenTypeResponse;
import com.cpn.app.MedicalInfo.model.TypeExamen;
import com.cpn.app.MedicalInfo.services.ExamenTypeService;

@RestController
@RequestMapping("/api/v1/examenType")
public record ExamenTypeController(
    ExamenTypeService examenService 
) {
    @GetMapping
    public ResponseEntity<List<ExamenTypeResponse>> getAllExamenTypes() {
        List<ExamenTypeResponse> responses = examenService.findAll().stream()
            .map(ExamenTypeResponse::fromEntity)
            .toList();
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ExamenTypeResponse> getExamenTypeById(@PathVariable Long id) {
        TypeExamen typeExamen = examenService.findById(id);
        if (typeExamen == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(ExamenTypeResponse.fromEntity(typeExamen));
    }

    @PostMapping()
    public ResponseEntity<ExamenTypeResponse> createExamenType(@RequestBody ExamenTypeRequest examenType) {
        TypeExamen created = examenService.createTypeExamen(examenType);
        return ResponseEntity.status(HttpStatus.CREATED).body(ExamenTypeResponse.fromEntity(created));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ExamenTypeResponse> updateExamenType(@PathVariable Long id, @RequestBody ExamenTypeRequest examenType) {
        TypeExamen updated = examenService.updateTypeExamen(examenType, id);
        if (updated == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(ExamenTypeResponse.fromEntity(updated));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteExamenType(@PathVariable Long id) {
        examenService.delete(id);
        return ResponseEntity.noContent().build();
    }
}