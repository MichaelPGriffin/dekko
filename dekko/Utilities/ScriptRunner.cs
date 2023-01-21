using System.Diagnostics;

namespace dekko.Utilities
{
    internal class ScriptRunner
    {
        public ScriptRunner(string applicationPath, string programPath, string? arg0 = null)
        {
            var startInfo = new ProcessStartInfo
            {
                FileName = applicationPath,
                Arguments = $"{programPath}{(arg0 != null ? " " + arg0 : string.Empty)}",

                UseShellExecute = false,
                RedirectStandardOutput = true,
                RedirectStandardError = true,
                CreateNoWindow = true
            };

            SpawnedProcess = new Process
            {
                StartInfo = startInfo
            };
        }

        public readonly Process SpawnedProcess;

        public void Start()
        {
            SpawnedProcess.OutputDataReceived += new DataReceivedEventHandler(OutputHandler);
            SpawnedProcess.ErrorDataReceived += new DataReceivedEventHandler(OutputHandler);
            SpawnedProcess.Start();
            SpawnedProcess.BeginOutputReadLine();
            SpawnedProcess.BeginErrorReadLine();
            SpawnedProcess.WaitForExit();
        }

        static void OutputHandler(object sender, DataReceivedEventArgs outLine)
        {
            Console.WriteLine(outLine.Data);
        }
    }
}
