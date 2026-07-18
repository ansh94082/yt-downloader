class Queue {
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

  remove(id) {
    this.items = this.items.filter((item) => item.id !== id);

    if (this.head >= this.items.length) {
      this.head = Math.max(0, this.items.length - 1);
    }

    return true;
  }

  clear() {
    this.items = [];
    this.head = 0;
  }
}

const downloadQueue = new Queue();

export default downloadQueue;