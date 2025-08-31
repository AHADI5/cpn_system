package com.cpn.app.MedicalInfo.controllers;

import com.cpn.app.MedicalInfo.dtos.requests.AntecedentRequest;
import com.cpn.app.MedicalInfo.dtos.responses.PatientAntecedentResponse;
import com.cpn.app.MedicalInfo.model.PatientAntecedent;
import com.cpn.app.MedicalInfo.services.PatientAntecedentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Objects;

@RestController
@RequestMapping("/api/patients/{patientId}/antecedents")
@RequiredArgsConstructor
public class PatientAntecedentController {

    private final PatientAntecedentService patientAntecedentService;

    // Upsert a patient's antecedent (create if missing, update if exists)
    @PutMapping
    public ResponseEntity<PatientAntecedentResponse> upsert(
            @PathVariable Long patientId,
            @RequestBody AntecedentRequest request
    ) {
        PatientAntecedent saved = patientAntecedentService.upsert(patientId, request, null );
        return ResponseEntity.ok(PatientAntecedentResponse.fromEntity(saved));
    }

    // List all antecedents for a patient
    @GetMapping
    public ResponseEntity<List<PatientAntecedentResponse>> listForPatient(@PathVariable Long patientId) {
        List<PatientAntecedentResponse> result = patientAntecedentService.findAll().stream()
                .filter(pa -> pa.getPatient() != null && equalsNumber(pa.getPatient().getPatientId(), patientId))
                .map(PatientAntecedentResponse::fromEntity)
                .toList();

        if (result.isEmpty()) return ResponseEntity.noContent().build();
        return ResponseEntity.ok(result);
    }

    // Get a specific antecedent for a patient by antecedent definition id
    @GetMapping("/{antecedentId}")
    public ResponseEntity<PatientAntecedentResponse> getOne(
            @PathVariable Long patientId,
            @PathVariable Long antecedentId
    ) {
        return patientAntecedentService.findAll().stream()
                .filter(pa ->
                        pa.getPatient() != null
                                && equalsNumber(pa.getPatient().getPatientId(), patientId)
                                && pa.getAntecedent() != null
                                && equalsNumber(pa.getAntecedent().getId(), antecedentId)
                )
                .findFirst()
                .map(PatientAntecedentResponse::fromEntity)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // Helper to compare Number-like ids safely (Integer vs Long)
    private boolean equalsNumber(Object a, Long b) {
        if (a == null || b == null) return false;
        if (a instanceof Number n) return n.longValue() == b;
        return Objects.equals(a.toString(), String.valueOf(b));
    }
}