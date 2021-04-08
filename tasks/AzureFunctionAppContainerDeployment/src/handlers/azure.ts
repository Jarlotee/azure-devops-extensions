import * as task from "azure-pipelines-task-lib";
import * as path from "path";
import { EnsureExecSync } from "./devops";
import { Config, DockerRepository } from "../types";

export const Login = (azureResourceManagerConnection: string) => {
  const authenticationScheme = task.getEndpointAuthorizationScheme(
    azureResourceManagerConnection,
    false
  ) as string;

  const isServicePrincipalAuthenticationScheme = /serviceprincipal/i.test(
    authenticationScheme
  );

  if (!isServicePrincipalAuthenticationScheme) {
    throw new Error(
      `Unsupported AzureResourceManager auth scheme [${authenticationScheme}]`
    );
  }

  const subscriptionID = task.getEndpointDataParameter(
    azureResourceManagerConnection,
    "SubscriptionID",
    false
  ) as string;

  const servicePrincipalId = task.getEndpointAuthorizationParameter(
    azureResourceManagerConnection,
    "serviceprincipalid",
    false
  ) as string;

  const azureTenantId = task.getEndpointAuthorizationParameter(
    azureResourceManagerConnection,
    "tenantid",
    false
  ) as string;

  const password = GetPasswordByAuthenticationType(
    azureResourceManagerConnection
  );
  const escapedCliPassword = password.replace(/"/g, '\\"');

  EnsureExecSync(
    "az",
    `login --service-principal -u "${servicePrincipalId}" --password="${escapedCliPassword}" --tenant "${azureTenantId}" --allow-no-subscriptions --output "None"`
  );
  EnsureExecSync(
    "az",
    `account set --subscription "${subscriptionID}" --output "None"`
  );
};

const GetPasswordByAuthenticationType = (
  azureResourceManagerConnection: string
): string => {
  const authenticationType = task.getEndpointAuthorizationParameter(
    azureResourceManagerConnection,
    "authenticationType",
    false
  ) as string;

  switch (authenticationType) {
    case "spnCertificate": {
      const certificateContent = task.getEndpointAuthorizationParameter(
        azureResourceManagerConnection,
        "servicePrincipalCertificate",
        false
      ) as string;

      const certificatePath = GetCertificatePath();
      task.writeFile(certificatePath, certificateContent);
      return certificatePath;
    }
    // case 'unknown': // not sure what the key is here
    //   return task.getEndpointAuthorizationParameter(azureResourceManagerConnection, "serviceprincipalkey", false) as string;
    default:
      throw new Error(
        `Unsupported authentication type [${authenticationType}]`
      );
  }
};

export const DeployContainerToWebApp = (
  config: Config,
  registry: DockerRepository
) => {
  const options = [] as string[];
  options.push(`functionapp config container set`);
  options.push(`-g "${config.resourceGroupName}"`);
  options.push(`-n "${config.functionAppName}"`);

  if (config.slot) {
    options.push(`-s "${config.slot}"`);
  }

  options.push(`-i "${registry.domain}/${config.repository}:${config.tag}"`);
  options.push(`-r "${registry.url}"`);

  if (registry.username) {
    options.push(`-u "${registry.username}"`);
  }

  if (registry.password) {
    options.push(`-p "${registry.password}"`);
  }

  options.push(`--output "None"`);

  EnsureExecSync(
    "az",
    options.reduce((a, b) => `${a} ${b}`)
  );
};

export const GetWebAppUrl = (config: Config) => {
  const options = [] as string[];
  options.push(`functionapp show`);
  options.push(`-g "${config.resourceGroupName}"`);
  options.push(`-n "${config.functionAppName}"`);

  if (config.slot) {
    options.push(`-s "${config.slot}"`);
  }

  options.push(`--query "defaultHostName"`);
  options.push(`--output "tsv""`);

  const result = EnsureExecSync(
    "az",
    options.reduce((a, b) => `${a} ${b}`),
    true
  );

  return result.stdout.replace(/\s/g, "");
};

export const Logout = () => {
  const certificatePath = GetCertificatePath();
  task.rmRF(certificatePath);
  EnsureExecSync("az", `account clear --output "None"`);
};

const GetCertificatePath = () => {
  const tempDirectory =
    task.getVariable("Agent.TempDirectory") ||
    task.getVariable("system.DefaultWorkingDirectory");

  if (!tempDirectory) {
    throw new Error(
      "Unable to locate a temp directory to house the authentication certificate"
    );
  }

  return path.join(tempDirectory, "spn-cert.pem");
};
