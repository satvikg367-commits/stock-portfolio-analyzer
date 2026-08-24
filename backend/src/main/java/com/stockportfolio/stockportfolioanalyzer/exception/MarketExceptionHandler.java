package com.stockportfolio.stockportfolioanalyzer.exception;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.LinkedHashMap;
import java.util.Map;

@RestControllerAdvice
public class MarketExceptionHandler {

    @ExceptionHandler(IndianApiException.class)
    public ResponseEntity<Map<String, Object>> handleIndianApi(IndianApiException ex) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("error", ex.getMessage());
        body.put("unavailable", ex.isUnavailable());
        return ResponseEntity.status(ex.getStatus()).body(body);
    }
}
