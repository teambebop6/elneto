#!/usr/bin/env bash

echo "Start clone..."

git clone git@gitlab.com:teambebop6/elneto-secret.git elneto-secret

# move ecosystem.config.js to project root folder
mv ./elneto-secret/ecosystem.config.js .
# move secret folder under src folder
mv ./elneto-secret ./src/

# generate branch name
timestamp() {
  date "+%Y%m%d%H%M%S_%s"
}
branchName=b_`timestamp`
echo branch is $branchName
# save branch name to temp file
echo $branchName > branch

# replace ${branch} to branch name in ecosystem.config.js
sed -i 's/${branch}/'$branchName'/g' ecosystem.config.js

# clone built project
git clone git@gitlab.com:teambebop6/elneto-built.git dist
