package com.brindha.diabetesprediction.service;

import com.brindha.diabetesprediction.dto.PredictionRequest;
import com.brindha.diabetesprediction.entity.PredictionRecord;
import com.brindha.diabetesprediction.repository.PredictionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Rule-based diabetes risk scoring service.
 *
 * NOTE: This project does not ship a trained machine-learning model or a
 * bundled dataset, so this service implements a transparent, clinically
 * inspired weighted-risk-factor calculator (based on the widely used Pima
 * Indians Diabetes indicators: glucose, BMI, age, blood pressure, insulin,
 * pregnancies and family history). It gives a reasonable, explainable
 * approximation of risk out of the box. Swap the body of {@link #predict}
 * for a call to a real trained model (e.g. served via a Python/Flask
 * microservice or an ONNX/PMML model loaded in Java) when one is available,
 * without needing to change the controller or frontend contract.
 */
@Service
public class PredictionService {

    private final PredictionRepository predictionRepository;

    @Autowired
    public PredictionService(PredictionRepository predictionRepository) {
        this.predictionRepository = predictionRepository;
    }

    public PredictionRecord predict(PredictionRequest request) {
        double score = 0;

        // Glucose (mg/dL) - strongest single indicator
        double glucose = request.getGlucose();
        if (glucose >= 126) score += 35;
        else if (glucose >= 100) score += 20;
        else if (glucose >= 90) score += 8;

        // BMI
        double bmi = request.getBmi();
        if (bmi >= 35) score += 20;
        else if (bmi >= 30) score += 14;
        else if (bmi >= 25) score += 7;

        // Age
        int age = request.getAge();
        if (age >= 60) score += 15;
        else if (age >= 45) score += 10;
        else if (age >= 30) score += 5;

        // Blood pressure (mm Hg)
        double bp = request.getBloodPressure();
        if (bp >= 90) score += 10;
        else if (bp >= 80) score += 5;

        // Insulin (mu U/ml)
        Double insulin = request.getInsulin();
        if (insulin != null) {
            if (insulin > 166) score += 8;
            else if (insulin > 100) score += 4;
        }

        // Pregnancies
        if (request.getPregnancies() >= 4) score += 6;
        else if (request.getPregnancies() >= 1) score += 2;

        // Diabetes pedigree function (family-history proxy)
        Double dpf = request.getDiabetesPedigreeFunction();
        if (dpf != null) {
            if (dpf >= 0.8) score += 6;
            else if (dpf >= 0.4) score += 3;
        }

        // Clamp to 0-100
        score = Math.max(0, Math.min(100, score));

        String riskLevel;
        boolean diabetic;
        if (score >= 55) {
            riskLevel = "High";
            diabetic = true;
        } else if (score >= 30) {
            riskLevel = "Moderate";
            diabetic = false;
        } else {
            riskLevel = "Low";
            diabetic = false;
        }

        PredictionRecord record = new PredictionRecord();
        record.setUserEmail(request.getUserEmail());
        record.setPregnancies(request.getPregnancies());
        record.setGlucose(glucose);
        record.setBloodPressure(bp);
        record.setSkinThickness(request.getSkinThickness() == null ? 0 : request.getSkinThickness());
        record.setInsulin(insulin == null ? 0 : insulin);
        record.setBmi(bmi);
        record.setDiabetesPedigreeFunction(dpf == null ? 0 : dpf);
        record.setAge(age);
        record.setRiskScore(score);
        record.setRiskLevel(riskLevel);
        record.setDiabetic(diabetic);

        return predictionRepository.save(record);
    }

    public List<PredictionRecord> history(String email) {
        return predictionRepository.findByUserEmailOrderByCreatedAtDesc(email);
    }
}
