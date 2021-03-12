import fetch from "node-fetch";

import { GithubRepository } from "../types";

export const isTagReleased = async (githubApiToken: string, githubRepository: GithubRepository, tag: string | null) => {
  if(!tag) {
    return false;
  }

  const options = {
    method: "GET",
    headers: {
      Accept: "application/vnd.github.v3+json",
      Authorization: `Token ${githubApiToken}`,
    },
  };

  const releaseResponse = await fetch(
    `${githubRepository.api}/repos/${githubRepository.owner}/${githubRepository.name}/releases/tags/${tag}`,
    options
  );

  if (!releaseResponse.ok) {
    return false;
  }

  const release = await releaseResponse.json();
  const isDraft = release.draft as boolean;

  return !isDraft;
}
