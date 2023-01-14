import { equal } from 'assert';
import { Queue } from '../../src/Queue.js';

describe('Queue', function() {
  const q = new Queue();
  q.enqueue(123);

  describe('enqueue()', function() {
    it('Places a new member in the queue', function() {
      const queuedElement = q.next();
      equal(queuedElement, 123);
    });
  });

  describe('next()', function() {
    it('Returns the earliest-added item from the queue', function() {
      const queuedElement = q.next();
      equal(queuedElement, 123);
    });
  });

  describe('dequeue()', function() {
    it(
        'Removes the earliest-added item from the queue and returns it',
        function() {
          const queuedElement = q.dequeue();
          equal(queuedElement, 123);
          equal(q.next(), null);
        });
  });

  describe('count()', function() {
    it(
        'Returns the count of items in the queue',
        function() {
          const items = ['a', 1, NaN, undefined, null];
          items.forEach(i => q.enqueue(i));
          equal(q.count(), items.length);
        });
  });

  describe('FIFO property', function() {
    it(
        'The order of items dequeued matches the order they were enqueued',
        function() {
          const items = ['a', 1, null, undefined, NaN];
          const fifoPropertyQueue = new Queue();

          for (let i = 0; i < items.length; i++) {
            fifoPropertyQueue.enqueue(items[i]);
          }

          let current = null;
          let i = 0;
          while (fifoPropertyQueue.next() !== null) {
            current = fifoPropertyQueue.dequeue();
            equal(current, items[i]);
            i++;
          }
        });
  });
});
