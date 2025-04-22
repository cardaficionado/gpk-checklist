// /src/app/topps/gpk/layout.tsx

export const metadata = {
  title: "2022 Topps Garbage Pail Kids",
  description: "View and track your 2022 Topps GPK Non-Flushable Tokens collection.",
};

export default function GpkLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="p-4">
      {children}
    </div>
  );
}