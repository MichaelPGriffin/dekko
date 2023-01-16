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
    # Create directory if it does not exist.
    mkdir -p $PROJECT_PATH/.refs/branch-contents/    
    
    # Copy roster file to track state
    cp $PROJECT_PATH/.refs/roster $PROJECT_PATH/.refs/branch-contents/$BRANCH_NAME

    # Copy csvs
    cp -r $PROJECT_PATH/StockPricetimeseries/responses/ $PROJECT_PATH/.refs/branch-contents/$BRANCH_NAME

    # Copy tsv for convenient spreadsheeting
    cp $PROJECT_PATH/StockPricetimeseries/data/closing-prices.tsv $PROJECT_PATH/.refs/branch-contents/$BRANCH_NAME
fi
