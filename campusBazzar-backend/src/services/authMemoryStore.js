const authMemoryStore = globalThis.__campusBazzarAuthMemoryStore ?? {
  users: new Map(),
  otps: new Map(),
};

globalThis.__campusBazzarAuthMemoryStore = authMemoryStore;

export default authMemoryStore;