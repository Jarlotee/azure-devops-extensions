# Azure Devops Extensions

## Libraries

Fetch became natively supported in node 21, but ADO is currently max on Node 20, so for now stick with node-fetch 2.x

## Setup 
Ensure that you have the Azure Devops Extension tooling installed

`npm install -g tfx-cli`

## Release

`npm run build` to run the typescript transpiler
`npm run package` to build the release package

Publish on [Visual Studio Marketplace](https://marketplace.visualstudio.com/manage/publishers/jarlotee)
