import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

public class TestBoth {
    public static void main(String[] args) throws Exception {
        HttpClient client = HttpClient.newHttpClient();
        String[] stocks = {"TCS", "RELIANCE"};
        for (String stock : stocks) {
            HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create("https://stock.indianapi.in/stock?name=" + stock))
                .header("x-api-key", "sk-live-v0r9Gwg6VHHJyzF9LhE8kIIvAUWoa1DQyrjqlOON")
                .build();
            HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
            System.out.println(stock + ": " + response.statusCode());
            if (response.statusCode() == 200) {
                System.out.println(response.body().substring(0, Math.min(100, response.body().length())));
            } else {
                System.out.println(response.body());
            }
        }
    }
}
