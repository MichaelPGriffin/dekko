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

    const { metricValue: debt, filing_date } = await Liabilities(symbol, periodOffset);
    const { metricValue: equity } = await Equity(symbol, periodOffset);

    const response = {
        statusCode: 200,
        body: JSON.stringify({
            symbol,
            debt,
            equity,
            value: debt / equity,
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
    
    const url = `https://api.polygon.io/vX/reference/financials?ticker=${symbol}&filing_date.lte=${date}1&timeframe=quarterly&order=desc&limit=${periodOffset + 1}&sort=period_of_report_date&apiKey=${POLYGON_API_KEY}`;
    const { data } = await axios.get(url);

    return data.results[periodOffset];
};


const Liabilities = async (symbol, periodOffset) => await FindMetric(symbol, ['liabilities'], periodOffset);
const Equity = async (symbol, periodOffset) => await FindMetric(symbol, ['equity'], periodOffset);


/* Details:
Return on Equity

    Per Investopedia:
    ROE = Net Income / Shareholder Equity

    Property names in payload:
        'net_income_loss'
        'equity'
*/
