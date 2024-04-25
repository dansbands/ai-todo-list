require("dotenv").config();
const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
const isDev = process.env.NODE_ENV === "development";
const corsOptions = {
  origin: "*",
  optionsSuccessStatus: 201, // some legacy browsers (IE11, various SmartTVs) choke on 204
};

app.use(cors(!isDev ? corsOptions : null));
app.use(express.json());

const PORT = process.env.PORT || 10000;

app.get("/", (req, res) => {
  console.log("We are live");
  res.send("Got the app!!!");
});

app.post("/api/chat", async (req, res) => {
  const { message } = req.body;
  try {
    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: message }],
      },
      {
        headers: {
          "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );
    res.send(response.data);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error processing the AI request");
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
