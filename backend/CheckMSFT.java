import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

public class CheckMSFT {
    public static void main(String[] args) throws Exception {
        HttpClient client = HttpClient.newHttpClient();
        HttpRequest request = HttpRequest.newBuilder()
            .uri(URI.create("https://stock.indianapi.in/stock?name=MSFT"))
            .header("x-api-key", "sk-live-v0r9Gwg6VHHJyzF9LhE8kIIvAUWoa1DQyrjqlOON")
            .build();
        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
        System.out.println("MSFT: " + response.statusCode() + " " + response.body());
    }
}
