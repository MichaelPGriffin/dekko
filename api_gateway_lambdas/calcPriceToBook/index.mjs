import axios from 'axios';
import getsecret from 'getsecret';

const secret = await getsecret('polygon-api-key');
const { POLYGON_API_KEY } = secret;

export const handler = async(event) => {
    const { symbol, periodOffset } = event.queryStringParameters;
    periodOffset = Number.parseInt(periodOffset, 10);

    const noSymbol = !symbol;
    const invalidPeriodOffset = Number.isNaN(periodOffset) || periodOffset < 0;
    if (noSymbol || invalidPeriodOffset) {
        const response = {
            statusCode: 400,
            body: JSON.stringify('Bad request: Invalid `symbol`, `periodOffset` parameters')
        };
        
        return response;
    }

    // If periodOffset is zero, it uses current market cap.
    // Otherwise it gets the market cap from the offset date.
    const { metricValue: book_value, metric_property_name, filing_date } = await FixedAssets(symbol, periodOffset);
    const market_cap = await MarketCap(symbol, filing_date);

    const response = {
        statusCode: 200,
        body: JSON.stringify({
            symbol,
            market_cap,
            book_value,
            metric_property_name,
            value: market_cap / book_value,
            filing_date
        }),
    };

    return response;
};

const MarketCap = async (symbol, date) => {
    let status = null;
    let market_cap = null;
    
    const retryCriteria = [null, 404];
    
    do {
        try {
            const url = `https://api.polygon.io/v3/reference/tickers/${symbol}?date=${date}&apiKey=${POLYGON_API_KEY}`;
            const res = await axios.get(url);
            status = res.status;
            market_cap = res.data.results.market_cap;
        } catch {
            date = DecrementDate(date);
        }
    } while (retryCriteria.includes(status));

    return market_cap;
};

// A list of synonymous terms referring to book value. Skip results where value is zero.
// Fixed assets are a subset of noncurrent assets used for production.
// It can wildly inflate the price-to-book metric. noncurrent_assets seems like the conventional choice.
const terminology = ['book_value', 'fixed_assets', 'noncurrent_assets', 'assets'];
const FixedAssets = async (symbol, periodOffset) => await FindMetric(symbol, terminology, periodOffset);


const FindMetric = async (symbol, metricNames, periodOffset) => {
    const mostRecentFinancials = await RequestStockData(symbol, periodOffset);
    const { filing_date } = mostRecentFinancials;

    const valuesToIgnore = [null, 0, Number.Infinity];

    const traverseForMetric = (pojo, metricName) => {
        for (let key in pojo) {
            if (typeof pojo[key] === "object") {
                if (key === metricName) {
                    metric_property_name = key;
                    if (Object.keys(pojo[metricName]).includes('value')) {
                        metricValue = pojo[metricName].value;
                    } else {
                        metricValue = pojo[metricName];
                    }

                    if (!valuesToIgnore.includes(metricValue)) {
                        return;
                    }
                }

                traverseForMetric(pojo[key], metricName);
            }
        }
    };

    // Use recursive traversal so any metric name can be specified.
    let metricValue = Number.Infinity;
    let metric_property_name = 'Not found';
    for (const metricName of metricNames) {
        traverseForMetric(mostRecentFinancials, metricName);
        if (!valuesToIgnore.includes(metricValue)) {
            break;
        }
    }
    
    return { metric_property_name, metricValue, filing_date };
};

const RequestStockData = async (symbol, periodOffset) => {
    const today = new Date();
    let monthNumber = `${today.getMonth() + 1}`;
    if (monthNumber.length < 2) {
        monthNumber = `0${monthNumber}`;
    }
    
    let dayNumber = `${today.getDate()}`;
    if (dayNumber.length < 2) {
        dayNumber = `0${dayNumber}`;
    }

    const date = `${today.getFullYear()}-${monthNumber}-${dayNumber}`;
    const url = `https://api.polygon.io/vX/reference/financials?ticker=${symbol}&filing_date.lte=${date}&timeframe=quarterly&order=desc&limit=${periodOffset + 1}&sort=period_of_report_date&apiKey=${POLYGON_API_KEY}`;
    const { data } = await axios.get(url);
    console.log(data.results[periodOffset].financials.balance_sheet);
    
    return data.results[periodOffset];
};

const DecrementDate = dateString => {
    // Expects a date string in YYYY-MM-DD format.
    const date = new Date(Date.parse(dateString));
    date.setDate(date.getDate() - 1);
    
    let month = (date.getMonth() + 1).toString();
    if (month.length < 2) {
        month = `0${month}`;
    }
    
    let day = date.getDate().toString();
    if (day.length < 2) {
        day = `0${day}`;
    }

    return `${date.getFullYear()}-${month}-${day}`;
};
