package com.stockportfolio.stockportfolioanalyzer.controller;

import com.stockportfolio.stockportfolioanalyzer.dto.TransactionRequest;
import com.stockportfolio.stockportfolioanalyzer.entity.Transaction;
import com.stockportfolio.stockportfolioanalyzer.entity.User;
import com.stockportfolio.stockportfolioanalyzer.security.CurrentUserService;
import com.stockportfolio.stockportfolioanalyzer.service.TransactionService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/transactions")
@RequiredArgsConstructor
public class TransactionController {
    private final TransactionService transactionService;
    private final CurrentUserService currentUserService;

    @PostMapping
    public Transaction saveTransaction(@RequestBody Transaction transaction) {
        return transactionService.saveTransaction(transaction, currentUserService.getCurrentUser());
    }

    @GetMapping
    public List<Transaction> getAllTransactions() {
        return transactionService.getTransactionsByUser(currentUserService.getCurrentUser());
    }

    @GetMapping("/{id}")
    public Transaction getTransactionById(@PathVariable Integer id) {
        return transactionService.getTransactionById(id, currentUserService.getCurrentUser());
    }

    @PostMapping("/buy")
    public Transaction buyStock(@RequestBody TransactionRequest request) {
        return transactionService.buyStock(request, currentUserService.getCurrentUser());
    }

    @PostMapping("/sell")
    public Transaction sellStock(@RequestBody TransactionRequest request) {
        return transactionService.sellStock(request, currentUserService.getCurrentUser());
    }

    @DeleteMapping("/{id}")
    public String deleteTransaction(@PathVariable Integer id) {
        transactionService.deleteTransaction(id, currentUserService.getCurrentUser());
        return "Transaction deleted successfully";
    }
}
