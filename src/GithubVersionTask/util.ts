const standardReleaseRegex = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:\+[0-9A-Za-z-]+)?$/;

export const isStandardRelease = (tag: string) => {
  return standardReleaseRegex.test(tag);
};

export const parseStandardRelease = (tag: string) => {
  const parsedLatestTag = tag.match(standardReleaseRegex);

  if (!parsedLatestTag) {
    throw new Error(`Tag does not match standard release format [${tag}]`);
  }

  return {
    major: parseInt(parsedLatestTag[1]),
    minor: parseInt(parsedLatestTag[2]),
    patch: parseInt(parsedLatestTag[3]),
  };
};
