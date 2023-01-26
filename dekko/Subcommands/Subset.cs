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
            var currentBranch = Branch.GetCurrentBranchName();
            var symbol = "O";
            var filePath = @$"{Constants.BranchStoragePath}\{currentBranch}\responses\{symbol}.csv";
            var rawData = await File.ReadAllLinesAsync(filePath);

            var timeSeries = rawData
                .Where(r => decimal.TryParse(r, out decimal _))
                .Select(r => Convert.ToDecimal(r))
                .ToArray();

            var goldenCrossCandidate = new GoldenCross(timeSeries);

            var status = goldenCrossCandidate.IsTrue() ? "is a" : " is not a";

            Console.WriteLine($"The symbol {symbol} {status} golden cross");             
        }
    }
}
