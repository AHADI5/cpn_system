package com.cpn.app.PatientManagement.dtos.responses;

import com.cpn.app.PatientManagement.models.Patient;

public record PatientResponse(
        Long patientId,
        String firstName,
        String lastName,
        String email,
        String phoneNumber,
        String gender,
        String birthDate,
        String address,
        String maritalStatus,
        String nationality
) {
    public static PatientResponse fromEntity(Patient patient) {
        if (patient == null) {
            return null;
        }
        return new PatientResponse(
                patient.getPatientId(),
                patient.getFirstName(),
                patient.getLastName(),
                patient.getEmail(),
                patient.getPhoneNumber(),
                patient.getGender(),
                patient.getBirthDate() != null ? patient.getBirthDate() : null,
                patient.getAddress(),
                patient.getMaritalStatus(),
                patient.getNationality()
        );
    }
}
