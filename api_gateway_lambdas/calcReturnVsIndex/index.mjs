import axios from 'axios';
import getsecret from 'getsecret';

const secret = await getsecret('polygon-api-key');
const { POLYGON_API_KEY } = secret;

const BENCHMARK_INDEX = 'SP';

export const handler = async(event) => {
    let { symbol, periodOffset, periodCount } = event.queryStringParameters;
    periodOffset = Number.parseInt(periodOffset, 10);
    periodCount = Number.parseInt(periodCount, 10);

    const noSymbol = !symbol;
    const invalidPeriodOffset = Number.isNaN(periodOffset) || periodOffset < 0;
    const invalidperiodCount = Number.isNaN(periodCount) || periodCount < 1;

    if (noSymbol || invalidPeriodOffset || invalidperiodCount) {
        const response = {
            statusCode: 400,
            body: JSON.stringify('Bad request: Invalid `symbol`, `periodOffset`, `periodCount` parameters')
        };
        
        return response;
    }

    const filing_date = await GetFilingDate(symbol, periodOffset);
    const previous_filing_date = await GetFilingDate(symbol, periodOffset + periodCount);
    
    const stock_return = await ComputePeriodReturn(symbol, filing_date, previous_filing_date);
    const index_return = await ComputePeriodReturn(BENCHMARK_INDEX, filing_date, previous_filing_date);

    const response = {
        statusCode: 200,
        body: JSON.stringify({
            symbol,
            stock_return,
            index_return,
            value: stock_return - index_return,
            filing_date,
            previous_filing_date
        }),
    };

    return response;
};

const ComputePeriodReturn = async (symbol, filing_date, previous_filing_date) => {
    const startPrice = await SharePrice(symbol, previous_filing_date);
    const endPrice = await SharePrice(symbol, filing_date);
    
    return (endPrice - startPrice) / startPrice;
};

const SharePrice = async (symbol, date) => {
    let status = null;
    let share_price = null;

    const retryCriteria = [null, 404];
    
    do {
        try {
            const url = `https://api.polygon.io/v1/open-close/${symbol}/${date}?adjusted=true&apiKey=${POLYGON_API_KEY}`;
            const res = await axios.get(url);
            status = res.status;
            share_price = res.data.close;
        } catch {
            date = DecrementDate(date);
        }
    } while (retryCriteria.includes(status));
    
    return share_price;
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

const GetFilingDate = async (symbol, periodOffset) => {
    const { filing_date } = await FindMetric(symbol, ['filing_date'], periodOffset);
    
    return filing_date;
};

const FindMetric = async (symbol, metricNames, periodOffset, periodCount) => {
    const mostRecentFinancials = await RequestStockData(symbol, periodOffset, periodCount);
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


/* Details:
    Calculate stock return relative to S & P 500 over the same period.
*/
