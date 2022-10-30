#!/usr/bin/env bash

token=${TOKEN}
branchName=${BRANCH_NAME}
file=${FILE}

if [[ -z "$token" ]]
then
  echo "Pls provide token"
  exit -1
fi

if [[ -z "$branchName" ]]
then
  echo "Pls provide branch name"
  exit -1
fi

if [[ -z "$file" ]]
then
  echo "Pls provide asset file"
  exit -1
fi

echo "branch name is ${branchName}"

time=`date +"%Y%m%d_%H%M%S_%s"`
if [[ $branchName = feature* ]]
then
  tagName=feature_${time}
else
  tagName=release_${time}
fi

echo "tag name is ${tagName}"

targetRepo=teambebop6/elneto-secret

createReleaseResponse=$(
  curl \
    -X POST \
    -H "Accept: application/vnd.github+json" \
    -H "Authorization: Bearer ${token}" \
    https://api.github.com/repos/${targetRepo}/releases \
    -d '{"tag_name":"'${tagName}'","name":"'${tagName}'","body":"Automatically release on branch '${branchName}'.","draft":false,"prerelease":false,"generate_release_notes":false}'
)

releaseId=$(echo $createReleaseResponse | jq '.id')
echo release id is ${releaseId}

fileName=$(basename ${file})
uploadUrl=https://uploads.github.com/repos/${targetRepo}/releases/${releaseId}/assets?name=${fileName}
echo upload url is ${uploadUrl}

uploadAssetResponse=$(
  curl \
    -H "Authorization: Bearer $token"  \
    -H "Content-Type: application/zip" \
    --data-binary @${file}  \
    "$uploadUrl"
)

assetUrl=$(echo $uploadAssetResponse | jq '.url')
echo asset url is ${assetUrl}

ts=$(date +%s)

cp dev/CI/DEPLOY_INFO.template DEPLOY_INFO
sed -i 's/@@tag@@/'${tagName}'/g' DEPLOY_INFO
sed -i 's/@@ts@@/'${ts}'/g' DEPLOY_INFO
sed -i 's/@@url@@/'${assetUrl}'/g' DEPLOY_INFO

cat DEPLOY_INFO
