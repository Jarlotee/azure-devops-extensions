import SimpleGit from 'simple-git';

const git = SimpleGit();

export const GetRemoteDetails = () => {
  git.listConfig()
}
