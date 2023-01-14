import { batchSize, sleep } from '../config.js';
import { symbols } from '../../symbols.js';
import { getPriceHistories } from './priceHistoryJsonToCsv.js';

const governedRequests = async (collection) => {
  for(let start = 0; start < collection.length; start+=batchSize) {
    const end = Math.min(start + batchSize, collection.length);
    const symbolBatch = collection.slice(start, end);
    await getPriceHistories(symbolBatch);

    if (end <= collection.length) {
      await sleep();
    }
  }
};

await governedRequests(symbols);

console.log('Downloads are complete.');
