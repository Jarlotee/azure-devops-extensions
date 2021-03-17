import fetch from "node-fetch";

import { Config, GithubRepository, Version } from "../types";

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
      'Content-Type': 'application/json'
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

  const release = await releaseResponse.json();
  console.log(`Created release ${release.html_url}`)
};
