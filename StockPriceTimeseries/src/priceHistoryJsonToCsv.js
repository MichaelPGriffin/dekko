import { createObjectCsvWriter } from 'csv-writer';
import { requestPriceHistory } from './requestPriceHistory.js';

export const getPriceHistories = async stockSymbols => {
  Promise.all(
    stockSymbols.map(
      symbol => {
        _getPriceHistory(symbol);
      }
    )
  );
}

const _getPriceHistory = async stockSymbol => {
  const symbol = stockSymbol.toUpperCase();

  try {
    const response = await requestPriceHistory(symbol);

    const data = [];
    response.forEach(candle => {
      const { close: closingPrice } = candle;
      data.push({ 'name': closingPrice });
    });

    _writeToCsv(symbol, data);
  } catch(error) {
    throw new Error(`Encountered error for symbol ${symbol}: error`);
  }
}

const  _writeToCsv = (symbol, data) => {
  const csvWriter = createObjectCsvWriter({
    path: `/Users/Owner/Projects/dekko/StockPriceTimeseries/responses/${symbol}.csv`,
    header: [
      //TODO: Would be nice to omit headers entirely instead of using placeholder.
      { id: 'name', title: `${symbol}` }
    ]
  });

  csvWriter
    .writeRecords(data)
    .then(() => console.log(`The ${symbol} data has been written to csv`));
}
