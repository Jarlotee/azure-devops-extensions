export interface Config {
  azureResourceManagerConnection: string;
  resourceGroupName: string;
  webAppName: string;
  slot?: string;
  containerRegistry: string;
  repository: string;
  tag: string;
  verificationPath?: string;
}

export interface DockerRepository {
  url: string;
  domain: string;
  username?: string;
  password?: string;
}
