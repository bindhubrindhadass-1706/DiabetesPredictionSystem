package com.brindha.diabetesprediction.dto;

import jakarta.validation.constraints.*;

public class PredictionRequest {

    private String userEmail;

    @Min(value = 0, message = "Pregnancies cannot be negative")
    private int pregnancies;

    @NotNull
    @Positive(message = "Glucose must be a positive value")
    private Double glucose;

    @NotNull
    @Positive(message = "Blood pressure must be a positive value")
    private Double bloodPressure;

    @PositiveOrZero
    private Double skinThickness;

    @PositiveOrZero
    private Double insulin;

    @NotNull
    @Positive(message = "BMI must be a positive value")
    private Double bmi;

    @PositiveOrZero
    private Double diabetesPedigreeFunction;

    @NotNull
    @Min(value = 1, message = "Age must be at least 1")
    private Integer age;

    public String getUserEmail() {
        return userEmail;
    }

    public void setUserEmail(String userEmail) {
        this.userEmail = userEmail;
    }

    public int getPregnancies() {
        return pregnancies;
    }

    public void setPregnancies(int pregnancies) {
        this.pregnancies = pregnancies;
    }

    public Double getGlucose() {
        return glucose;
    }

    public void setGlucose(Double glucose) {
        this.glucose = glucose;
    }

    public Double getBloodPressure() {
        return bloodPressure;
    }

    public void setBloodPressure(Double bloodPressure) {
        this.bloodPressure = bloodPressure;
    }

    public Double getSkinThickness() {
        return skinThickness;
    }

    public void setSkinThickness(Double skinThickness) {
        this.skinThickness = skinThickness;
    }

    public Double getInsulin() {
        return insulin;
    }

    public void setInsulin(Double insulin) {
        this.insulin = insulin;
    }

    public Double getBmi() {
        return bmi;
    }

    public void setBmi(Double bmi) {
        this.bmi = bmi;
    }

    public Double getDiabetesPedigreeFunction() {
        return diabetesPedigreeFunction;
    }

    public void setDiabetesPedigreeFunction(Double diabetesPedigreeFunction) {
        this.diabetesPedigreeFunction = diabetesPedigreeFunction;
    }

    public Integer getAge() {
        return age;
    }

    public void setAge(Integer age) {
        this.age = age;
    }
}
