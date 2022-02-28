#!/bin/sh

set -eu

geth init /root/config/genesis.json
geth account import /root/config/private-key.txt --password /root/config/password.txt
