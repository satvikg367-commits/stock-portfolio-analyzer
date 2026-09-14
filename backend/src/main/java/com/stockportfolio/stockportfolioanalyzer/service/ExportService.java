package com.stockportfolio.stockportfolioanalyzer.service;

import com.stockportfolio.stockportfolioanalyzer.dto.PortfolioResponse;
import com.stockportfolio.stockportfolioanalyzer.entity.Transaction;
import com.stockportfolio.stockportfolioanalyzer.entity.User;
import com.stockportfolio.stockportfolioanalyzer.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ExportService {

    private final TransactionRepository transactionRepository;
    private final PortfolioService portfolioService;

    public String exportTransactionsCsv(User user) {
        List<Transaction> transactions = transactionRepository.findByUserId(user.getId());
        StringBuilder csv = new StringBuilder();
        csv.append("ID,Stock Symbol,Company,Transaction Type,Quantity,Price,Value,Date\n");
        for (Transaction t : transactions) {
            String symbol = t.getStock() != null ? t.getStock().getSymbol() : "";
            String company = t.getStock() != null ? t.getStock().getCompanyname() : "";
            double value = t.getPrice() * t.getQuantity();
            csv.append(String.format("%d,%s,%s,%s,%d,%.2f,%.2f,%s\n",
                    t.getId(),
                    escapeCsv(symbol),
                    escapeCsv(company),
                    t.getTransactionType(),
                    t.getQuantity(),
                    t.getPrice(),
                    value,
                    t.getTransactionDate()
            ));
        }
        return csv.toString();
    }

    public byte[] exportPortfolioExcel(User user) {
        List<Transaction> transactions = transactionRepository.findByUserId(user.getId());
        List<PortfolioResponse> holdings = portfolioService.getPortfolio(user.getId());
        
        double totalInvested = holdings.stream().mapToDouble(PortfolioResponse::getInvestedValue).sum();
        double currentValue = holdings.stream().mapToDouble(PortfolioResponse::getCurrentValue).sum();
        double profitLoss = currentValue - totalInvested;
        
        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            
            // Sheet 1: Summary
            Sheet summarySheet = workbook.createSheet("Portfolio Summary");
            Row row0 = summarySheet.createRow(0);
            row0.createCell(0).setCellValue("User Name");
            row0.createCell(1).setCellValue(user.getName());
            
            Row row1 = summarySheet.createRow(1);
            row1.createCell(0).setCellValue("Email");
            row1.createCell(1).setCellValue(user.getEmail());
            
            Row row2 = summarySheet.createRow(2);
            row2.createCell(0).setCellValue("Total Invested");
            row2.createCell(1).setCellValue(totalInvested);
            
            Row row3 = summarySheet.createRow(3);
            row3.createCell(0).setCellValue("Current Value");
            row3.createCell(1).setCellValue(currentValue);
            
            Row row4 = summarySheet.createRow(4);
            row4.createCell(0).setCellValue("Profit/Loss");
            row4.createCell(1).setCellValue(profitLoss);
            
            Row row5 = summarySheet.createRow(5);
            row5.createCell(0).setCellValue("Total Holdings");
            row5.createCell(1).setCellValue(holdings.size());
            
            Row row6 = summarySheet.createRow(6);
            row6.createCell(0).setCellValue("Total Transactions");
            row6.createCell(1).setCellValue(transactions.size());
            
            // Sheet 2: Holdings
            Sheet hSheet = workbook.createSheet("Holdings");
            Row hHeader = hSheet.createRow(0);
            String[] hHeaders = {"Symbol", "Company", "Quantity", "Average Buy Price", "Current Price", "Invested Value", "Current Value", "Profit/Loss"};
            for (int i = 0; i < hHeaders.length; i++) hHeader.createCell(i).setCellValue(hHeaders[i]);
            
            int hRowIdx = 1;
            for (var h : holdings) {
                Row row = hSheet.createRow(hRowIdx++);
                row.createCell(0).setCellValue(h.getSymbol());
                row.createCell(1).setCellValue(h.getCompanyName());
                row.createCell(2).setCellValue(h.getQuantity());
                row.createCell(3).setCellValue(h.getAverageBuyPrice());
                row.createCell(4).setCellValue(h.getCurrentPrice());
                row.createCell(5).setCellValue(h.getInvestedValue());
                row.createCell(6).setCellValue(h.getCurrentValue());
                row.createCell(7).setCellValue(h.getProfitLoss());
            }

            // Sheet 3: Transactions
            Sheet txSheet = workbook.createSheet("Transactions");
            Row headerRow = txSheet.createRow(0);
            String[] headers = {"ID", "Stock Symbol", "Company", "Type", "Quantity", "Price", "Value", "Date"};
            for (int i = 0; i < headers.length; i++) headerRow.createCell(i).setCellValue(headers[i]);
            
            int rowIdx = 1;
            for (Transaction t : transactions) {
                Row row = txSheet.createRow(rowIdx++);
                row.createCell(0).setCellValue(t.getId());
                row.createCell(1).setCellValue(t.getStock() != null ? t.getStock().getSymbol() : "");
                row.createCell(2).setCellValue(t.getStock() != null ? t.getStock().getCompanyname() : "");
                row.createCell(3).setCellValue(t.getTransactionType());
                row.createCell(4).setCellValue(t.getQuantity());
                row.createCell(5).setCellValue(t.getPrice());
                row.createCell(6).setCellValue(t.getPrice() * t.getQuantity());
                row.createCell(7).setCellValue(t.getTransactionDate() != null ? t.getTransactionDate().toString() : "");
            }

            workbook.write(out);
            return out.toByteArray();
        } catch (IOException e) {
            throw new RuntimeException("Failed to generate Excel file", e);
        }
    }

    private String escapeCsv(String value) {
        if (value == null) return "";
        if (value.contains(",") || value.contains("\"") || value.contains("\n")) {
            return "\"" + value.replace("\"", "\"\"") + "\"";
        }
        return value;
    }
}
