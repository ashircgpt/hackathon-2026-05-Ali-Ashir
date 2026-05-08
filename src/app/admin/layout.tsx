import AdminSidebar from "@/components/admin/AdminSidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-void text-cream">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto min-h-screen">{children}</main>
    </div>
  );
}
