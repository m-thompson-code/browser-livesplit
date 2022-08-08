/**
 * Solution using Native Date instance
 */
export const getClockFormat = (durationInMilliseconds: number): string => {
    const diff = Math.max(0, durationInMilliseconds);

    const milliseconds = Math.floor(diff / 10) % 100;
    const seconds = Math.floor(diff / 1000) % 60;
    const minutes = Math.floor(diff / 1000 / 60) % 60;
    const hours = Math.floor(diff / 1000 / 60 / 60) % 24;
    const days = Math.floor(diff / 1000 / 60 / 60 / 24);

    let result = "";

    if (days) {
        result = getAppendedDigits(result, days);
    }

    if (result || hours) {
        result = getAppendedDigits(result, hours);
    }

    if (result || minutes) {
        result = getAppendedDigits(result, minutes);
    }

    result = getAppendedDigits(result, seconds);

    result += `.${getPaddedDigit(milliseconds)}`;

    return result;
}

export const getAppendedDigits = (previousValue: string, nextValue: number): string => {
    if (previousValue) {
        return `${previousValue}:${getPaddedDigit(nextValue)}`;
    }

    return `${nextValue}`;
}

export const getPaddedDigit = (value: number): string => {
    return value >= 10 ? `${value}` : `0${value}`;
}
