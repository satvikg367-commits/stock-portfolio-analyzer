package com.stockportfolio.stockportfolioanalyzer.repository;

import com.stockportfolio.stockportfolioanalyzer.entity.Alert;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AlertRepository extends JpaRepository<Alert, Integer> {
    List<Alert> findByUserId(Integer userId);
}
