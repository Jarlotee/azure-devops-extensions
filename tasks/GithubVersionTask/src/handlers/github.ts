import fetch from "node-fetch";

import { GithubRepository } from "../types";
import { isStandardRelease, parseStandardRelease } from "../util";

export const GetLatestReleaseVersion = async (
  authToken: string,
  repository: GithubRepository
) => {
  const options = {
    method: "GET",
    headers: {
      Accept: "application/vnd.github.v3+json",
      Authorization: `Token ${authToken}`,
    },
  };

  const latestReleaseResponse = await fetch(
    `${repository.api}/repos/${repository.owner}/${repository.name}/releases/latest`,
    options
  );

  if (!latestReleaseResponse.ok) {
    return null;
  }

  const latestRelease = await latestReleaseResponse.json();
  const latestTag = latestRelease.tag_name as string;

  if (!latestTag) {
    throw new Error("Latest release does not have a tag name");
  }

  if (isStandardRelease(latestTag)) {
    return parseStandardRelease(latestTag);
  }

  const recentReleasesResponse = await fetch(
    `${repository.api}/repos/${repository.owner}/${repository.name}/releases?per_page=25`,
    options
  );

  if (!recentReleasesResponse.ok) {
    throw new Error("Failed to get recent to get recent releases");
  }

  const recentReleases = await recentReleasesResponse.json();

  for (let index = 0; index < recentReleases.length; index++) {
    const release = recentReleases[index];
    const prerelease = release.prerelease as boolean;
    const draft = release.draft as boolean;
    const tag = release.tag_name as string;

    if (!prerelease && !draft && isStandardRelease(tag)) {
      return parseStandardRelease(tag);
    }
  }

  return null;
};
