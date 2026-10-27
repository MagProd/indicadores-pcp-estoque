import type { DashboardDataset } from '@/domain/types'
import { apiGet } from './apiClient'
import { appConfig } from './config'

/**
 * Contrato da camada de acesso a dados. A camada visual depende apenas desta
 * interface; trocar dados fictícios pela API corporativa é uma mudança de
 * configuração (VITE_DATA_SOURCE=api), sem alterar páginas ou componentes.
 *
 * O navegador NUNCA conecta diretamente ao SQL Server: a implementação "api"
 * chama endpoints HTTPS de uma API/BFF corporativa autenticada via Entra ID.
 */
export interface IndicadoresDataSource {
  carregarDataset(): Promise<DashboardDataset>
}

const mockDataSource: IndicadoresDataSource = {
  async carregarDataset() {
    // Import dinâmico: os dados fictícios não entram no bundle no modo "api".
    const { gerarDatasetFicticio } = await import('@/mocks/fixtures')
    await new Promise((r) => setTimeout(r, 350))
    return gerarDatasetFicticio()
  },
}

/**
 * Endpoints esperados da API corporativa (sugestão de contrato — ver PLAN.md).
 * Cada recurso pode ser carregado separadamente quando a API existir.
 */
const httpDataSource: IndicadoresDataSource = {
  async carregarDataset() {
    return apiGet<DashboardDataset>('/v1/indicadores/dataset')
  },
}

export const dataService: IndicadoresDataSource =
  appConfig.dataSource === 'api' ? httpDataSource : mockDataSource
