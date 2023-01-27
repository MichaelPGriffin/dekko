using dekko.Indicators;

namespace dekko.Subcommands
{
    internal class Subset : IExecutable
    {
        public async Task Execute(string[] args)
        {
            var indicator = args[1];

            switch (indicator)
            {
                case "golden-cross":
                    await PrintGoldenCrosDemonstrators();
                    break;
                default:
                    throw new ArgumentException($"Unexpected indicator name {indicator}");
            }
        }

        // TODO: Consider deleting/hiding files in branch that don't make the golden cross indicator show TRUE.
        private static async Task PrintGoldenCrosDemonstrators()
        {
            var symbols = new[] { "O" };

            foreach (var symbol in symbols)
            {
                var timeSeries = await GetSymbolTimeSeries(symbol);
                var goldenCrossCandidate = new GoldenCross(timeSeries);
                var status = goldenCrossCandidate.IsTrue() ? "is a" : "is not a";
                Console.WriteLine($"The symbol {symbol} {status} golden cross");
            }
        }

        private static async Task<decimal[]> GetSymbolTimeSeries(string symbol)
        {
            var currentBranch = Branch.GetCurrentBranchName();
            var filePath = @$"{Constants.BranchStoragePath}\{currentBranch}\responses\{symbol}.csv";
            var rawData = await File.ReadAllLinesAsync(filePath);

            var timeSeries = rawData
                .Where(r => decimal.TryParse(r, out decimal _))
                .Select(r => Convert.ToDecimal(r))
                .ToArray();

            return timeSeries;
        }
    }
}
