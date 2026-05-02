import { render, screen, waitFor } from "@testing-library/react";
import { ProtectedRoute } from "@/routes/protected-route";
import { useAuthStore } from "@/store/auth-store";
import type { UserSession } from "@/types";

const replace = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    replace
  }),
  usePathname: () => "/app"
}));

const session: UserSession = {
  userId: "user-1",
  phone: "+251911111111",
  role: "CUSTOMER",
  accessToken: "token",
  refreshToken: "refresh",
  accessTokenExpiresIn: 900
};

describe("ProtectedRoute", () => {
  afterEach(() => {
    replace.mockReset();
    useAuthStore.getState().logout();
  });

  it("redirects unauthenticated users to login", () => {
    render(
      <ProtectedRoute allowedRoles={["CUSTOMER"]}>
        <div>Private</div>
      </ProtectedRoute>
    );

    return waitFor(() =>
      expect(replace).toHaveBeenCalledWith("/auth/login?next=%2Fapp")
    );
  });

  it("renders children for allowed roles", () => {
    useAuthStore.getState().setSession(session);

    render(
      <ProtectedRoute allowedRoles={["CUSTOMER"]}>
        <div>Private</div>
      </ProtectedRoute>
    );

    expect(screen.getByText("Private")).toBeInTheDocument();
  });
});
