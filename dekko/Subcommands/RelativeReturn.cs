using RestSharp;
using System.Text;
using System.Text.Json;
using static dekko.Subcommands.Fundamentals;

namespace dekko.Subcommands
{
    internal class RelativeReturn : IExecutable
    {
        public async Task Execute(string[] args)
        {
            if (args.Length <= 2)
            {
                throw new InvalidOperationException($"The `relative-return` command must be followed by `startPeriod` and `periodCount` parameters");
            }

            if (!int.TryParse(args[1], out int startPeriod))
            {
                throw new InvalidOperationException($"Unexpected start period argument {args[1]}");
            }

            if (!int.TryParse(args[2], out int periodCount))
            {
                throw new InvalidOperationException($"Unexpected period count argument {args[2]}");
            }

            var tableText = await PrintAllApiResponses(startPeriod, periodCount);

            bool hasOutputFileName = args.Length >= 4 && !string.IsNullOrEmpty(args[3]);
            if (hasOutputFileName)
            {
                var path = $"{ResourceIdentifiers.BranchStoragePath}\\{Branch.GetCurrentBranchName()}\\{args[3]}";
                Console.WriteLine($"Saving to {path}");
                await File.WriteAllTextAsync(path, tableText);
            }
            else
            {
                Console.WriteLine("No filename specified. Type \"y\" to print to console");
                var input = Console.ReadLine();
                if (input == "y")
                {
                    Console.WriteLine(tableText);
                }
            }
        }

        private static async Task<string> PrintAllApiResponses(int startPeriodOffset, int periodCount) 
        {
            var symbols = await RosterSymbols();
            var table = new StringBuilder();
            
            foreach (var symbol in symbols)
            {
                var relativeReturn = await RequestRelativeReturn(symbol, startPeriodOffset, periodCount);
                table.AppendLine($"{symbol}{columnDelimiter}{relativeReturn}");
            }

            return table.ToString();
        }

        private static async Task<string> RequestRelativeReturn(string symbol, int startPeriodOffset, int periodCount)
        {
            var request = ConfigureRequest(symbol, ReturnVersusIndex, startPeriodOffset, periodCount);
            var client = await ConfigureClient();
            var response = await client.ExecuteAsync(request);

            if (string.IsNullOrEmpty(response.Content))
            {
                throw new InvalidOperationException("Unexpected API response.");
            }

            FundametalMetric? data;
            try
            {
                data = JsonSerializer.Deserialize<FundametalMetric>(response.Content);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Inspect request for {ReturnVersusIndex} with {symbol}");
                Console.WriteLine(ex.Message);
                Console.WriteLine("Inserting `decimal.MinValue` as a placeholder");
                data = new FundametalMetric { value = int.MinValue };
            }

            var metricValue = data!.value.ToString();

            return metricValue;
        }

        private static RestRequest ConfigureRequest(string symbol, string metricName, int startPeriodOffset = 1, int periodCount = 1)
        {
            string endpoint = $"/prod/stocks/fundamentals/{metricName}";
            string queryString = $"symbol={symbol}&startPeriodOffset={startPeriodOffset}&periodCount={periodCount}";
            string fullUrl = $"{endpoint}?{queryString}";

            var request = new RestRequest(fullUrl, Method.Get);

            return request;
        }
    }
}
