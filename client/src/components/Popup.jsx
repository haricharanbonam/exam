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
import Modal from "./Modal";
const Popup = ({ message, onClose }) => {
  const cheatCount = message?.cheatCount;
  const snapshot = message?.snapshot || message?.image;
  return (
    <Modal onClose={onClose}>
      <div
        style={{
          backgroundColor: "#fff",
          padding: "32px",
          borderRadius: "12px",
          width: "90%",
          maxWidth: "400px",
          textAlign: "center",
          boxShadow: "0 8px 24px rgba(0, 0, 0, 0.2)",
        }}
      >
        <h2 style={{ marginBottom: "16px", color: "#d32f2f" }}>
          ⚠️ Cheating Detected
        </h2>
        {snapshot && typeof snapshot === "string" && snapshot.startsWith("data:image") && (
          <img
            src={snapshot}
            alt="Snapshot"
            style={{
              width: "100%",
              borderRadius: "8px",
              marginBottom: "12px",
              border: "1px solid #e2e8f0",
            }}
          />
        )}
        {cheatCount ? (
          <>
            <p style={{ fontSize: "16px", marginBottom: "12px" }}>
              You have been detected cheating <strong>{cheatCount}</strong> time
              {cheatCount > 1 ? "s" : ""}.
            </p>
            <p
              style={{ fontSize: "15px", color: "#555", marginBottom: "20px" }}
            >
              Further violations will result in immediate submission of your
              test.
            </p>
          </>
        ) : (
          <p style={{ fontSize: "16px", marginBottom: "20px" }}>
            Suspicious activity detected.
          </p>
        )}
        <button
          onClick={onClose}
          style={{
            padding: "10px 24px",
            backgroundColor: "#1976d2",
            color: "#fff",
            border: "none",
            borderRadius: "6px",
            fontSize: "16px",
            cursor: "pointer",
          }}
        >
          OK
        </button>
      </div>
    </Modal>
  );
};

export default Popup;
