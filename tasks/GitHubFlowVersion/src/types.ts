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

export interface VersionHistory extends Version {
  body: string;
}

export interface PullRequest {
  title: string,
  body: string,
  link: string,
  isMajor: boolean,
  isMinor: boolean,
  isPatch: boolean
}
