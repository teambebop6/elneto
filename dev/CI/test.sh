#!/usr/bin/env bash

token=${TOKEN}
branchName=${BRANCH_NAME}
file=${FILE}

if [[ -z "${a}" ]]; then
  echo A is not set
fi

if [[ -z "${branchName}" ]]; then
  echo BRANCH_NAME is not set
else
  echo branch name is ${branchName}
fi

if [[ -z "${file}" ]]; then
  echo FILE is not set
else
  echo file is ${file}
fi
