import React, { useEffect, useRef } from "react";

const Modal = ({ onClose, closeOnBackdropClick = true, className = "", children }) => {
  const innerRef = useRef(null);

  useEffect(() => {
    if (!onClose) return;
    const handler = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const handleBackdropMouseDown = (e) => {
    if (!closeOnBackdropClick || !onClose) return;
    if (innerRef.current && !innerRef.current.contains(e.target)) {
      onClose();
    }
  };

  return (
    <div
      onMouseDown={handleBackdropMouseDown}
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <div ref={innerRef} className={className}>
        {children}
      </div>
    </div>
  );
};

export default Modal;
