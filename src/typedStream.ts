import { Stream } from 'stream';

type Listener<T> = (value: T) => void;

export default class TypedStream<T> {
    private readonly stream: Stream;

    private value?: T;

    constructor(stream: Stream | null = null) {
        if (stream == null) {
            this.stream = new Stream();
        } else {
            this.stream = stream;
        }
    }

    write(value: T) {
        this.stream.emit('data', value);
        this.value = value;
    }

    on(listener: Listener<T>): TypedStream<T> {
        if (this.value != null) {
            listener(this.value);
        }
        return new TypedStream(this.stream.on('data', listener));
    }
}
