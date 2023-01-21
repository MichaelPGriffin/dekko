using System.Diagnostics;

namespace dekko
{
    internal class ScriptRunner
    {
        public ScriptRunner(string applicationPath, string programPath, string? arg0 = null)
        {
            var startInfo = new ProcessStartInfo();
            startInfo.FileName = applicationPath;
            startInfo.Arguments = $"{programPath}{(arg0 != null ? " " + arg0 : string.Empty)}";

            startInfo.UseShellExecute = false;
            startInfo.RedirectStandardOutput = true;
            startInfo.RedirectStandardError = true;
            startInfo.CreateNoWindow = true;

            SpawnedProcess = new Process();
            SpawnedProcess.StartInfo = startInfo;
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
