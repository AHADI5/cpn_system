package com.cpn.app.MedicalInfo.services;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Service;

import com.cpn.app.MedicalInfo.dtos.requests.ExamResultRequest;
import com.cpn.app.MedicalInfo.model.Consultation;
import com.cpn.app.MedicalInfo.model.Examen;
import com.cpn.app.MedicalInfo.model.ResultatExamen;
import com.cpn.app.MedicalInfo.repository.ConsultationRepository;
import com.cpn.app.MedicalInfo.repository.ExamenRepository;
import com.cpn.app.MedicalInfo.repository.ExamenResultatRepository;
import com.cpn.app.base.BaseCrudServiceImpl;

@Service
public class ExamenResultService extends BaseCrudServiceImpl<ResultatExamen, Long> {
    final ExamenResultatRepository examenResultatRepository;
    final ExamenRepository examenRepository;
    final ConsultationRepository consultationRepository;

    public ExamenResultService(ExamenResultatRepository examenResultatRepository, ExamenRepository examenRepository, ConsultationRepository consultationRepository) {
        this.examenResultatRepository = examenResultatRepository;
        this.examenRepository = examenRepository;
        this.consultationRepository = consultationRepository;
    }

    public ResultatExamen createResultatExamen(ExamResultRequest request) {
        // Fetch related entities (Examen and Consultation) by their IDs
        Examen examen = examenRepository.findById(request.examenId())
            .orElseThrow(() -> new IllegalArgumentException("Examen not found"));
        Consultation consultation = consultationRepository.findById(request.consultationId())
            .orElseThrow(() -> new IllegalArgumentException("Consultation not found"));

        ResultatExamen resultatExamen = ResultatExamen.builder()
            .champ(request.champ())
            .valeur(request.valeur())
            .examen(examen)
            .consultation(consultation)
            .build();

        return examenResultatRepository.save(resultatExamen);
    }

    public ResultatExamen updateResultatExamen(Long id, ExamResultRequest request) {
        ResultatExamen existing = examenResultatRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("ResultatExamen not found"));

        Examen examen = examenRepository.findById(request.examenId())
            .orElseThrow(() -> new IllegalArgumentException("Examen not found"));
        Consultation consultation = consultationRepository.findById(request.consultationId())
            .orElseThrow(() -> new IllegalArgumentException("Consultation not found"));

        existing.setChamp(request.champ());
        existing.setValeur(request.valeur());
        existing.setExamen(examen);
        existing.setConsultation(consultation);

        return examenResultatRepository.save(existing);
    }

    @Override
    protected JpaRepository<ResultatExamen, Long> getRepository() {
        return examenResultatRepository;
    }
    
}
