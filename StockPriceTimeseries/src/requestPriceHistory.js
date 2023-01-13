import querystring from 'query-string';
import got from 'got';
import { queryParameters } from '../config.js';

export async function requestPriceHistory(stockSymbol) {
  const requestArgs = querystring.stringify(queryParameters);

  const options = {
    hostname: 'api.tdameritrade.com',
    path: `/v1/marketdata/${stockSymbol}/pricehistory?`,
  };

  const response = await got.get(`https://${options.hostname}${options.path}${requestArgs}`).json();

  return response.candles;
}
