# Casos de Teste - Velô Sprint (Configurador de Veículo Elétrico)

Este documento contém os casos de teste para o sistema Velô Sprint, cobrindo os módulos de Landing Page, Configurador de Veículo, Checkout/Pedido, Análise de Crédito, Confirmação e Consulta de Pedidos.

---

### CT01 - Acesso e Navegação da Landing Page para o Configurador

#### Objetivo
Garantir que o usuário consegue visualizar a Landing Page e ser redirecionado corretamente para a página do Configurador de Veículo.

#### Pré-Condições
- O sistema deve estar acessível e online.
- O usuário deve estar na rota inicial (`/`).

#### Passos

| Id | Ação | Resultado Esperado |
|----|------|--------------------|
| 1  | Acessar a URL principal da aplicação. | A Landing Page é exibida corretamente com as informações do Velô Sprint. |
| 2  | Clicar no botão ou link "Configurar" (ou equivalente) para iniciar a configuração. | O sistema redireciona o usuário para a rota `/configure`. |
| 3  | Aguardar o carregamento da tela do Configurador. | O modelo 3D/imagem do veículo e o painel de configuração são exibidos. |

#### Resultados Esperados
- O usuário deve conseguir transitar da tela inicial para a tela de configurações do veículo sem erros.

#### Critérios de Aceitação
- A navegação ocorre para a rota `/configure`.
- A interface de configuração carrega os elementos centrais (veículo e painel lateral).

---

### CT02 - Configurador - Validação de Precificação (Veículo Base)

#### Objetivo
Validar se o valor exibido inicialmente no configurador corresponde ao preço base do veículo sem opcionais.

#### Pré-Condições
- O usuário deve estar na página do configurador (`/configure`).
- Nenhuma modificação opcional adicional foi selecionada ainda.

#### Passos

| Id | Ação | Resultado Esperado |
|----|------|--------------------|
| 1  | Observar o painel de resumo de valores da configuração atual. | O sistema exibe o preço ou subtotal inicial. |
| 2  | Verificar se o valor corresponde ao preço base configurado nas regras de negócio. | O valor exibido é de R$ 40.000. |

#### Resultados Esperados
- O sistema deve carregar o preço base correto para um novo fluxo de configuração, que é de R$ 40.000.

#### Critérios de Aceitação
- Preço base exibido deve ser exatamente R$ 40.000.

---

### CT03 - Configurador - Validação de Precificação com Opcionais

#### Objetivo
Garantir que a adição de pacotes opcionais aplique os devidos acréscimos na precificação final do veículo.

#### Pré-Condições
- O usuário encontra-se na página do configurador (`/configure`).

#### Passos

| Id | Ação | Resultado Esperado |
|----|------|--------------------|
| 1  | No painel de configuração, selecionar a opção de rodas "Sport". | O preço total é atualizado com um acréscimo de +R$ 2.000. |
| 2  | Na aba de opcionais/tecnologia, selecionar "Precision Park". | O preço total é atualizado com um acréscimo de +R$ 5.500. |
| 3  | Na aba de opcionais/tecnologia, selecionar "Flux Capacitor". | O preço total é atualizado com um acréscimo de +R$ 5.000. |
| 4  | Remover a seleção do pacote "Precision Park". | O sistema reduz R$ 5.500 do total. |

#### Resultados Esperados
- Os valores acompanham em tempo real as seleções do usuário de forma cumulativa correta, refletindo as regras de negócio de preços.

#### Critérios de Aceitação
- Com Rodas Sport: Novo total R$ 42.000.
- Com Rodas Sport + Precision Park + Flux Capacitor: Novo total R$ 52.500.
- A subtração ao desmarcar o item ocorre corretamente, voltando o total para R$ 47.000.

---

### CT04 - Checkout - Validação de Campos Obrigatórios de Cadastro (Fluxo Negativo)

#### Objetivo
Garantir que o usuário não consegue prosseguir e concluir o pedido sem preencher todos os dados obrigatórios do formulário pessoal.

#### Pré-Condições
- O usuário realizou a configuração de um veículo e avançou para a tela de finalização de pedido (`/order`).

#### Passos

| Id | Ação | Resultado Esperado |
|----|------|--------------------|
| 1  | Manter os campos Nome, Sobrenome, Email, Telefone, CPF e Loja de Retirada vazios. | Os campos permanecem em branco. |
| 2  | Não marcar a caixa "Li e aceito os Termos de Uso e Política de Privacidade". | A caixa de seleção fica desmarcada. |
| 3  | Clicar no botão "Confirmar Pedido". | O sistema bloqueia a submissão e exibe mensagens de erro em todos os campos obrigatórios. |
| 4  | Preencher apenas o "Nome" com 1 caractere. | O campo deve exibir alerta de "Nome deve ter pelo menos 2 caracteres". |
| 5  | Inserir um e-mail sem formato válido (ex: "teste@teste"). | O campo deve exibir alerta de "Email inválido". |

#### Resultados Esperados
- O sistema intercepta erros de validação localmente e informa o usuário quais campos necessitam ajuste antes da submissão para backend.

#### Critérios de Aceitação
- Botão "Confirmar Pedido" processa validações no schema.
- Exibição em vermelho/mensagens de erro abaixo de cada input faltante ou bloqueio da chamada ao backend.

---

### CT05 - Checkout - Simulação de Financiamento (Validação de Juros em 12x)

#### Objetivo
Verificar se o cálculo das parcelas do financiamento respeita a regra de negócio da taxa fixa de 2% ao mês sobre o saldo devedor financiado, para uma compra em 12x.

#### Pré-Condições
- O usuário está na tela de Checkout (`/order`).
- O valor do veículo configurado está definido em R$ 40.000.

#### Passos

| Id | Ação | Resultado Esperado |
|----|------|--------------------|
| 1  | Selecionar a aba/botão "Financiamento" nas "Formas de Pagamento". | O campo "Valor da Entrada" é habilitado. |
| 2  | Inserir "0" no Valor da Entrada. | O valor a financiar é R$ 40.000. O sistema calcula a parcela e exibe. |
| 3  | Conferir o valor unitário da parcela para 12x exibido em tela e total financiado. | A parcela deve ser exibida segundo a regra do sistema `(Total - Entrada) / 12 * 1.02`. |
| 4  | Inserir R$ 10.000 no "Valor da Entrada". | O saldo a financiar cai para R$ 30.000, recalculando os juros e parcelas sobre esse novo montante. |

#### Resultados Esperados
- O dinamismo da interface deve mostrar as reduções nas parcelas de forma compatível com a entrada fornecida e aplicar 2% a.m. ao saldo restante dividido por 12.

#### Critérios de Aceitação
- Se o veículo custa R$ 40.000 e entrada for 0: parcela = R$ 3.400,00 `((40000 / 12) * 1.02)`, Total de financiamento R$ 40.800,00.

---

### CT06 - Análise de Crédito Automática - Score Alto > 700 (Aprovado)

#### Objetivo
Validar se uma tentativa de financiamento com um CPF simulado tendo Score de Crédito > 700 resulta na aprovação imediata do pedido.

#### Pré-Condições
- Usuário na página do Checkout (`/order`) com todos os campos preenchidos corretamente.
- Forma de pagamento selecionada: Financiamento com entrada abaixo de 50%.
- A conexão/mock com o backend retorna score igual a 750 (Score Alto).

#### Passos

| Id | Ação | Resultado Esperado |
|----|------|--------------------|
| 1  | Preencher os dados obrigatórios e inserir um CPF associado a Score > 700 no servidor/mock. | Formulário preenchido sem erros. |
| 2  | Marcar aceite de Termos de Uso. | Checkbox ativado. |
| 3  | Clicar em "Confirmar Pedido". | O sistema chama a API de crédito e processa o checkout. |
| 4  | Aguardar a transição para a tela de sucesso (`/success`). | A tela exibe a confirmação de sucesso com status do pedido "APROVADO". |

#### Resultados Esperados
- O pedido deve ser gerado no banco de dados e ter o seu `status` atribuído como `APROVADO` devido à regra de Score Alto.

#### Critérios de Aceitação
- Sistema reflete status "APROVADO".
- Permite geração do ID único de pedido.

---

### CT07 - Análise de Crédito Automática - Score Médio (501 a 700) (Em Análise)

#### Objetivo
Validar se uma tentativa de financiamento tendo Score entre 501 e 700 marca o pedido como pendente ("Em análise").

#### Pré-Condições
- Usuário na página do Checkout (`/order`) com formulário válido.
- Forma de pagamento: Financiamento com entrada abaixo de 50%.
- Conexão do backend para o CPF informado retorna score igual a 600.

#### Passos

| Id | Ação | Resultado Esperado |
|----|------|--------------------|
| 1  | Preencher os dados preenchendo o CPF condicionado e confirmar submissão de Pedido. | O sistema envia a requisição de checkout e faz a chamada de crédito. |
| 2  | Aguardar a tela de conclusão de pedido (`/success`). | O sistema conclui o pedido e indica que o pedido se encontra no status "EM_ANALISE". |

#### Resultados Esperados
- O pedido é registrado, contudo o status retornado para o cliente é EM_ANALISE (ou análogo, informando que a aprovação não é imediata e demanda checagem manual/futura).

#### Critérios de Aceitação
- O banco e a interface indicam status `EM_ANALISE`.

---

### CT08 - Análise de Crédito Automática - Score Baixo <= 500 (Reprovado)

#### Objetivo
Validar se um CPF bloqueado e com Score Baixo resulta na reprovação automática do pedido para financiamento.

#### Pré-Condições
- Usuário na tela de Checkout (`/order`) com dados preenchidos válidos e Financiamento escolhido (entrada inferior a 50%).
- Backend retorna Score igual a 450 para o CPF analisado.

#### Passos

| Id | Ação | Resultado Esperado |
|----|------|--------------------|
| 1  | Clicar para Confirmar Pedido com os dados no formato pronto para reprovação. | Sistema faz a checagem no crédito. |
| 2  | Aguardar a finalização em tela de sucesso. | Sistema registra a tentativa criando o Pedido mas o classifica com status "REPROVADO". |

#### Resultados Esperados
- O sistema nega aprovação em resposta imediata, atrelando ao status de reprovação do pedido criado.

#### Critérios de Aceitação
- Status em banco e tela será `REPROVADO`.

---

### CT09 - Análise de Crédito - Exceção de Entrada >= 50% (Aprovação Automática)

#### Objetivo
Garantir o fluxo de "bypass" das regras tradicionais do score caso o cliente injete uma entrada de 50% ou mais no fluxo de financiamento.

#### Pré-Condições
- O usuário está no Checkout (`/order`) informando um CPF que normalmente resultaria em score baixo/reprovação (Score <= 500).
- Produto escolhido tem total, por exemplo, R$ 40.000.

#### Passos

| Id | Ação | Resultado Esperado |
|----|------|--------------------|
| 1  | Selecionar "Financiamento" nas Formas de Pagamento. | Aparecem os campos de financiamento. |
| 2  | Inserir Valor de Entrada igual ou maior a R$ 20.000 (>= 50% de 40.000). | Valores de parcela e juros são recalculados sobre o restante. |
| 3  | Clicar em "Confirmar Pedido". | O sistema emite a requisição do checkout. |
| 4  | Verificar a tela de finalização de pedido (`/success`). | O pedido sofre *bypass* no score e indica obrigatoriamente status "APROVADO". |

#### Resultados Esperados
- Apesar do baixo score do CPF, o sistema aceita a robustez da entrada oferecida (maior/igual à metade do valor do bem) e defere a requisição com aprovação automática.

#### Critérios de Aceitação
- Ocorrer aprovação independente do Score de API caso `(entrada / valortotal) >= 0.5`.

---

### CT10 - Consulta de Pedidos Válida (`order_number`)

#### Objetivo
Verificar se a aba ou página de consulta de pedido retorna os dados precisos de um pedido existente dado o seu número único e assegura que dados não listam abertos a buscas aleatórias.

#### Pré-Condições
- O cliente possui um "Número de Pedido" (`order_number`) anotado a partir de um pedido finalizado no sistema de Banco de Dados.
- O usuário encontra-se na página de Consulta de Pedidos (`/lookup`).

#### Passos

| Id | Ação | Resultado Esperado |
|----|------|--------------------|
| 1  | Inserir o número correto e real de um pedido (Ex: `ord_123456`) no campo de busca. | O campo recebe a formatação. |
| 2  | Clicar no botão "Buscar Pedido" ou ícone de pesquisa. | O sistema entra em estado de requisição ("Buscando..."). |
| 3  | Aguardar os resultados na tela. | O sistema exibe o status atualizado do pedido, modelo configurado, cliente e valores totais associados. |

#### Resultados Esperados
- Exibição de componente/card com os detalhes completos salvos na base daquele rastreio exclusivo.

#### Critérios de Aceitação
- Exibir os dados consistentes ao ID.

---

### CT11 - Consulta de Pedidos Inválida (Restrição de Segurança)

#### Objetivo
Assegurar que o sistema trata buscas ou hashes incorretos retornando falha de exibição como método de contenção/segurança.

#### Pré-Condições
- O usuário encontra-se na página de Consulta de Pedidos (`/lookup`).

#### Passos

| Id | Ação | Resultado Esperado |
|----|------|--------------------|
| 1  | Inserir um número de pedido falso, aleatório ou com formatação adulterada (ex: `invalido123`). | O campo é preenchido. |
| 2  | Clicar em "Buscar Pedido". | O sistema chama o backend enviando o hash inválido. |
| 3  | Avaliar o alerta retornado na página. | O sistema exibe componente de erro ou mensagem de "Pedido não encontrado". Nenhum dado real é demonstrado. |

#### Resultados Esperados
- Ninguém sem o correto número restrito (chave/hash do pedio) deve conseguir pescar informações de clientes na base.

#### Critérios de Aceitação
- Estado "NotFound" com feedback explícito da busca vazia ou incorreta no formulário. Tolerância Zero a vazamento de lista.
