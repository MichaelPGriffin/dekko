namespace dekko.Subcommands
{
    internal class Roster:IExecutable
    {
        public async Task Execute(string[] args)
        {
            CheckParameterValidity(args);

            var command = args[1];
            string symbol = args.Length > 2 ? args[2] : string.Empty;

            switch (command)
            {
                case "add":
                    await Add(symbol);
                    break;
                case "rm":
                    await RemoveAsync(symbol);
                    break;
                case "ls":
                    List();
                    break;
                case "clear":
                    await Clear();
                    break;
                case "restore":
                    await Restore();
                    break;
                default:
                    throw new ArgumentException($"Invalid parameter passed to `roster` method: {command}");
            }
        }
        
        private static void CheckParameterValidity(string[] args)
        {
            if (args == null || args.Length < 2)
            {
                throw new ArgumentException("Invalid parameters passed to `roster` method");
            }
        }

        public async static Task Add(string symbol)
        {
            string[]? symbols;
            try
            {
                symbols = await File.ReadAllLinesAsync(Constants.RosterPath);
            }
            catch (Exception)
            {
                Console.WriteLine("Roster file was deleted. Re-initializing roster");
                // Ensure the file exists if it was deleted (Sometimes this happens during dev).
                File.Create(Constants.RosterPath);
                symbols = await File.ReadAllLinesAsync(Constants.RosterPath);
            }

            if (symbols.Contains(symbol))
            {
                return;
            }

            await File.AppendAllTextAsync(Constants.RosterPath, $"{symbol.ToUpperInvariant()}\n");
        }

        public static async Task RemoveAsync(string symbol)
        {
            var symbols = await File.ReadAllLinesAsync(Constants.RosterPath);
            var filteredSymbols = symbols.Where(s => s != symbol);
            await File.AppendAllLinesAsync(Constants.RosterPath, filteredSymbols);
        }

        public static void List()
        {
            var symbols = File.ReadAllLines(Constants.RosterPath);

            foreach(var symbol in symbols)
            {
                Console.WriteLine(symbol);
            }
        }

        public static async Task Clear() =>
            await File.WriteAllTextAsync(Constants.RosterPath, string.Empty);

        public static async Task Restore()
        {
            // Restore the roster using the contents of the current branch /responses folder.
            var currentBranch = Branch.GetCurrentBranchName();
            var symbols = Directory
                .EnumerateFiles($@"{Constants.BranchStoragePath}\{currentBranch}\responses")
                .Select(f => f.Split(@"\").Last())
                .Select(f => f.Replace(".csv", string.Empty));

            await File.WriteAllLinesAsync(Constants.RosterPath, symbols);
            await File.WriteAllLinesAsync($@"{Constants.BranchStoragePath}\{currentBranch}\roster", symbols);
        }
    }
}
