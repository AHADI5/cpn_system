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

import com.cpn.app.MedicalInfo.dtos.requests.ExamenRequest;
import com.cpn.app.MedicalInfo.dtos.responses.ExamenResponse;
import com.cpn.app.MedicalInfo.model.Examen;
import com.cpn.app.MedicalInfo.services.ExamenService;

@RestController
@RequestMapping("api/v1/examens")
public record ExamenController(
    ExamenService examenService 
) {
    
    @PostMapping()
    public ResponseEntity<ExamenResponse> createExamen(@RequestBody ExamenRequest request) {
        Examen examen = examenService.createExamen(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ExamenResponse.fromEntity(examen));
    }

    @GetMapping()
    public ResponseEntity<List<ExamenResponse>> getAllExamens() {
        List<Examen> examens = examenService.findAll();
        List<ExamenResponse> responses = examens.stream()
            .map(ExamenResponse::fromEntity)
            .toList();
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ExamenResponse> getExamenById(@PathVariable Long id) {
        Examen examen = examenService.findById(id);
        return ResponseEntity.ok(ExamenResponse.fromEntity(examen));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ExamenResponse> updateExamen(@PathVariable Long id, @RequestBody ExamenRequest request) {
        Examen examen = examenService.updateExamen(id, request);
        return ResponseEntity.ok(ExamenResponse.fromEntity(examen));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteExamen(@PathVariable Long id) {
        examenService.deleteExamen(id);
        return ResponseEntity.noContent().build();
    }
}
