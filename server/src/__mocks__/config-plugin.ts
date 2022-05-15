// Import this named export into your test file:
export const mockStart = jest.fn();

const mockConfig = {
    deviceName: 'mockDeviceName',
    save: jest.fn()
}

const mockSaveConfig = jest.fn();
const mockSetValue = jest.fn((key: string, value: any) => true)

const mock = jest.fn().mockImplementation(() => {
    return {
        start: mockStart,
        config: mockConfig
    };
});

export default mock; 