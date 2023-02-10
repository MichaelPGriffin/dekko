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
                    await IdentifyGoldenCrossDemonstrators();
                    break;
                default:
                    throw new ArgumentException($"Unexpected indicator name {indicator}");
            }
        }

        private static async Task IdentifyGoldenCrossDemonstrators()
        {
            var symbols = File.ReadAllLines(Constants.RosterPath).ToList();

            decimal trueCount = 0;
            var postives = new List<string>();
            var negatives = new List<string>();

            foreach (var symbol in symbols)
            {
                var timeSeries = await GetSymbolTimeSeries(symbol);
                var goldenCrossCandidate = new GoldenCross(timeSeries);

                if (goldenCrossCandidate.IsTrue())
                {
                    trueCount++;
                    postives.Add(symbol);
                }
                else
                {
                    negatives.Add(symbol);
                }
            }

            if (postives.Count > 0)
            {
                Console.WriteLine("The following symbols display golden crosses:");
                PrintSymbols(postives);
            }

            if (negatives.Count > 0)
            {
                Console.WriteLine("The following symbols do not display golden crosses:");
                PrintSymbols(negatives);
            }

            var percentage = Math.Round(100 * (trueCount / symbols.Count()), 2);
            Console.WriteLine($"{percentage}% of roster demonstrate golden-crosses");

            if (percentage > 0 && percentage < 100)
            {
                Console.WriteLine("Would you like to exclude the negatives from consideration? Type \"yes\" to confirm.)");

                var response = Console.ReadLine();
                if (response == "yes")
                {
                    await File.WriteAllLinesAsync(Constants.RosterPath, symbols.Where(s => !negatives.Contains(s)));
                }
            }
        }

        private static void PrintSymbols(IEnumerable<string> symbols)
        {
            int element = 0;
            var blankLine = "\n";
            foreach (var symbol in symbols)
            {
                var delimiter = "\t";
                element++;
                if (element % 5 == 0)
                {
                    delimiter = blankLine;
                }

                if (element == symbols.Count())
                {
                    delimiter = string.Empty;
                }

                Console.Write($"{symbol}{delimiter}");
            }

            Console.WriteLine(blankLine);
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
