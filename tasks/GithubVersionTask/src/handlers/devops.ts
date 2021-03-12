import * as task from "azure-pipelines-task-lib";

export const AuthorizeGithubConnection = (githubConnectionName: string) => {
  const authorization = task.getEndpointAuthorization(
    githubConnectionName,
    false
  );

  if (!authorization) {
    throw new Error(
      `Failed to get authorization details for [${githubConnectionName}]`
    );
  }

  task.debug(`Github Connection Scheme: ${authorization.scheme}`);

  switch (authorization.scheme) {
    case "PersonalAccessToken":
      return authorization.parameters.accessToken;
    case "OAuth":
    case "OAuth2":
    case "Token":
      return authorization.parameters.AccessToken;
    default:
      throw new Error(
        `Unsupported authorization schema [${authorization.scheme}] for [${githubConnectionName}]`
      );
  }
};
