export const truncate = (value: string, digits: number) => {
    if (!value) return '';
    const [intPart, fracPart = ''] = value.split('.');
    if (digits == null || digits <= 0) return intPart + '.';
    return intPart + '.' + fracPart.slice(0, digits).padEnd(digits, '0');
};

export function debounce<T extends (...args: Parameters<T>) => ReturnType<T>>(
    func: T,
    wait: number
): ((...args: Parameters<T>) => void) & { cancel: () => void } {
    let timeout: ReturnType<typeof setTimeout>;

    const debounced = (...args: Parameters<T>): void => {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
            func(...args);
        }, wait);
    };

    debounced.cancel = () => {
        clearTimeout(timeout);
    };

    return debounced;
}
