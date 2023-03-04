import axios from 'axios';
import getsecret from 'getsecret';

const secret = await getsecret('polygon-api-key');
const { POLYGON_API_KEY } = secret;

export const handler = async(event) => {
    let { symbol, periodOffset } = event.queryStringParameters;
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

    const { metricValue: lastQuarterSales, filing_date } = await Sales(symbol, periodOffset);
    const preceding3Quarters = await Preceding3QuartersTotalSales(symbol, periodOffset);
    const sales = lastQuarterSales + preceding3Quarters;
    
    const market_cap = await MarketCap(symbol, filing_date);

    const response = {
        statusCode: 200,
        body: JSON.stringify({
            symbol,
            sales,
            market_cap,
            value: market_cap / sales,
            filing_date 
        }),
    };

    return response;
};

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

    return data.results[periodOffset];
};


const Sales = async (symbol, periodOffset) => await FindMetric(symbol, ['revenues'], periodOffset);

const Preceding3QuartersTotalSales = async (symbol, periodOffset) => {
    console.log('****************');
    console.log(periodOffset + 1);
    console.log('****************');
    const secondMostRecentSales = Sales(symbol, periodOffset + 1);
    const thirdMostRecentSales = Sales(symbol, periodOffset + 2);
    const fourthMostRecentSales = Sales(symbol, periodOffset + 3);
    
    const requests = [secondMostRecentSales, thirdMostRecentSales, fourthMostRecentSales];
    const results = await Promise.allSettled(requests);

    let total = 0;
    for (const result of results) {
        total += result.value.metricValue;
    }

    return total;
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


/* Details:
Price to Sales ratio
    Per Investopedia:The P/S ratio is an investment valuation ratio that shows a company's market capitalization divided by the company's sales for the previous 12 months.

*/
