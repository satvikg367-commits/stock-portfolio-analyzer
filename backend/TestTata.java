import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.net.URLEncoder;

public class TestTata {
    public static void main(String[] args) throws Exception {
        HttpClient client = HttpClient.newHttpClient();
        String[] stocks = {"TATAMOTORS", "TATA MOTORS", "Tata Motors", "RELIANCE"};
        for (String stock : stocks) {
            String encoded = URLEncoder.encode(stock, "UTF-8");
            HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create("https://stock.indianapi.in/stock?name=" + encoded))
                .header("x-api-key", "sk-live-v0r9Gwg6VHHJyzF9LhE8kIIvAUWoa1DQyrjqlOON")
                .build();
            HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
            System.out.println("Query: " + stock + " -> " + response.statusCode());
            if (response.statusCode() == 200) {
                System.out.println("SUCCESS! " + response.body().substring(0, Math.min(100, response.body().length())));
            } else if (response.statusCode() == 404) {
                System.out.println("NOT FOUND: " + response.body());
            } else {
                System.out.println(response.body());
            }
            Thread.sleep(2000); // Sleep 2 seconds to avoid burst rate limit!
        }
    }
}
