package com.brindha.diabetesprediction.controller;

import com.brindha.diabetesprediction.dto.ApiResponse;
import com.brindha.diabetesprediction.dto.PredictionRequest;
import com.brindha.diabetesprediction.entity.PredictionRecord;
import com.brindha.diabetesprediction.service.PredictionService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/predictions")
@CrossOrigin("*")
public class PredictionController {

    private final PredictionService predictionService;

    @Autowired
    public PredictionController(PredictionService predictionService) {
        this.predictionService = predictionService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<PredictionRecord>> predict(@Valid @RequestBody PredictionRequest request) {
        PredictionRecord record = predictionService.predict(request);
        return ResponseEntity.ok(ApiResponse.ok("Prediction complete", record));
    }

    @GetMapping("/history/{email}")
    public ResponseEntity<ApiResponse<List<PredictionRecord>>> history(@PathVariable String email) {
        List<PredictionRecord> records = predictionService.history(email);
        return ResponseEntity.ok(ApiResponse.ok("History fetched", records));
    }
}
