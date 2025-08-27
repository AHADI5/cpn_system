package com.cpn.app.PatientManagement.dtos.responses;

import com.cpn.app.PatientManagement.models.Dossier;

public record DossierResponse(
        long dossierID ,
        String uniqueID ,
        long patientID
) {
    public static DossierResponse fromEntity(Dossier dossier) {
        if (dossier == null) {
            return null;
        }
        return new DossierResponse(
                dossier.getDossierId(),
                dossier.getUniqueID(),
                dossier.getPatient().getPatientId()
        );
    }
}
