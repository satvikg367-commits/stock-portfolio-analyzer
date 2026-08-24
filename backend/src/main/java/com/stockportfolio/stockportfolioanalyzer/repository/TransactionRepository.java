package com.stockportfolio.stockportfolioanalyzer.repository;

import com.stockportfolio.stockportfolioanalyzer.entity.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TransactionRepository extends JpaRepository<Transaction, Integer> {

    List<Transaction> findByUserId(Integer userId);

    List<Transaction> findByUserIdOrderByTransactionDateDesc(Integer userId);
    boolean existsByStockId(Integer stockId);
}