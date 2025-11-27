import React from "react";
import { createRoot } from "react-dom/client";

function App() {
  return (
    <div className="text-center p-10 text-3xl text-fb-blue font-bold">
      تم التشغيل بنجاح ✔
    </div>
  );
}

const root = createRoot(document.getElementById("root"));
root.render(<App />);
