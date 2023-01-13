export const symbols = [
  // 'QQQ',
  // 'PYPL',
  // 'O',
  // 'TEAM',

  'STAG',
  'ILMN',
  'BRK.B',
  'DIS',
  'JNJ',
  'NLY',
  'PBCT',
  'QQQ',
  'SPY',
  'QYLD'

  // 'MMM',
  // 'AOS',
  // 'ABT',
  // 'ABBV',
  // 'ABMD',
  // 'ACN',
  // 'ATVI',
  // 'ADM',
  // 'ADBE',
  // 'AAP',
  // 'AMD',
  // 'AES',
  // 'AFL',
  // 'A',
  // 'APD',
  // 'AKAM',
  // 'ALK',
  // 'ALB',
  // 'ARE',
  // 'ALGN',
  // 'ALLE',
  // 'LNT',
  // 'ALL',
  // 'GOOGL',
  // 'GOOG',
  // 'MO',
  // 'AMZN',
  // 'AMCR',
  // 'AEE',
  // 'AAL',
  // 'AEP',
  // 'AXP',
  // 'AIG',
  // 'AMT',
  // 'AWK',
  // 'AMP',
  // 'ABC',
  // 'AME',
  // 'AMGN',
  // 'APH',
  // 'ADI',
  // 'ANSS',
  // 'ANTM',
  // 'AON',
  // 'APA',
  // 'AAPL',
  // 'AMAT',
  // 'APTV',
  // 'ANET',
  // 'AJG'
];

export const queryParameters = Object.freeze({
 'apikey': 'K7DBHWUB9MKLFAXCFAYYM8JXKTFXNKME',
 'frequencyType': 'daily',
 'periodType': 'ytd'
});

export const batchSize = 10;

const msBetweenRequests = 10000;
export const sleep = async () => await new Promise(resolve => setTimeout(resolve, msBetweenRequests));
