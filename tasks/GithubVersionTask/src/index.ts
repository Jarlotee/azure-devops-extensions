import * as task from "azure-pipelines-task-lib";

import {
  GetRepository,
  GetCurrentBranch,
  GetCurrentCommit,
  GetLastStandardTag,
} from "./handlers/git";

import { GetLatestReleaseVersion } from "./handlers/github";
import { AuthorizeGithubConnection } from "./handlers/devops";

async function run() {
  const githubConnection = task.getInput("GitHubConnection") as string;
  const githubEnterpriseConnection = task.getInput(
    "GitHubEnterpriseConnection"
  ) as string;

  if (!githubConnection && !githubEnterpriseConnection) {
    throw new Error(
      "Missing parameter please supply either a standard or enterprise github connection"
    );
  }

  console.log("Selected Token", githubConnection);
  console.log("Remote", await GetRepository());
  console.log("Current Branch", await GetCurrentBranch());
  console.log("Current Commit", await GetCurrentCommit());
  console.log(
    "Last Git Tag",
    await GetLastStandardTag()
  );
  console.log(
    "Github Connection Token",
    AuthorizeGithubConnection(githubConnection)
  );
  console.log(
    "Last Release",
    await GetLatestReleaseVersion(
      await AuthorizeGithubConnection(githubConnection),
      await GetRepository()
    )
  );
}

run().catch((error) => task.setResult(task.TaskResult.Failed, error.message));
