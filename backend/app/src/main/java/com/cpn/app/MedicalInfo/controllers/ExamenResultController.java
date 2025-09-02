package com.cpn.app.MedicalInfo.controllers;

import com.cpn.app.MedicalInfo.dtos.requests.ExamResultRequest;
import com.cpn.app.MedicalInfo.dtos.responses.ExamResultResponse;
import com.cpn.app.MedicalInfo.model.ResultatExamen;
import com.cpn.app.MedicalInfo.services.ExamenResultService;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("api/v1/resultats-examen")
public record ExamenResultController(ExamenResultService examenResultService) {



    @GetMapping
    public ResponseEntity<List<ExamResultResponse>> getAllResults() {
        List<ResultatExamen> results = examenResultService.findAll();
        List<ExamResultResponse> responses = results.stream()
            .map(ExamResultResponse::fromEntity)
            .toList();
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ExamResultResponse> getResultById(@PathVariable Long id) {
        ResultatExamen result = examenResultService.findById(id);
        if (result != null) {
            return ResponseEntity.ok(ExamResultResponse.fromEntity(result));
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    @PostMapping
    public ResponseEntity<ResultatExamen> createResult(@RequestBody ExamResultRequest resultatExamen) {
        ResultatExamen created = examenResultService.createResultatExamen(resultatExamen);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ResultatExamen> updateResult(@PathVariable Long id, @RequestBody ExamResultRequest examenResult) {
        ResultatExamen updated = examenResultService.updateResultatExamen(id, examenResult);
        if (updated != null) {
            return ResponseEntity.ok(updated);
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteResult(@PathVariable Long id) {
        examenResultService.delete(id);
        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
    }
}
