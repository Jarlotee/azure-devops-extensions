* add hotfix param
* find last release by traversing git tags and checking for draft = false
* check if new version exists in tag history, if so throw an error (did you mean to hotfix? maybe you should create a PR?)
* grab pr history and format
  * write (no pull request history found) if we dont have anything
  * create the dif link
* create a new version
  * if hotfix append +{commit_hash} to last release
  * if !=hotfix walk pr history
  * append postfix if asked unless its a hotfix (that doesnt make sense)
* export the version + log + pre-release as variables
* create a draft release
* in a subsequent part (with a gate or something) set draft release to regular

[Ideas]
Create pre-release at end of build cycle => use output from prior pipeline as input to new pipeline (e.g. deploy x ) for containers (all youd need is the version to promote it) [Requires Artifacts, meh]
