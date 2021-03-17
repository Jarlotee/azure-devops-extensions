import { ParseVersion } from "./util";
import { Config } from "../types";
import { AuthorizeGithubConnection } from "./devops";
import { GetCurrentCommit, GetRepository } from "./git";
import { CreateRelease } from "./github";

export const HandleTask = async (githubConnection: string, config: Config) => {
  const githubApiToken = AuthorizeGithubConnection(githubConnection);
  const githubRepository = await GetRepository();
  const parsedVersion = ParseVersion(config.tag);
  const currentCommit = await GetCurrentCommit();

  await CreateRelease(
    githubApiToken,
    githubRepository,
    config,
    parsedVersion,
    currentCommit
  );
};
