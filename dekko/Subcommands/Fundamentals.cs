using dekko;
using dekko.Utilities;
using RestSharp;
using System;

namespace dekko.Subcommands
{
    public class Fundamentals : IExecutable
    {
        public async Task Execute(string[] args)
        {
            await GetSymbols();
            await RequestFundamentals("AMD");
        }

        // Metric name URL endpoints
        private const string debtToEquity = "debt-to-equity";
        private const string dividendPayoutRatio = "dividend-payout-ratio";
        private const string dividendYieldRatio = "dividend-yield-ratio";
        private const string freeCashFlow = "free-cash-flow";
        private const string marketCap = "market-cap";
        private const string priceToBook = "price-to-book";
        private const string priceToEarnings = "price-to-earnings";
        private const string priceToSales = "price-to-sales";
        private const string returnOnEquity = "return-on-equity";
        private const string returnVersusIndex = "return-vs-index";

        // RESUME HERE
        // TODO: Generalize this.
        private static async Task RequestFundamentals(string symbol)
        {
            var client = await ConfigureClient();
            var request = ConfigureRequest(symbol, 0);
            var response = await client.ExecuteAsync(request);
            Console.WriteLine(response.Content);
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

        // TODO: parameterize the metric name and build endpoint querystring with it.
        private static RestRequest ConfigureRequest(string symbol, int endPeriodOffset = 0, int startPeriodOffset = 1)
        {
            const string endpoint = "/prod/stocks/fundamentals/price-to-earnings";

            // TODO: Finish parameterizing the query string. Will not need startPeriodOffset for all requests.
            // Can maybe use a string builder or something more piecemeal.
            string queryString = $"symbol={symbol}&periodOffset={endPeriodOffset}&startPeriodOffset={startPeriodOffset}";
            string fullUrl = $"{endpoint}?{queryString}";
  
            var request = new RestRequest(fullUrl, Method.Get);

            return request;
        }

        private static async Task<IEnumerable<string>> GetSymbols()
        {
            var symbols = await File.ReadAllLinesAsync(Constants.RosterPath);

            return symbols;
        }
    }
}