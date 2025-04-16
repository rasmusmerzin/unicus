import { expect, test } from "vitest";
import { decryptData, deriveKey, encryptData } from "./crypto";

test("crypto", async () => {
  const secret = "secret";
  const data = `{"example":"data"}`;
  const key = await deriveKey(secret);
  const encrypted = await encryptData(key, data);
  const decrypted = await decryptData(key, encrypted);
  expect(decrypted).toBe(data);
});
