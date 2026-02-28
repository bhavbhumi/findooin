/**
 * Integration tests for PostJobDialog — job posting flow.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const mockMutateAsync = vi.fn();

vi.mock("@/hooks/useJobs", () => ({
  useCreateJob: () => ({
    mutateAsync: mockMutateAsync,
    isPending: false,
  }),
}));

vi.mock("@/contexts/RoleContext", () => ({
  useRole: () => ({
    userId: "employer-1",
    activeRole: "intermediary",
    loaded: true,
    roles: [{ role: "intermediary", sub_type: null }],
  }),
}));

import { PostJobDialog } from "@/components/jobs/PostJobDialog";

function renderDialog(open = true) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const onClose = vi.fn();
  const result = render(
    <QueryClientProvider client={queryClient}>
      <PostJobDialog open={open} onClose={onClose} />
    </QueryClientProvider>
  );
  return { ...result, onClose };
}

describe("PostJobDialog Integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockMutateAsync.mockResolvedValue({});
  });

  it("renders job posting form", () => {
    renderDialog();
    expect(screen.getByText("Post a Job")).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/senior fund manager/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/hdfc amc/i)).toBeInTheDocument();
  });

  it("requires title and company name", async () => {
    const user = userEvent.setup();
    renderDialog();

    // Click post without filling required fields
    await user.click(screen.getByRole("button", { name: /post job/i }));

    expect(mockMutateAsync).not.toHaveBeenCalled();
  });

  it("submits job with all fields", async () => {
    const user = userEvent.setup();
    const { onClose } = renderDialog();

    await user.type(screen.getByPlaceholderText(/senior fund manager/i), "React Developer");
    await user.type(screen.getByPlaceholderText(/hdfc amc/i), "FinTech Corp");
    await user.type(screen.getByPlaceholderText(/mumbai/i), "Bangalore");
    await user.type(
      screen.getByPlaceholderText(/describe the role/i),
      "Full stack developer position"
    );

    await user.click(screen.getByRole("button", { name: /post job/i }));

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "React Developer",
          company_name: "FinTech Corp",
          location: "Bangalore",
          description: "Full stack developer position",
          poster_id: "employer-1",
        })
      );
      expect(onClose).toHaveBeenCalled();
    });
  });

  it("adds and removes skills", async () => {
    const user = userEvent.setup();
    renderDialog();

    const skillInput = screen.getByPlaceholderText("Add a skill");
    await user.type(skillInput, "React");
    await user.keyboard("{Enter}");

    expect(screen.getByText("React")).toBeInTheDocument();

    await user.type(skillInput, "TypeScript");
    await user.keyboard("{Enter}");

    expect(screen.getByText("TypeScript")).toBeInTheDocument();

    // Remove React skill by clicking the X svg inside the badge
    const reactBadge = screen.getByText("React").parentElement!;
    const xButton = reactBadge.querySelector("svg.cursor-pointer") || reactBadge.querySelector("svg:last-child");
    if (xButton) fireEvent.click(xButton);

    await waitFor(() => {
      expect(screen.queryByText("React")).not.toBeInTheDocument();
    });
  });

  it("adds qualifications", async () => {
    const user = userEvent.setup();
    renderDialog();

    const qualInput = screen.getByPlaceholderText(/mba finance/i);
    await user.type(qualInput, "CFA Level 3");
    await user.keyboard("{Enter}");

    expect(screen.getByText("CFA Level 3")).toBeInTheDocument();
  });

  it("includes skills and qualifications in submission", async () => {
    const user = userEvent.setup();
    renderDialog();

    // Fill required fields
    await user.type(screen.getByPlaceholderText(/senior fund manager/i), "Analyst");
    await user.type(screen.getByPlaceholderText(/hdfc amc/i), "Test Corp");

    // Add a skill
    await user.type(screen.getByPlaceholderText("Add a skill"), "Python");
    await user.keyboard("{Enter}");

    // Add a qualification
    await user.type(screen.getByPlaceholderText(/mba finance/i), "MBA");
    await user.keyboard("{Enter}");

    await user.click(screen.getByRole("button", { name: /post job/i }));

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          skills_required: ["Python"],
          qualifications: ["MBA"],
        })
      );
    });
  });

  it("does not render when open is false", () => {
    renderDialog(false);
    expect(screen.queryByText("Post a Job")).not.toBeInTheDocument();
  });
});

// Import fireEvent for skill removal
import { fireEvent } from "@testing-library/react";
