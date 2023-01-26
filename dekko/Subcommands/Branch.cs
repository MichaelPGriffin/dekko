using dekko.Utilities;

namespace dekko.Subcommands
{
    public class Branch: IExecutable
    {
        private static readonly string CurrentBranchPath = $@"{Constants.RefsPath}\current-branch";
        
        private static readonly string BranchesPath = $@"{Constants.RefsPath}\branches";

        private static readonly string InitialBranchName = "initial";

        public void Execute(string[] args)
        {
            CheckParameterValidity(args);

            var command = args[1];

            switch (command)
            {
                case "current":
                    Current();
                    break;
                case "ls":
                    List();
                    break;
                case "new":
                    New(args);
                    break;
                case "rm":
                    Remove(args);
                    break;
                case "switch":
                    Switch(args);
                    break;
                default:
                    throw new NotImplementedException($"Unknown command: {command}");
            }
        }

        public static string GetCurrentBranchName()
        {
            var branchName = File.ReadAllLines(CurrentBranchPath).FirstOrDefault();

            if (string.IsNullOrEmpty(branchName))
            {
                throw new InvalidOperationException("Current branch name is null or empty. See `.refs/current-branch` file.");
            }

            return branchName;
        }

        private static void Current()
        {
            var currentBranchName = File.ReadAllLines(CurrentBranchPath).FirstOrDefault();
            Console.WriteLine(currentBranchName);
        }

        private static void List()
        {
            var branches = File.ReadAllLines(BranchesPath);
            var currentBranch = File.ReadAllLines(CurrentBranchPath).FirstOrDefault();

            foreach (var branch in branches)
            {                
                var currentIndicator = branch == currentBranch ? "* " : string.Empty;
                Console.WriteLine($"{currentIndicator}{branch}");
            }
        }

        private static void New(string[] args)
        {
            CheckBranchNameValidity(args);
            var newBranchName = args[2];
            var branches = File.ReadAllLines(BranchesPath);

            if (branches.Contains(newBranchName))
            {
                throw new ArgumentException($"A branch with name \"{newBranchName}\" already exists");
            }

            var branchPersistenceScript = $@"{Constants.RootPath}\StockPriceTimeseries\persist-branch.sh {newBranchName}";
            var scriptRunner = new ScriptRunner(Constants.BashPath, branchPersistenceScript);
            scriptRunner.Start();

            File.AppendAllLines(BranchesPath, new[] { newBranchName });

            Switch(newBranchName);

            // Clean up initial branch now that state is persisted on other branch.
            File.WriteAllText(Constants.RosterPath, string.Empty);
            File.WriteAllText($@"{Constants.RootPath}\StockPriceTimeseries\data\closing-prices.tsv", string.Empty);

            // Delete .csv files.
            foreach (var file in Directory.GetFiles($@"{Constants.RootPath}\StockPriceTimeseries\responses"))
            {
                File.Delete(file);
            }
        }

        private static void Remove(string[] args)
        {
            CheckBranchNameValidity(args);
            var targetBranchName = args[2];

            var currentBranchName = File.ReadAllLines(CurrentBranchPath).FirstOrDefault();
            if (targetBranchName == currentBranchName)
            {
                throw new ArgumentException("Cannot delete the current branch.");
            }

            if (targetBranchName == InitialBranchName)
            {
                throw new ArgumentException($"The \"{InitialBranchName}\" branch cannot be removed.");
            }

            var branches = File.ReadAllLines(BranchesPath);
            if (branches.Contains(targetBranchName))
            {
                Directory.Delete($@"{Constants.BranchStoragePath}\{targetBranchName}", recursive: true);
                File.WriteAllLines(BranchesPath, branches.Where(branch => branch != targetBranchName));
                Console.WriteLine($"Deleted branch {targetBranchName}");
            } else
            {
                Console.WriteLine($"No branch named \"{targetBranchName}\" exists");
            }
        }

        private static void Switch(string[] args)
        {
            CheckBranchNameValidity(args);
            var targetBranch = args[2];
            var branches = File.ReadAllLines(BranchesPath);

            if (!branches.Contains(targetBranch))
            {
                throw new ArgumentException($"No branch named \"{targetBranch}\" exists");
            }

            Switch(targetBranch);
        }

        private static void Switch(string targetBranch)
        {
            File.WriteAllLines(CurrentBranchPath, new[] { targetBranch });
        }

        private static void CheckParameterValidity(string[] args)
        {
            if (args == null || args.Length < 2)
            {
                throw new ArgumentException("Invalid parameters passed to `branch` method");
            }
        }

        private static void CheckBranchNameValidity(string[] args)
        {
            if (args.Length < 3)
            {
                throw new ArgumentException("Missing branch name");
            }

            if (string.IsNullOrEmpty(args[2]))
            {
                throw new ArgumentException("Branch name cannot be null or empty");
            }
        }
    }
}
