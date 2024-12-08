export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="min-h-screen dark:bg-[#222222]">{children}</div>;
}
