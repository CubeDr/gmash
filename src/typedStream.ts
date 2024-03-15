import { Stream } from 'stream';

type Listener<T> = (value: T) => void;

export default class TypedStream<T> {
  private readonly stream: Stream;

  private current?: T;
  get value() {
    return this.current;
  }

  constructor(stream: Stream | null = null) {
    if (stream == null) {
      this.stream = new Stream();
    } else {
      this.stream = stream;
    }
  }

  write(value: T) {
    this.stream.emit('data', value);
    this.current = value;
  }

  on(listener: Listener<T>): TypedStream<T> {
    if (this.current != null) {
      listener(this.current);
    }
    return new TypedStream(this.stream.on('data', listener));
  }

  remove(listener: Listener<T>) {
    this.stream.off('data', listener);
  }
}
