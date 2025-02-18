export default function CanvasLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <div className="w-full h-full">{children}</div>;
}