import type { Familia, Produto } from '@/domain/types'

/** Cadastro FICTÍCIO — nenhum dado real de produto, cliente ou fornecedor. */
export const familias: Familia[] = [
  { id: 'MON', nome: 'Monitores Multiparamétricos' },
  { id: 'INF', nome: 'Bombas de Infusão' },
  { id: 'VEN', nome: 'Ventiladores Pulmonares' },
  { id: 'DEF', nome: 'Desfibriladores' },
  { id: 'OXI', nome: 'Oxímetros de Pulso' },
  { id: 'ECG', nome: 'Eletrocardiógrafos' },
]

const modelos: Record<Familia['id'], { nome: string; custo: number }[]> = {
  MON: [
    { nome: 'Monitor Vita MX-300', custo: 18500 },
    { nome: 'Monitor Vita MX-500', custo: 27400 },
    { nome: 'Monitor Vita MX-700 UTI', custo: 41200 },
    { nome: 'Módulo Capnografia CM-2', custo: 6400 },
  ],
  INF: [
    { nome: 'Bomba Infusa IV-100', custo: 7900 },
    { nome: 'Bomba Infusa IV-200 Dupla', custo: 12300 },
    { nome: 'Bomba Seringa SR-50', custo: 6200 },
    { nome: 'Equipo Infusa EQ-10', custo: 38 },
  ],
  VEN: [
    { nome: 'Ventilador Aera V-60', custo: 64500 },
    { nome: 'Ventilador Aera V-90 UTI', custo: 98200 },
    { nome: 'Ventilador Transporte VT-20', custo: 41800 },
    { nome: 'Circuito Respiratório CR-5', custo: 145 },
  ],
  DEF: [
    { nome: 'Desfibrilador Pulsar D-40', custo: 22600 },
    { nome: 'DEA Pulsar Public P-10', custo: 9800 },
    { nome: 'Cardioversor Pulsar D-80', custo: 35400 },
    { nome: 'Pás Adesivas PA-2', custo: 210 },
  ],
  OXI: [
    { nome: 'Oxímetro Sat O-10 Portátil', custo: 980 },
    { nome: 'Oxímetro Sat O-30 Mesa', custo: 3400 },
    { nome: 'Sensor SpO2 Adulto S-1', custo: 165 },
    { nome: 'Sensor SpO2 Neonatal S-3', custo: 190 },
  ],
  ECG: [
    { nome: 'Eletrocardiógrafo Ritmo E-3', custo: 11200 },
    { nome: 'Eletrocardiógrafo Ritmo E-12', custo: 19800 },
    { nome: 'Holter Ritmo H-24', custo: 8700 },
    { nome: 'Cabo Paciente CP-10', custo: 320 },
  ],
}

export const produtos: Produto[] = familias.flatMap((f, fi) =>
  modelos[f.id].map((m, i) => ({
    codigo: `PA-${f.id}-${1001 + i + fi * 10}`,
    descricao: m.nome,
    familia: f.id,
    custoUnitario: m.custo,
    curvaABC: m.custo > 20000 ? 'A' : m.custo > 3000 ? 'B' : 'C',
  })),
)

export const linhasProducao = [
  'Linha 1 · Montagem Eletrônica',
  'Linha 2 · Montagem Final',
  'Linha 3 · Pneumática',
  'Linha 4 · Acessórios',
]

export const fornecedores = [
  'Alfa Componentes Ltda.',
  'Beta Eletrônica S.A.',
  'Circuitos Delta',
  'Épsilon Plásticos Técnicos',
  'Gama Sensores',
  'Ômega Metais de Precisão',
  'Sigma Embalagens',
  'Zeta Baterias',
]

export const materiais = [
  'Placa de circuito impresso',
  'Display LCD 12"',
  'Bateria Li-ion 14,4V',
  'Gabinete ABS',
  'Sensor de pressão',
  'Válvula proporcional',
  'Cabo blindado',
  'Embalagem hospitalar',
  'Microcontrolador ARM',
  'Fonte chaveada 24V',
]

export const depositos = ['CD Matriz', 'Almoxarifado Produção', 'CD Regional Nordeste']

export const transportadoras = ['TransMed Log', 'Rápido Saúde', 'ViaCarga Express', 'Frota Própria']

export const regioes = ['Sudeste', 'Sul', 'Nordeste', 'Centro-Oeste', 'Norte']

export const clientes = [
  'Hospital Fictício São Lucas',
  'Rede Saúde Exemplo',
  'Clínica Modelo Vida',
  'Hospital Demo Central',
  'Distribuidora MedTeste',
  'Secretaria de Saúde (exemplo)',
]
