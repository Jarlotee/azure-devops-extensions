export interface GithubRepository {
  owner: string;
  name: string;
  api: string;
  domain: string;
}

export interface Version {
  major: number;
  minor: number;
  patch: number;
  preRelease?: string;
  buildMetadata?: string;
}

export interface Config {
  tag: string;
  name?: string;
  body?: string;
  draft: boolean;
}
