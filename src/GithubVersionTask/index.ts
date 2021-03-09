import * as task from "azure-pipelines-task-lib/task";

async function run() {
  const token = task.getInput("GitHubConnection", true);

  console.log("Selected Token", token);
}

run().catch((error) => task.setResult(task.TaskResult.Failed, error.message));
