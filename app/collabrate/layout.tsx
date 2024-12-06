import { Navbar } from '../(marketing)/_components/Navbar';

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="dark:bg-neutral-300">
      <Navbar />
      <main className="">{children}</main>
    </div>
  );
}
