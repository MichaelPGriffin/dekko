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

    const filing_date = await GetFilingDate(symbol, periodOffset);
    const dividends_per_share = await Last12MonthsDividends(symbol, filing_date);
    const share_price = await SharePrice(symbol, filing_date);

    const response = {
        statusCode: 200,
        body: JSON.stringify({
            symbol,
            dividends_per_share,
            share_price,
            value: dividends_per_share / share_price,
            filing_date
        }),
    };

    return response;
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

const Last12MonthsDividends = async (symbol, filing_date) => {
    const endDate = filing_date;
    const startDate = BuildStartDate(filing_date);

    const dateCriteria = `ex_dividend_date.gte=${startDate}&ex_dividend_date.lte=${endDate}`;
    const prefix = `https://api.polygon.io/v3/reference/dividends`;
    const sortConfig = 'order=desc&sort=ex_dividend_date';

    const url = `${prefix}?ticker=${symbol}&${dateCriteria}&${sortConfig}&apiKey=${POLYGON_API_KEY}`;
    const { data } = await axios.get(url);

    let dividendSum = 0;

    for (const payment of data.results) {
        dividendSum += payment.cash_amount;
    }

    return dividendSum;
};

const BuildStartDate = filing_date => {
    // Approximate a threshold likely to contain all dividend payments for the quarter.
    const startDate = new Date(Date.parse(filing_date));
    const monthsPerQuarter = 3;
    const quartersPerYear = 4;
    const daysPerMonth = 31;
    startDate.setDate(startDate.getDate() - (daysPerMonth * monthsPerQuarter * quartersPerYear));

    let month = (startDate.getMonth() + 1).toString();
    if (month.length < 2) {
        month = `0${month}`;
    }
    
    let day = startDate.getDate().toString();
    if (day.length < 2) {
        day = `0${day}`;
    }

    return `${startDate.getFullYear()}-${month}-${day}`;
};

const GetFilingDate = async (symbol, periodOffset) => {
    const { filing_date } = await FindMetric(symbol, ['filing_date'], periodOffset);
    
    return filing_date;
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


/* Details:

Dividend Yield Ratio: Annual Dividends Per Share / Current Share Price

*/
