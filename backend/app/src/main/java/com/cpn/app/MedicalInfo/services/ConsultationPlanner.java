package com.cpn.app.MedicalInfo.services;

import com.cpn.app.MedicalInfo.model.Consultation;

import java.time.*;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

public class ConsultationPlanner {

    /**
     * Generate ANC consultations from the first day of the last menstrual period (LMP).
     * Schedule:
     * - Monthly: 12, 16, 20, 24, 28 SA
     * - Biweekly: 30, 32, 34, 36 SA
     * - Weekly: 37, 38, 39, 40, 41 SA
     *
     * Notes from guideline:
     * - Gestational age is counted in SA from LMP.
     * - EDD ≈ LMP + 40 to 41 weeks.
     * - If LMP is unknown, estimate from clinical exam or ultrasound (not handled here).
     */
    public static List<Consultation> generateConsultationsFromLMP(Date lastAmenorrheaDate) {
        if (lastAmenorrheaDate == null) {
            throw new IllegalArgumentException("lastAmenorrheaDate (LMP) is required");
        }

        ZoneId zone = ZoneId.systemDefault();
        LocalDate lmp = Instant.ofEpochMilli(lastAmenorrheaDate.getTime())
                .atZone(zone)
                .toLocalDate();

        // Build schedule weeks: 12..28 by 4; 30..36 by 2; 37..41 by 1
        List<Integer> weeks = new ArrayList<>();
        for (int w = 12; w <= 28; w += 4) weeks.add(w);
        for (int w = 30; w <= 36; w += 2) weeks.add(w);
        for (int w = 37; w <= 41; w++) weeks.add(w);

        List<Consultation> consultations = new ArrayList<>(weeks.size());
        for (Integer w : weeks) {
            LocalDate visitDate = lmp.plusWeeks(w);
            Date asDate = Date.from(visitDate.atStartOfDay(zone).toInstant());
            consultations.add(Consultation.builder()
                    .date(asDate)
                    .build());
        }

        return consultations;
    }

    /**
     * Variant: only upcoming consultations relative to 'today'.
     */
    public static List<Consultation> generateUpcomingConsultationsFromLMP(Date lastAmenorrheaDate) {
        List<Consultation> all = generateConsultationsFromLMP(lastAmenorrheaDate);
        LocalDate today = LocalDate.now();
        ZoneId zone = ZoneId.systemDefault();
        return all.stream()
                .filter(c -> !c.getDate().before(Date.from(today.atStartOfDay(zone).toInstant())))
                .toList();
    }
}