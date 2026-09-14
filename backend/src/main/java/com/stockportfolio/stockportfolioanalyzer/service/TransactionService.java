package com.stockportfolio.stockportfolioanalyzer.service;

import com.stockportfolio.stockportfolioanalyzer.dto.TransactionRequest;
import com.stockportfolio.stockportfolioanalyzer.entity.Stock;
import com.stockportfolio.stockportfolioanalyzer.entity.Transaction;
import com.stockportfolio.stockportfolioanalyzer.entity.User;
import com.stockportfolio.stockportfolioanalyzer.repository.StockRepository;
import com.stockportfolio.stockportfolioanalyzer.repository.TransactionRepository;
import com.stockportfolio.stockportfolioanalyzer.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.List;

@Service
public class TransactionService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private StockRepository stockRepository;

    @Autowired
    private TransactionRepository transactionRepository;


    // CREATE TRANSACTION
    public Transaction saveTransaction(Transaction transaction, User authenticatedUser) {

        if (transaction.getStock() == null ||
                transaction.getStock().getId() == null) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Stock ID is required"
            );
        }

        User user = authenticatedUser; // Use the authenticated user directly!

        Stock stock = stockRepository.findById(
                transaction.getStock().getId()
        ).orElseThrow(() -> new ResponseStatusException(
                HttpStatus.NOT_FOUND,
                "Stock not found"
        ));

        if (transaction.getQuantity() == null ||
                transaction.getQuantity() <= 0) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Quantity must be greater than zero"
            );
        }

        if (transaction.getPrice() == null ||
                transaction.getPrice() <= 0) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Price must be greater than zero"
            );
        }

        if (transaction.getTransactionType() == null ||
                (!transaction.getTransactionType().equalsIgnoreCase("BUY")
                        && !transaction.getTransactionType().equalsIgnoreCase("SELL"))) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Transaction type must be BUY or SELL"
            );
        }

        String type = transaction.getTransactionType().toUpperCase();

        // Check holding when selling
        if (type.equals("SELL")) {

            int currentHolding = calculateHolding(
                    user.getId(),
                    stock.getId()
            );

            if (transaction.getQuantity() > currentHolding) {

                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Insufficient stock holding"
                );
            }
        }

        transaction.setUser(user);
        transaction.setStock(stock);
        transaction.setTransactionType(type);

        if (transaction.getTransactionDate() == null) {
            transaction.setTransactionDate(LocalDate.now());
        }

        return transactionRepository.save(transaction);
    }


    // GET ALL TRANSACTIONS
    public List<Transaction> getAllTransactions() {
        return transactionRepository.findAll();
    }


    // GET TRANSACTION BY ID
    public Transaction getTransactionById(Integer id, User user) {

        Transaction transaction = transactionRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Transaction not found"));
        if (!transaction.getUser().getId().equals(user.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You do not have access to this transaction");
        }
        return transaction;
    }


    // BUY STOCK
    public Transaction buyStock(TransactionRequest request, User user) {


        Stock stock = stockRepository.findById(request.getStockId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Stock not found"
                ));

        if (request.getQuantity() <= 0) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Quantity must be greater than zero"
            );
        }

        if (request.getPrice() <= 0) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Price must be greater than zero"
            );
        }

        Transaction transaction = new Transaction();

        transaction.setUser(user);
        transaction.setStock(stock);
        transaction.setQuantity(request.getQuantity());
        transaction.setPrice(request.getPrice());
        transaction.setTransactionType("BUY");
        transaction.setTransactionDate(LocalDate.now());

        return transactionRepository.save(transaction);
    }


    // SELL STOCK
    public Transaction sellStock(TransactionRequest request, User user) {


        Stock stock = stockRepository.findById(request.getStockId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Stock not found"
                ));

        if (request.getQuantity() <= 0) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Quantity must be greater than zero"
            );
        }

        if (request.getPrice() <= 0) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Price must be greater than zero"
            );
        }

        int currentHolding = calculateHolding(
                user.getId(),
                stock.getId()
        );

        if (request.getQuantity() > currentHolding) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Insufficient stock holding"
            );
        }

        Transaction transaction = new Transaction();

        transaction.setUser(user);
        transaction.setStock(stock);
        transaction.setQuantity(request.getQuantity());
        transaction.setPrice(request.getPrice());
        transaction.setTransactionType("SELL");
        transaction.setTransactionDate(LocalDate.now());

        return transactionRepository.save(transaction);
    }


    // GET TRANSACTIONS BY USER
    public List<Transaction> getTransactionsByUser(User user) {

        return transactionRepository.findByUserIdOrderByTransactionDateDesc(user.getId());
    }


    // DELETE TRANSACTION
    public void deleteTransaction(Integer id, User user) {

        Transaction transaction = getTransactionById(id, user);
        transactionRepository.delete(transaction);
    }


    // CALCULATE CURRENT HOLDING
    private int calculateHolding(Integer userId, Integer stockId) {

        List<Transaction> transactions =
                transactionRepository.findAll();

        int holding = 0;

        for (Transaction transaction : transactions) {

            if (transaction.getUser().getId().equals(userId)
                    && transaction.getStock().getId().equals(stockId)) {

                if (transaction.getTransactionType()
                        .equalsIgnoreCase("BUY")) {

                    holding += transaction.getQuantity();

                } else if (transaction.getTransactionType()
                        .equalsIgnoreCase("SELL")) {

                    holding -= transaction.getQuantity();
                }
            }
        }

        return holding;
    }
}
