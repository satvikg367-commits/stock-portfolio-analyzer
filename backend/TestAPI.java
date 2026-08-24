import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;

public class TestAPI {
    public static void main(String[] args) throws Exception {
        String[] stocks = {"TCS", "INFY", "RELIANCE"};
        HttpClient client = HttpClient.newHttpClient();
        
        for (String stock : stocks) {
            HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create("https://stock.indianapi.in/stock?name=" + stock))
                .header("x-api-key", "sk-live-v0r9Gwg6VHHJyzF9LhE8kIIvAUWoa1DQyrjqlOON")
                .timeout(Duration.ofSeconds(10))
                .build();
                
            HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
            System.out.println(stock + " -> " + response.statusCode() + " " + response.body());
        }
    }
}
