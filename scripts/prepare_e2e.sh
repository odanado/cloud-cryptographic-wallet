#!/bin/bash

set -eu

function get_outputs () {
  cat ../geth-action/action.yml | yq eval --output-format json | jq -r ".outputs.$1.value"
}

export RPC_URL=$(get_outputs rpc_url)
export PRIVATE_KEY=$(get_outputs private_key)

exec $*

