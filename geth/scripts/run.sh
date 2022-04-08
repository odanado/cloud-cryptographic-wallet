#!/bin/sh

set -eu

geth \
    --nodiscover \
    --syncmode 'full' \
    --nat none \
    --port 30310 \
    --http \
    --http.addr '0.0.0.0' \
    --http.port 8501 \
    --http.vhosts '*' \
    --http.api 'personal,eth,net,web3,txpool,miner,debug' \
    --mine \
    --miner.gasprice 0 \
    --allow-insecure-unlock \
    --dev
