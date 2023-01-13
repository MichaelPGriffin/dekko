class _Node {
  constructor(data) {
    this.data = data;
    this.next = null;
  }
}

export class Queue {
  constructor() {
    this._front = null;
    this._end = null;
    this._count = 0;
  }

  enqueue(data) {
    if (this._front === null) {
      this._front = new _Node(data);
      this._end = this._front;
    } else {
      const tmp = new _Node(data);
      this._end.next = tmp;
      this._end = this._end.next;
    }

    this._count++;
  }

  next() {
    if (this._front === null) {
      return null;
    }

    return this._front.data;
  }

  dequeue() {
    if (this._front === null) {
      return null;
    }

    const result = this._front;
    this._front = this._front.next;

    if (this._count > 0) {
      this._count--;
    }

    return result.data;
  }

  count() {
    return this._count;
  }
}
