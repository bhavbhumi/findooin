import { describe, it, expect } from "vitest";
import { isDisposableEmail, DISPOSABLE_EMAIL_ERROR } from "@/lib/disposable-email-domains";

describe("isDisposableEmail", () => {
  it("blocks known disposable domains", () => {
    expect(isDisposableEmail("test@guerrillamail.com")).toBe(true);
    expect(isDisposableEmail("test@mailinator.com")).toBe(true);
    expect(isDisposableEmail("test@yopmail.com")).toBe(true);
    expect(isDisposableEmail("test@10minutemail.com")).toBe(true);
    expect(isDisposableEmail("test@trashmail.com")).toBe(true);
    expect(isDisposableEmail("test@maildrop.cc")).toBe(true);
    // Domains found in real abuse logs
    expect(isDisposableEmail("test@onbap.com")).toBe(true);
    expect(isDisposableEmail("test@soco7.com")).toBe(true);
    expect(isDisposableEmail("test@qvmao.com")).toBe(true);
  });

  it("allows legitimate email providers", () => {
    expect(isDisposableEmail("user@gmail.com")).toBe(false);
    expect(isDisposableEmail("user@yahoo.com")).toBe(false);
    expect(isDisposableEmail("user@outlook.com")).toBe(false);
    expect(isDisposableEmail("user@hotmail.com")).toBe(false);
    expect(isDisposableEmail("user@company.co.in")).toBe(false);
    expect(isDisposableEmail("user@findoo.in")).toBe(false);
    expect(isDisposableEmail("user@icicibank.com")).toBe(false);
    expect(isDisposableEmail("user@hdfcbank.com")).toBe(false);
  });

  it("is case-insensitive", () => {
    expect(isDisposableEmail("test@GUERRILLAMAIL.COM")).toBe(true);
    expect(isDisposableEmail("test@Mailinator.Com")).toBe(true);
    expect(isDisposableEmail("test@GMAIL.COM")).toBe(false);
  });

  it("handles edge cases gracefully", () => {
    expect(isDisposableEmail("")).toBe(false);
    expect(isDisposableEmail("noemailhere")).toBe(false);
    expect(isDisposableEmail("@")).toBe(false);
    expect(isDisposableEmail("user@")).toBe(false);
  });

  it("exports a user-friendly error message", () => {
    expect(DISPOSABLE_EMAIL_ERROR).toBeTruthy();
    expect(DISPOSABLE_EMAIL_ERROR.length).toBeGreaterThan(10);
  });
});
