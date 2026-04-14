 "use client";

import React, { useEffect, useState } from "react";
import {
  getRequestErrorMessage,
  postChatMessage,
} from "../util/fetch";

const getFallbackChatResponse = (content = "") => ({
  message: typeof content === "string" ? content : "",
  links: [],
  googleSearch: "",
  steps: [],
});

const getLegacyChatContent = (response) =>
  typeof response?.choices?.[0]?.message?.content === "string"
    ? response.choices[0].message.content
    : "";

const normalizeChatResponse = (response) => {
  if (!response || typeof response !== "object") {
    return getFallbackChatResponse();
  }

  const message =
    typeof response.message === "string" ? response.message : "";
  const legacyContent = getLegacyChatContent(response);

  if (!message && legacyContent) {
    return getFallbackChatResponse(legacyContent);
  }

  return {
    message,
    links: Array.isArray(response.links)
      ? response.links
          .filter(
            (link) =>
              link &&
              typeof link === "object" &&
              typeof link.linkTitle === "string" &&
              typeof link.url === "string"
          )
          .map((link) => ({
            ...link,
            description:
              typeof link.description === "string" ? link.description : "",
          }))
      : [],
    googleSearch:
      typeof response.googleSearch === "string" ? response.googleSearch : "",
    steps: Array.isArray(response.steps)
      ? response.steps.filter((step) => typeof step === "string")
      : [],
  };
};

const Chat = ({ title, todoId, chatResponse, onGuestLimitReached }) => {
  const chatContent = normalizeChatResponse(chatResponse);

  const [message, setMessage] = useState("");
  const [response, setResponse] = useState(chatContent || {});
  const [loading, setLoading] = useState(false);
  const [requestError, setRequestError] = useState("");

  useEffect(() => {
    setResponse(normalizeChatResponse(chatResponse));
  }, [chatResponse]);

  const sendMessage = async () => {
    setLoading(true);
    setRequestError("");

    try {
      const result = await postChatMessage({
        todoId,
        message,
      });

      setResponse(normalizeChatResponse(result));
      setMessage("");
    } catch (error) {
      console.error("Error sending chat message:", error);
      if (
        error?.response?.data?.code === "GUEST_LIMIT_REACHED" &&
        typeof onGuestLimitReached === "function"
      ) {
        onGuestLimitReached(error.response.data);
      }

      const errorMessage = getRequestErrorMessage(
        error,
        "The AI response could not be loaded right now. Please try again."
      );
      setRequestError(errorMessage);

      setResponse((currentResponse) =>
        currentResponse?.message
          ? currentResponse
          : getFallbackChatResponse(errorMessage)
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
        {response.steps.map((step, index) => (
          <li key={`${index}-${step}`}>{step}</li>
        ))}
      </ol>
    ) : null;

  const hasLinks = Array.isArray(response?.links) && response.links.length > 0;
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
        <button className="chat-button" onClick={sendMessage} disabled={loading}>
          <div className="chat-sparkles">{"\u2728"}</div>
          <div>{loading ? "loading..." : "AI Assistant"}</div>
        </button>
      </div>
      {response.message && (
        <div className="chat-response">
          <>
            {requestError && <div className="auth-error">{requestError}</div>}
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
            {hasLinks && (
              <div className="chat-section">
                <h3>🔗 Resources</h3>
                {renderLinks()}
              </div>
            )}

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
