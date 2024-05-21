import "./App.css";
import { Routes, Route } from "react-router-dom";

import Layout from "./components/layout";
import Tasks from "./pages/tasks";
import SignIn from "./pages/signIn";
import SignUp from "./pages/signUp";
import RequireAuth from "./components/require-auth";

function App() {
  return (
    <Layout>
      <Routes>
        <Route
          index
          element={
            <RequireAuth>
              <Tasks />
            </RequireAuth>
          }
        />
        <Route path="sign-in" element={<SignIn />} />
        <Route path="sign-up" element={<SignUp />} />
      </Routes>
    </Layout>
  );
}

export default App;
