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

    // The most important thing to remember is that this metric will be the basis of
    // comparison between different stocks. The actual methodology isn't as important
    // as the relative-comparisons.
    const { metric_property_name, metricValue: earnings, filing_date } = await Earnings(symbol, periodOffset);

    const share_price = await GetPrice(symbol, filing_date);


    const response = {
        statusCode: 200,
        body: JSON.stringify({
            symbol,
            share_price,
            earnings,
            metric_property_name,
            value: share_price / earnings,
            filing_date
        }),
    };

    return response;
};

const GetPrice = async (symbol, date) => {
    let status = null;
    let price = null;

    const retryCriteria = [null, 404];

    // Want share price on same date as financial report. If none available for that day, look at the preceding day until finding a valid share price.
    do {
        try {
            const url = `https://api.polygon.io/v1/open-close/${symbol}/${date}?adjusted=true&apiKey=${POLYGON_API_KEY}`;
            const res = await axios.get(url);
            status = res.status;
            price = res.data.close;
        } catch {
            date = DecrementDate(date);
        }
    } while (retryCriteria.includes(status));

    return price;
};

const terminology = ['diluted_earnings_per_share', 'basic_earnings_per_share'];
const Earnings = async (symbol, periodOffset) => await FindMetric(symbol, terminology, periodOffset);

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
