/**
 * Wraps a promise in a timeout that rejects after a specified duration.
 * @param promise The promise to wrap
 * @param timeoutMs Timeout in milliseconds (default: 5000)
 * @param timeoutMessage Custom error message on timeout
 */
export const withTimeout = <T>(
    promise: Promise<T>,
    timeoutMs: number = 5000,
    timeoutMessage: string = 'O tempo limite da operação foi excedido.'
): Promise<T> => {
    let timeoutId: ReturnType<typeof setTimeout>;

    const timeoutPromise = new Promise<T>((_, reject) => {
        timeoutId = setTimeout(() => {
            reject(new Error(timeoutMessage));
        }, timeoutMs);
    });

    return Promise.race([
        promise.then((result) => {
            clearTimeout(timeoutId);
            return result;
        }),
        timeoutPromise,
    ]);
};
