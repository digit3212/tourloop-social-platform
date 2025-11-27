import React from "react";
import { createRoot } from "react-dom/client";

function App() {
  return (
    <div className="text-center p-10 text-3xl text-fb-blue font-bold">
      تم التشغيل بنجاح ✔
    </div>
  );
}

const rootElement = document.getElementById("root");

if (rootElement) {
  const root = createRoot(rootElement);
  root.render(<App />);
} else {
  console.error("لم يتم العثور على عنصر root في الصفحة");
}
