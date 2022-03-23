import { test, expect } from "vitest";
import { getTransactionType } from "./get-transaction-type.js";

test("transaction.type = 1", () => {
  expect(getTransactionType({ type: 1 })).toBe(1);
});

test("transaction.type is string", () => {
  expect(() => getTransactionType({ type: "1" })).toThrow(
    /transaction.type must be number/
  );
});

test("transaction.maxFeePerGas is defined", () => {
  expect(getTransactionType({ maxFeePerGas: "0x1" })).toBe(2);
});

test("transaction.maxFeePerGas is defined", () => {
  expect(getTransactionType({ accessList: [] })).toBe(1);
});

test("transaction.gasPrice is defined", () => {
  expect(getTransactionType({ gasPrice: "0x1" })).toBe(0);
});
