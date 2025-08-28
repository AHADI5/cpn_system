package com.cpn.app.PatientManagement.controllers;

import com.cpn.app.PatientManagement.dtos.requests.PatientRequest;
import com.cpn.app.PatientManagement.dtos.responses.PatientResponse;
import com.cpn.app.PatientManagement.models.Patient;
import com.cpn.app.PatientManagement.services.PatientService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("api/v1/patient")
public record PatientController(
        PatientService patientService
) {
    @PostMapping()
    public ResponseEntity<String> createPatient(@RequestBody PatientRequest request) {
        Patient patient = patientService.createPatient(request) ;
        return ResponseEntity.status(HttpStatus.CREATED).body("Patient Created" + patient.getFirstName() + " " + patient.getLastName());
    }

    @GetMapping()
    public ResponseEntity<List<PatientResponse>> getPatients() {
        List<Patient> patients = patientService.findAll() ;
        List<PatientResponse> patientResponses = new ArrayList<>();
        for (Patient patient : patients) {
            patientResponses.add(PatientResponse.fromEntity(patient));
        }
        return ResponseEntity.status(HttpStatus.OK).body(patientResponses);
    }

    @GetMapping("/{patientID}")
    public ResponseEntity<PatientResponse> getPatient(@PathVariable("patientID") long patientID) {
        Patient patient = patientService.findById(patientID) ;
        return ResponseEntity.status(HttpStatus.OK).body(PatientResponse.fromEntity(patient));
    }

    @PutMapping("/{patientID}")
    public ResponseEntity<String> updatePatient(@PathVariable("patientID") long patientID, @RequestBody PatientRequest request) {
        Patient patient = patientService.updatePatient(patientID, request) ;
        return ResponseEntity.status(HttpStatus.OK).body("Patient Updated" + patient.getFirstName() + " " + patient.getLastName());
    }

    @DeleteMapping("/{patientID}")
    public ResponseEntity<String> deletePatient(@PathVariable("patientID") long patientID) {
        patientService.delete(patientID) ;
        return ResponseEntity.status(HttpStatus.OK).body("Patient Deleted" + patientID);
    }
}
