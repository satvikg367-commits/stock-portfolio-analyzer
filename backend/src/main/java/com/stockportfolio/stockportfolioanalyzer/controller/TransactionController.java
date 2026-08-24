package com.stockportfolio.stockportfolioanalyzer.controller;

import com.stockportfolio.stockportfolioanalyzer.dto.TransactionRequest;
import com.stockportfolio.stockportfolioanalyzer.entity.Transaction;
import com.stockportfolio.stockportfolioanalyzer.service.TransactionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/transactions")
public class TransactionController {

    @Autowired
    private TransactionService transactionService;

    // CREATE TRANSACTION
    @PostMapping
    public Transaction saveTransaction(
            @RequestBody Transaction transaction) {

        return transactionService.saveTransaction(transaction);
    }

    // GET ALL TRANSACTIONS
    @GetMapping
    public List<Transaction> getAllTransactions() {

        return transactionService.getAllTransactions();
    }

    // GET TRANSACTION BY ID
    @GetMapping("/{id}")
    public Transaction getTransactionById(
            @PathVariable Integer id) {

        return transactionService.getTransactionById(id);
    }

    // BUY STOCK
    @PostMapping("/buy")
    public Transaction buyStock(
            @RequestBody TransactionRequest request) {

        return transactionService.buyStock(request);
    }

    // SELL STOCK
    @PostMapping("/sell")
    public Transaction sellStock(
            @RequestBody TransactionRequest request) {

        return transactionService.sellStock(request);
    }

    // GET TRANSACTIONS BY USER
    @GetMapping("/user/{id}")
    public List<Transaction> getTransactionsByUser(
            @PathVariable Integer id) {

        return transactionService.getTransactionsByUser(id);
    }

    // DELETE TRANSACTION
    @DeleteMapping("/{id}")
    public String deleteTransaction(
            @PathVariable Integer id) {

        transactionService.deleteTransaction(id);

        return "Transaction deleted successfully";
    }
}