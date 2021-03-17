import fetch from "node-fetch";

import { GithubRepository, PullRequest } from "../types";

export const IsTagReleased = async (
  githubApiToken: string,
  githubRepository: GithubRepository,
  tag: string | null
): Promise<boolean> => {
  if (!tag) {
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
};

export const GetPullRequest = async (
  githubApiToken: string,
  githubRepository: GithubRepository,
  pullRequestNumber: number
): Promise<PullRequest> => {
  const options = {
    method: "GET",
    headers: {
      Accept: "application/vnd.github.v3+json",
      Authorization: `Token ${githubApiToken}`,
    },
  };

  const pullRequestResponse = await fetch(
    `${githubRepository.api}/repos/${githubRepository.owner}/${githubRepository.name}/issues/${pullRequestNumber}`,
    options
  );

  if (!pullRequestResponse.ok) {
    throw new Error(
      `Unable to get pull request detail for [${pullRequestNumber}]`
    );
  }

  const pullRequest = await pullRequestResponse.json();
  const isMajor = HasLabel(pullRequest.labels, "major-version");
  const isMinor = HasLabel(pullRequest.labels, "minor-version");

  return {
    title: pullRequest.title,
    body: pullRequest.body,
    link: pullRequest.html_url,
    isMajor,
    isMinor,
    isPatch: !isMajor && !isMinor,
  };
};

const HasLabel = (labels: any[], label: string): boolean => {
  if (!labels) {
    return false;
  }

  if (labels.some((l) => l.name.includes(label))) {
    return true;
  }

  return false;
};
