export const FIVE_MINS = (60 * 60 * 1000);
export const ONE_YEAR_AGO = (356 * 24 * 60 * 60 * 1000)

export const loadDate = (name: string) => {
    const rtn = window.localStorage.getItem(name) || "";
    if (!rtn || rtn === 'NaN') return undefined;
    else {
        return new Date(parseInt(rtn))
    };
}

const saveValue = (name: string, value: any) => localStorage.setItem(name, value)

export const GetDates = () => {
    const currentDate = new Date();
    const fiveMinsAgo = new Date(currentDate.getTime() - ONE_YEAR_AGO)

    let loadedStart = LoadStartDate();
    let loadedEnd = LoadEndDate();

    if (loadedStart) {
        if (loadedStart > currentDate) loadedStart = fiveMinsAgo;
    } else {
        loadedStart = fiveMinsAgo;
    }

    if (loadedEnd) {
        if (loadedEnd > currentDate) loadedEnd = new Date();
    } else {
        loadedEnd = new Date();
    }

    return { start: loadedStart, end: loadedEnd, curr: currentDate }
}

export const SaveStartDate = (d: Date) => saveValue('startDate', d.getTime());
export const LoadStartDate = () => loadDate('startDate');
export const SaveEndDate = (d: Date) => saveValue('endDate', d.getTime());
export const LoadEndDate = () => loadDate('endDate');