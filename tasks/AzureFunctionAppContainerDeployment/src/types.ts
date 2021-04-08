export interface Config {
  azureResourceManagerConnection: string;
  resourceGroupName: string;
  functionAppName: string;
  slot?: string;
  containerRegistry: string;
  repository: string;
  tag: string;
  versionVerificationPath: string;
  healthVerificationPath: string;
}

export interface DockerRepository {
  url: string;
  domain: string;
  username?: string;
  password?: string;
}
