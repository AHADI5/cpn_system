package com.cpn.app.PatientManagement.dtos.requests;

public record PatientRequest(
         String firstName,
         String lastName,
         String email,
         String phoneNumber,
         String gender,
         String birthDate,
         String address,
         String maritalStatus,
         String nationality,
         String dossierID
) {
}
