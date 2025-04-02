import fetch from "node-fetch";

import { Config, GithubRepository, Version } from "../types";

export const GetRelease = async (
  githubApiToken: string,
  githubRepository: GithubRepository,
  config: Config
) => {
  const options = {
    method: "GET",
    headers: {
      Accept: "application/vnd.github.v3+json",
      Authorization: `Token ${githubApiToken}`,
    },
  };

  const releaseByTagResponse = await fetch(
    `${githubRepository.api}/repos/${githubRepository.owner}/${githubRepository.name}/releases/tags/${config.tag}`,
    options
  );

  if (releaseByTagResponse.ok) {
    const release = await releaseByTagResponse.json() as any;
    return { id: release.id as string, url: release.html_url as string };
  }

  const releasesResponse = await fetch(
    `${githubRepository.api}/repos/${githubRepository.owner}/${githubRepository.name}/releases?per_page=25`,
    options
  );

  if (!releasesResponse.ok) {
    return;
  }

  const releases: any[] = await releasesResponse.json() as any;

  const release_name = config.name ?? config.tag;
  const release = releases.find((r) => r.name === release_name);

  if (release) {
    return { id: release.id as string, url: release.html_url as string };
  }
};

export const CreateRelease = async (
  githubApiToken: string,
  githubRepository: GithubRepository,
  config: Config,
  version: Version,
  currentCommit: string
) => {
  const options = {
    method: "POST",
    body: JSON.stringify({
      tag_name: config.tag,
      target_commitish: currentCommit,
      name: config.name ?? config.tag,
      body: config.body,
      draft: config.draft,
      prerelease: !!version.preRelease,
    }),
    headers: {
      Accept: "application/vnd.github.v3+json",
      Authorization: `Token ${githubApiToken}`,
      "Content-Type": "application/json",
    },
  };

  const releaseResponse = await fetch(
    `${githubRepository.api}/repos/${githubRepository.owner}/${githubRepository.name}/releases`,
    options
  );

  if (!releaseResponse.ok) {
    console.log("error body", await releaseResponse.json());
    throw new Error(`Error creating release [${releaseResponse.statusText}]`);
  }

  const release = await releaseResponse.json() as any;

  return { id: release.id as string, url: release.html_url as string };
};

export const UpdateRelease = async (
  githubApiToken: string,
  githubRepository: GithubRepository,
  config: Config,
  version: Version,
  currentCommit: string,
  releaseId: string
) => {
  const options = {
    method: "PATCH",
    body: JSON.stringify({
      tag_name: config.tag,
      target_commitish: currentCommit,
      name: config.name ?? config.tag,
      body: config.body,
      draft: config.draft,
      prerelease: !!version.preRelease,
    }),
    headers: {
      Accept: "application/vnd.github.v3+json",
      Authorization: `Token ${githubApiToken}`,
      "Content-Type": "application/json",
    },
  };

  const releaseResponse = await fetch(
    `${githubRepository.api}/repos/${githubRepository.owner}/${githubRepository.name}/releases/${releaseId}`,
    options
  );

  if (!releaseResponse.ok) {
    console.log("error body", await releaseResponse.json());
    throw new Error(`Error updating release [${releaseResponse.statusText}]`);
  }

  const release = await releaseResponse.json() as any;

  return { id: release.id as string, url: release.html_url as string };
};
