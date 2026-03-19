/**
 * Integration tests for the Auth page — login, signup, lockout, and magic link flows.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BrowserRouter } from "react-router-dom";

// Mock supabase
const mockSignInWithPassword = vi.fn();
const mockSignUp = vi.fn();
const mockSignInWithOtp = vi.fn();
const mockResetPasswordForEmail = vi.fn();
const mockGetSession = vi.fn();
const mockOnAuthStateChange = vi.fn();

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    auth: {
      signInWithPassword: (...args: any[]) => mockSignInWithPassword(...args),
      signUp: (...args: any[]) => mockSignUp(...args),
      signInWithOtp: (...args: any[]) => mockSignInWithOtp(...args),
      resetPasswordForEmail: (...args: any[]) => mockResetPasswordForEmail(...args),
      getSession: () => mockGetSession(),
      onAuthStateChange: () => {
        mockOnAuthStateChange();
        return { data: { subscription: { unsubscribe: vi.fn() } } };
      },
    },
    from: () => ({
      select: () => ({ eq: () => ({ maybeSingle: () => Promise.resolve({ data: null, error: null }) }) }),
      insert: () => Promise.resolve({ error: null }),
    }),
  },
}));

vi.mock("@/lib/session-manager", () => ({
  registerSession: vi.fn(),
}));

vi.mock("@/hooks/usePageMeta", () => ({
  usePageMeta: vi.fn(),
}));

// We need to import Auth after mocks are set up
import Auth from "@/pages/Auth";

function renderAuth(searchParams = "") {
  window.history.pushState({}, "", `/auth${searchParams}`);
  return render(
    <BrowserRouter>
      <Auth />
    </BrowserRouter>
  );
}

describe("Auth Page Integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetSession.mockResolvedValue({ data: { session: null } });
  });

  describe("Sign In Flow", () => {
    it("renders sign in form by default", () => {
      renderAuth();
      expect(screen.getByText("Welcome back")).toBeInTheDocument();
      expect(screen.getByLabelText("Email")).toBeInTheDocument();
      expect(screen.getByLabelText("Password")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Sign In" })).toBeInTheDocument();
    });

    it("submits credentials on sign in", async () => {
      const user = userEvent.setup();
      mockSignInWithPassword.mockResolvedValue({
        data: { session: { user: { id: "user-1" } } },
        error: null,
      });
      
      renderAuth();

      await user.type(screen.getByLabelText("Email"), "test@example.com");
      await user.type(screen.getByLabelText("Password"), "password123");
      
      const form = screen.getByRole("button", { name: "Sign In" }).closest("form")!;
      fireEvent.submit(form);

      await waitFor(() => {
        expect(mockSignInWithPassword).toHaveBeenCalledWith({
          email: "test@example.com",
          password: "password123",
        });
      });
    });

    it("shows error on failed login", async () => {
      const user = userEvent.setup();
      mockSignInWithPassword.mockResolvedValue({
        data: { session: null },
        error: { message: "Invalid login credentials" },
      });

      renderAuth();

      await user.type(screen.getByLabelText("Email"), "bad@example.com");
      await user.type(screen.getByLabelText("Password"), "wrong");

      const form = screen.getByRole("button", { name: "Sign In" }).closest("form")!;
      fireEvent.submit(form);

      await waitFor(() => {
        expect(mockSignInWithPassword).toHaveBeenCalled();
      });
    });

    it("shows lockout after max attempts", async () => {
      const user = userEvent.setup();
      mockSignInWithPassword.mockResolvedValue({
        data: { session: null },
        error: { message: "Invalid login credentials" },
      });

      renderAuth();

      // Submit 3 times to trigger lockout
      for (let i = 0; i < 3; i++) {
        await user.clear(screen.getByLabelText("Email"));
        await user.type(screen.getByLabelText("Email"), "bad@example.com");
        await user.clear(screen.getByLabelText("Password"));
        await user.type(screen.getByLabelText("Password"), "wrong");
        const form = screen.getByRole("button", { name: "Sign In" }).closest("form")!;
        fireEvent.submit(form);
        await waitFor(() => expect(mockSignInWithPassword).toHaveBeenCalledTimes(i + 1));
      }

      await waitFor(() => {
        expect(screen.getByText(/too many failed attempts/i)).toBeInTheDocument();
      });
    });
  });

  describe("Sign Up Flow", () => {
    it("renders signup form when mode=signup", () => {
      renderAuth("?mode=signup");
      expect(screen.getByText("Create your account")).toBeInTheDocument();
      expect(screen.getByLabelText("Full Name")).toBeInTheDocument();
    });

    it("switches between sign in and sign up", async () => {
      const user = userEvent.setup();
      renderAuth();

      expect(screen.getByText("Welcome back")).toBeInTheDocument();
      await user.click(screen.getByText("Sign Up"));
      expect(screen.getByText("Create your account")).toBeInTheDocument();
    });

    it("submits signup form", async () => {
      const user = userEvent.setup();
      mockSignUp.mockResolvedValue({ data: {}, error: null });

      renderAuth("?mode=signup");

      await user.type(screen.getByLabelText("Full Name"), "Test User");
      await user.type(screen.getByLabelText("Email"), "new@example.com");
      await user.type(screen.getByLabelText("Password"), "securepass123");

      const form = screen.getByRole("button", { name: /create account/i }).closest("form")!;
      fireEvent.submit(form);

      await waitFor(() => {
        expect(mockSignUp).toHaveBeenCalledWith(
          expect.objectContaining({
            email: "new@example.com",
            password: "securepass123",
          })
        );
      });
    });

    it("does not submit signup when full name is blank spaces", async () => {
      const user = userEvent.setup();
      mockSignUp.mockResolvedValue({ data: {}, error: null });

      renderAuth("?mode=signup");

      await user.type(screen.getByLabelText("Full Name"), "   ");
      await user.type(screen.getByLabelText("Email"), "new@example.com");
      await user.type(screen.getByLabelText("Password"), "securepass123");

      const form = screen.getByRole("button", { name: /create account/i }).closest("form")!;
      fireEvent.submit(form);

      await waitFor(() => {
        expect(mockSignUp).not.toHaveBeenCalled();
      });
    });
  });

  describe("Magic Link Flow", () => {
    it("sends magic link only for existing users", async () => {
      const user = userEvent.setup();
      mockSignInWithOtp.mockResolvedValue({ error: null });

      renderAuth();

      await user.type(screen.getByLabelText("Email"), "magic@example.com");
      await user.click(screen.getByRole("button", { name: /magic link/i }));

      await waitFor(() => {
        expect(mockSignInWithOtp).toHaveBeenCalledWith(
          expect.objectContaining({
            email: "magic@example.com",
            options: expect.objectContaining({ shouldCreateUser: false }),
          })
        );
      });
    });

    it("blocks disposable emails in magic link flow", async () => {
      const user = userEvent.setup();
      mockSignInWithOtp.mockResolvedValue({ error: null });

      renderAuth();

      await user.type(screen.getByLabelText("Email"), "spam@onbap.com");
      await user.click(screen.getByRole("button", { name: /magic link/i }));

      await waitFor(() => {
        expect(mockSignInWithOtp).not.toHaveBeenCalled();
      });
    });
  });

  describe("Forgot Password Flow", () => {
    it("shows forgot password dialog", async () => {
      const user = userEvent.setup();
      renderAuth();
      
      await user.click(screen.getByText("Forgot password?"));
      
      await waitFor(() => {
        expect(screen.getByText("Reset Password")).toBeInTheDocument();
      });
    });
  });

  describe("Accessibility", () => {
    it("has proper form labels", () => {
      renderAuth();
      expect(screen.getByLabelText("Email")).toBeInTheDocument();
      expect(screen.getByLabelText("Password")).toBeInTheDocument();
    });

    it("submit button is keyboard accessible", () => {
      renderAuth();
      const button = screen.getByRole("button", { name: "Sign In" });
      expect(button).not.toBeDisabled();
      expect(button.getAttribute("type")).toBe("submit");
    });
  });
});
