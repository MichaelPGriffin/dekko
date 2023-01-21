#!/usr/bin/env sh
PROJECT_PATH='/c/Users/Owner/Projects/dekko'
BRANCH_NAME=$1

rm -rf $PROJECT_PATH/StockPriceTimeseries/data/
mkdir $PROJECT_PATH/StockPriceTimeseries/data/
rm -rf $PROJECT_PATH/StockPriceTimeSeries/responses/
mkdir $PROJECT_PATH/StockPriceTimeSeries/responses/
node $PROJECT_PATH/StockPriceTimeseries/src/main.js 
paste $PROJECT_PATH/StockPricetimeseries/responses/*.csv | awk '{print (NR==1?"#":NR-1) "\t" $0}' > $PROJECT_PATH/StockPriceTimeseries/data/closing-prices.tsv & echo 'CSVs are combined. See ./data/closing-prices.tsv'

# Copy to branch directory
if [ $BRANCH_NAME != "initial" ]
then
    eval '$PROJECT_PATH/StockPriceTimeSeries/persist-branch.sh $BRANCH_NAME'
fi
