import axios from 'axios';
import getsecret from 'getsecret';

const secret = await getsecret('polygon-api-key');
const { POLYGON_API_KEY } = secret;

export const handler = async(event) => {
    const { symbol } = event.queryStringParameters;
    
    const noSymbol = !symbol;
    if (noSymbol) {
        return null;
    };
    
    console.log(`Getting market cap for symbol ${symbol}`);
    
    const market_cap = await getMarketCap(symbol);

    const response = {
        statusCode: 200,
        body: JSON.stringify({
            symbol,
            market_cap
        }),
    };

    return response;
};

const getMarketCap = async symbol => {
    const url = `https://api.polygon.io/v3/reference/tickers/${symbol}?apiKey=${POLYGON_API_KEY}`;
    const { data } = await axios.get(url);

    const { market_cap } = data.results;

    return market_cap;
}
