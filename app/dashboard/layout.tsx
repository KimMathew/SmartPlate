import type React from "react"
// Add a layout file for the dashboard
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <div className="min-h-screen bg-white">{children}</div>
}
