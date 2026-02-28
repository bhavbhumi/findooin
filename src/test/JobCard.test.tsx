import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { JobCard } from "@/components/jobs/JobCard";
import type { Job } from "@/hooks/useJobs";

const mockJob: Job = {
  id: "job-1",
  poster_id: "user-1",
  title: "Senior Fund Manager",
  description: "Manage equity portfolios",
  company_name: "Alpha Capital",
  company_logo_url: null,
  location: "Mumbai",
  is_remote: true,
  job_category: "fund_management",
  job_type: "full_time",
  experience_min: 5,
  experience_max: 10,
  salary_min: 2500000,
  salary_max: 5000000,
  salary_currency: "INR",
  skills_required: ["Portfolio Management", "Equities", "Risk Analysis", "CFA"],
  qualifications: ["MBA Finance"],
  certifications_preferred: ["CFA"],
  status: "active",
  expires_at: null,
  application_count: 12,
  view_count: 150,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  poster_profile: {
    full_name: "Admin User",
    display_name: null,
    avatar_url: null,
    verification_status: "verified",
  },
};

describe("JobCard", () => {
  it("renders job title", () => {
    render(<JobCard job={mockJob} />);
    expect(screen.getByText("Senior Fund Manager")).toBeInTheDocument();
  });

  it("renders company name", () => {
    render(<JobCard job={mockJob} />);
    expect(screen.getByText("Alpha Capital")).toBeInTheDocument();
  });

  it("renders location with remote indicator", () => {
    render(<JobCard job={mockJob} />);
    expect(screen.getByText("Mumbai (Remote)")).toBeInTheDocument();
  });

  it("renders job type label", () => {
    render(<JobCard job={mockJob} />);
    expect(screen.getByText("Full-Time")).toBeInTheDocument();
  });

  it("renders salary range formatted", () => {
    render(<JobCard job={mockJob} />);
    expect(screen.getByText("₹25L – ₹50L")).toBeInTheDocument();
  });

  it("renders experience range", () => {
    render(<JobCard job={mockJob} />);
    expect(screen.getByText("5–10y")).toBeInTheDocument();
  });

  it("renders category badge", () => {
    render(<JobCard job={mockJob} />);
    expect(screen.getByText("Fund Management")).toBeInTheDocument();
  });

  it("renders first 3 skills as badges", () => {
    render(<JobCard job={mockJob} />);
    expect(screen.getByText("Portfolio Management")).toBeInTheDocument();
    expect(screen.getByText("Equities")).toBeInTheDocument();
    expect(screen.getByText("Risk Analysis")).toBeInTheDocument();
  });

  it("shows +N for extra skills", () => {
    render(<JobCard job={mockJob} />);
    expect(screen.getByText("+1")).toBeInTheDocument();
  });

  it("has proper aria-label", () => {
    render(<JobCard job={mockJob} />);
    expect(screen.getByRole("button", { name: "Senior Fund Manager at Alpha Capital" })).toBeInTheDocument();
  });

  it("calls onClick when clicked", async () => {
    const onClick = vi.fn();
    render(<JobCard job={mockJob} onClick={onClick} />);
    await userEvent.click(screen.getByRole("button", { name: "Senior Fund Manager at Alpha Capital" }));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("renders save button when onToggleSave provided", () => {
    render(<JobCard job={mockJob} onToggleSave={vi.fn()} />);
    expect(screen.getByLabelText("Save job")).toBeInTheDocument();
  });

  it("renders unsave button when saved", () => {
    render(<JobCard job={mockJob} isSaved onToggleSave={vi.fn()} />);
    expect(screen.getByLabelText("Unsave job")).toBeInTheDocument();
  });
});
