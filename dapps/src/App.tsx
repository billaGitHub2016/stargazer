import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Layout } from "./components/Layout";
import { Landing } from "./pages/Landing";
import { Dashboard } from "./pages/Dashboard";
import { GatePayment } from "./pages/GatePayment";
import { Toaster } from "react-hot-toast";

function App() {
  return (
    <>
      <Toaster 
        position="top-right" 
        toastOptions={{
          style: {
            background: '#111',
            color: '#fff',
            border: '1px solid #333',
            borderRadius: '0',
            fontFamily: 'Inter, sans-serif'
          }
        }} 
      />
      <Router>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Landing />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="gate/:ruleId" element={<GatePayment />} />
          </Route>
        </Routes>
      </Router>
    </>
  );
}

export default App;
