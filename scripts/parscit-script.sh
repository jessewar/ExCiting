#!/bin/bash
for file in /home/jesse/Classes/CSE454/paper-dir/*.txt
do
    filename=${file:37}
    name=${filename:0:`expr index "$filename" .`-1}
    /home/jesse/Classes/CSE454/parscit/bin/citeExtract.pl -m extract_all $file > /home/jesse/Classes/CSE454/paper-dir/output/"$name.xml" 
done
