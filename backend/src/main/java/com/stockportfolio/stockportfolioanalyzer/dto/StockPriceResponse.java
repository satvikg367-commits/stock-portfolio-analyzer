package com.stockportfolio.stockportfolioanalyzer.dto;

public class StockPriceResponse {

    private String symbol;
    private String companyName;
    private Double price;
    private Double previousClose;
    private Double percentChange;
    private Double dayHigh;
    private Double dayLow;
    private Double yearHigh;
    private Double yearLow;
    private String date;
    private String time;
    private Double nsePrice;
    private Double bsePrice;

    public StockPriceResponse() {
    }

    public StockPriceResponse(
            String symbol,
            String companyName,
            Double price,
            Double previousClose,
            Double percentChange,
            Double dayHigh,
            Double dayLow,
            Double yearHigh,
            Double yearLow,
            String date,
            String time) {

        this.symbol = symbol;
        this.companyName = companyName;
        this.price = price;
        this.previousClose = previousClose;
        this.percentChange = percentChange;
        this.dayHigh = dayHigh;
        this.dayLow = dayLow;
        this.yearHigh = yearHigh;
        this.yearLow = yearLow;
        this.date = date;
        this.time = time;
    }

    public String getSymbol() {
        return symbol;
    }

    public void setSymbol(String symbol) {
        this.symbol = symbol;
    }

    public String getCompanyName() {
        return companyName;
    }

    public void setCompanyName(String companyName) {
        this.companyName = companyName;
    }

    public Double getPrice() {
        return price;
    }

    public void setPrice(Double price) {
        this.price = price;
    }

    public Double getPreviousClose() {
        return previousClose;
    }

    public void setPreviousClose(Double previousClose) {
        this.previousClose = previousClose;
    }

    public Double getPercentChange() {
        return percentChange;
    }

    public void setPercentChange(Double percentChange) {
        this.percentChange = percentChange;
    }

    public Double getDayHigh() {
        return dayHigh;
    }

    public void setDayHigh(Double dayHigh) {
        this.dayHigh = dayHigh;
    }

    public Double getDayLow() {
        return dayLow;
    }

    public void setDayLow(Double dayLow) {
        this.dayLow = dayLow;
    }

    public Double getYearHigh() {
        return yearHigh;
    }

    public void setYearHigh(Double yearHigh) {
        this.yearHigh = yearHigh;
    }

    public Double getYearLow() {
        return yearLow;
    }

    public void setYearLow(Double yearLow) {
        this.yearLow = yearLow;
    }

    public String getDate() {
        return date;
    }

    public void setDate(String date) {
        this.date = date;
    }

    public String getTime() {
        return time;
    }

    public void setTime(String time) {
        this.time = time;
    }

    public Double getNsePrice() {
        return nsePrice;
    }

    public void setNsePrice(Double nsePrice) {
        this.nsePrice = nsePrice;
    }

    public Double getBsePrice() {
        return bsePrice;
    }

    public void setBsePrice(Double bsePrice) {
        this.bsePrice = bsePrice;
    }
}