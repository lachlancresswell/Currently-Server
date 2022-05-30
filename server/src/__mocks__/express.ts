const mock = jest.fn().mockImplementation(() => {
    return {
        use: jest.fn(),
        listen: jest.fn(),
        all: jest.fn((path, cb) => cb(path)),
        get: jest.fn((path, cb) => cb(path)),
        connection: {
            encrypted: true
        }
    };
});

Object.defineProperty(mock, "static", { value: jest.fn() });
Object.defineProperty(mock, "json", { value: jest.fn() });

export default mock; 
