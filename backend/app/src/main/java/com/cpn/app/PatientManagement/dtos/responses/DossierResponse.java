package com.cpn.app.PatientManagement.dtos.responses;

import com.cpn.app.PatientManagement.models.Dossier;

public record DossierResponse(
        long dossierID ,
        String uniqueID ,
        PatientResponse patient
) {
    public static DossierResponse fromEntity(Dossier dossier) {
        if (dossier == null) {
            return null;
        }
        return new DossierResponse(
                dossier.getDossierId(),
                dossier.getUniqueID(),
                PatientResponse.fromEntity(dossier.getPatient())
        );
    }
}
