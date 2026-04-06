import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import Chat from "./chat";
import { postChatMessage } from "../util/fetch";

jest.mock("../util/fetch", () => ({
  getAuthHeaders: jest.fn(() => ({ Authorization: "Bearer test-token" })),
  getRequestErrorMessage: jest.fn(),
  postChatMessage: jest.fn(),
  serverUrl: "",
}));

describe("Chat", () => {
  beforeEach(() => {
    const { getRequestErrorMessage } = require("../util/fetch");
    getRequestErrorMessage.mockReturnValue(
      "The AI response could not be loaded right now. Please try again."
    );
    postChatMessage.mockReset();
  });

  it("shows a friendly fallback message when the AI request fails", async () => {
    postChatMessage.mockRejectedValueOnce(new Error("network down"));

    render(<Chat todoId="todo-1" chatResponse={null} />);

    fireEvent.click(screen.getByRole("button", { name: /ai assistant/i }));

    const fallbackMessages = await screen.findAllByText(
      "The AI response could not be loaded right now. Please try again."
    );
    expect(fallbackMessages.length).toBeGreaterThan(0);

    await waitFor(() => {
      expect(screen.queryByText(/resources/i)).not.toBeInTheDocument();
    });
  });
});
