import * as task from "azure-pipelines-task-lib";

import { HandleTask } from "./handlers/task";
import { Config } from "./types";

async function run() {
  const githubConnection = task.getInput("gitHubConnection");
  const githubEnterpriseConnection = task.getInput(
    "gitHubEnterpriseConnection"
  ) as string;

  if (!githubConnection && !githubEnterpriseConnection) {
    throw new Error(
      "Missing parameter please supply either a standard or enterprise github connection"
    );
  }

  const config : Config = {
    tag: task.getInput('tag', true) as string,
    name: task.getInput('name'),
    body: task.getInput('body'),
    draft: task.getBoolInput('draft')
  }

  await HandleTask(githubConnection ?? githubEnterpriseConnection, config);
}

run().catch((error) => task.setResult(task.TaskResult.Failed, error.message));
