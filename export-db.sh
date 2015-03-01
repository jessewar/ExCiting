#!/bin/bash

# Exports the mongodb so that its usable for others
cd data/repo-exclude
mongodump -d exciting -o database-dump

tar -czf database-dump.tar.gz database-dump
mv database-dump.tar.gz ../repo-include/
cd ../..