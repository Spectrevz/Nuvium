# Nuvium

Nuvium é um aplicativo desktop moderno para gerenciar, compartilhar e versionar arquivos na nuvem, desenvolvido com Tauri, React e Rust. Focado em empresas e equipes, o app oferece uma interface intuitiva com funcionalidades como drag & drop, commits com mensagens, categorias de arquivos, e integração com provedores de nuvem.

## ✨ Funcionalidades principais

- Upload de arquivos com drag & drop  
- Commit com nome, mensagem e categoria  
- Filtro por tipo de arquivo  
- Pesquisa inteligente  
- Integração com múltiplos serviços de nuvem (em desenvolvimento)  
- Interface rápida e nativa com Tauri  

## 🚀 Tecnologias usadas

- **Rust** para lógica de backend e segurança  
- **React + TypeScript** no frontend  
- **Tauri** para empacotamento desktop multiplataforma  
- **SQLite** (opcional) para armazenamento local  

## 🎯 Objetivo

Pensado para empresas que precisam de um meio simples e seguro de organizar arquivos, manter histórico e colaborar com eficiência — tudo localmente, com o poder da nuvem.

## Para usuários finais

Baixe o arquivo executável `.exe` mais recente na seção [Releases](https://github.com/spectrevz/nuvium/releases) do projeto, execute e comece a usar sem precisar instalar nenhuma dependência adicional.

## Para desenvolvedores

Se quiser rodar o projeto localmente, contribuir ou modificar:

### Pré-requisitos

- Node.js  
- Rust e Cargo  
- Tauri CLI (`cargo install tauri-cli`)

### Instalação e execução

```bash
git clone https://github.com/spectrevz/nuvium.git
cd nuvium
pnpm install
pnpm tauri dev
```

### Build para produção

```bash
pnpm tauri build
```
