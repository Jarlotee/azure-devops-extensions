* add raw string version of version
* grab pr history and build stuff
  * write (no pull request history found) if we dont have anything
* create a new version
  * incriment patch if we dont have pr history
  * if its not master|main|trunk use the branch name as the -[pre-release] (error out if the branch name doesnt follow semver 2.0)
* export the version + log as variables
* create a pre-release
* in a subsequent part (with a gate) upgrade from pre-release

[Ideas]
Create pre-release at end of build cycle => use output from prior pipeline as input to new pipeline (e.g. deploy x ) for containers (all youd need is the version to promote it)
