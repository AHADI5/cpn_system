package com.cpn.app.MedicalInfo.dtos.requests;


public record ExamenRequest(
    String nom, 
    String description, 
    Long typeExamenId) {
    
}
