#!/bin/bash
for file in ../data/paper_subset/raw/*.txt
do
    filename="${file#*raw/}"
    filename="${filename%.txt}"
    ../../parscit/bin/citeExtract.pl -m extract_all $file > ../data/paper_subset/chunks/"$filename.xml" 
done
