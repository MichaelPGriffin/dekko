using System.Text;

namespace dekko
{
    internal class Program
    {
        static void Main(string[] args)
        {
            string init = "init";
            string eval = "eval";
            string fetch = "fetch";

            var validCommands = new HashSet<string> { init, eval };

            if (args == null)
            {
                Console.WriteLine("args is null");
                return;
            }

            if (args.Length == 0)
            {
                Console.WriteLine("args is empty");
                return;
            }

            var command = args[0];

            if (!validCommands.Contains(command))
            {
                Console.WriteLine($"Unknown command: {command}");
                return;
            }

            switch (command)
            {
                case "init":
                    Initialize();
                    break;
                case "eval":
                    Evaluate();
                    break;
                case "fetch":
                    Fetch();
                    break;
            }
        }

        //
        //
        private static void Initialize()
        {
            Console.WriteLine("* * * Welcome to dekko!!!! * * *");
            Console.WriteLine();
            Console.WriteLine("Initializing dekko repository");
        }

        // TODO: Could generalize this to either initialize a new symbol file, or to
        // append to an existing one.
        private static void Evaluate()
        {
            // TODO: Add error handling for bad inputs here.
            Console.WriteLine("What symbols are you interested in?");
            var symbolString = Console.ReadLine();

            if ( string.IsNullOrWhiteSpace(symbolString))
            {
                Console.WriteLine("Invalid input.");
                return;
            }

            var symbols = symbolString.Split(null);
            var writer = new SymbolWriter();

            foreach(var symbol in symbols)
            {
                writer.Append(symbol);
            }

            File.WriteAllText("C:\\Users\\Owner\\Projects\\dekko\\symbols.js", writer.ToString());
        }

        private static void Fetch()
        {
            // TODO: From here, call the `run.sh` script in the StockPriceTimeseries repo.
            // Will eventually use a similar mechanism to run the graph-analysis tool too.
            throw new NotImplementedException();
        }
    }
}
