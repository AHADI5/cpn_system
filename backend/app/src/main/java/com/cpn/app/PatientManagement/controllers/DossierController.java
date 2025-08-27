package com.cpn.app.PatientManagement.controllers;

import com.cpn.app.PatientManagement.dtos.responses.DossierResponse;
import com.cpn.app.PatientManagement.models.Dossier;
import com.cpn.app.PatientManagement.repository.DossierRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;

import java.util.ArrayList;
import java.util.List;

@RequestMapping("api/v1/dossier")
public record DossierController(
        DossierRepository dossierRepository
) {
    @GetMapping()
    public ResponseEntity<List<DossierResponse>> getAllDossiers() {
        List<Dossier> dossiers = dossierRepository.findAll();
        List<DossierResponse> responses = new ArrayList<>();
        for (Dossier dossier : dossiers) {
            DossierResponse.fromEntity(dossier);
        }
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/{uniqueID}")
    public ResponseEntity<DossierResponse> getDossierById(@PathVariable("uniqueID") String uniqueID) {
        Dossier dossier = dossierRepository.findDossierByUniqueID(uniqueID);
        DossierResponse dossierResponse = DossierResponse.fromEntity(dossier);
        return ResponseEntity.ok(dossierResponse);
    }
}
