#!/usr/bin/env sh
cp ../../StockPriceTimeseries/responses/*csv ../time-series-data/
sed -i 1d ../time-series-data/*.csv
