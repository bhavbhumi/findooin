import { describe, it, expect, vi, beforeEach } from "vitest";
import { createActionGuard, throttle, debounce } from "@/lib/throttle";

describe("createActionGuard", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  it("allows first action", () => {
    const guard = createActionGuard(1000);
    expect(guard("like")).toBe(true);
  });

  it("blocks rapid duplicate actions", () => {
    const guard = createActionGuard(1000);
    expect(guard("like")).toBe(true);
    expect(guard("like")).toBe(false);
  });

  it("allows action after cooldown", () => {
    const guard = createActionGuard(500);
    expect(guard("like")).toBe(true);
    vi.advanceTimersByTime(600);
    expect(guard("like")).toBe(true);
  });

  it("tracks different keys independently", () => {
    const guard = createActionGuard(1000);
    expect(guard("like")).toBe(true);
    expect(guard("bookmark")).toBe(true);
    expect(guard("like")).toBe(false);
  });
});

describe("throttle", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  it("executes immediately on first call", () => {
    const fn = vi.fn();
    const throttled = throttle(fn, 500);
    throttled();
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("blocks calls within throttle window", () => {
    const fn = vi.fn();
    const throttled = throttle(fn, 500);
    throttled();
    throttled();
    throttled();
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("allows call after delay", () => {
    const fn = vi.fn();
    const throttled = throttle(fn, 500);
    throttled();
    vi.advanceTimersByTime(600);
    throttled();
    expect(fn).toHaveBeenCalledTimes(2);
  });
});

describe("debounce", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  it("delays execution", () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 300);
    debounced();
    expect(fn).not.toHaveBeenCalled();
    vi.advanceTimersByTime(350);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("resets timer on rapid calls", () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 300);
    debounced();
    vi.advanceTimersByTime(100);
    debounced();
    vi.advanceTimersByTime(100);
    debounced();
    vi.advanceTimersByTime(350);
    expect(fn).toHaveBeenCalledTimes(1);
  });
});
