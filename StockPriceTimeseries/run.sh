#!/usr/bin/env sh
rm -rf /c/Users/Owner/Projects/dekko/StockPriceTimeseries/data/
mkdir /c/Users/Owner/Projects/dekko/StockPriceTimeseries/data/
rm -rf /c/Users/Owner/Projects/dekko/StockPriceTimeSeries/responses/
mkdir /c/Users/Owner/Projects/dekko/StockPriceTimeSeries/responses/
node /c/Users/Owner/Projects/dekko/StockPriceTimeseries/src/main.js 
paste /c/Users/Owner/Projects/dekko/StockPricetimeseries/responses/*.csv | awk '{print (NR==1?"#":NR-1) "\t" $0}' > /c/Users/Owner/Projects/dekko/StockPriceTimeseries/data/closing-prices.tsv & echo 'CSVs are combined. See ./data/closing-prices.tsv'
