import { MemoryStore } from "./cache-store";

describe("MemoryStore", () => {
  let store: MemoryStore<string>;
  beforeEach(() => {
    store = new MemoryStore<string>();
  });

  it("correct", async () => {
    await expect(store.get("key")).resolves.toBeUndefined();

    await store.set("key", "aaa");

    await expect(store.get("key")).resolves.toBe("aaa");
  });
});
