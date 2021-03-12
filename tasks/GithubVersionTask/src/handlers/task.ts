import { GithubRepository, VersionHistory } from "../types";

import { GetRepository, GetNearestTag, GetCurrentCommit } from "./git";

import { AuthorizeGithubConnection } from "./devops";
import { isTagReleased } from "./github";
import { ParseVersion } from "./util";

export const HandleTask = async (
  githubConnection: string,
  isHotfix: boolean,
  preReleaseDecorator?: string
): Promise<VersionHistory> => {
  const githubApiToken = AuthorizeGithubConnection(githubConnection);
  const githubRepository = await GetRepository();

  const lastReleaseTag = await GetLastReleaseTag(
    githubApiToken,
    githubRepository
  );

  const version = await GetNextVersion(
    lastReleaseTag,
    isHotfix,
    preReleaseDecorator,
    githubApiToken,
    githubRepository
  );

  return version;
};

const GetLastReleaseTag = async (
  githubApiToken: string,
  githubRepository: GithubRepository
) => {
  let tag = await GetNearestTag();
  let isReleased = await isTagReleased(githubApiToken, githubRepository, tag);

  while (tag && !isReleased) {
    tag = await GetNearestTag(tag);
    isReleased = await isTagReleased(githubApiToken, githubRepository, tag);
  }

  return tag || "0.1.0";
};

const GetNextVersion = async (
  lastReleaseTag: string,
  isHotfix: boolean,
  preReleaseDecorator: string | undefined,
  githubApiToken: string,
  githubRepository: GithubRepository
): Promise<VersionHistory> => {
  const parsedVersion = ParseVersion(lastReleaseTag);
  const hash = await GetCurrentCommit();
  // calculate diff link

  if (isHotfix) {
    return {
      major: parsedVersion.major,
      minor: parsedVersion.minor,
      patch: parsedVersion.patch,
      build: hash,
      body: "Hotfix", // todo add diff link
    };
  }

  const history = await GetHistoryAndVersionFromPullRequests(
    lastReleaseTag,
    preReleaseDecorator,
    githubApiToken,
    githubRepository
  );

  return history;
};

const GetHistoryAndVersionFromPullRequests = async (
  lastReleaseTag: string,
  preReleaseDecorator: string | undefined,
  githubApiToken: string,
  githubRepository: GithubRepository
): Promise<VersionHistory> => {
  // todo interrogate pull requests
  // todo throw error if no pull-requests found
};
