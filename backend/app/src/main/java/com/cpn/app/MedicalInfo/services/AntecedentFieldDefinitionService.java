package com.cpn.app.MedicalInfo.services;

import com.cpn.app.MedicalInfo.model.AntecedentFieldDefinition;
import com.cpn.app.MedicalInfo.repository.AntecedentFieldDefinitionRepository;
import com.cpn.app.base.BaseCrudServiceImpl;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Service;



@Service
public class AntecedentFieldDefinitionService extends BaseCrudServiceImpl<AntecedentFieldDefinition, Integer> {
    final AntecedentFieldDefinitionRepository repository;

    public AntecedentFieldDefinitionService(AntecedentFieldDefinitionRepository repository) {
        this.repository = repository;
    }

//    public List<AntecedentFieldDefinition> createAntecedentFiledDefinition(List<FieldDefinitionRequest> requests) {
//        for (FieldDefinitionRequest definitionRequest : requests) {
//            AntecedentFieldDefinition fieldDefinition = AntecedentFieldDefinition.builder()
//                    .code(definitionRequest.code())
//                    .label(definitionRequest.label())
//                    .type(definitionRequest.type())
//                    .displayOrder(definitionRequest.displayOrder())
//                    .required(definitionRequest.required())
//                    .constraints(definitionRequest.constraints())
//                    .antecedent(createdAntecedent)
//                    .build();
//            fields.add(fieldDefinition);
//        }
//        List<AntecedentFieldDefinition> createdFields = antecedentFieldDefinitionRepository.saveAll(fields);
//    }

    @Override
    protected JpaRepository<AntecedentFieldDefinition, Integer> getRepository() {
        return repository;
    }
}
