# Escala MESC — Demonstrativo HTML

Webapp React para ler uma planilha do Google Drive e gerar um demonstrativo da escala MESC em HTML, pronto para impressão (A4 horizontal / PDF).

## Requisitos

- Node.js 18+
- Planilha Google Sheets compartilhada como **Qualquer pessoa com o link pode ver**

## Instalação

```bash
npm install
npm run dev
```

Abra `http://localhost:5173` no navegador.

## Configuração persistente

Configure uma vez e o app carrega automaticamente ao abrir.

### Opção 1 — `public/config.json` (recomendado)

```bash
cp public/config.example.json public/config.json
```

Edite `public/config.json`:

```json
{
  "spreadsheetId": "https://docs.google.com/spreadsheets/d/SEU_ID/...",
  "sheetName": "Escala",
  "titulo": "Demonstrativo · Escala MESC",
  "subtitulo": "Ministério de Escalas · Comunidade",
  "periodo": "Julho 2026",
  "coordenacao": "João Silva\nMaria Santos"
}
```

### Opção 2 — `.env`

```bash
cp .env.example .env
```

Preencha as variáveis `VITE_*`. Elas sobrescrevem valores do JSON quando definidas.

**Prioridade de carregamento:** `config.json` → `.env` → alterações salvas no navegador.

## Uso

1. Configure a planilha em **Configuração** ou diretamente no `config.json` / `.env`.
2. Após alterar a estrutura da planilha, vá em **Planilha** → **Reler planilha**.
3. Confira o mapeamento de colunas e a prévia bruta; ajuste `headerRow` ou `columns` se necessário.
4. Na aba **Demonstrativo**, clique em **Atualizar escala** e gere o HTML.

## Formato da planilha

A primeira linha deve ser o cabeçalho. Colunas reconhecidas automaticamente:

| Coluna     | Alternativas                          |
|------------|---------------------------------------|
| Data       | —                                     |
| Dia        | Dia da semana                         |
| Horário    | Hora                                  |
| Evento     | Culto, Missa, Atividade               |
| Função     | Ministério, Papel                     |
| Servo      | Nome, Voluntário, Responsável         |
| Observação | Obs, Nota                             |

Exemplo:

| Data       | Dia   | Horário | Evento        | Função      | Servo         | Observação |
|------------|-------|---------|---------------|-------------|---------------|------------|
| 05/07/2026 | Dom   | 19:00   | Missa dominical | Ministro    | João Silva    |            |
| 05/07/2026 | Dom   | 19:00   | Missa dominical | Leitor      | Maria Santos  |            |

## Como compartilhar a planilha

1. Abra a planilha no Google Sheets.
2. Clique em **Compartilhar**.
3. Em «Acesso geral», escolha **Qualquer pessoa com o link** → **Leitor**.

## Scripts

```bash
npm run dev      # desenvolvimento
npm run build    # build de produção
npm run preview  # preview do build
```

## Observações

- Não é necessário API key nem OAuth: a planilha precisa estar pública para leitura.
- A configuração persistente fica em `public/config.json` ou `.env`; o navegador guarda cópia ao salvar pela tela de Configuração.
- O HTML gerado inclui CSS de impressão otimizado para A4 horizontal.
# escala-mesc
