namespace dekko.Subcommands
{
    public static class Branch
    {
        private static readonly string CurrentBranchPath = $@"{Constants.RefsPath}\current-branch";
        
        private static readonly string BranchesPath = $@"{Constants.RefsPath}\branches";

        public static void Execute(string[] args)
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
                default:
                    throw new NotImplementedException();
            }
        }

        private static void CheckParameterValidity(string[] args)
        {
            if (args == null || args.Length < 2)
            {
                throw new ArgumentException("Invalid parameters passed to `branch` method");
            }
        }

        public static void Current()
        {
            var currentBranchName = File.ReadAllLines(CurrentBranchPath).FirstOrDefault();
            Console.WriteLine(currentBranchName);
        }

        public static void List()
        {
            var branches = File.ReadAllLines(CurrentBranchPath);

            foreach(var branch in branches)
            {
                var currentBranch = File.ReadAllLines(CurrentBranchPath).FirstOrDefault();
                var currentIndicator = branch == currentBranch ? "* " : string.Empty;
                Console.WriteLine($"{currentIndicator}{branch}");
            }
        }

        public static void New(string[] args)
        {
        }

        public static void Remove(string[] args)
        {
        }
    }
}
