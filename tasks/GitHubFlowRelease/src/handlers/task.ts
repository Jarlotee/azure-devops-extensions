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
    config.tag
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

  // ignores config.draft to force git tag creation
  const createdRelease = await CreateRelease(
    githubApiToken,
    githubRepository,
    config,
    parsedVersion,
    currentCommit
  );

  // sets correct draft status
  if (config.draft) {
    await UpdateRelease(
      githubApiToken,
      githubRepository,
      config,
      parsedVersion,
      currentCommit,
      createdRelease.id
    );
  }

  console.log(
    `Created release [${createdRelease.id}] at ${createdRelease.url}`
  );
};
