export const secureStorageMock = {
  clear: jest.fn(),
  clearCredentials: jest.fn(),
  containsKey: jest.fn(),
  getAllKeys: jest.fn(),
  getCredentials: jest.fn(),
  getItem: jest.fn(),
  getSize: jest.fn(),
  removeItem: jest.fn(),
  setCredentials: jest.fn(),
  setItem: jest.fn(),
};

export const defaultStorageMock = {
  clear: jest.fn(),
  containsKey: jest.fn(),
  getAllKeys: jest.fn(),
  getItem: jest.fn(),
  getItemSync: jest.fn(),
  getJSON: jest.fn(),
  getJSONSync: jest.fn(),
  getSize: jest.fn(),
  removeItem: jest.fn(),
  removeItemSync: jest.fn(),
  setItem: jest.fn(),
  setItemSync: jest.fn(),
  setJSON: jest.fn(),
  setJSONSync: jest.fn(),
};

export const zustandStorageMock = {
  getItem: jest.fn(),
  removeItem: jest.fn(),
  setItem: jest.fn(),
};
