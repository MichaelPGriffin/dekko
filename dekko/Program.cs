using System.ComponentModel.DataAnnotations;
using System.Runtime.CompilerServices;
using System.Text;
using dekko.Subcommands;

namespace dekko
{
    internal class Program
    {
        static async Task Main(string[] args)
        {
            const string help = "help";
            const string roster = "roster";
            const string eval = "eval";
            const string fetch = "fetch";
            const string islands = "islands";

            var validCommands = new HashSet<string> { help, roster, eval, fetch, islands };

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
                    case eval:
                        await Evaluate();
                        break;
                    case fetch:
                        Fetch();
                        break;
                    case islands:
                        Islands(args);
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
        

        // TODO: Could generalize this to either initialize a new symbol file, or to
        // append to an existing one. Thinking a `refs` directory could be introduced.
        private static async Task Evaluate()
        {
            // TODO: Add error handling for bad inputs here.
            Console.WriteLine("What symbols are you interested in?");
            var symbolString = Console.ReadLine();

            if (string.IsNullOrWhiteSpace(symbolString))
            {
                Console.WriteLine("Invalid input. Type 'dekko help'");
                return;
            }

            var rosterSymbols = await File.ReadAllLinesAsync(Constants.RosterPath);
            var symbols = symbolString.Split(null).Select(s => s.ToUpperInvariant());
            var distinctSymbols = rosterSymbols.Concat(symbols).Distinct();

            var writer = new SymbolWriter();

            foreach(var symbol in distinctSymbols)
            {
                writer.Append(symbol);
            }

            File.WriteAllText("C:\\Users\\Owner\\Projects\\dekko\\symbols.js", writer.ToString());
        }

        private static void Fetch()
        {
            // TODO: Implement a similar mechanism to run the graph-analysis tool too.
            var application = "C:\\Program Files\\Git\\bin\\sh.exe";
            var program = "C:\\Users\\Owner\\Projects\\dekko\\StockPriceTimeseries\\run.sh";
            var runner = new ScriptRunner(application, program);

            runner.Start();
        }

        private static void Islands(string[] args)
        {
            if (args == null || args.Length < 2)
            {
                throw new ArgumentException("Island count must be specified");
            }

            string? islandCount = args[1];
            var application = "C:\\Program Files\\nodejs\\node.exe";
            var program = "C:\\Users\\Owner\\Projects\\dekko\\StockGraphAnalysis\\islands.js";
            
            var invalidInput = !int.TryParse(islandCount, out int _);
            if (invalidInput)
            {
                throw new ArgumentException($"Unexpected non-numeric argument: {islandCount}");
            }

            // TODO: Parameterize the island method so it doesn't just use a hardcoded island count.
            // Would need to pass this into the JS layer. Currently it is set to 3.
            var runner = new ScriptRunner(application, program, islandCount);

            runner.Start();
        }
    }
}
