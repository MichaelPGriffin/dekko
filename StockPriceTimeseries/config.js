export const queryParameters = Object.freeze({
 'apikey': 'K7DBHWUB9MKLFAXCFAYYM8JXKTFXNKME',
 'frequencyType': 'daily',
 'periodType': 'ytd'
});

export const batchSize = 5;

// Insert a delay to avoid violating TOS.
const msBetweenRequests = 10000;

export const sleep = async () => await new Promise(resolve => setTimeout(resolve, msBetweenRequests));
