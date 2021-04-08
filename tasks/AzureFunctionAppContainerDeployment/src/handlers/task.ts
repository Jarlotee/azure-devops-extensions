import { Config } from "../types";
import { GetRegistryDetails } from "./docker";
import * as Azure from "./azure";
import fetch, { Response } from "node-fetch";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const HandleTask = async (config: Config) => {
  try {
    console.log(
      `Deploying ${config.repository}:${config.tag} to ${config.functionAppName} `
    );
    Azure.Login(config.azureResourceManagerConnection);
    const registry = await GetRegistryDetails(config.containerRegistry);
    const functionAppUrl = Azure.GetFunctionAppUrl(config);
    Azure.DeployContainerToFunctionApp(config, registry);
    await VerifyVersion(config, functionAppUrl);
    await VerifyHealth(config, functionAppUrl);
    console.log(`##[section] Deployment Complete! ( •_•)  ( •_•)>⌐■-■  (⌐■_■)`);
  } catch (error) {
    throw error;
  } finally {
    Azure.Logout();
  }
};

const VerifyVersion = async (config: Config, functionAppUrl: string) => {
  const functionAppVerificationUrl = `https://${functionAppUrl}${config.versionVerificationPath}`;
  let response: Response | undefined;
  let responseText: string | undefined;

  console.log(`##[debug] Verifying version at ${functionAppVerificationUrl}`);

  for (let i = 0; i < 30; i++) {
    response = await fetch(functionAppVerificationUrl);
    responseText = await response.text();

    if (response.ok && responseText.match(`${config.tag}`)) {
      break;
    }

    await sleep(4000);
  }

  const tagNotFound =
    !response ||
    !response.ok ||
    !responseText ||
    !responseText.match(`${config.tag}`);

  if (tagNotFound) {
    throw new Error(
      `Failed to confirm version ${config.tag} please check [${functionAppVerificationUrl}]`
    );
  }
};

const VerifyHealth = async (config: Config, functionAppUrl: string) => {
  const functionAppVerificationUrl = `https://${functionAppUrl}${config.healthVerificationPath}`;
  const response = await fetch(functionAppVerificationUrl);

  console.log(`##[debug] Verifying health at ${functionAppVerificationUrl}`);
  if (!response.ok) {
    throw new Error(
      `Deployment is unhealthy please check [${functionAppVerificationUrl}]`
    );
  }
};
