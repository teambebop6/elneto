#!/bin/bash
# Decrypt the private key
openssl aes-256-cbc -K $encrypted_f29dc9db7745_key -iv $encrypted_f29dc9db7745_iv -in ./.travis/id_rsa_elneto_deploy.enc -out id_rsa_elneto_deploy -d

# Start SSH agent
eval $(ssh-agent -s)

# Set the permission of the key
chmod 600 id_rsa_elneto_deploy

# Add the private key to the system
ssh-add id_rsa_elneto_deploy

git clone git@github.com:flaudre/elneto-secret.git elneto-secret