// import { useMemo, useState, type UIEvent } from "react";


// type ThrottleFn<T extends (...args: any[]) => void> = (...args: Parameters<T>) => void

//  function throttle<T extends (...args: any[]) => void>(
//   fn: T,
//   delay: number
// ): ThrottleFn<T> {

//   let lastCall = 0

//   return (...args: Parameters<T>) => {
//     const now = Date.now()

//     if (now - lastCall >= delay) {
//       lastCall = now
//       fn(...args)
//     }
//   }
// }

// export function InfiniteScrollAuto() {


//   const data = useMemo(() => Array.from({ length: 100 }), []);

//   const PAGE_SIZE = 25;



//   const [visibleRows, setVisibleRows] = useState(
//     data.slice(0, PAGE_SIZE)
//   );

// const handleLoadMore = useMemo(
//   () =>
//     throttle(() => {
//       setVisibleRows((prevRows) => {

//         if (prevRows.length >= data.length) {
//           return prevRows
//         }

//         const start = prevRows.length
//         const end = start + PAGE_SIZE

//         const newRows = data.slice(start, end)

//         return [...prevRows, ...newRows]
//       })
//     }, 200),
//   [data]
// )



//   const handleScroll = (e: UIEvent<HTMLDivElement>) => {

//     const container = e.currentTarget;

//     /**
//      * Scroll math
//      *
//      * scrollTop      -> pixels scrolled from top
//      * clientHeight   -> visible container height
//      * scrollHeight   -> full scrollable content height
//      */
//    console.log(container.scrollTop,container.clientHeight,container.scrollHeight)
//     const scrollPosition =
//       container.scrollTop + container.clientHeight;

//     const bottomThreshold = container.scrollHeight - 10;

//     if (scrollPosition >= bottomThreshold) {
//       handleLoadMore();
//     }
//   };

//   return (
//     <div>

//       <h1 style={{ textAlign: "center" }}>
//         Infinite Scroll Table
//       </h1>

//       <div
//         style={{
//           maxHeight: "500px",
//           overflow: "auto",
//           width: "100%",
//         }}
//         onScroll={handleScroll}
//       >

//         <table
//           style={{
//             border: "1px solid",
//             width: "100%",
//             borderCollapse: "collapse",
//           }}
//         >

//           {/* Sticky table header */}
//           <thead
//             style={{
//               position: "sticky",
//               top: 0,
//               backgroundColor: "white",
//               zIndex: 1,
//             }}
//           >
//             <tr>
//               <th>1</th>
//               <th>2</th>
//               <th>3</th>
//               <th>4</th>
//             </tr>
//           </thead>

//           <tbody>
//             {visibleRows.map((_, index) => (
//               <tr key={index}>

//                 <td>{index}</td>
//                 <td>{index}</td>
//                 <td>{index}</td>
//                 <td>{index}</td>

//               </tr>
//             ))}
//           </tbody>

//         </table>
//       </div>

//       {/* Manual fallback load (useful for testing) */}
//       <button onClick={handleLoadMore}>
//         Load More
//       </button>

//     </div>
//   );
// }
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

// ─── Types ───────────────────────────────────────────────────────────────────

interface Row {
  id: number;
  col1: string;
  col2: string;
  col3: string;
  col4: string;
}

type Status = "idle" | "loading" | "exhausted" | "error";

// ─── Constants ───────────────────────────────────────────────────────────────

const PAGE_SIZE = 25;
const SCROLL_THRESHOLD_PX = 120;
const THROTTLE_MS = 200;

// ─── Helpers ─────────────────────────────────────────────────────────────────

function throttle<T extends (...args: never[]) => void>(fn: T, delay: number): T {
  let lastCall = 0;
  return ((...args: Parameters<T>) => {
    const now = Date.now();
    if (now - lastCall >= delay) {
      lastCall = now;
      fn(...args);
    }
  }) as T;
}

/** Simulates a network fetch — swap with your real API call. */
async function fetchRows(offset: number, limit: number): Promise<Row[]> {
  await new Promise((res) => setTimeout(res, 600)); // fake latency
  return Array.from({ length: limit }, (_, i) => {
    const n = offset + i + 1;
    return {
      id: n,
      col1: `Alpha ${n}`,
      col2: `Beta ${n}`,
      col3: `Gamma ${n}`,
      col4: `Delta ${n}`,
    };
  });
}

const TOTAL_ROWS = 100; // replace with server-driven value

// ─── Component ───────────────────────────────────────────────────────────────

export function InfiniteScrollAuto() {
  const [rows, setRows] = useState<Row[]>([]);
  const [status, setStatus] = useState<Status>("idle");
  const scrollRef = useRef<HTMLDivElement>(null);
  const loadingRef = useRef(false); // guard against concurrent fetches

  // ── Data loading ──────────────────────────────────────────────────────────

  const loadMore = useCallback(async () => {
    if (loadingRef.current) return;

    setRows((prev) => {
      if (prev.length >= TOTAL_ROWS) return prev; // nothing left
      return prev;
    });

    // Read current length outside setState to decide whether to fetch
    setRows((prev) => {
      if (prev.length >= TOTAL_ROWS) {
        setStatus("exhausted");
        return prev;
      }
      return prev; // real fetch triggered below
    });

    // Use a ref snapshot to avoid stale closure issues
    const currentLength = rows.length; // captured at call time

    if (currentLength >= TOTAL_ROWS) {
      setStatus("exhausted");
      return;
    }

    loadingRef.current = true;
    setStatus("loading");

    try {
      const limit = Math.min(PAGE_SIZE, TOTAL_ROWS - currentLength);
      const newRows = await fetchRows(currentLength, limit);
      setRows((prev) => [...prev, ...newRows]);
      setStatus(prev => {
        // check after append
        return currentLength + newRows.length >= TOTAL_ROWS ? "exhausted" : "idle";
      });
    } catch {
      setStatus("error");
    } finally {
      loadingRef.current = false;
    }
  }, [rows.length]);

  // Initial load
  useEffect(() => {
    loadMore();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Scroll handling ───────────────────────────────────────────────────────

  const handleScroll = useMemo(
    () =>
      throttle(() => {
        const el = scrollRef.current;
        if (!el || status === "loading" || status === "exhausted" || status === "error") return;

        const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
        if (distanceFromBottom <= SCROLL_THRESHOLD_PX) {
          loadMore();
        }
      }, THROTTLE_MS),
    [loadMore, status]
  );

  // ── Derived state ─────────────────────────────────────────────────────────

  const isEmpty = rows.length === 0 && status !== "loading";

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div style={styles.wrapper}>
      <header style={styles.header}>
        <h1 style={styles.title}>Records</h1>
        <span style={styles.badge} aria-live="polite">
          {rows.length} / {TOTAL_ROWS}
        </span>
      </header>

      <div
        ref={scrollRef}
        onScroll={handleScroll}
        style={styles.scrollContainer}
        role="region"
        aria-label="Scrollable data table"
        tabIndex={0}
      >
        <table style={styles.table} aria-rowcount={TOTAL_ROWS}>
          <thead>
            <tr>
              {["Alpha", "Beta", "Gamma", "Delta"].map((col) => (
                <th key={col} scope="col" style={styles.th}>
                  {col}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {rows.map((row, i) => (
              <tr
                key={row.id}
                style={i % 2 === 0 ? styles.trEven : styles.trOdd}
                aria-rowindex={i + 1}
              >
                <td style={styles.td}>{row.col1}</td>
                <td style={styles.td}>{row.col2}</td>
                <td style={styles.td}>{row.col3}</td>
                <td style={styles.td}>{row.col4}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* States rendered below the table, inside the scroll container */}
        {status === "loading" && (
          <div style={styles.stateRow} role="status" aria-label="Loading more rows">
            <Spinner /> Loading…
          </div>
        )}
        {status === "exhausted" && (
          <div style={styles.stateRow} aria-live="polite">
            ✓ All {TOTAL_ROWS} rows loaded
          </div>
        )}
        {status === "error" && (
          <div style={{ ...styles.stateRow, color: "#c0392b" }} role="alert">
            Failed to load.{" "}
            <button style={styles.retryBtn} onClick={loadMore}>
              Retry
            </button>
          </div>
        )}
        {isEmpty && (
          <div style={styles.stateRow} aria-live="polite">
            No data found.
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Spinner ─────────────────────────────────────────────────────────────────

function Spinner() {
  return (
    <span
      style={{
        display: "inline-block",
        width: 14,
        height: 14,
        border: "2px solid #ccc",
        borderTopColor: "#555",
        borderRadius: "50%",
        animation: "spin 0.7s linear infinite",
        marginRight: 6,
      }}
    />
  );
}

// Inject keyframe once
if (typeof document !== "undefined") {
  const id = "__inf_spin";
  if (!document.getElementById(id)) {
    const s = document.createElement("style");
    s.id = id;
    s.textContent = `@keyframes spin { to { transform: rotate(360deg); } }`;
    document.head.appendChild(s);
  }
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles: Record<string, React.CSSProperties> = {
  wrapper: {
    fontFamily: "'Georgia', serif",
    maxWidth: 700,
    margin: "40px auto",
    padding: "0 16px",
  },
  header: {
    display: "flex",
    alignItems: "baseline",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: 700,
    margin: 0,
  },
  badge: {
    fontSize: 13,
    color: "#666",
    fontVariantNumeric: "tabular-nums",
  },
  scrollContainer: {
    maxHeight: 480,
    overflowY: "auto",
    border: "1px solid #ddd",
    borderRadius: 6,
    outline: "none",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: 14,
  },
  th: {
    position: "sticky",
    top: 0,
    backgroundColor: "#f5f5f5",
    borderBottom: "2px solid #ddd",
    padding: "10px 14px",
    textAlign: "left",
    fontWeight: 600,
    zIndex: 1,
  },
  td: {
    padding: "8px 14px",
    borderBottom: "1px solid #eee",
  },
  trEven: { backgroundColor: "#fff" },
  trOdd: { backgroundColor: "#fafafa" },
  stateRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "14px 0",
    fontSize: 13,
    color: "#666",
    gap: 4,
  },
  retryBtn: {
    background: "none",
    border: "none",
    color: "#2563eb",
    cursor: "pointer",
    textDecoration: "underline",
    padding: 0,
    fontSize: 13,
  },
};