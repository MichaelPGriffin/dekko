using dekko;
using dekko.Utilities;
using RestSharp;
using System;
using System.Diagnostics.SymbolStore;
using System.Dynamic;
using System.Text;
using System.Text.Json;

namespace dekko.Subcommands
{
    public class Fundamentals : IExecutable
    {
        public async Task Execute(string[] args)
        {
            // TODO: pass in time period params.
            // Want ability to configure a range of of time for fundamentals.
            // Want relative return period to match this.
            await RequestFundamentals();
        }

        private const char columnDelimiter = '\t';
        private const char lineDelimiter = '\n';
        public static async Task RequestFundamentals()
        {
            var symbols = await RosterSymbols();
            var metrics = MetricNames();

            var table = new StringBuilder();
            table.Append(columnDelimiter);
            table.Append(string.Join(columnDelimiter, metrics));
            table.Append(lineDelimiter);

            foreach (var symbol in symbols)
            {
                table.Append(symbol);
                table.Append(columnDelimiter);

                table.Append(await GetMetricsForSymbol(metrics, symbol));
                table.Append(lineDelimiter);
            }

            Console.Write(table.ToString());
        }

        private static async Task<string> GetMetricsForSymbol(IEnumerable<string> metrics, string symbol)
        {
            var requests = new List<Task<string>>();
            foreach (var metric in metrics)
            {
                requests.Add(RequestMetric(symbol, metric));
            }

            await Task.WhenAll(requests);

            var values = new List<string>();
            foreach (var request in requests)
            {
                values.Add(await request);
            }

            return string.Join(columnDelimiter, values);
        }

        private static async Task<string> RequestMetric(string symbol, string metricName)
        {
            var client = await ConfigureClient();
            var request = ConfigureRequest(symbol, metricName, 0);
            var response = await client.ExecuteAsync(request);

            if (string.IsNullOrEmpty(response.Content))
            {
                throw new InvalidOperationException("Unexpected API response.");
            }

            var data = JsonSerializer.Deserialize<FundametalMetric>(response.Content);

            if (data == null)
            {
                throw new InvalidOperationException($"Inspect request for {metricName} with {symbol}");
            }

            return data.value.ToString();
        }

        private static async Task<RestClient> ConfigureClient() 
        {
            string apiKey = await SecretsManager.GetFundamentalsApiKey();
            
            var options = new RestClientOptions(Constants.FundamentalsBaseUrl)
            {
                MaxTimeout = -1,
            };

            var client = new RestClient(options);
            client.AddDefaultHeader("x-api-key", apiKey);

            return client;
        }

        private static RestRequest ConfigureRequest(string symbol, string metricName, int endPeriodOffset = 0, int startPeriodOffset = 1)
        {
            string endpoint = $"/prod/stocks/fundamentals/{metricName}";
            string queryString = $"symbol={symbol}&periodOffset={endPeriodOffset}&startPeriodOffset={startPeriodOffset}";
            string fullUrl = $"{endpoint}?{queryString}";
  
            var request = new RestRequest(fullUrl, Method.Get);

            return request;
        }

        private static async Task<IEnumerable<string>> RosterSymbols()
        {
            var symbols = await File.ReadAllLinesAsync(Constants.RosterPath);

            return symbols;
        }

        private const string DebtToEquity = "debt-to-equity";
        private const string DividendPayoutRatio = "dividend-payout-ratio";
        private const string DividendYieldRatio = "dividend-yield-ratio";
        private const string FreeCashFlow = "free-cash-flow";
        private const string MarketCap = "market-cap";
        private const string PriceToBook = "price-to-book";
        private const string PriceToEarnings = "price-to-earnings";
        private const string PriceToSales = "price-to-sales";
        private const string ReturnOnEquity = "return-on-equity";

        // TODO: Configure details for wiring up relative return inclusion.
        // Seems like the time-period details need to be settled first.
        private const string ReturnVersusIndex = "return-vs-index";
        
        private static IEnumerable<string> MetricNames()
        {
            return new[]
            {
                DebtToEquity,
                DividendPayoutRatio,
                DividendYieldRatio,
                FreeCashFlow,
                MarketCap,
                PriceToBook,
                PriceToEarnings,
                PriceToSales,
                ReturnOnEquity
            };
        }
    }

    internal class FundametalMetric
    {
        public decimal value { get; set; }
    }
}
