import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import SignIn from "./signIn";
import { AuthContext } from "../components/auth";
import { getApp, postExistingUser } from "../util/fetch";

jest.mock("../util/fetch", () => ({
  getApp: jest.fn(),
  getRequestErrorMessage: jest.fn(() => "Invalid username and password combination"),
  postExistingUser: jest.fn(),
}));

describe("SignIn", () => {
  it("shows an auth error for failed sign in attempts", async () => {
    getApp.mockResolvedValue("Got the app!!!");
    postExistingUser.mockRejectedValueOnce({
      response: { data: { error: "Invalid username and password combination" } },
    });

    render(
      <AuthContext.Provider value={{ user: null, signIn: jest.fn() }}>
        <MemoryRouter>
          <SignIn />
        </MemoryRouter>
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
