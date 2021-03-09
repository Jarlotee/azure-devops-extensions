import * as task from "azure-pipelines-task-lib/task";

import {
  GetRemoteOwnerAndRepository,
  GetCurrentBranch,
  GetCurrentCommit,
  GetGithubApiUri,
} from "./handlers/git";

import { AuthorizeGithubConnection } from "./handlers/devops";

async function run() {
  const githubConnection = task.getInput("GitHubConnection", true) as string;

  console.log("Selected Token", githubConnection);
  console.log("Remote", await GetRemoteOwnerAndRepository());
  console.log("Current Branch", await GetCurrentBranch());
  console.log("Current Commit", await GetCurrentCommit());
  console.log("Remote Api Uri", await GetGithubApiUri());
  console.log(
    "Github Connection Token",
    AuthorizeGithubConnection(githubConnection)
  );
}

run().catch((error) => task.setResult(task.TaskResult.Failed, error.message));
