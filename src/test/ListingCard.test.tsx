import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ListingCard } from "@/components/directory/ListingCard";
import type { Listing } from "@/hooks/useListings";

const mockListing: Listing = {
  id: "lst-1",
  user_id: "user-1",
  listing_type: "product",
  product_category: "mutual_fund",
  service_category: null,
  title: "Alpha Growth Fund",
  description: "A high-performance equity growth fund targeting mid-cap stocks",
  highlights: ["15% CAGR", "Low TER"],
  pricing_info: {},
  media_urls: [],
  tags: ["equity", "mid-cap"],
  location: "Mumbai",
  certifications: [],
  min_investment: 500000,
  returns_info: "15% CAGR",
  risk_level: "moderate",
  tenure: "3 years",
  status: "active",
  view_count: 234,
  enquiry_count: 12,
  review_count: 8,
  average_rating: 4.2,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  owner: {
    full_name: "Fund House",
    display_name: "FundHouse",
    avatar_url: null,
    verification_status: "verified",
    organization: "Alpha AMC",
  },
};

describe("ListingCard", () => {
  it("renders listing title", () => {
    render(<ListingCard listing={mockListing} onSelect={vi.fn()} />);
    expect(screen.getByText("Alpha Growth Fund")).toBeInTheDocument();
  });

  it("renders description", () => {
    render(<ListingCard listing={mockListing} onSelect={vi.fn()} />);
    expect(screen.getByText(/high-performance equity/)).toBeInTheDocument();
  });

  it("renders category label", () => {
    render(<ListingCard listing={mockListing} onSelect={vi.fn()} />);
    expect(screen.getByText("Mutual Fund")).toBeInTheDocument();
  });

  it("renders risk level badge", () => {
    render(<ListingCard listing={mockListing} onSelect={vi.fn()} />);
    expect(screen.getByText("moderate risk")).toBeInTheDocument();
  });

  it("renders min investment formatted", () => {
    render(<ListingCard listing={mockListing} onSelect={vi.fn()} />);
    expect(screen.getByText("Min ₹5,00,000")).toBeInTheDocument();
  });

  it("renders rating", () => {
    render(<ListingCard listing={mockListing} onSelect={vi.fn()} />);
    expect(screen.getByText("4.2 (8)")).toBeInTheDocument();
  });

  it("renders owner name", () => {
    render(<ListingCard listing={mockListing} onSelect={vi.fn()} />);
    expect(screen.getByText("FundHouse")).toBeInTheDocument();
  });

  it("renders organization", () => {
    render(<ListingCard listing={mockListing} onSelect={vi.fn()} />);
    expect(screen.getByText("Alpha AMC")).toBeInTheDocument();
  });

  it("renders location", () => {
    render(<ListingCard listing={mockListing} onSelect={vi.fn()} />);
    expect(screen.getByText("Mumbai")).toBeInTheDocument();
  });

  it("calls onSelect when clicked", async () => {
    const onSelect = vi.fn();
    render(<ListingCard listing={mockListing} onSelect={onSelect} />);
    await userEvent.click(screen.getByRole("button", { name: "Listing: Alpha Growth Fund" }));
    expect(onSelect).toHaveBeenCalledWith(mockListing);
  });

  it("renders compare button when onCompare provided", () => {
    render(<ListingCard listing={mockListing} onSelect={vi.fn()} onCompare={vi.fn()} />);
    expect(screen.getByText("Add to Compare")).toBeInTheDocument();
  });

  it("renders remove from compare when isComparing", () => {
    render(<ListingCard listing={mockListing} onSelect={vi.fn()} onCompare={vi.fn()} isComparing />);
    expect(screen.getByText("Remove from Compare")).toBeInTheDocument();
  });

  it("renders service listing type correctly", () => {
    const service: Listing = { ...mockListing, listing_type: "service", product_category: null, service_category: "advisory" };
    render(<ListingCard listing={service} onSelect={vi.fn()} />);
    expect(screen.getByText("Advisory")).toBeInTheDocument();
  });
});
