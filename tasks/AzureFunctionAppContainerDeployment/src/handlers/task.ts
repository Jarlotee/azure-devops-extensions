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
    const webAppUrl = Azure.GetWebAppUrl(config);
    Azure.DeployContainerToWebApp(config, registry);
    await VerifyVersion(config, webAppUrl);
    await VerifyHealth(config, webAppUrl);
    console.log(`##[section] Deployment Complete! ( •_•)  ( •_•)>⌐■-■  (⌐■_■)`);
  } catch (error) {
    throw error;
  } finally {
    Azure.Logout();
  }
};

const VerifyVersion = async (config: Config, webAppUrl: string) => {
  const webAppVerificationUrl = `https://${webAppUrl}${config.versionVerificationPath}`;
  let response: Response | undefined;
  let responseText: string | undefined;

  console.log(`##[debug] Verifying version at ${webAppVerificationUrl}`);

  for (let i = 0; i < 30; i++) {
    response = await fetch(webAppVerificationUrl);
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
      `Failed to confirm version ${config.tag} please check [${webAppVerificationUrl}]`
    );
  }
};

const VerifyHealth = async (config: Config, webAppUrl: string) => {
  const webAppVerificationUrl = `https://${webAppUrl}${config.healthVerificationPath}`;
  const response = await fetch(webAppVerificationUrl);

  console.log(`##[debug] Verifying health at ${webAppVerificationUrl}`);
  if (!response.ok) {
    throw new Error(
      `Deployment is unhealthy please check [${webAppVerificationUrl}]`
    );
  }
};
