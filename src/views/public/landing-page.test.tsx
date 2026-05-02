import { render, screen } from "@testing-library/react";
import { LandingPage } from "@/views/public/landing-page";

describe("LandingPage", () => {
  it("renders hero message and pricing section", () => {
    render(<LandingPage />);

    expect(
      screen.getByText(/Your barbershop’s booking, queue, and payment flow finally feels premium/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/Simple plans for solo barbers/i)).toBeInTheDocument();
  });
});
