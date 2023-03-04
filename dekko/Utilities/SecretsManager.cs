using System.Text.Json;
using Amazon;
using Amazon.SecretsManager;
using Amazon.SecretsManager.Model;

/*
*	Use this code snippet in your app.
*	If you need more information about configurations or implementing the sample code, visit the AWS docs:
*	https://aws.amazon.com/developer/language/net/getting-started
*/


namespace dekko.Utilities
{
    public static class SecretsManager
    {
        public static async Task<string> GetFundamentalsApiKey()
        {
            string secretName = "dekko-api-key";
            string region = "us-west-2";

            IAmazonSecretsManager client = new AmazonSecretsManagerClient(RegionEndpoint.GetBySystemName(region));

            GetSecretValueRequest request = new GetSecretValueRequest
            {
                SecretId = secretName,
                VersionStage = "AWSCURRENT", // VersionStage defaults to AWSCURRENT if unspecified.
            };

            GetSecretValueResponse response;

            try
            {
                response = await client.GetSecretValueAsync(request);
            }
            catch (Exception e)
            {
                // For a list of the exceptions thrown, see
                // https://docs.aws.amazon.com/secretsmanager/latest/apireference/API_GetSecretValue.html
                throw;
            }

            var secretJson = JsonSerializer.Deserialize<SecretKeyValue>(response.SecretString);

            if (secretJson == null)
            {
                throw new Exception("Secret cannot be null");
            }

            return secretJson.DEKKO_API_KEY;
        }
        private class SecretKeyValue
        {
#pragma warning disable CS8618 // Non-nullable field must contain a non-null value when exiting constructor. Consider declaring as nullable.
            public string DEKKO_API_KEY { get; set; }
#pragma warning restore CS8618 // Non-nullable field must contain a non-null value when exiting constructor. Consider declaring as nullable.
        }
    }
}
