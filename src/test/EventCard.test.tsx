import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { EventCard } from "@/components/events/EventCard";
import type { EventData } from "@/hooks/useEvents";

const futureDate = new Date();
futureDate.setDate(futureDate.getDate() + 7);
const endDate = new Date(futureDate);
endDate.setHours(endDate.getHours() + 2);

const mockEvent: EventData = {
  id: "evt-1",
  organizer_id: "user-1",
  title: "Fintech Innovation Summit",
  description: "Annual fintech conference",
  category: "industry_conference",
  event_mode: "hybrid",
  banner_url: null,
  venue_name: "Taj Lands End",
  venue_address: "Mumbai",
  virtual_link: "https://zoom.us/j/123",
  start_time: futureDate.toISOString(),
  end_time: endDate.toISOString(),
  capacity: 200,
  registration_count: 45,
  is_free: true,
  status: "published",
  tags: ["fintech", "innovation"],
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  organizer_profile: {
    full_name: "Event Org",
    display_name: "EventOrg",
    avatar_url: null,
    verification_status: "verified",
  },
  is_registered: false,
};

describe("EventCard", () => {
  it("renders event title", () => {
    render(<EventCard event={mockEvent} />);
    expect(screen.getByText("Fintech Innovation Summit")).toBeInTheDocument();
  });

  it("renders organizer name", () => {
    render(<EventCard event={mockEvent} />);
    expect(screen.getByText("EventOrg")).toBeInTheDocument();
  });

  it("renders venue name for non-virtual events", () => {
    render(<EventCard event={mockEvent} />);
    expect(screen.getByText("Taj Lands End")).toBeInTheDocument();
  });

  it("renders capacity info", () => {
    render(<EventCard event={mockEvent} />);
    expect(screen.getByText("45/200")).toBeInTheDocument();
  });

  it("renders Free badge for free events", () => {
    render(<EventCard event={mockEvent} />);
    expect(screen.getByText("Free")).toBeInTheDocument();
  });

  it("renders Register button for non-registered users", () => {
    render(<EventCard event={mockEvent} />);
    expect(screen.getByText("Register")).toBeInTheDocument();
  });

  it("renders Registered button when user is registered", () => {
    const registered = { ...mockEvent, is_registered: true };
    render(<EventCard event={registered} />);
    expect(screen.getByText("Registered ✓")).toBeInTheDocument();
  });

  it("renders Full badge when event is at capacity", () => {
    const full = { ...mockEvent, registration_count: 200 };
    render(<EventCard event={full} />);
    expect(screen.getByText("Full")).toBeInTheDocument();
  });

  it("renders Ended badge for past events", () => {
    const past = { ...mockEvent, end_time: new Date("2020-01-01").toISOString() };
    render(<EventCard event={past} />);
    expect(screen.getByText("Ended")).toBeInTheDocument();
  });

  it("has proper aria-label", () => {
    render(<EventCard event={mockEvent} />);
    expect(screen.getByRole("button", { name: "Event: Fintech Innovation Summit" })).toBeInTheDocument();
  });

  it("calls onRegister when register clicked", async () => {
    const onRegister = vi.fn();
    render(<EventCard event={mockEvent} onRegister={onRegister} />);
    await userEvent.click(screen.getByText("Register"));
    expect(onRegister).toHaveBeenCalledOnce();
  });

  it("renders tag badges", () => {
    render(<EventCard event={mockEvent} />);
    expect(screen.getByText("fintech")).toBeInTheDocument();
    expect(screen.getByText("innovation")).toBeInTheDocument();
  });
});
