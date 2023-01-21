#!/usr/bin/env sh
PROJECT_PATH='/c/Users/Owner/Projects/dekko'
BRANCH_NAME=$1

# Create directory if it does not exist.
mkdir -p $PROJECT_PATH/.refs/branch-contents/
mkdir -p $PROJECT_PATH/.refs/branch-contents/$BRANCH_NAME

# Copy roster file to track state
cp $PROJECT_PATH/.refs/roster $PROJECT_PATH/.refs/branch-contents/$BRANCH_NAME/roster

# Copy csvs
cp -r $PROJECT_PATH/StockPricetimeseries/responses/ $PROJECT_PATH/.refs/branch-contents/$BRANCH_NAME/responses/

# Copy tsv for convenient spreadsheeting
cp $PROJECT_PATH/StockPricetimeseries/data/closing-prices.tsv $PROJECT_PATH/.refs/branch-contents/$BRANCH_NAME/closing-prices.tsv
