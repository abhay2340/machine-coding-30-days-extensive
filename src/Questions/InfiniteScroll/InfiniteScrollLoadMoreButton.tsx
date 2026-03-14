import {  useMemo, useState } from "react";

export function InfiniteScrollLoadMoreButton() {
  const data = useMemo(() => Array.from({ length: 100 }), [])

  const showRowsCount = 25;
  const [loadedCounter, setLoadedCounter] = useState(1);
  const [visibleRows, setVisibleRows] = useState(data.slice(0, showRowsCount+1));

  const handleLoadMore = () => {
    const newVisibleRows = data.slice(
      loadedCounter * showRowsCount,
      (loadedCounter + 1) * showRowsCount+1,
    );
    setVisibleRows((prev) => [...prev, ...newVisibleRows]);
    setLoadedCounter((prev) => prev + 1);
  };
  return (
    <div>
      <h1 style={{ textAlign: "center" }}>Infinite Scroll Table</h1>
      <div style={{ maxHeight: "600px", overflow: "scroll", width: "100%" }}>
        <table style={{ border: "1px solid", width: "100%" }}>
          <thead style={{position:"sticky",top:"0",backgroundColor:"red"}}>
            <tr>
              <th>1</th>
              <th>2</th>
              <th>3</th>
              <th>4</th>
            </tr>
          </thead>
          <tbody>
          {visibleRows.map((row, index) => (
            <tr style={{ border: "1px solid" }} key={index}>
              <td style={{ border: "1px solid", width: "20%" }}>{index}</td>
              <td style={{ border: "1px solid", width: "20%" }}>{index}</td>
              <td style={{ border: "1px solid", width: "20%" }}>{index}</td>
              <td style={{ border: "1px solid", width: "20%" }}>{index}</td>
            </tr>
          ))}
          </tbody>
        </table>
      </div>
      <button onClick={handleLoadMore}>Load More</button>
    </div>
  );
}
