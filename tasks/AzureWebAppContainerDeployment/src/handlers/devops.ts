import * as task from "azure-pipelines-task-lib";

export const EnsureExecSync = (tool: string, args: string | string[]) => {
  const result = task.execSync(tool, args);

  if (result.code !== 0) {
    task.error(
      `Tool [${tool}] returned exit code [${result.code}] for command ${args}`
    );
    throw result;
  }

  return result;
};
