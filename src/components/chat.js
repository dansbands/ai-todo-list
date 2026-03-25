import React, { useEffect, useState } from "react";
import axios from "axios";
import { getAuthHeaders, serverUrl } from "../util/fetch";

const getFallbackChatResponse = (content = "") => ({
  message: typeof content === "string" ? content : "",
  links: [],
  googleSearch: "",
  steps: [],
});

const normalizeChatResponse = (response) => {
  if (!response || typeof response !== "object") {
    return getFallbackChatResponse();
  }

  return {
    message: typeof response.message === "string" ? response.message : "",
    links: Array.isArray(response.links) ? response.links : [],
    googleSearch:
      typeof response.googleSearch === "string" ? response.googleSearch : "",
    steps: Array.isArray(response.steps) ? response.steps : [],
  };
};

const Chat = ({ title, todoId, chatResponse }) => {
  const chatContent = normalizeChatResponse(chatResponse);

  const [message, setMessage] = useState("");
  const [response, setResponse] = useState(chatContent || {});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setResponse(normalizeChatResponse(chatResponse));
  }, [chatResponse]);

  const sendMessage = async () => {
    setLoading(true);

    try {
      const result = await axios.post(
        `${serverUrl}/api/chat`,
        {
          todoId,
          ...(message.trim() ? { message } : {}),
        },
        {
          headers: getAuthHeaders(),
        }
      );

      setResponse(normalizeChatResponse(result.data));
      setMessage("");
    } catch (error) {
      console.error("Error sending chat message:", error);
      setResponse(
        getFallbackChatResponse(
          "The AI response could not be loaded right now. Please try again."
        )
      );
    } finally {
      setLoading(false);
    }
  };

  const renderLinks = () => (
    <ul className="chat-links">
      {(Array.isArray(response?.links) ? response.links : []).map((link) => (
        <li key={`${link.url}-${link.linkTitle}`} className="chat-link-item">
          <div>{link.linkTitle}</div>
          <a href={link.url} target="_blank" rel="noreferrer">
            {link.url}
          </a>
          <div>{link.description}</div>
        </li>
      ))}
    </ul>
  );

  const renderSteps = () =>
    Array.isArray(response?.steps) && response.steps.length ? (
      <ol className="chat-steps">
        {response.steps.map((step) => (
          <li key={step}>{step}</li>
        ))}
      </ol>
    ) : null;

  const googleLink = response.googleSearch
    ? `https://www.google.com/search?q=${encodeURIComponent(response.googleSearch)}`
    : null;

  return (
    <div>
      <div className={title ? "chat-form-button-only" : "chat-form"}>
        {!title && (
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message"
          />
        )}
        <button className="chat-button" onClick={sendMessage}>
          <div className="chat-sparkles">{"\u2728"}</div>
          <div>{loading ? "loading..." : "AI Assistant"}</div>
        </button>
      </div>
      {response.message && (
        <div className="chat-response">
          <>
            <div className="chat-section">
              <h3>🧠 Plan</h3>
              <div>{response.message}</div>
            </div>
            {renderSteps() && (
              <div className="chat-section">
                <h3>🪜 Steps</h3>
                {renderSteps()}
              </div>
            )}
            <div className="chat-section">
              <h3>🔗 Resources</h3>
              {renderLinks()}
            </div>

            {googleLink && (
              <div className="chat-section">
                <h3>🔍 Search on Google</h3>
                <a
                  href={googleLink}
                  className="chat-search-link"
                  target="_blank"
                  rel="noreferrer"
                >
                  continue search on Google
                </a>
              </div>
            )}
          </>
        </div>
      )}
    </div>
  );
};

export default Chat;
