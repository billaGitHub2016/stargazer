import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Layout } from "./components/Layout";
import { Landing } from "./pages/Landing";
import { Dashboard } from "./pages/Dashboard";
import { GatePayment } from "./pages/GatePayment";
import { Toaster } from "react-hot-toast";
import { createPortal } from "react-dom";

function App() {
  return (
    <>
      {typeof document !== "undefined"
        ? createPortal(
            <Toaster
              position="top-right"
              containerStyle={{ zIndex: 2147483647 }}
              toastOptions={{
                style: {
                  background: "#111",
                  color: "#fff",
                  border: "1px solid #333",
                  borderRadius: "0",
                  fontFamily: "Inter, sans-serif",
                },
              }}
            />,
            document.body,
          )
        : null}
      <Router>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Landing />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="gate/:ruleId?" element={<GatePayment />} />
          </Route>
        </Routes>
      </Router>
    </>
  );
}

export default App;
