import { HeadContent, Outlet, Scripts, createRootRoute } from '@tanstack/react-router'
import { AuthProvider } from '@/auth/AuthContext'
import { AppShell } from '@/components/layout/AppShell'
import { DataProvider } from '@/state/DataContext'
import { FiltersProvider } from '@/state/FiltersContext'

import '../styles.css'

const siteName = 'Indicadores PCP · Planejamento, Estoque e Materiais'
const siteDescription =
  'Painel corporativo de indicadores de PCP, estoques, compras, S&OP e expedição para indústria de equipamentos médicos. Versão de validação com dados fictícios.'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: siteName,
      },
      {
        name: 'description',
        content: siteDescription,
      },
      {
        property: 'og:title',
        content: siteName,
      },
      {
        property: 'og:description',
        content: siteDescription,
      },
      {
        property: 'og:type',
        content: 'website',
      },
      {
        name: 'robots',
        content: 'noindex, nofollow',
      },
    ],
  }),
  shellComponent: RootDocument,
  component: RootLayout,
})

function RootLayout() {
  return (
    <AuthProvider>
      <DataProvider>
        <FiltersProvider>
          <AppShell>
            <Outlet />
          </AppShell>
        </FiltersProvider>
      </DataProvider>
    </AuthProvider>
  )
}

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  )
}
