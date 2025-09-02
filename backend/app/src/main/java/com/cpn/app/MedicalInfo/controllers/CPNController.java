package com.cpn.app.MedicalInfo.controllers;

import com.cpn.app.MedicalInfo.dtos.requests.PrenatalConsultationFormRequest;
import com.cpn.app.MedicalInfo.dtos.responses.PrenatalConsultationFormResponse;
import com.cpn.app.MedicalInfo.model.PrenatalConsultationForm;
import com.cpn.app.MedicalInfo.services.CpnService;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("api/v1/cpn")
public record CPNController(
    CpnService cpnService 
) {
    @PostMapping()
    public ResponseEntity<String> createCpn(@RequestBody PrenatalConsultationFormRequest request) {
        PrenatalConsultationForm form = cpnService.setUpForm(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(form.getCpnID().toString());
    }

    @GetMapping()
    public ResponseEntity<List<PrenatalConsultationFormResponse>> getAllCpn() {
        List<PrenatalConsultationForm> forms = cpnService.findAll();
        List<PrenatalConsultationFormResponse> responses = forms.stream()
                .map(PrenatalConsultationFormResponse::fromEntity)
                .toList();
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/{id}")
    public ResponseEntity<PrenatalConsultationFormResponse> getCpn(@PathVariable long id) {
        PrenatalConsultationForm form = cpnService.findById(id);
        PrenatalConsultationFormResponse response = PrenatalConsultationFormResponse.fromEntity(form);
        return ResponseEntity.ok(response);
    }

}
