using System.Text;

namespace dekko
{
    internal class Program
    {
        static void Main(string[] args)
        {
            const string init = "init";
            const string eval = "eval";
            const string fetch = "fetch";
            const string islands = "islands";

            var validCommands = new HashSet<string> { init, eval, fetch, islands };

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
                case init:
                    Initialize();
                    break;
                case eval:
                    Evaluate();
                    break;
                case fetch:
                    Fetch();
                    break;
                case islands:
                    Islands();
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
        // append to an existing one. Thinking a `refs` directory could be introduced.
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
            // TODO: Implement a similar mechanism to run the graph-analysis tool too.
            var application = "C:\\Program Files\\Git\\bin\\sh.exe";
            var program = "C:\\Users\\Owner\\Projects\\dekko\\StockPriceTimeseries\\run.sh";
            var runner = new ScriptRunner(application, program);

            runner.Start();
        }

        private static void Islands()
        {
            var application = "C:\\Program Files\\nodejs\\node.exe";
            var program = "C:\\Users\\Owner\\Projects\\dekko\\StockGraphAnalysis\\main.js";
            var runner = new ScriptRunner(application, program);

            runner.Start();
        }
    }
}
