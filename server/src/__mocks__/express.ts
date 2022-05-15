const mock = jest.fn().mockImplementation(() => {
    return {
        use: jest.fn(),
        listen: jest.fn(),
        all: jest.fn((path, cb) => cb(path))
    };
});

Object.defineProperty(mock, "static", { value: jest.fn() });

export default mock; 
