import SimpleGit from "simple-git";
import { GithubRepository } from "../types";

const git = SimpleGit();

export const GetRepository = async (): Promise<GithubRepository> => {
  const config = await git.listConfig();
  const remoteUri = config.values[".git/config"]["remote.origin.url"] as string;

  return parseRepository(remoteUri);
};

function parseRepository(remoteUri: string): GithubRepository {
  const repositoryMatches = remoteUri.match(
    /[:|\/]([-_0-9a-zA-Z]+)\/([-_0-9a-zA-Z]+)(.git|$)/
  );
  const domainMatches = remoteUri.match(/[:|\/@]([-_0-9a-zA-Z.]+).*/);

  if (repositoryMatches == null) {
    throw new Error("Failed to parse owner and repository from remote origin");
  }

  if (domainMatches == null) {
    throw new Error("Failed to parse api uri from remote origin");
  }

  let domain = domainMatches[1].toLowerCase();
  let api = "";

  if (domain === "github.com") {
    api = "https://api.github.com";
  } else {
    api = `https://${domain}/api/v3`;
  }

  const owner = repositoryMatches[1];
  const name = repositoryMatches[2];

  return { owner, name, api, domain };
}

export const GetCurrentBranch = async () => {
  return git.revparse(["--abbrev-ref", "HEAD"]);
};

export const GetCurrentCommit = async () => {
  return git.revparse(["--short", "HEAD"]);
};

export const GetNearestTag = async (before?: string) => {
  try {
    const tag = await git.raw([
      "describe",
      "--abbrev=0",
      "--tags",
      "--match",
      "[0-9]*.[0-9]*.[0-9]*",
      before ? `${before}~1` : "HEAD",
    ]);

    return tag.replace(/^\s+|\s+$/g, "");
  } catch (error) {}

  return null;
};

export const GetPullRequestNumbers = async (lastReleaseTag: string) => {
  const history = await git.log([
    `${lastReleaseTag}..HEAD`,
    "--reverse",
    "--pretty=%s",
    "--grep",
    "Merge pull request #*",
  ]);

  const pullRequestNumbers = [];

  for (let i = 0; i < history.total; i++) {
    const item = history.all[i];
    const pullRequestNumberMatch = item.hash.match(
      /Merge pull request #([0-9]+) from */
    );

    if (pullRequestNumberMatch) {
      pullRequestNumbers.push(parseInt(pullRequestNumberMatch[1]));
    }
  }

  return pullRequestNumbers;
};
