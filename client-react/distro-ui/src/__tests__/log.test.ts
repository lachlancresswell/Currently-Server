import { Logger } from '../log';


describe('asd', () => {
    test('should create new instance', () => {
        const name = 'logtest'
        const log = new Logger(name);
        expect(log).toBeInstanceOf(Logger);
        expect(log.name).toEqual(name);
    });

    test('should print log', () => {
        console.log = jest.fn();
        const log = new Logger('logtest');

        log.info('hello');
        expect((console.log as jest.Mock).mock.calls[0][0]).toContain('hello');
    })
});