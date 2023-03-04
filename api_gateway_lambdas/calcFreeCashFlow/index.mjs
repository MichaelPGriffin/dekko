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

    // Can wrap this up in a driver method or something?
    const value = await freeCashFlow(symbol, periodOffset);
    const { filing_date } = await FindMetric(symbol, ['filing_date'], periodOffset);

    const response = {
        statusCode: 200,
        body: JSON.stringify({
            symbol,
            value,
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

const ebit = async (symbol, periodOffset) => await FindMetric(symbol, ['income_loss_from_continuing_operations_before_tax'], periodOffset);
const interestExpense = async (symbol, periodOffset) => await FindMetric(symbol, ['interest_expense_operating'], periodOffset);
const taxExpense = async (symbol, periodOffset) => await FindMetric(symbol, ['income_tax_expense_benefit'], periodOffset);

const changesInWorkingCapital = async (symbol, periodOffset) => {
    const currentAssets = await FindMetric(symbol, ['assets'], periodOffset);
    const currentLiabilities = await FindMetric(symbol, ['liabilities'], periodOffset);

    const previousPeriod = periodOffset + 1;
    const previousAssets = await FindMetric(symbol, ['assets'], previousPeriod);
    const previousLiabilities = await FindMetric(symbol, ['liabilities'], previousPeriod);
    
    const change = (currentAssets.metricValue - currentLiabilities.metricValue) - (previousAssets.metricValue - previousLiabilities.metricValue);

    return change;
};

const capex = async (symbol, periodOffset) => {
    const terminology = ['fixed_assets', 'noncurrent_assets'];
    const currentPpe = await FindMetric(symbol, terminology, periodOffset);

    const previousPeriod = periodOffset + 1;
    const previousPpe = await FindMetric(symbol, terminology, previousPeriod);

    const result = currentPpe.metricValue - previousPpe.metricValue;

    return result;
};

const freeCashFlow = async (symbol, periodOffset) => {
    const ebitCalc = (await ebit(symbol, periodOffset)).metricValue;
    const interestExpenseCalc = (await interestExpense(symbol, periodOffset)).metricValue;
    const taxExpenseCalc = (await taxExpense(symbol, periodOffset)).metricValue;
    const changesInWorkingCapitalCalc = await changesInWorkingCapital(symbol, periodOffset);
    const capexCalc = await capex(symbol, periodOffset);

    const result = ebitCalc - interestExpenseCalc - taxExpenseCalc - changesInWorkingCapitalCalc - capexCalc;

    return result;
};

/* Details:
*
Element Source
Earnings before interest and taxes (EBIT)	Current Income Statement 
+ Depreciation & Amortization	Current Income Statement 
- Taxes	Current Income Statement
- Changes in Working Capital	Prior & Current Balance Sheets: Current Assets and Liability accounts
- Capital expenditure (CAPEX)	Prior & Current Balance Sheets: Property, Plant and Equipment accounts
= Free Cash Flow	

_________________
Notes:
    Re. EBIT: Metric name looks like 'income_loss_from_continuing_operations_before_tax'. 
    This should include interest per article:
        https://www.insee.fr/en/metadonnees/definition/c1200#:~:text=Pre%2Dtax%20profit%2Floss%20is,of%20goods%20and%20services)%3A
    But there is also an `interest_expense_operating` metric. Could just use this in equation if given.
    And there is income_tax_expense_benefit.

And for balance sheets, need to compare the current one and the next preceding.
    Changes in Working Capital: current_assets_minus_liabilities - previous_assets_minus_liabilities.
    Capital Expenditure: current_property_plant_and_equipment - previous_property_plan_and_equipment.
*/
