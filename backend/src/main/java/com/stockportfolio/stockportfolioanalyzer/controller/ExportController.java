package com.stockportfolio.stockportfolioanalyzer.controller;

import com.stockportfolio.stockportfolioanalyzer.security.CurrentUserService;
import com.stockportfolio.stockportfolioanalyzer.service.ExportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/users/me/export")
@RequiredArgsConstructor
public class ExportController {

    private final ExportService exportService;
    private final CurrentUserService currentUserService;

    @GetMapping(value = "/transactions/csv", produces = "text/csv")
    public ResponseEntity<String> exportTransactionsCsv() {
        String csv = exportService.exportTransactionsCsv(currentUserService.getCurrentUser());
        
        HttpHeaders headers = new HttpHeaders();
        headers.add(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=stock-portfolio-transactions.csv");
        
        return ResponseEntity.ok()
                .headers(headers)
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(csv);
    }

    @GetMapping(value = "/portfolio/excel", produces = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
    public ResponseEntity<byte[]> exportPortfolioExcel() {
        byte[] excel = exportService.exportPortfolioExcel(currentUserService.getCurrentUser());
        
        HttpHeaders headers = new HttpHeaders();
        headers.add(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=stock-portfolio-report.xlsx");
        
        return ResponseEntity.ok()
                .headers(headers)
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(excel);
    }
}
