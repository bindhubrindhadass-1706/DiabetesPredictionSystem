package com.brindha.diabetesprediction.repository;

import com.brindha.diabetesprediction.entity.PredictionRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PredictionRepository extends JpaRepository<PredictionRecord, Long> {

    List<PredictionRecord> findByUserEmailOrderByCreatedAtDesc(String userEmail);

}
