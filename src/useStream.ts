import { useEffect, useState } from 'react';

import TypedStream from './typedStream';

export default function useStream<T>(stream: TypedStream<T>) {
    const [value, setValue] = useState<T>();

    useEffect(() => {
        stream.on(value => setValue(value));
    }, [stream]);

    return value;
}
