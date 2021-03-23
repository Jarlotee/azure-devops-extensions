import { GithubRepository, Version, VersionHistory } from "../types";

import {
  GetRepository,
  GetNearestTag,
  GetCurrentCommit,
  GetPullRequestNumbers,
} from "./git";

import { AuthorizeGithubConnection } from "./devops";
import { GetPullRequest, IsTagReleased } from "./github";
import { FormatVersion, ParseVersion } from "./util";

export const HandleTask = async (
  githubConnection: string,
  isHotfix: boolean,
  preReleaseSuffix?: string
): Promise<VersionHistory> => {
  const githubApiToken = AuthorizeGithubConnection(githubConnection);
  const githubRepository = await GetRepository();

  const lastReleaseTag = await GetLastReleaseTag(
    githubApiToken,
    githubRepository
  );

  console.log("Last Release Tag", lastReleaseTag);

  const newVersion = await GetNextVersion(
    lastReleaseTag,
    isHotfix,
    preReleaseSuffix,
    githubApiToken,
    githubRepository
  );

  const nextTagVersion = FormatVersion(newVersion);
  console.log("Next Tag Version", nextTagVersion);

  // todo consider pre-checking that the tag is available

  return newVersion;
};

const GetLastReleaseTag = async (
  githubApiToken: string,
  githubRepository: GithubRepository
) => {
  let tag = await GetNearestTag();
  let isReleased = await IsTagReleased(githubApiToken, githubRepository, tag);

  while (tag && !isReleased) {
    tag = await GetNearestTag(tag);
    isReleased = await IsTagReleased(githubApiToken, githubRepository, tag);
  }

  return tag;
};

const GetNextVersion = async (
  lastReleaseTag: string | null,
  isHotfix: boolean,
  preReleaseSuffix: string | undefined,
  githubApiToken: string,
  githubRepository: GithubRepository
): Promise<VersionHistory> => {
  if (!lastReleaseTag) {
    return GetFirstReleaseVersion();
  }

  if (isHotfix) {
    return GetNextHotfixVersion(lastReleaseTag, githubRepository);
  }

  return GetNextPullRequestVersion(
    lastReleaseTag,
    preReleaseSuffix,
    githubApiToken,
    githubRepository
  );
};

const GetFirstReleaseVersion = (): VersionHistory => {
  return {
    major: 0,
    minor: 1,
    patch: 0,
    body: "Initial Release",
  };
};

const GetNextHotfixVersion = async (
  lastReleaseTag: string,
  githubRepository: GithubRepository
) => {
  const parsedVersion = ParseVersion(lastReleaseTag);
  const hash = await GetCurrentCommit();
  const newVersion: Version = {
    major: parsedVersion.major,
    minor: parsedVersion.minor,
    patch: parsedVersion.patch,
    buildMetadata: hash,
  };

  const nextTagVersion = FormatVersion(newVersion);
  const diffLink = GetLastReleaseDiff(
    lastReleaseTag,
    nextTagVersion,
    githubRepository
  );

  return Object.assign(
    { body: `${diffLink}\r\n\r\nHotfix of ${lastReleaseTag}` },
    newVersion
  );
};

const GetLastReleaseDiff = (
  lastReleaseTag: string,
  nextReleaseTag: string,
  githubRepository: GithubRepository
) => {
  return `[Changes since last release](https://${githubRepository.domain}/${githubRepository.owner}/${githubRepository.name}/compare/${lastReleaseTag}...${nextReleaseTag})`;
};

const GetNextPullRequestVersion = async (
  lastReleaseTag: string,
  preReleaseSuffix: string | undefined,
  githubApiToken: string,
  githubRepository: GithubRepository
): Promise<VersionHistory> => {
  const parsedVersion = ParseVersion(lastReleaseTag);
  const pullRequestNumbers = await GetPullRequestNumbers(lastReleaseTag);

  if (pullRequestNumbers.length === 0) {
    throw new Error(
      `No pull requests found since [${lastReleaseTag}]. Did you mean to create a hotfix?`
    );
  }

  const newVersion: VersionHistory = {
    major: parsedVersion.major,
    minor: parsedVersion.minor,
    patch: parsedVersion.patch,
    preRelease: preReleaseSuffix,
    body: "",
  };

  for (let i = 0; i < pullRequestNumbers.length; i++) {
    const pullRequest = await GetPullRequest(
      githubApiToken,
      githubRepository,
      pullRequestNumbers[i]
    );

    if (pullRequest.isMajor) {
      newVersion.major = newVersion.major + 1;
    } else if (pullRequest.isMinor) {
      newVersion.minor = newVersion.minor + 1;
    } else {
      newVersion.patch = newVersion.patch + 1;
    }

    const body = pullRequest.body || "No Pull Request Body";

    const formatted = `### [${pullRequest.title}](${pullRequest.link})\r\n${body}\r\n\r\n`;

    newVersion.body = newVersion.body + formatted;
  }

  const nextTagVersion = FormatVersion(newVersion);

  const diffLink = GetLastReleaseDiff(
    lastReleaseTag,
    nextTagVersion,
    githubRepository
  );

  newVersion.body = `${diffLink}\r\n\r\n${newVersion.body}`;

  return newVersion;
};
