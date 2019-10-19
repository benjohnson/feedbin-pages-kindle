#!/usr/bin/env bash
rm -rf dist
yarn build-ts
cp -R src/templates dist/templates
cp -R src/views dist/views
cp -R src/static dist/static
