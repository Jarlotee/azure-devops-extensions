import * as task from "azure-pipelines-task-lib";
import { writeFileSync, existsSync, mkdirSync } from "fs";

import { HandleTask } from "./handlers/task";
import { FormatVersion } from "./handlers/util";

async function run() {
  const githubConnection = task.getInput("gitHubConnection");
  const githubEnterpriseConnection = task.getInput(
    "gitHubEnterpriseConnection"
  ) as string;
  const isHotfix = task.getBoolInput("isHotFix");
  const preReleaseSuffix = task.getInput("preReleaseSuffix");

  if (!githubConnection && !githubEnterpriseConnection) {
    throw new Error(
      "Missing parameter please supply either a standard or enterprise github connection"
    );
  }

  if (preReleaseSuffix && isHotfix) {
    throw new Error(
      "Supplying a pre-release decorator is not compatible with a hotfix"
    );
  }

  const version = await HandleTask(
    githubConnection ?? githubEnterpriseConnection,
    isHotfix,
    preReleaseSuffix
  );

  const tagVersion = FormatVersion(version);

  task.setVariable("GitHubFlow.Tag", tagVersion);
  task.setVariable("GitHubFlow.Body", version.body);

  if (!existsSync("./.githubflow")) {
    mkdirSync("./.githubflow");
  }

  writeFileSync("./.githubflow/tag", tagVersion);
  writeFileSync("./.githubflow/body", version.body);
}

run().catch((error) => task.setResult(task.TaskResult.Failed, error.message));
