package com.cpn.app.PatientManagement.services;

import com.cpn.app.AuthModule.model.UserRole;
import com.cpn.app.PatientManagement.dtos.requests.PatientRequest;
import com.cpn.app.PatientManagement.models.Dossier;
import com.cpn.app.PatientManagement.models.Patient;
import com.cpn.app.PatientManagement.repository.DossierRepository;
import com.cpn.app.PatientManagement.repository.PatientRepository;
import com.cpn.app.base.BaseCrudServiceImpl;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Service;

@Service
public class PatientService extends BaseCrudServiceImpl<Patient, Long> {
    private  final  PatientRepository patientRepository ;
    private  final DossierRepository dossierRepository ;

    public PatientService(PatientRepository repository, DossierRepository dossierRepository) {this.patientRepository = repository;
        this.dossierRepository = dossierRepository;
    }

    public Patient createPatient(PatientRequest request) {

        //Create the patient
        Patient patient = Patient.builder()
                .firstName(request.firstName())
                .lastName(request.lastName())
                .birthDate(request.birthDate())
                .gender(request.gender())
                .email(request.email())
                .address(request.address())
                .maritalStatus(request.maritalStatus())
                .nationality(request.nationality())
                .dossierID(request.dossierID())
                .gender(request.gender())
                .build();
        Patient createdPatient = patientRepository.save(patient);

        //associate him with a dossier
        Dossier dossier = Dossier.builder()
                .patient(patient)
                .build();
        Dossier createdDossier = dossierRepository.save(dossier);
        createdPatient.setDossierID(createdDossier.getUniqueID());
        return patientRepository.save(createdPatient);
    }

    @Override
    protected JpaRepository<Patient, Long> getRepository() {
        return null;
    }

    public Patient updatePatient(long patientID, PatientRequest request) {
        Patient patient = patientRepository.findByPatientId(patientID);
        patient.setFirstName(request.firstName());
        patient.setLastName(request.lastName());
        patient.setBirthDate(request.birthDate());
        patient.setGender(request.gender());
        patient.setEmail(request.email());
        patient.setAddress(request.address());
        patient.setMaritalStatus(request.maritalStatus());
        patient.setNationality(request.nationality());
        patientRepository.save(patient);

        return patient;
    }
}
