package com.cpn.app.MedicalInfo.controllers;

import com.cpn.app.MedicalInfo.dtos.requests.CreateAntecedentDefinitionRequest;
import com.cpn.app.MedicalInfo.dtos.responses.AntecedentDefinitionResponse;
import com.cpn.app.MedicalInfo.model.AntecedentDefinition;
import com.cpn.app.MedicalInfo.services.AntecedentService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("api/v1/antecedent")
public record AntecedentController(
        AntecedentService antecedentService
) {
    @PostMapping()
    public ResponseEntity<String> createAntecedent(@RequestBody CreateAntecedentDefinitionRequest request) {
        AntecedentDefinition antecedentDefinition = antecedentService.createAntecedent(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(antecedentDefinition.getName());
    }
    @GetMapping()
    public ResponseEntity<List<AntecedentDefinitionResponse>> getAntecedent() {
        List<AntecedentDefinition> antecedentDefinitions = antecedentService.findAll();

        List<AntecedentDefinitionResponse> responses =
                (antecedentDefinitions == null ? List.<AntecedentDefinition>of() : antecedentDefinitions)
                        .stream()
                        .map(AntecedentDefinitionResponse::fromEntity)
                        .collect(java.util.stream.Collectors.toList());

        if (responses.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(responses);
    }
}
