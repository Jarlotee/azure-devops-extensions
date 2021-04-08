import * as task from "azure-pipelines-task-lib";

import { HandleTask } from "./handlers/task";
import { Config } from "./types";

async function run() {

  const config : Config = {
    azureResourceManagerConnection: task.getInput('azureResourceManagerConnection', true) as string,
    resourceGroupName: task.getInput('resourceGroupName', true) as string,
    functionAppName: task.getInput('functionAppName', true) as string,
    slot: task.getInput('slot', false),
    containerRegistry: task.getInput('containerRegistry', true) as string,
    repository: task.getInput('repository', true) as string,
    tag: task.getInput('tag', true) as string,
    versionVerificationPath: task.getInput('versionVerificationPath', true) as string,
    healthVerificationPath: task.getInput('healthVerificationPath', true) as string,
  }

  await HandleTask(config);
}

run().catch((error) => task.setResult(task.TaskResult.Failed, error.message));
