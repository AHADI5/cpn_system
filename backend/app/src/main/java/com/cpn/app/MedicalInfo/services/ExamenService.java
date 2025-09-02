package com.cpn.app.MedicalInfo.services;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Service;

import com.cpn.app.MedicalInfo.dtos.requests.ExamenRequest;
import com.cpn.app.MedicalInfo.model.Examen;
import com.cpn.app.MedicalInfo.repository.ExamenRepository;
import com.cpn.app.base.BaseCrudServiceImpl;

import jakarta.persistence.EntityNotFoundException;


@Service
public class ExamenService  extends  BaseCrudServiceImpl<Examen, Long>{
    private final ExamenRepository examenRepository;

    public ExamenService(ExamenRepository examenRepository) {
        this.examenRepository = examenRepository;
    }

    public Examen createExamen(ExamenRequest request) {
        Examen examen = Examen.builder()
                .nom(request.nom())
                .description(request.description())
                .build();
        return examenRepository.save(examen);
    }

    public Examen updateExamen(Long id, ExamenRequest request) {
        Examen examen = examenRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Examen not found"));
        examen.setNom(request.nom());
        examen.setDescription(request.description());
        return examenRepository.save(examen);
    }

    @Override
    protected JpaRepository<Examen, Long> getRepository() {
        return examenRepository;
    }

}