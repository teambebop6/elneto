#!/usr/bin/env bash

echo "Start init..."
echo branch is $TRAVIS_BRANCH
# how to encrypt sensitive files: https://docs.travis-ci.com/user/encrypting-files/

# import ssh keys
openssl aes-256-cbc -K $encrypted_8df8ba15f725_key -iv $encrypted_8df8ba15f725_iv -in .travis/assets.zip.enc -out assets.zip -d

unzip assets.zip

# Start SSH agent
#eval $(ssh-agent -s)

chmod 600 ./assets/server_2_secret_repo
chmod 600 ./assets/travis_2_server

echo './assets'
ls -l ./assets/

cp ./assets/server_2_secret_repo ~/.ssh/
cp ./assets/travis_2_server ~/.ssh/

echo '~/.ssh'
ls -l ~/.ssh/

# get server host
serverHost=`cat ./assets/server_host`
# replace all server_host placeholder in config file
sed -i 's/${server_host}/'$serverHost'/g' ./assets/config
# append to ~/.ssh/config file
cat ./assets/config >> ~/.ssh/config

echo '~/.ssh/config'
cat ~/.ssh/config

ssh-keyscan $serverHost >> ~/.ssh/known_hosts

echo "Import ssh keys done"
echo "Finish init."