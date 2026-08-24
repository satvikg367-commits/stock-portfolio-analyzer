package com.stockportfolio.stockportfolioanalyzer.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.stockportfolio.stockportfolioanalyzer.dto.StockPriceResponse;
import com.stockportfolio.stockportfolioanalyzer.exception.IndianApiException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.http.client.ClientHttpResponse;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.ResponseErrorHandler;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;
import java.net.URI;
import java.time.Duration;
import java.util.List;
import java.util.Map;

@Service
public class IndianMarketDataService {

    @Value("${indianapi.base-url}")
    private String baseUrl;

    @Value("${indianapi.api-key}")
    private String apiKey;

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public IndianMarketDataService() {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(Duration.ofSeconds(8));
        factory.setReadTimeout(Duration.ofSeconds(25));
        this.restTemplate = new RestTemplate(factory);
        this.restTemplate.setErrorHandler(new ResponseErrorHandler() {
            @Override
            public boolean hasError(ClientHttpResponse response) throws IOException {
                return false;
            }
        });
    }

    public StockPriceResponse getCurrentPrice(String stockName) {
        JsonNode root = getStockDetails(stockName);

        String symbol = firstText(root, stockName, "tickerId", "symbol", "ticker");
        String companyName = firstText(root, stockName, "companyName", "company_name", "name");

        JsonNode currentPrice = root.path("currentPrice");
        Double nsePrice = toDouble(currentPrice.path("NSE"));
        Double bsePrice = toDouble(currentPrice.path("BSE"));
        Double price = nsePrice != null ? nsePrice : bsePrice;
        if (price == null) {
            price = firstDouble(root, "price", "lastPrice", "currentPrice");
        }

        Double percentChange = firstDouble(root, "percentChange", "percent_change", "changePercent");
        Double yearHigh = firstDouble(root, "yearHigh", "year_high", "fiftyTwoWeekHigh");
        Double yearLow = firstDouble(root, "yearLow", "year_low", "fiftyTwoWeekLow");
        Double dayHigh = firstDouble(root, "dayHigh", "day_high", "high");
        Double dayLow = firstDouble(root, "dayLow", "day_low", "low");
        Double previousClose = firstDouble(root, "previousClose", "previous_close", "close");

        StockPriceResponse response = new StockPriceResponse(
                symbol,
                companyName,
                price,
                previousClose,
                percentChange,
                dayHigh,
                dayLow,
                yearHigh,
                yearLow,
                firstText(root, "", "date"),
                firstText(root, "", "time")
        );
        response.setNsePrice(nsePrice);
        response.setBsePrice(bsePrice);
        return response;
    }

    public JsonNode getStockDetails(String stockName) {
        requireParam("name", stockName);
        JsonNode root = get("/stock", Map.of("name", stockName.trim()));
        if (looksLikeMissingStock(root)) {
            throw new IndianApiException(404, "Stock not found.", false);
        }
        return root;
    }

    public JsonNode getHistoricalData(String stockName, String period, String filter) {
        requireParam("stockName", stockName);
        requireParam("period", period);
        requireParam("filter", filter);
        return get("/historical_data", Map.of(
                "stock_name", stockName.trim(),
                "period", period,
                "filter", filter
        ));
    }

    public JsonNode getTrendingStocks() {
        return get("/trending", Map.of());
    }

    public JsonNode getNews() {
        return get("/news", Map.of());
    }

    public JsonNode getIpoData() {
        return get("/ipo", Map.of());
    }

    public JsonNode getPriceShockers() {
        return get("/price_shockers", Map.of());
    }

    public JsonNode getBseMostActiveStocks() {
        return get("/BSE_most_active", Map.of());
    }

    public JsonNode getNseMostActiveStocks() {
        return get("/NSE_most_active", Map.of());
    }

    public JsonNode get52WeekHighLow() {
        return get("/fetch_52_week_high_low_data", Map.of());
    }

    public JsonNode getIndustryStocks(String query) {
        requireParam("query", query);
        return get("/industry_search", Map.of("query", query.trim()));
    }

    public JsonNode getCorporateActions(String stockName) {
        requireParam("stockName", stockName);
        return get("/corporate_actions", Map.of("stock_name", stockName.trim()));
    }

    public JsonNode getMutualFunds() {
        return get("/mutual_funds", Map.of());
    }

    public JsonNode getMutualFundSearch(String query) {
        requireParam("query", query);
        return get("/mutual_fund_search", Map.of("query", query.trim()));
    }

    public JsonNode getMutualFundDetails(String name) {
        requireParam("name", name);
        return get("/mutual_fund_details", Map.of("id", name.trim(), "name", name.trim()));
    }

    public JsonNode getTargetPrice(String stockId) {
        requireParam("stockId", stockId);
        return get("/stock_target_price", Map.of("stock_id", stockId.trim()));
    }

    public JsonNode getRecentAnnouncements(String stockName) {
        requireParam("stockName", stockName);
        return get("/recent_announcements", Map.of("stock_name", stockName.trim()));
    }

    public JsonNode getStatement(String stockName, String stats) {
        requireParam("stockName", stockName);
        requireParam("stats", stats);
        return get("/statement", Map.of(
                "stock_name", stockName.trim(),
                "stats", stats
        ));
    }

    public JsonNode getHistoricalStats(String stockName, String stats) {
        requireParam("stockName", stockName);
        requireParam("stats", stats);
        return get("/historical_stats", Map.of(
                "stock_name", stockName.trim(),
                "stats", stats
        ));
    }

    public JsonNode getStockForecasts(
            String stockId,
            String measureCode,
            String periodType,
            String dataType,
            String age
    ) {
        requireParam("stockId", stockId);
        requireParam("measure_code", measureCode);
        requireParam("period_type", periodType);
        requireParam("data_type", dataType);
        requireParam("age", age);
        return get("/stock_forecasts", Map.of(
                "stock_id", stockId.trim(),
                "measure_code", measureCode,
                "period_type", periodType,
                "data_type", dataType,
                "age", age
        ));
    }

    public JsonNode getCommodities() {
        return get("/commodities", Map.of());
    }

    private JsonNode get(String path, Map<String, String> query) {
        MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
        query.forEach(params::add);

        URI uri = UriComponentsBuilder
                .fromUriString(trimSlash(baseUrl) + path)
                .queryParams(params)
                .build()
                .encode()
                .toUri();

        HttpHeaders headers = new HttpHeaders();
        headers.set("x-api-key", apiKey);
        headers.setAccept(List.of(MediaType.APPLICATION_JSON));

        ResponseEntity<String> response;
        try {
            response = restTemplate.exchange(uri, HttpMethod.GET, new HttpEntity<>(headers), String.class);
        } catch (ResourceAccessException ex) {
            throw new IndianApiException(503, "Unable to fetch market data.", true);
        } catch (Exception ex) {
            throw new IndianApiException(500, "Unable to fetch market data.", false);
        }

        int status = response.getStatusCode().value();
        String body = response.getBody() == null ? "" : response.getBody();
        System.out.println("DEBUG API: " + uri.toString() + " -> " + status + " " + body);
        String lower = body.toLowerCase();

        if (status == 401 || status == 403 || containsPlanError(lower)) {
            throw new IndianApiException(status == 200 ? 403 : status, "Currently unavailable", true);
        }
        if (status == 404 || looksLikeNotFound(lower)) {
            throw new IndianApiException(404, "Stock not found.", false);
        }
        if (status == 429) {
            throw new IndianApiException(429, "Unable to fetch market data.", true);
        }
        if (status == 422 || status == 400) {
            throw new IndianApiException(status, "Unable to fetch market data.", false);
        }
        if (status >= 500) {
            throw new IndianApiException(status, "Unable to fetch market data.", true);
        }
        if (status >= 400) {
            throw new IndianApiException(status, "Unable to fetch market data.", false);
        }
        if (body.isBlank()) {
            throw new IndianApiException(502, "Data is currently unavailable.", true);
        }

        try {
            JsonNode root = objectMapper.readTree(body);
            if (containsPlanError(root.toString().toLowerCase()) && !root.has("companyName") && !root.has("tickerId")) {
                throw new IndianApiException(403, "Currently unavailable", true);
            }
            return root;
        } catch (IndianApiException ex) {
            throw ex;
        } catch (Exception ex) {
            throw new IndianApiException(502, "Data is currently unavailable.", true);
        }
    }

    private boolean looksLikeMissingStock(JsonNode root) {
        if (root == null || root.isNull() || root.isMissingNode()) {
            return true;
        }
        if (root.has("error") && !root.has("companyName") && !root.has("tickerId") && !root.has("currentPrice")) {
            return true;
        }
        return false;
    }

    private boolean containsPlanError(String lower) {
        return lower.contains("upgrade")
                || lower.contains("not included in your plan")
                || lower.contains("subscription")
                || lower.contains("unauthorized")
                || lower.contains("invalid api key")
                || lower.contains("api key");
    }

    private boolean looksLikeNotFound(String lower) {
        return lower.contains("not found") || lower.contains("no data found") || lower.contains("invalid stock");
    }

    private void requireParam(String name, String value) {
        if (value == null || value.isBlank()) {
            throw new IndianApiException(400, "Unable to fetch market data.", false);
        }
    }

    private String trimSlash(String value) {
        if (value == null) {
            return "";
        }
        return value.endsWith("/") ? value.substring(0, value.length() - 1) : value;
    }

    private String firstText(JsonNode root, String fallback, String... fields) {
        for (String field : fields) {
            JsonNode node = root.get(field);
            if (node != null && !node.isNull() && !node.asText("").isBlank()) {
                return node.asText();
            }
        }
        return fallback;
    }

    private Double firstDouble(JsonNode root, String... fields) {
        for (String field : fields) {
            Double value = toDouble(root.path(field));
            if (value != null) {
                return value;
            }
        }
        return null;
    }

    private Double toDouble(JsonNode node) {
        if (node == null || node.isNull() || node.isMissingNode()) {
            return null;
        }
        if (node.isNumber()) {
            return node.asDouble();
        }
        String text = node.asText("").replace("%", "").replace(",", "").trim();
        if (text.isBlank() || "null".equalsIgnoreCase(text)) {
            return null;
        }
        try {
            return Double.parseDouble(text);
        } catch (NumberFormatException ex) {
            return null;
        }
    }
}
