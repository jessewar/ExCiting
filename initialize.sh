#!/bin/bash

#Initializes the project by extracting data, running preprocesing, etc

cd data/repo-include
tar -xzf aanrelease2013.tar.gz
mv aan ../repo-exclude/

tar -xzf database-dump.tar.gz
mongorestore database-dump
rm -rf database-dump
