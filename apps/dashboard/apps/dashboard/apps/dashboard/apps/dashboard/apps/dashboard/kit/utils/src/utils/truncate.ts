/**
 * Truncates a string if it's longer than the specified maximum length.
 * The truncated string will end with the omission string.
 *
 * @param string - The string to truncate
 * @param options - The options object
 * @param options.length - The maximum string length (default: 30)
 * @param options.omission - The string to indicate text is omitted (default: '...')
 * @param options.separator - The separator pattern to truncate to (string or regex)
 * @returns The truncated string
 *
 * @example
 * truncate('hello world', { length: 5 })
 * // => 'he...'
 *
 * @example
 * truncate('hello world', { length: 10, omission: ' [...]' })
 * // => 'hel [...]'
 *
 * @example
 * truncate('hello world', { length: 10, separator: ' ' })
 * // => 'hello...'
 *
 * @example
 * truncate('hello world', { length: 10, separator: /,? +/ })
 * // => 'hello...'
 */
export function truncate(
    string: string,
    options: {
        length?: number;
        omission?: string;
        separator?: string | RegExp;
    } = {},
): string {
    const { length = 30, omission = '...', separator } = options;

    if (string.length <= length) {
        return string;
    }

    const end = length - omission.length;

    if (end < 1) {
        return omission;
    }

    let result = string.slice(0, end);

    if (separator === undefined) {
        return result + omission;
    }

    // Handle separator
    if (typeof separator === 'string') {
        const separatorIndex = result.lastIndexOf(separator);
        if (separatorIndex > -1) {
            result = result.slice(0, separatorIndex);
        }
    } else if (separator instanceof RegExp) {
        // Find all matches
        const matches = Array.from(string.matchAll(new RegExp(separator, 'g')));
        // Find the last match that is within our result
        let lastMatchIndex = -1;
        for (const match of matches) {
            if (match.index !== undefined && match.index < end) {
                lastMatchIndex = match.index;
            } else {
                break;
            }
        }
        if (lastMatchIndex > -1) {
            result = result.slice(0, lastMatchIndex);
        }
    }

    return result + omission;
}
