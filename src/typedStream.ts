import { Stream } from 'stream';

type Listener<T> = (value: T) => void;

export default class TypedStream<T> {
    private readonly stream: Stream;

    constructor(stream: Stream | null = null) {
        if (stream == null) {
            this.stream = new Stream();
        } else {
            this.stream = stream;
        }
    }

    write(value: T) {
        this.stream.emit('data', value);
    }

    on(listener: Listener<T>): TypedStream<T> {
        return new TypedStream(this.stream.on('data', listener));
    }
}
