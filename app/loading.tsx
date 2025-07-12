// app/loading.tsx
export default function Loading() {
  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        display: "flex", // Enable flexbox
        justifyContent: "center", // Center horizontally
        alignItems: "center", // Center vertically
        textAlign: "center", // Ensure text alignment
      }}
    >
      Loading...
    </div>
  );
}