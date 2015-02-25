#!/bin/bash
for file in ../data/paper_subset/raw/*.txt
do
    filename="${file#*raw/}"
    filename="${filename%.txt}"
    echo "Parsing $filename"
    ../../parscit/bin/citeExtract.pl -m extract_all $file > ../data/paper_subset/chunks/"$filename.xml" 
    # Get rid of it incase we have an interrupt
    rm $file
done
