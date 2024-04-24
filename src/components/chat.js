import React, { useEffect, useState } from "react";
import axios from "axios";

const Chat = ({ title }) => {
  const [message, setMessage] = useState("");
  const [response, setResponse] = useState({});

  const prompt = `I need to ${title}. How can I best accomplish this? Additionally, can you please provide a list of web resources for how to ${title} in json format with linkTitle, url, and description? Format the entire answer as a json object of {message, links}`;

  useEffect(() => {
    if (title) setMessage(prompt);
  }, [title, prompt]);

  const sendMessage = async () => {
    const result = await axios.post("http://localhost:3001/api/chat", {
      message,
    });
    setResponse(JSON.parse(result.data.choices[0].message.content));
    setMessage("");
  };

  const renderLinks = () => (
    <ul className="chat-links">
      {response?.links?.map((link) => (
        <li className="chat-link-item">
          <div>{link.linkTitle}</div>
          <a href={link.url}>{link.url}</a>
          <div>{link.description}</div>
        </li>
      ))}
    </ul>
  );

  return (
    <div>
      <input
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type your message"
      />
      <button onClick={sendMessage}>Send</button>
      <div className="chat-response">
        <div>{response.message}</div>
        {renderLinks()}
      </div>
    </div>
  );
};

export default Chat;
