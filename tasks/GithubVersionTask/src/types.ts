export interface GithubRepository {
  owner: string;
  name: string;
  api: string;
}

export interface Version {
  major: number;
  minor: number;
  patch: number;
  preRelease?: string;
  build?: string;
}

export interface VersionHistory extends Version {
  body: string;
}
