import { expect, test } from "vitest";
import {
  base64ToBuffer,
  bufferToBase64,
  decryptData,
  deriveKey,
  encryptData,
} from "./crypto";

test("base64", async () => {
  const data = new Uint8Array([1, 2, 3, 4, 5, 254]);
  const serialized = await bufferToBase64(data);
  const deserialized = await base64ToBuffer(serialized);
  expect(new Uint8Array(deserialized)).toEqual(data);
  expect(document.createElement("div"));
});

test("crypto", async () => {
  const secret = "secret";
  const data = `{"example":"data"}`;
  const key = await deriveKey(secret);
  const encrypted = await encryptData(key, data);
  const decrypted = await decryptData(key, encrypted);
  expect(decrypted).toBe(data);
});
