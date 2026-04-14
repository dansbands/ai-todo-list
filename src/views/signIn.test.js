import { fireEvent, render, screen } from "@testing-library/react";
import SignIn from "./signIn";
import { AuthContext } from "../components/auth";
import { getApp, getRequestErrorMessage, postExistingUser } from "../util/fetch";

jest.mock("../util/fetch", () => ({
  getApp: jest.fn(),
  getRequestErrorMessage: jest.fn(),
  postExistingUser: jest.fn(),
}));

jest.mock("../util/router", () => ({
  Link: ({ children, ...props }) => <a {...props}>{children}</a>,
  Navigate: () => null,
  useNavigate: () => jest.fn(),
}));

describe("SignIn", () => {
  beforeEach(() => {
    getRequestErrorMessage.mockReturnValue("Invalid username and password combination");
  });

  it("shows an auth error for failed sign in attempts", async () => {
    getApp.mockResolvedValue("Got the app!!!");
    postExistingUser.mockRejectedValueOnce({
      response: { data: { error: "Invalid username and password combination" } },
    });

    render(
      <AuthContext.Provider value={{ user: null, signIn: jest.fn() }}>
        <SignIn />
      </AuthContext.Provider>
    );

    fireEvent.click(await screen.findByRole("button", { name: /^sign in$/i }));
    fireEvent.change(screen.getByPlaceholderText(/email/i), {
      target: { value: "dan@example.com", name: "email" },
    });
    fireEvent.change(screen.getByPlaceholderText(/password/i), {
      target: { value: "wrong-password", name: "password" },
    });
    fireEvent.click(screen.getByRole("button", { name: /^sign in$/i }));

    expect(
      await screen.findByText("Invalid username and password combination")
    ).toBeInTheDocument();
  });
});
