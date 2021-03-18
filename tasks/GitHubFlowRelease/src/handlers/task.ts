import { ParseVersion } from "./util";
import { Config } from "../types";
import { AuthorizeGithubConnection } from "./devops";
import { GetCurrentCommit, GetRepository } from "./git";
import { CreateRelease, GetRelease, UpdateRelease } from "./github";

export const HandleTask = async (githubConnection: string, config: Config) => {
  const githubApiToken = AuthorizeGithubConnection(githubConnection);
  const githubRepository = await GetRepository();
  const parsedVersion = ParseVersion(config.tag);
  const currentCommit = await GetCurrentCommit();

  const existingRelease = await GetRelease(
    githubApiToken,
    githubRepository,
    config
  );

  if (existingRelease) {
    await UpdateRelease(
      githubApiToken,
      githubRepository,
      config,
      parsedVersion,
      currentCommit,
      existingRelease.id
    );

    console.log(
      `Updated release [${existingRelease.id}] at ${existingRelease.url}`
    );
    return;
  }

  const createdRelease = await CreateRelease(
    githubApiToken,
    githubRepository,
    config,
    parsedVersion,
    currentCommit
  );

  console.log(
    `Created release [${createdRelease.id}] at ${createdRelease.url}`
  );
};
