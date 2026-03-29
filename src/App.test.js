import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import App from "./App";
import { AuthContext } from "./components/auth";
import { getApp } from "./util/fetch";

jest.mock("./util/fetch", () => ({
  getApp: jest.fn(),
}));

test("renders the signed-out landing screen for unauthenticated users", async () => {
  getApp.mockResolvedValue("Got the app!!!");

  render(
    <AuthContext.Provider value={{ user: null }}>
      <MemoryRouter initialEntries={["/"]}>
        <App />
      </MemoryRouter>
    </AuthContext.Provider>
  );

  expect(
    await screen.findByRole("button", { name: /get started/i })
  ).toBeInTheDocument();
});
