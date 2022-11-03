import * as Dates from '../Dates'


let currentDate = new Date();
let fiveMinsAgo = new Date(currentDate.getTime() - Dates.FIVE_MINS)

describe('Load Dates', () => {
    beforeEach(() => {
        currentDate = new Date();
        fiveMinsAgo = new Date(currentDate.getTime() - Dates.FIVE_MINS)
    })

    test('should save and load date', () => {
        Dates.SaveStartDate(currentDate);
        const loaded = Dates.LoadStartDate()!;

        expect(loaded).toBeTruthy();
        expect(loaded).toBeInstanceOf(Date)
        expect(loaded.getTime()).toBe(currentDate.getTime());
    });

    test('dates should exist', () => {
        const d = Dates.GetDates();

        expect(d.start).toBeTruthy();
        expect(d.end).toBeTruthy();
    });

    test('Default to current date if no saved data found', () => {
        const d = Dates.GetDates();

        expect(d.start).toBeInstanceOf(Date);
        expect(d.end).toBeInstanceOf(Date);

        // Account for minor differences in current time
        let diff = currentDate.getTime() - d.curr.getTime();
        expect(diff).toBeLessThanOrEqual(50)

        diff = currentDate.getTime() - d.end.getTime();
        expect(diff).toBeLessThanOrEqual(50)
    });

    test('Load saved date if stored data found', () => {
        const dateToStore = new Date(currentDate.getTime() - (60 * 60 * 1000)); // Minus one hour

        Dates.SaveStartDate(dateToStore);

        const d = Dates.GetDates();

        expect(d.start.getTime()).toBe(dateToStore.getTime());
    });

    test('should default to current date if future date is stored', () => {
        const endDateToStore = new Date(currentDate.getTime() + (2 * (60 * 60 * 1000))); // Plus two hours
        const startDateToStore = new Date(currentDate.getTime() + (1 * (60 * 60 * 1000))); // Plus one hour

        Dates.SaveEndDate(endDateToStore);
        Dates.SaveStartDate(startDateToStore);

        const d = Dates.GetDates();

        // Account for minor differences in current time
        let diff = currentDate.getTime() - d.end.getTime();
        expect(diff).toBeLessThanOrEqual(10)

        diff = fiveMinsAgo.getTime() - d.start.getTime();
        expect(diff).toBeLessThanOrEqual(10)
    });
});