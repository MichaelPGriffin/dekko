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
                    await PrintGoldenCrossDemonstrators();
                    break;
                default:
                    throw new ArgumentException($"Unexpected indicator name {indicator}");
            }
        }

        // TODO: Consider deleting/hiding files in branch that don't make the golden cross indicator show TRUE.
        private static async Task PrintGoldenCrossDemonstrators()
        {
            var responsesPath = @$"{Constants.BranchStoragePath}{Branch.GetCurrentBranchName()}\responses";
            var symbols = Directory
                .EnumerateFiles(responsesPath)
                .Select(f => f.Split(@"\").Last())
                .Select(f => f.Replace(".csv", string.Empty));

            decimal trueCount = 0;

            foreach (var symbol in symbols)
            {
                var timeSeries = await GetSymbolTimeSeries(symbol);
                var goldenCrossCandidate = new GoldenCross(timeSeries);
                string status;

                if (goldenCrossCandidate.IsTrue())
                {
                    trueCount++;
                    status = "is a";
                }
                else
                {
                    status = "is not a";
                }

                Console.WriteLine($"The symbol {symbol} {status} golden cross");
            }

            var percentage = Math.Round(100 * (trueCount / symbols.Count()), 2);
            Console.WriteLine($"{percentage}% of roster demonstrate golden-crosses");
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
