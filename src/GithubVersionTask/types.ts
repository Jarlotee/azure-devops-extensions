export type GithubRepository = {
  owner: string;
  name: string;
  api: string;
};

export type Version = {
  major: number;
  minor: number;
  patch: number;
  raw: string;
};
