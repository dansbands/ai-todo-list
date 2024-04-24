import React, { useEffect, useState } from "react";
import axios from "axios";

const Chat = ({ title }) => {
  const [message, setMessage] = useState("");
  const [response, setResponse] = useState({});
  const [loading, setLoading] = useState(false)

  const prompt = `I need to ${title}. How can I best accomplish this? Additionally, can you please provide a list of web resources for how to ${title} in json format with linkTitle, url, and description? Format the entire answer as a json object of {message, links}`;

  useEffect(() => {
    if (title) setMessage(prompt);
  }, [title, prompt]);

  const sendMessage = async () => {
    setLoading(true);
    const result = await axios.post("http://localhost:3001/api/chat", {
      message,
    });
    setResponse(JSON.parse(result.data.choices[0].message.content));
    setMessage("");
    setLoading(false);
  };

  const renderLinks = () => (
    <ul className="chat-links">
      {response?.links?.map((link) => (
        <li key={link.description} className="chat-link-item">
          <div>{link.linkTitle}</div>
          <a href={link.url}>{link.url}</a>
          <div>{link.description}</div>
        </li>
      ))}
    </ul>
  );

  return (
    <div>
      <div className={title ? "chat-form-button-only" : "chat-form"}>
        {!title && (
          <input
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
      <div className="chat-response">
        <div>{response.message}</div>
        {renderLinks()}
      </div>
    </div>
  );
};

export default Chat;
