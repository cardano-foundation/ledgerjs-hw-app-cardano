#!/bin/bash

set -e

#cd ../..
#PATH=$(yarn bin):$PATH
#cd -
babel --source-maps -d example-node/lib example-node/src
