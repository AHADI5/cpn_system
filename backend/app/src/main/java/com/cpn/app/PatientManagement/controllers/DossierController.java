package com.cpn.app.PatientManagement.controllers;

import com.cpn.app.PatientManagement.dtos.responses.DossierResponse;
import com.cpn.app.PatientManagement.models.Dossier;
import com.cpn.app.PatientManagement.repository.DossierRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;
import java.util.List;
@Slf4j
@RestController
@RequestMapping("api/v1/dossier")
public record DossierController(
        DossierRepository dossierRepository
) {
    @GetMapping()
    public ResponseEntity<List<DossierResponse>> getAllDossiers() {
        List<Dossier> dossiers = dossierRepository.findAll();
        log.info("Dossiers found{}", dossiers);
        List<DossierResponse> responses = new ArrayList<>();
        for (Dossier dossier : dossiers) {
            responses.add(DossierResponse.fromEntity(dossier)) ;
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
