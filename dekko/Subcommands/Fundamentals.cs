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
        {.
            // TODO: Ensure relative return request makes sense with respect to offset param.
            // Seems like it should be a lagging indicator.
            if (!int.TryParse(args[1], out int startPeriod))
            {
                throw new InvalidOperationException($"Unexpected period offset argument {args[1]}");
            }

            if (!int.TryParse(args[2], out int endPeriod))
            {
                endPeriod = -1;
            }

            await RequestFundamentals(startPeriod, endPeriod);
        }

        private const char columnDelimiter = '\t';
        private const char lineDelimiter = '\n';
        public static async Task RequestFundamentals(int startPeriodOffset, int endPeriodOffset = -1)
        {
            endPeriodOffset = Math.Max(startPeriodOffset, endPeriodOffset);

            var symbols = await RosterSymbols();
            var headers = MetricHeaders(startPeriodOffset, endPeriodOffset);

            var table = new StringBuilder();
            table.Append(columnDelimiter);
            table.Append(string.Join(columnDelimiter, headers));
            table.Append(lineDelimiter);

            foreach (var symbol in symbols)
            {
                table.Append(symbol);
                table.Append(columnDelimiter);

                table.Append(await GetMetricsForSymbol(symbol, startPeriodOffset, endPeriodOffset));
                table.Append(lineDelimiter);
            }

            Console.Write(table.ToString());
        }

        private static async Task<string> GetMetricsForSymbol(string symbol, int startPeriod, int endPeriod)
        {
            var requests = new List<Task<string>>();
            var metrics = MetricNames();
            foreach (var metric in metrics)
            {
                for (int period = startPeriod; period <= endPeriod; period++)
                {
                    requests.Add(RequestMetric(symbol, metric, period));
                }
            }

            await Task.WhenAll(requests);

            var values = new List<string>();
            foreach (var request in requests)
            {
                values.Add(await request);
            }

            return string.Join(columnDelimiter, values);
        }

        private static async Task<string> RequestMetric(string symbol, string metricName, int periodOffset)
        {
            var client = await ConfigureClient();
            var request = ConfigureRequest(symbol, metricName, periodOffset);
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

        private static RestRequest ConfigureRequest(string symbol, string metricName, int startPeriodOffset = 0, int endPeriod = 0)
        {
            string endpoint = $"/prod/stocks/fundamentals/{metricName}";

            // TODO: Conditionally append an endPeriod segment to query string if it's relevant to the metric
            // e.g. the period over which relative return is to be calculated.
   
            string queryString = $"symbol={symbol}&periodOffset={startPeriodOffset}";
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

        private static IEnumerable<string> MetricHeaders(int startPeriodOffset, int endPeriodOffset)
        {
            var metricNames = MetricNames();
            var headers = new List<string>();

            for (int period = startPeriodOffset; period <= endPeriodOffset; period++)
            {
                var timePeriodColumns = metricNames.Select(name => $"{name}_{period}");
                foreach(var column in timePeriodColumns)
                {
                    headers.Add(column);
                }

            }

            return headers;
        }


        private static List<string> MetricNames()
        {
            return new List<string>
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


        internal class FundametalMetric
        {
            public decimal value { get; set; }
        }
    }
}
