// Import this named export into your test file:
export const mockStart = jest.fn();
export const mockRegisterEndpoint = jest.fn((path: string, cb: any) => {
    const get = (path: string) => '';
    const send = () => true;
    cb({
        get: get,
        url: 'localhost'
    }, {
        send: send
    });
});
export const mockProxy = jest.fn();

const mockConfig = {
    deviceName: 'mockDeviceName',
    save: jest.fn(),
    setValue: jest.fn()
}

const mock = jest.fn().mockImplementation(() => {
    return {
        start: mockStart,
        registerEndpoint: mockRegisterEndpoint,
        proxy: mockProxy,
        config: mockConfig
    };
});

export default mock; 