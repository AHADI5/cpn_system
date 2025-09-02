package com.cpn.app.MedicalInfo.services;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Service;

import com.cpn.app.MedicalInfo.dtos.requests.ExamenTypeRequest;
import com.cpn.app.MedicalInfo.model.TypeExamen;
import com.cpn.app.MedicalInfo.repository.ExamenTypeRepository;
import com.cpn.app.base.BaseCrudServiceImpl;

@Service
public class ExamenTypeService extends BaseCrudServiceImpl<TypeExamen, Long> {
    final ExamenTypeRepository examenTypeRepository;

    public ExamenTypeService(ExamenTypeRepository examenTypeRepository) {
        this.examenTypeRepository = examenTypeRepository;
    }

    public TypeExamen createTypeExamen(ExamenTypeRequest request) {
        TypeExamen examenType = TypeExamen.builder()
                .nom(request.nom())
                .description(request.description())
                .build();
        return examenTypeRepository.save(examenType);
    }

    public TypeExamen updateTypeExamen(ExamenTypeRequest request , long id) {
        TypeExamen examenType = examenTypeRepository.findById(id).orElseThrow();
        examenType.setNom(request.nom());
        examenType.setDescription(request.description());
        return examenTypeRepository.save(examenType);
    }

    @Override
    protected JpaRepository<TypeExamen, Long> getRepository() {
        return examenTypeRepository;
    }
    
}
