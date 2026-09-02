# Módulo de Configurações e Controle de Cargos

## Objetivo
Transformar **Configuração** em um módulo administrativo completo, com personalização visual da loja e gestão de cargos, acessível exclusivamente à conta `marketing@digitaletextil.com.br`.

## O que será construído
- Proteger o módulo no menu, na rota e no banco de dados, evitando que apenas esconder o link no frontend seja usado como segurança.
- Organizar Configurações em áreas: Loja, Design e layout, Frete, Pagamento e Cargos.
- Adicionar opções de design da loja: paleta semântica, estilo do cabeçalho, densidade/grade de produtos, exibição de busca, contatos, anúncio e seções da página inicial.
- Fazer a loja pública consumir essas preferências e aplicar o layout selecionado de forma responsiva.
- Criar gestão de cargos para listar usuários internos e alterar suas funções, preservando regras de segurança e impedindo que clientes da loja sejam promovidos acidentalmente.
- Garantir que somente a conta de marketing possa administrar cargos e configurações, inclusive por políticas do banco.

## Segurança
- A autorização será validada pelo ID autenticado e pelo e-mail verificado no backend; não dependerá de localStorage nem de um e-mail enviado pelo navegador.
- Cargos continuarão em tabela separada de perfis/usuários.
- A conta de marketing receberá permissão exclusiva para o módulo, sem liberar essa capacidade a administradores comuns.
- Alterações de cargo serão validadas por função segura no banco, com valores permitidos e proteção contra remoção do acesso do gestor principal.

## Validação
- Verificar tipos TypeScript e build automático.
- Testar menu e rota com conta autorizada e confirmar bloqueio para conta não autorizada quando houver sessão disponível.
- Validar que preferências salvas aparecem na loja e persistem após recarregar.
- Executar o linter de segurança do banco após a migração.

## Detalhes técnicos
- Evoluir `store_settings` com uma configuração JSON de tema/layout, mantendo compatibilidade com os dados atuais.
- Criar uma função de autorização específica para o módulo e políticas RLS restritas.
- Criar uma RPC segura para administração de cargos; o frontend não fará edição direta irrestrita em `user_roles`.
- Separar a página em componentes menores para manter o módulo sustentável.
