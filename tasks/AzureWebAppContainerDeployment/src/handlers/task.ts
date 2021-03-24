import { Config } from "../types";
import { GetRegistryDetails } from "./docker";
import * as Azure from "./azure";
import fetch, { Response } from "node-fetch";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const HandleTask = async (config: Config) => {
  try {
    console.log(
      `Deploying ${config.repository}:${config.tag} to ${config.webAppName} `
    );
    const registry = await GetRegistryDetails(config.containerRegistry);
    Azure.Login(config.azureResourceManagerConnection);
    Azure.DeployContainerToWebApp(config, registry);

    if (config.verificationPath) {
      await VerifyContainerDeployment(config);
    }

    console.log(`##[section] Deployment Complete! ( •_•)  ( •_•)>⌐■-■  (⌐■_■)`);
  } catch (error) {
    throw error;
  } finally {
    Azure.Logout();
  }
};

const VerifyContainerDeployment = async (config: Config) => {
  const webAppUrl = Azure.GetWebAppUrl(config);
  const webAppVerificationUrl = `https://${webAppUrl}${config.verificationPath}`;
  let response: Response | undefined;
  let responseText: string | undefined;

  for (let i = 0; i < 30; i++) {
    response = await fetch(webAppVerificationUrl);
    responseText = await response.text();

    console.log(
      `debug verification loop [${i}]`,
      response.status,
      responseText,
      responseText.match(`${config.tag}`)
    );
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
