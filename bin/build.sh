#!/usr/bin/env sh
rm -rf dist
yarn build-ts
cp -R src/templates dist/templates
cp -R src/views dist/views
# cp -R src/static dist/static
