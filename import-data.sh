#!/bin/bash

#Initializes the project by extracting data, running preprocesing, etc
cd data
if [ ! -e repo-exclude/aan ]; then
  wget -O ./aan.tar.gz https://www.dropbox.com/s/i9r9akdptyzm6pj/aanrelease2013.tar.gz?dl=1
  tar -xzf aan.tar.gz
  rm aan.tar.gz
  mv aan repo-exclude/
fi

tar -xzf repo-include/database-dump.tar.gz
mongorestore database-dump
rm -rf database-dump
cat repo-include/database-changes.js | mongo
