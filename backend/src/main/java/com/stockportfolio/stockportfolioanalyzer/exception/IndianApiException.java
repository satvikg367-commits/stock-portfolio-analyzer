package com.stockportfolio.stockportfolioanalyzer.exception;

public class IndianApiException extends RuntimeException {

    private final int status;
    private final boolean unavailable;

    public IndianApiException(int status, String message, boolean unavailable) {
        super(message);
        this.status = status;
        this.unavailable = unavailable;
    }

    public int getStatus() {
        return status;
    }

    public boolean isUnavailable() {
        return unavailable;
    }
}
