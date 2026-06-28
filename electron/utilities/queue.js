export default class Queue {
  constructor() {
    this.items = [];
    this.head = 0;
  }

  enqueue(item) {
    this.items.push(item);
  }

  dequeue() {
    if (this.isEmpty()) return undefined;

    const item = this.items[this.head];
    this.head++;

    if (this.head > 50 && this.head * 2 >= this.items.length) {
      this.items = this.items.slice(this.head);
      this.head = 0;
    }

    return item;
  }

  top() {
    return this.isEmpty() ? undefined : this.items[this.head];
  }

  isEmpty() {
    return this.head >= this.items.length;
  }

  size() {
    return this.items.length - this.head;
  }

  clear() {
    this.items = [];
    this.head = 0;
  }
}