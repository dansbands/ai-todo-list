import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import SignUpForm from "./sign-up-form";
import { AuthContext } from "./auth";
import {
  createGuestSession,
  getRequestErrorMessage,
  postNewUser,
} from "../util/fetch";

jest.mock("../util/fetch", () => ({
  createGuestSession: jest.fn(),
  getRequestErrorMessage: jest.fn(),
  postNewUser: jest.fn(),
}));

jest.mock("../util/router", () => ({
  Link: ({ children, ...props }) => <a {...props}>{children}</a>,
  useNavigate: () => jest.fn(),
}));

describe("SignUpForm", () => {
  beforeEach(() => {
    getRequestErrorMessage.mockReturnValue("Unable to continue as guest");
  });

  it("lets a user continue as guest from sign up", async () => {
    const signIn = jest.fn((user, callback) => callback());
    createGuestSession.mockResolvedValueOnce({
      data: {
        token: "guest-token",
        _id: "guest_123",
        firstName: "Guest",
        lastName: "User",
        email: "guest@local",
        isGuest: true,
      },
    });

    render(
      <AuthContext.Provider value={{ user: null, signIn }}>
        <SignUpForm showGuestAction />
      </AuthContext.Provider>
    );

    fireEvent.click(screen.getByRole("button", { name: /continue as guest/i }));

    await waitFor(() => {
      expect(createGuestSession).toHaveBeenCalledTimes(1);
    });

    expect(signIn).toHaveBeenCalledWith(
      expect.objectContaining({ isGuest: true }),
      expect.any(Function)
    );
  });

  it("shows an auth error when sign up fails", async () => {
    postNewUser.mockRejectedValueOnce({
      response: { data: { error: "Email already in use" } },
    });

    render(
      <AuthContext.Provider value={{ user: null, signIn: jest.fn() }}>
        <SignUpForm />
      </AuthContext.Provider>
    );

    fireEvent.change(screen.getByPlaceholderText(/first name/i), {
      target: { value: "Dan", name: "firstName" },
    });
    fireEvent.change(screen.getByPlaceholderText(/last name/i), {
      target: { value: "Smith", name: "lastName" },
    });
    fireEvent.change(screen.getByPlaceholderText(/^email$/i), {
      target: { value: "dan@example.com", name: "email" },
    });
    fireEvent.change(screen.getByPlaceholderText(/password/i), {
      target: { value: "secret", name: "password" },
    });

    fireEvent.click(screen.getByRole("button", { name: /^sign up$/i }));

    expect(await screen.findByText("Unable to continue as guest")).toBeInTheDocument();
  });
});
