import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";

//WIP (currently broken)
export default function MoveableWindow({
  title = "Window",
  children,
  initial = { x: 100, y: 100, width: 480, height: 320 },
  minWidth = 200,
  minHeight = 120,
  onClose = () => {},
  className = "",
}) {
  const [pos, setPos] = useState({ x: initial.x, y: initial.y });
  const [size, setSize] = useState({ width: initial.width, height: initial.height });
  const draggingRef = useRef(null);
  const resizingRef = useRef(null);

  // --- Mouse / touch move handlers ---
  useEffect(() => {
    const onMove = (e) => {
      const clientX = e.clientX ?? e.touches?.[0]?.clientX;
      const clientY = e.clientY ?? e.touches?.[0]?.clientY;
      if (!clientX || !clientY) return;

      if (draggingRef.current) {
        const { startX, startY, origX, origY } = draggingRef.current;
        setPos({ x: origX + clientX - startX, y: origY + clientY - startY });
      }

      if (resizingRef.current) {
        const { startX, startY, origW, origH } = resizingRef.current;
        setSize({
          width: Math.max(minWidth, origW + clientX - startX),
          height: Math.max(minHeight, origH + clientY - startY),
        });
      }
    };

    const onEnd = () => {
      draggingRef.current = null;
      resizingRef.current = null;
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onEnd);
    window.addEventListener("touchmove", onMove, { passive: false });
    window.addEventListener("touchend", onEnd);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onEnd);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("touchend", onEnd);
    };
  }, [minWidth, minHeight]);

  // --- Escape key to close ---
  useEffect(() => {
    const handleEscape = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  // --- Start drag / resize ---
  const startDrag = (e) => {
    e.preventDefault();
    const clientX = e.clientX ?? e.touches?.[0]?.clientX;
    const clientY = e.clientY ?? e.touches?.[0]?.clientY;
    draggingRef.current = { startX: clientX, startY: clientY, origX: pos.x, origY: pos.y };
  };

  const startResize = (e) => {
    e.preventDefault();
    const clientX = e.clientX ?? e.touches?.[0]?.clientX;
    const clientY = e.clientY ?? e.touches?.[0]?.clientY;
    resizingRef.current = { startX: clientX, startY: clientY, origW: size.width, origH: size.height };
  };

  // --- Render via React Portal ---
  return createPortal(
    <div
      className={`fixed shadow-2xl rounded-lg overflow-hidden bg-white ${className}`}
      style={{ left: pos.x, top: pos.y, width: size.width, height: size.height, touchAction: "none", zIndex: 50 }}
    >
      {/* Header (drag handle) */}
      <div
        className="flex items-center justify-between px-3 py-2 cursor-move select-none bg-gray-100"
        onMouseDown={startDrag}
        onTouchStart={startDrag}
      >
        <div className="text-sm font-medium">{title}</div>
        <button onClick={onClose} className="px-2 py-1 rounded hover:bg-gray-200">
          ✕
        </button>
      </div>

      {/* Content */}
      <div className="p-3 overflow-auto" style={{ height: `calc(${size.height}px - 40px)` }}>
        {children}
      </div>

      {/* Resize handle */}
      <div
        onMouseDown={startResize}
        onTouchStart={startResize}
        className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize bg-gray-300"
      />
    </div>,
    document.body
  );
}
