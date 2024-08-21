import React, { useEffect, useRef, useState } from "react";

const messages = [
  "This takes a minute to load...",
  "so while we're here...",
  "I figured I'd take this opportunity to tell you about myself",
  "I mean, you're probably using this app because you saw it on my resume",
  "I'm Dan O'Dea",
  "Software Engineer with 7 years experience",
  "I've worked everywhere from startups...",
  "to Fortune 100 & 500 companies",
  "My specialty is Front-end with React, but I'm comfortable across the stack",
  "Can I develop Full-Stack apps? I built this one using the MERN stack",
  "I've been everything from Junior to Tech Lead, and I really love mentoring other devs",
  "prior to becoming an engineer, I had a few other careers",
  "these include Musician (band leader), Private Music Teacher (founded school of 20 instructors), Orchestra Teacher (160 students/ 4 orchestras per year)",
];

const ElevatorPitch = () => {
  const [index, setIndex] = useState(0);
  const timeoutRef = useRef(null);

  function resetTimeout() {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }

  useEffect(() => {
    resetTimeout();
    timeoutRef.current = setTimeout(() => {
      setIndex((prevIndex) =>
        prevIndex === messages.length - 1 ? 0 : prevIndex + 1
      );
    }, 4000);
    return () => {
      resetTimeout();
    };
  }, [index]);

  return <div>{messages[index]}</div>;
};

export default ElevatorPitch;
