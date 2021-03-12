import * as task from "azure-pipelines-task-lib";

import { HandleTask } from "./handlers/task";

async function run() {
  const githubConnection = task.getInput("GitHubConnection");
  const githubEnterpriseConnection = task.getInput(
    "GitHubEnterpriseConnection"
  ) as string;
  const isHotfix = task.getBoolInput('IsHotFix');
  const preReleaseDecorator = task.getInput("PreReleaseDecorator");

  if (!githubConnection && !githubEnterpriseConnection) {
    throw new Error(
      "Missing parameter please supply either a standard or enterprise github connection"
    );
  }

  if(preReleaseDecorator && isHotfix) {
    throw new Error(
      "Supplying a pre-release decorator is not compatible with a hotfix"
    );
  }

  const version = await HandleTask(githubConnection ?? githubEnterpriseConnection, isHotfix, preReleaseDecorator);
}

run().catch((error) => task.setResult(task.TaskResult.Failed, error.message));
