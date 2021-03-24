import * as task from "azure-pipelines-task-lib";

export const EnsureExecSync = (
  tool: string,
  args: string | string[],
  silent: boolean = false
) => {
  const result = task.execSync(tool, args, { silent });

  if (result.code !== 0) {
    task.error(
      `Tool [${tool}] returned exit code [${result.code}] for command ${args}`
    );
    throw result;
  }

  return result;
};
