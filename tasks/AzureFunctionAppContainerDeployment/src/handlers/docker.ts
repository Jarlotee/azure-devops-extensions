import * as task from "azure-pipelines-task-lib";
import * as whatwg from "whatwg-url";

import { DockerRepository } from "../types";

export const GetRegistryDetails = (
  containerRegistry: string
): DockerRepository => {
  const registryType = task.getEndpointDataParameter(
    containerRegistry,
    "registrytype",
    true
  );

  const url = task.getEndpointAuthorizationParameter(
    containerRegistry,
    "registry",
    false
  ) as string;

  const parsedUrl = whatwg.parseURL(url);

  if (!parsedUrl) {
    throw new Error(`Failed to parse url [${url}]`);
  }

  const domain = parsedUrl.host as string;

  switch (registryType) {
    case "Others": {
      return {
        url,
        domain,
        username: task.getEndpointAuthorizationParameter(
          containerRegistry,
          "username",
          false
        ) as string,
        password: task.getEndpointAuthorizationParameter(
          containerRegistry,
          "password",
          false
        ) as string,
      };
    }
    default:
      throw new Error(`Unsupported Container Registry ${registryType}`);
  }
};
