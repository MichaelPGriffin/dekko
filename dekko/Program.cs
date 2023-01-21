using dekko.Utilities;

namespace dekko
{
    internal class Program
    {
        static async Task Main(string[] args)
        {
            const string help = "help";
            const string roster = "roster";
            const string config = "config";
            const string fetch = "fetch";
            const string islands = "islands";
            const string branch = "branch";

            var validCommands = new HashSet<string> { help, roster, config, fetch, islands, branch };

            if (args == null)
            {
                Console.WriteLine("args is null");
                return;
            }

            if (args.Length == 0)
            {
                Console.WriteLine("Invalid input. Type 'dekko help'");
                return;
            }

            var command = args[0];

            if (!validCommands.Contains(command))
            {
                Console.WriteLine($"Unknown command: {command}");
                return;
            }

            try
            {
                switch (command)
                {
                    case help:
                        About();
                        break;
                    case roster:
                        await Roster(args);
                        break;
                    case config:
                        await Config();
                        break;
                    case fetch:
                        Fetch();
                        break;
                    case islands:
                        Islands(args);
                        break;
                    case branch:
                        Branch(args);
                        break;
                }
            } catch(Exception ex)
            {
                Console.WriteLine("Error:");
                Console.Write(ex.Message);
            }
        }

        private static void About()
        {
            Console.WriteLine("* * * Welcome to dekko!!!! * * *");
            Console.WriteLine();
            Console.WriteLine("More info coming soon.");
        }

        private static async Task Roster(string[] args) =>
            await Subcommands.Roster.Execute(args);

        private static async Task Config()
        {
            // TODO: Add error handling for bad inputs here.
            Console.WriteLine("What symbols are you interested in? Press ENTER to rely on `roster` file.");
            var symbolString = Console.ReadLine();

            var rosterSymbols = await File.ReadAllLinesAsync(Constants.RosterPath);

            if (string.IsNullOrWhiteSpace(symbolString) && rosterSymbols.Length == 0)
            {
                Console.WriteLine("Symbols must be provided manually or via `roster` command. Type 'dekko help'");
                return;
            }

            var symbols = string.IsNullOrEmpty(symbolString) ?
                Enumerable.Empty<string>() :
                symbolString.Split(null).Select(s => s.ToUpperInvariant());

            var distinctSymbols = rosterSymbols.Concat(symbols).Distinct();

            var writer = new SymbolWriter();

            foreach(var symbol in distinctSymbols)
            {
                writer.Append(symbol);
            }

            File.WriteAllText($@"{Constants.RootPath}\symbols.js", writer.ToString());
        }

        // TODO: Add ability to configure details for API requests, like the number of days of data.
        private static void Fetch()
        {
            var application = Constants.BashPath;
            var program = $@"{Constants.RootPath}\StockPriceTimeseries\run.sh";
            var currentBranch = Subcommands.Branch.GetCurrentBranchName();
            var runner = new ScriptRunner(application, program, currentBranch);

            runner.Start();
        }

        private static void Islands(string[] args)
        {
            if (args == null || args.Length < 2)
            {
                throw new ArgumentException("Island count must be specified");
            }

            string? islandCount = args[1];
            var application = Constants.NodePath;
            var program = $@"{Constants.RootPath}\StockGraphAnalysis\\islands.js";

            var invalidInput = !int.TryParse(islandCount, out int _);
            if (invalidInput)
            {
                throw new ArgumentException($"Unexpected non-numeric argument: {islandCount}");
            }

            var runner = new ScriptRunner(application, program, islandCount);

            runner.Start();
        }

        private static void Branch(string[] args)
        {
            Subcommands.Branch.Execute(args);
        }
    }
}
