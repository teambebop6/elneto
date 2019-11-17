#!/usr/bin/env bash

echo "Start post..."

echo 'dist/'
ls -l dist/

# copy ecosystem.config.js to dist
cp ecosystem.config.js dist/

branchName=`cat branch`
echo branch name is $branchName

# push to built project
cd dist/
git add .
git commit -m "built code"
git checkout -b $branchName
# force push the files
git push origin $branchName -f

# wait 10 seconds
sleepTime=10s
echo start! sleep $sleepTime
sleep $sleepTime
echo done! sleep $sleepTime

cd ..

travisBranch=$TRAVIS_BRANCH

echo will deploy according to travis branch $travisBranch

serverHost=`cat ./assets/server_host`
remoteCheckPath=`DEPLOYING=true BRANCH=$travisBranch node ecosystem.config.js`

if [ "$travisBranch" = "master" -o "$travisBranch" = "release" ]
then
    devEnv="production"
else
    devEnv="staging"
fi

echo development environment is $devEnv

echo "====== 1 ======="
echo git status
echo "====== 1 ======="
git status

if ssh $serverHost stat $remoteCheckPath \> /dev/null 2\>\&1
then
    echo "File exists"
    echo "====== 2a ======="
    echo git status
    echo "====== 2a ======="
    git status
    pm2 deploy $devEnv exec "git pull"
else
    echo "File does not exist"
    echo "====== 2b ======="
    echo git status
    echo "====== 2b ======="
    git status
    pm2 deploy $devEnv setup
fi

echo "====== 3 ======="
echo git status
echo "====== 3 ======="
git status
pm2 deploy $devEnv --force
