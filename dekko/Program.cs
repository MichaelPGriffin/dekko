namespace dekko
{
    internal class Program
    {
        static void Main(string[] args)
        {
            string init = "init";

            var validCommands = new HashSet<string> { init };

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
    }
}