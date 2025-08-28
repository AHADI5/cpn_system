package com.cpn.app.MedicalInfo.services;

import com.cpn.app.MedicalInfo.dtos.requests.CreateAntecedentDefinitionRequest;
import com.cpn.app.MedicalInfo.dtos.requests.FieldDefinitionRequest;
import com.cpn.app.MedicalInfo.model.AntecedentDefinition;
import com.cpn.app.MedicalInfo.model.AntecedentFieldDefinition;
import com.cpn.app.MedicalInfo.repository.AntecedentDefinitionRepository;
import com.cpn.app.MedicalInfo.repository.AntecedentFieldDefinitionRepository;
import com.cpn.app.base.BaseCrudServiceImpl;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@Transactional
public class AntecedentService extends BaseCrudServiceImpl<AntecedentDefinition, Integer> {
    final AntecedentDefinitionRepository antecedentDefinitionRepository;
    final AntecedentFieldDefinitionRepository antecedentFieldDefinitionRepository;

    public AntecedentService(AntecedentDefinitionRepository antecedentDefinitionRepository, AntecedentFieldDefinitionRepository antecedentFieldDefinitionRepository) {
        this.antecedentDefinitionRepository = antecedentDefinitionRepository;
        this.antecedentFieldDefinitionRepository = antecedentFieldDefinitionRepository;
    }

    public AntecedentDefinition createAntecedent(CreateAntecedentDefinitionRequest request) {
        AntecedentDefinition antecedents = AntecedentDefinition.builder()
                .code(request.code())
                .name(request.name())
                .description(request.description())
                .antecedentType(request.antecedentType())

                .active(true)
                .build();
        AntecedentDefinition createdAntecedent = antecedentDefinitionRepository.save(antecedents);
        List<AntecedentFieldDefinition> fields = new ArrayList<>();

        //Create Fields
        for (FieldDefinitionRequest definitionRequest : request.fields()) {
            AntecedentFieldDefinition fieldDefinition = AntecedentFieldDefinition.builder()
                    .code(definitionRequest.code())
                    .label(definitionRequest.label())
                    .type(definitionRequest.type())
                    .displayOrder(definitionRequest.displayOrder())
                    .required(definitionRequest.required())
                    .constraints(definitionRequest.constraints())
                    .antecedent(createdAntecedent)
                    .build();
            fields.add(fieldDefinition);
        }
        List<AntecedentFieldDefinition> createdFields = antecedentFieldDefinitionRepository.saveAll(fields);
        createdAntecedent.setFields(createdFields);

        return createdAntecedent;
    }

    @Override
    protected JpaRepository<AntecedentDefinition, Integer> getRepository() {
        return antecedentDefinitionRepository;
    }
}
