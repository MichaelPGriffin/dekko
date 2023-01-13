#!/usr/bin/env sh
rm -rf ./responses/
mkdir responses
node ./src/main.js 
paste ./responses/*.csv | awk '{print (NR==1?"#":NR-1) "\t" $0}' > ./data/closing-prices.tsv & echo 'CSVs are combined. See ./data/closing-prices.tsv'
