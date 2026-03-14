import { useEffect, useRef, useState } from "react";

export function ModalSimple() {
  const [openModal, setOpenModal] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      setOpenModal(false);
    }
  };

  const handleKeys = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Escape") {
      setOpenModal(false);
    }
  };

  useEffect(() => {
    if (openModal) {
      ref.current?.focus();
    }
  }, [openModal]);

  return (
    <div>
      <button onClick={() => setOpenModal(true)}>Open Modal</button>

      {openModal && (
        <div
          ref={ref}
          tabIndex={0}
          onClick={handleClick}
          onKeyDown={handleKeys}
          style={{
            position: "fixed",
            inset: 0,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "rgba(79,74,74,0.5)",
            backdropFilter: "blur(2px)",
          }}
        >
          <div
            style={{
              backgroundColor: "white",
              borderRadius: "8px",
              padding: "40px",
              height: "200px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            This is a modal
            <button onClick={() => setOpenModal(false)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}