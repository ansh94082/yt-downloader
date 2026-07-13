import Sidebar from "./components/Sidebar"
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Downloads from "./pages/Downloads";
import Settings from "./pages/Settings";
import "./App.css";
import { useEffect } from "react";
import { Toaster } from "react-hot-toast";


function App() {

  useEffect(() => {
    const loadTheme = async () => {
      const settings =
        await window.api.getSettings();

      if (settings.theme) {
        document.documentElement.setAttribute(
          "data-theme",
          settings.theme
        );
      }
    };

    loadTheme();
  }, []);
  return (

    <>

      <Toaster
        position="bottom-right"
        toastOptions={{
          duration: 2500,
        }}
      />


      <div className="flex h-screen">


        <Sidebar />

        <main className="flex-1 overflow-y-auto">

          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/downloads" element={<Downloads />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </main>
      </div>
    </>
  )
}

export default App
