import { Header } from './Header'
import { Sidebar } from './Sidebar'

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <Sidebar />
      <div className="pl-[76px] xl:pl-64">
        <Header />
        <main className="mx-auto max-w-[1680px] px-6 py-6 2xl:px-8">{children}</main>
      </div>
    </div>
  )
}
