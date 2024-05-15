import React, { useCallback, useEffect, useState } from "react";
import loadingGif from "../img/loading.gif";

const loadingMessage = [
  "Welcome to my app!",
  "The server takes roughly a minute to spin up",
  "While we wait, I thought I'd tell you a little bit about myself",
  "I played Carnegie Hall at 12 years old",
  "in 2008, I founded Dan's Music Studio, a private music school in West Orange, NJ",
  "I play 10 instruments",
  "As a musician, I've appeared with Peter Yarrow (Peter, Paul and Mary), Pete Seeger, Clarence Clemons (E Street Band), Dickey Betts (Allman Brothers), Levon Helm (The Band), and John McEuen (Nitty Gritty Dirt Band)",
  "I performed at TEDx Jersey City in 2014",
  "in 2017, I became a Software Engineer",
  "since then, I've worked for startups, digital agencies, and large corporations like Amex and Comcast",
  "I'm currently looking for a new role. Do you need a Front End Engineer with Senior/ Lead experience?",
];

const Loader = () => {
  const [currentMsg, setCurrentMsg] = useState(loadingMessage[0]);
  let index = 0;

  const setMessage = useCallback(() => {
    index += 1; 
    setCurrentMsg(loadingMessage[index]);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessage()
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      <div className="loading-message">{currentMsg}</div>
      <img src={loadingGif} alt="loading-image" />
    </div>
  );
};

export default Loader;
