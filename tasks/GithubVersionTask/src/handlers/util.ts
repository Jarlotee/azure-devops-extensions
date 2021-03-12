import { Version } from "../types";

const semver2Regex = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/;

export const ParseVersion = (tag: string): Version => {
  const parsedVersion = tag.match(semver2Regex);

  if (!parsedVersion) {
    throw new Error(`Tag does not match semver 2.0 format [${tag}]`);
  }

  return {
    major: parseInt(parsedVersion[1]),
    minor: parseInt(parsedVersion[2]),
    patch: parseInt(parsedVersion[3]),
    preRelease: parsedVersion[4],
    build: parsedVersion[5],
    raw: tag,
  };
};
