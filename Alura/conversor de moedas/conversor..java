import com.google.gson.JsonObject;
import com.google.gson.JsonParser;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Scanner;

public class ConversorMoedas {

    private static final String API_URL = "https://v6.exchangerate-api.com/v6/8c0c33162421f5cfd3d91203/latest/";
    private static final List<String> historico = new ArrayList<>();

    public static void main(String[] args) throws IOException, InterruptedException {
        Scanner scanner = new Scanner(System.in);
        HttpClient client = HttpClient.newHttpClient();
        int opcao;

        do {
            System.out.println("\n==== Conversor de Moedas ====");
            System.out.println("1 - Dólar (USD) para Real (BRL)");
            System.out.println("2 - Real (BRL) para Dólar (USD)");
            System.out.println("3 - Peso Argentino (ARS) para Real (BRL)");
            System.out.println("4 - Real (BRL) para Peso Chileno (CLP)");
            System.out.println("5 - Boliviano (BOB) para Real (BRL)");
            System.out.println("6 - Peso Colombiano (COP) para Real (BRL)");
            System.out.println("7 - Ver histórico de conversões");
            System.out.println("0 - Sair");
            System.out.print("Escolha uma opção: ");
            opcao = scanner.nextInt();

            if (opcao >= 1 && opcao <= 6) {
                System.out.print("Digite o valor a ser convertido: ");
                double valor = scanner.nextDouble();

                String de = "", para = "";

                switch (opcao) {
                    case 1: de = "USD"; para = "BRL"; break;
                    case 2: de = "BRL"; para = "USD"; break;
                    case 3: de = "ARS"; para = "BRL"; break;
                    case 4: de = "BRL"; para = "CLP"; break;
                    case 5: de = "BOB"; para = "BRL"; break;
                    case 6: de = "COP"; para = "BRL"; break;
                }

                double taxa = obterTaxaConversao(client, de, para);
                double convertido = valor * taxa;

                String log = String.format("[ %s ] %.2f %s = %.2f %s", LocalDateTime.now(), valor, de, convertido, para);
                historico.add(log);
                System.out.println(log);

            } else if (opcao == 7) {
                System.out.println("\n== Histórico de Conversões ==");
                if (historico.isEmpty()) {
                    System.out.println("Nenhuma conversão realizada ainda.");
                } else {
                    historico.forEach(System.out::println);
                }
            } else if (opcao != 0) {
                System.out.println("Opção inválida. Tente novamente.");
            }

        } while (opcao != 0);

        System.out.println("Programa encerrado.");
        scanner.close();
    }

    private static double obterTaxaConversao(HttpClient client, String de, String para) throws IOException, InterruptedException {
        String url = API_URL + de;
        HttpRequest request = HttpRequest.newBuilder().uri(URI.create(url)).build();
        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

        if (response.statusCode() != 200) {
            System.out.println("Erro ao acessar a API: " + response.statusCode());
            return 0;
        }

        JsonObject json = JsonParser.parseString(response.body()).getAsJsonObject();
        JsonObject rates = json.getAsJsonObject("conversion_rates");
        return rates.get(para).getAsDouble();
    }
}
