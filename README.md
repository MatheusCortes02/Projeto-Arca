# Projeto Arca

Site público e painel do cidadão para o **Programa ARCA** (Apoio, Resgate, Cuidado e Adoção Animal) da Serra (ES), feito como projeto pessoal. A ideia é reunir num só lugar os serviços de um programa municipal de proteção animal (adoção, resgate, castração e atendimento veterinário, canal de denúncia) a partir de uma mesma conta de usuário.

## Duas versões

| Versão | O que é | Onde está |
|---|---|---|
| **1 (este repositório)** | Site estático: um único `index.html` com HTML, CSS e JavaScript puro, Bootstrap 5 e dados guardados no `localStorage` do navegador. | Este repositório, publicado pelo GitHub Pages em <https://matheuscortes02.github.io/Projeto-Arca/> |
| **2 (publicada)** | Reescrita da plataforma em React, com API em Python (FastAPI) e banco SQLite. | <https://seven-projeto-arca-1.onrender.com/> (o código dessa versão **não** está neste repositório) |

O restante deste README descreve a versão 1, que é o código deste repositório.

## O que a versão 1 faz

**Site público** (seções `#inicio`, `#quem-somos`, `#servicos`, `#contato`): apresentação do programa, serviços oferecidos e contato, com link para pular ao conteúdo principal.

**Cadastro e login** (janelas `#cadastro` e `#login`): cadastro com nome, CPF, e-mail, senha, data de nascimento e endereço; login por CPF ou e-mail, com opção de manter a sessão.

**Painel do cidadão** (`#dashboard/...`, só com sessão ativa):

- Início, com resumo e atividades recentes
- Meus animais e cadastro de animal
- Adoção, com filtro por espécie e pedido de adoção
- Atendimento veterinário: agendamento de castração, vacinas, cirurgias ou atendimento de rotina
- Canal de denúncia e solicitação de resgate, com número de protocolo
- Histórico, ajuda e perfil

A navegação é feita pelo `hash` da URL (função `rotear()` em `script.js`), sem recarregar a página.

## Stack

- HTML5, CSS3 e JavaScript puro (sem framework e sem etapa de build)
- [Bootstrap 5.3.2](https://getbootstrap.com/) e Bootstrap Icons 1.11.3, carregados por CDN (jsDelivr)
- Fontes Inter e Outfit (Google Fonts)
- `localStorage` como armazenamento dos dados (usuários, sessão, animais, adoções, resgates, denúncias e agendamentos)

## Como rodar

Não há dependências para instalar. Basta servir a pasta:

```bash
git clone https://github.com/MatheusCortes02/Projeto-Arca.git
cd Projeto-Arca
python -m http.server 8000
# abra http://localhost:8000
```

Também funciona abrindo o `index.html` direto no navegador. É preciso internet para carregar o Bootstrap e as fontes pela CDN. Os dados ficam só no navegador em que o site foi aberto; para zerar, limpe o armazenamento do site (chaves que começam com `arca_`).

## Estrutura

```
.
├── index.html   # site público, janelas de login/cadastro e painel do cidadão
├── script.js    # rotas por hash, sessão, cadastro, formulários e telas do painel
├── style.css    # estilos do site e do painel
└── img/         # fotos e logotipo usados no site
```

## Limitações conhecidas

Estas limitações são da versão 1 e motivaram a reescrita:

- **Sem servidor**: tudo fica no `localStorage`, inclusive as **senhas, em texto puro**. Não há segurança real de conta; serve só como protótipo.
- **Identificadores pelo relógio**: os IDs e os números de protocolo vêm de `Date.now()`, com risco de repetição.
- **Código antigo escondido com CSS**: alguns blocos que saíram do layout continuam no HTML e só são ocultados com `display: none`.

Na versão 2, o caminho é o servidor guardar apenas o hash das senhas, o banco gerar os identificadores e o código que não é mais usado ser apagado.

## Autor

Matheus Cortes ([@MatheusCortes02](https://github.com/MatheusCortes02))
