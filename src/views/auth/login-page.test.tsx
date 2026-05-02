import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { LoginPage } from "@/views/auth/login-page";
import { authService } from "@/api/authService";

const push = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push
  })
}));

vi.mock("@/api/authService", () => ({
  authService: {
    sendOtp: vi.fn().mockResolvedValue(undefined)
  }
}));

describe("LoginPage", () => {
  afterEach(() => {
    push.mockReset();
  });

  it("validates Ethiopian phone numbers before submit", async () => {
    render(<LoginPage />);

    fireEvent.change(screen.getByLabelText(/phone number/i), {
      target: { value: "1234" }
    });
    fireEvent.click(screen.getByRole("button", { name: /send otp/i }));

    await waitFor(() =>
      expect(screen.getByText(/Enter a valid Ethiopian phone number/i)).toBeInTheDocument()
    );
  });

  it("submits a valid phone number", async () => {
    render(<LoginPage />);

    fireEvent.change(screen.getByLabelText(/phone number/i), {
      target: { value: "+251912345678" }
    });
    fireEvent.click(screen.getByRole("button", { name: /send otp/i }));

    await waitFor(() =>
      expect(authService.sendOtp).toHaveBeenCalledWith({ phoneNumber: "+251912345678" })
    );
    expect(push).toHaveBeenCalledWith("/auth/verify?phone=%2B251912345678");
  });
});
