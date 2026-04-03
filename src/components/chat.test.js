import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import axios from "axios";
import Chat from "./chat";

jest.mock("axios");
jest.mock("../util/fetch", () => ({
  getAuthHeaders: jest.fn(() => ({ Authorization: "Bearer test-token" })),
  getRequestErrorMessage: jest.fn(
    () => "The AI response could not be loaded right now. Please try again."
  ),
  serverUrl: "",
}));

describe("Chat", () => {
  it("shows a friendly fallback message when the AI request fails", async () => {
    axios.post.mockRejectedValueOnce(new Error("network down"));

    render(<Chat todoId="todo-1" chatResponse={null} />);

    fireEvent.click(screen.getByRole("button", { name: /ai assistant/i }));

    expect(
      await screen.findByText(
        "The AI response could not be loaded right now. Please try again."
      )
    ).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.queryByText(/resources/i)).not.toBeInTheDocument();
    });
  });
});
