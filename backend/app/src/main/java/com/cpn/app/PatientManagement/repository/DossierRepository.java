package com.cpn.app.PatientManagement.repository;

import com.cpn.app.PatientManagement.models.Dossier;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DossierRepository extends JpaRepository<Dossier, Integer> {
    Dossier findDossierByDossierId(int id);
    Dossier findDossierByUniqueID(String email);
}
