using dekko.Subcommands;

namespace dekko
{
    internal static class ResourceIdentifiers
    {
        public static readonly string BashPath = @"C:\Program Files\Git\bin\sh.exe";

        public static readonly string NodePath = @"C:\Program Files\nodejs\node.exe";

        public static readonly string RootPath = @"C:\Users\Owner\Projects\dekko";

        public static readonly string RefsPath = $@"{RootPath}\.refs";

        public static readonly string BranchStoragePath = $@"{RefsPath}\branch-contents";

        public static string RosterPath() => $@"{BranchStoragePath}\{Branch.GetCurrentBranchName()}\roster";

        public static readonly string FundamentalsBaseUrl = "https://usjkij2za7.execute-api.us-west-2.amazonaws.com";
    }
}
