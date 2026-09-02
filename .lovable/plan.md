# Logo, uploads e edição do carrossel

## Objetivo
Substituir a identidade visual pelo logotipo anexado, aplicar Helvetica Regular em todo o site e permitir que o usuário autorizado do módulo Configurações envie e gerencie o logo e os slides do carrossel sem depender de URLs externas.

## Implementação

### 1. Identidade visual
- Usar o arquivo anexado `Design_sem_nome.png` como novo logo padrão da loja.
- Gerar um favicon quadrado otimizado de 64×64 a partir do mesmo arquivo.
- Substituir as referências locais existentes ao logo e manter o logo enviado pelo painel como prioridade sobre o padrão.
- Trocar as fontes globais, títulos e utilitários `font-display`/`font-body` para Helvetica Regular, com fallback Arial/sans-serif; remover a importação remota das fontes atuais.

### 2. Armazenamento seguro de imagens
- Criar o bucket público `store-media`, limitado a imagens PNG, JPEG e WebP de até 5 MB.
- Permitir leitura pública para a vitrine.
- Restringir criação, alteração e exclusão de arquivos ao mesmo usuário autorizado por `can_manage_settings()`.
- Organizar os arquivos em `logo/` e `carousel/`, usando nomes UUID para evitar colisões.

### 3. Editor de logo
- Substituir o campo “URL do logo” por um seletor de arquivo com pré-visualização.
- Validar tipo e tamanho antes do envio, mostrar progresso/estado de erro e salvar automaticamente a URL pública no formulário.
- Permitir substituir ou remover o logo personalizado, retornando ao logo padrão anexado.

### 4. Editor do carrossel
- Criar uma seção própria na aba “Design e layout”.
- Permitir adicionar imagens por upload, editar título, texto alternativo, subtítulo e link, ativar/desativar e remover slides.
- Permitir reorganizar slides por controles de mover para cima/baixo.
- Salvar os slides no campo existente `store_settings.hero_banners`, com validação e limite de 10 slides.
- Fazer a vitrine priorizar os slides configurados; quando não houver slides ativos, manter o fallback atual baseado nos produtos.

### 5. Validação
- Testar validação de arquivos, serialização dos banners e fallback do carrossel.
- Verificar no navegador o upload, salvamento e renderização do logo/carrossel, além do favicon e Helvetica.
- Executar checagem de tipos e revisão das políticas de segurança.

## Detalhes técnicos
- Não será aceita URL manual para novos uploads; o sistema gravará apenas URLs geradas pelo armazenamento do projeto.
- SVG não será permitido para evitar conteúdo executável embutido.
- A autorização da interface será reforçada por políticas no armazenamento; ocultar o menu sozinho não será considerado proteção suficiente.
- O schema atual já possui `logo_url` e `hero_banners`, portanto não é necessário criar novas tabelas ou colunas.
