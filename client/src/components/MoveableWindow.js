import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";

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
  const actionRef = useRef(null); // can hold drag or resize info

  useEffect(() => {
    const handleMove = (e) => {
      const x = e.clientX ?? e.touches?.[0]?.clientX;
      const y = e.clientY ?? e.touches?.[0]?.clientY;
      if (!x || !y || !actionRef.current) return;

      const { type, startX, startY, origX, origY, origW, origH } = actionRef.current;
      if (type === "drag") {
        setPos({ x: origX + x - startX, y: origY + y - startY });
      } else if (type === "resize") {
        setSize({
          width: Math.max(minWidth, origW + x - startX),
          height: Math.max(minHeight, origH + y - startY),
        });
      }
    };

    const stopAction = () => (actionRef.current = null);

    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseup", stopAction);
    window.addEventListener("touchmove", handleMove, { passive: false });
    window.addEventListener("touchend", stopAction);
    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", stopAction);
      window.removeEventListener("touchmove", handleMove);
      window.removeEventListener("touchend", stopAction);
    };
  }, [minWidth, minHeight]);

  useEffect(() => {
    const onEsc = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, [onClose]);

  const startAction = (type, e) => {
    e.preventDefault();
    const x = e.clientX ?? e.touches?.[0]?.clientX;
    const y = e.clientY ?? e.touches?.[0]?.clientY;
    actionRef.current =
      type === "drag"
        ? { type, startX: x, startY: y, origX: pos.x, origY: pos.y }
        : { type, startX: x, startY: y, origW: size.width, origH: size.height };
  };

  const portalRoot = document.getElementById("portal-root") || document.body;

  return createPortal(
    <div
      style={{
        position: "fixed", left: pos.x, top: pos.y, width: size.width, height: size.height, zIndex: 10000, 
        backgroundColor: "#E7D2AB",
        border: "5px solid black", borderRadius: "8px", boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
        touchAction: "none", pointerEvents: "auto",
	display: "flex", flexDirection: "column", overflow: "hidden",
      }}
    >
      {/* Header (drag handle) */}
      <div
        onMouseDown={(e) => startAction("drag", e)}
        onTouchStart={(e) => startAction("drag", e)}
        style={{
          position: "relative", display: "flex", flexShrink: 0,
          alignItems: "center", justifyContent: "center",
	  backgroundColor: "#38ba5b",
          cursor: "move", userSelect: "none",
          boxSizing: "border-box", borderBottom: "5px solid black", padding: "10px 10px",
        }}
      >
        <span
          style={{
            position: "absolute", left: 0, right: 0,
            textAlign: "center", fontSize: "0.9rem", fontWeight: "700",
          }}
        >
          {title}
        </span>
        <button
          onClick={onClose}
          style={{
            position: "absolute", right: "6px", top: "50%", transform: "translateY(-50%)",
            padding: "2px 6px", borderRadius: "4px", border: "none",
            background: "none",
            cursor: "pointer",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.backgroundColor = "#ddd")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.backgroundColor = "transparent")
          }
        >
          ✕
        </button>
      </div>

      {/* Content */}
      <div
        style={{
          padding: "10px", boxSizing: "border-box",
          flexGrow: 1, overflow: "auto", height: `calc(${size.height}px - 45px)`, // subtract header height
        }}
      >
        {children}
      </div>

      {/* Resize handle */}
      <div
        onMouseDown={(e) => startAction("resize", e)}
        onTouchStart={(e) => startAction("resize", e)}
        style={{
          position: "absolute", bottom: 0, right: 0, width: "12px", height: "12px",
          backgroundColor: "#ccc",
          cursor: "se-resize",
        }}
      />
    </div>,
    portalRoot
  );
}
