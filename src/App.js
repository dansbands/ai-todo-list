import "./App.css";
import { Routes, Route } from "react-router-dom";

import Layout from "./components/layout";
import Tasks from "./pages/tasks";
import SignIn from "./pages/signIn";
import SignUp from "./pages/signUp";

const basename = process.env.NODE_ENV === "development" ? "/" : "/ai-todo-list";

function App() {
  return (
    <Layout>
      <Routes basename={basename}>
        <Route path="/" element={<Tasks />} />
        <Route path="sign-in" element={<SignIn />} />
        <Route path="sign-up" element={<SignUp />} />
      </Routes>
    </Layout>
  );
}

export default App;
