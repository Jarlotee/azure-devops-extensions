import SimpleGit from "simple-git";

const git = SimpleGit();

export const GetRemoteOwnerAndRepository = async () => {
  const config = await git.listConfig();
  const remoteUri = config.values[".git/config"]["remote.origin.url"] as string;

  const regExMatches = remoteUri.match(
    /[:|\/]([-_0-9a-zA-Z]+)\/([-_0-9a-zA-Z]+)(.git|$)/
  );

  if (regExMatches == null) {
    throw new Error("Failed to parse owner and repository from remote origin");
  }
  console.debug("stuff", remoteUri);
  const owner = regExMatches[1];
  const repository = regExMatches[2];

  return { owner, repository };
};

export const GetGithubApiUri = async () => {
  const config = await git.listConfig();
  const remoteUri = config.values[".git/config"]["remote.origin.url"] as string;

  const regExMatches = remoteUri.match(/[:|\/@]([-_0-9a-zA-Z.]+).*/);

  if (regExMatches == null) {
    throw new Error("Failed to parse api uri from remote origin");
  }

  const domain = regExMatches[1];

  if (domain.toLowerCase() === "github.com") {
    return "https://api.github.com";
  } else {
    return `https://${domain}/api/v3`;
  }
};

export const GetCurrentBranch = async () => {
  return git.revparse(["--abbrev-ref", "HEAD"]);
};

export const GetCurrentCommit = async () => {
  return git.revparse(["HEAD"]);
};
