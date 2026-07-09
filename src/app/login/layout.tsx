export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // No forced theme — inherits the user's selected theme from root layout
  return <>{children}</>;
}
