const multicastDns = jest.fn(() => ({
    on: jest.fn(),
    query: jest.fn(),
    respond: jest.fn(),
    destroy: jest.fn(),
}));

export default multicastDns;