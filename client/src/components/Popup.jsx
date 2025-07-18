// import React from "react";

// const Popup = ({ message, onClose }) => {
//   return (
//     <div className="fixed top-5 right-5 z-50 max-w-md w-full">
//       <div className="bg-black/70 backdrop-blur-md text-white rounded-xl shadow-xl p-4 animate-fade-in flex flex-col gap-3">
//         <p className="text-sm font-medium">{message}</p>
//         <button
//           onClick={onClose}
//           className="self-end bg-gradient-to-r from-blue-500 to-cyan-400 hover:from-cyan-400 hover:to-blue-500 text-white px-4 py-1 rounded-md text-sm transition duration-300"
//         >
//           Okay
//         </button>
//       </div>
//     </div>
//   );
// };

// export default Popup;

import React from "react";

const Popup = ({ message, onClose }) => {
  return (
    <div
      style={{
        position: "fixed",
        bottom: "20px",
        right: "20px",
        backgroundColor: "#fff",
        padding: "16px",
        border: "2px solid #333",
        borderRadius: "8px",
        boxShadow: "0 0 10px rgba(0,0,0,0.2)",
        zIndex: 9999,
        width: "300px",
      }}
    >
      <h3 style={{ marginBottom: "8px" }}>⚠️ Alert</h3>

      {typeof message === "object" ? (
        <div>
          <p>👤 Person: {message.objects?.person ?? 0}</p>
          <p>💻 Laptop: {message.objects?.laptop ?? 0}</p>
          <p>🔎 Suspicious: {message.suspicious ? "Yes" : "No"}</p>
        </div>
      ) : (
        <p>{message}</p>
      )}

      <button
        onClick={onClose}
        style={{
          marginTop: "12px",
          padding: "6px 12px",
          backgroundColor: "#f44336",
          color: "#fff",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
        }}
      >
        Close
      </button>
    </div>
  );
};
export default Popup;
