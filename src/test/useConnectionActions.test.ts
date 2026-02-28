/**
 * Unit tests for ConnectionStatus type logic used in useConnectionActions.
 */
import { describe, it, expect } from "vitest";

interface ConnectionStatus {
  following: boolean;
  connected: "none" | "pending" | "accepted";
}

describe("ConnectionStatus state transitions", () => {
  it("starts with default unconnected state", () => {
    const initial: ConnectionStatus = { following: false, connected: "none" };
    expect(initial.following).toBe(false);
    expect(initial.connected).toBe("none");
  });

  it("transitions to following on follow", () => {
    const state: ConnectionStatus = { following: false, connected: "none" };
    const updated = { ...state, following: true };
    expect(updated.following).toBe(true);
  });

  it("transitions to pending on connect", () => {
    const state: ConnectionStatus = { following: true, connected: "none" };
    const updated = { ...state, connected: "pending" as const };
    expect(updated.connected).toBe("pending");
    // Following should be preserved
    expect(updated.following).toBe(true);
  });

  it("transitions to accepted on acceptance", () => {
    const state: ConnectionStatus = { following: true, connected: "pending" };
    const updated = { ...state, connected: "accepted" as const };
    expect(updated.connected).toBe("accepted");
  });

  it("transitions to none on disconnect", () => {
    const state: ConnectionStatus = { following: true, connected: "accepted" };
    const updated = { ...state, connected: "none" as const };
    expect(updated.connected).toBe("none");
    // Following should be preserved independently
    expect(updated.following).toBe(true);
  });

  it("transitions to not following on unfollow", () => {
    const state: ConnectionStatus = { following: true, connected: "accepted" };
    const updated = { ...state, following: false };
    expect(updated.following).toBe(false);
    // Connection should be preserved independently
    expect(updated.connected).toBe("accepted");
  });
});
