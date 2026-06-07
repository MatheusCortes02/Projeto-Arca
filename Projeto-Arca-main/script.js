// ================================================
// CONSTANTES E CHAVES DO LOCALSTORAGE
// ================================================
const CHAVE_USUARIOS  = 'arca_usuarios';
const CHAVE_SESSAO    = 'arca_sessao';
const CHAVE_ANIMAIS   = 'arca_animais';
const CHAVE_ADOCOES   = 'arca_adocoes';
const CHAVE_RESGATES  = 'arca_resgates';
const CHAVE_DENUNCIAS = 'arca_denuncias';
const CHAVE_AGENDAMENTOS = 'arca_agendamentos';

// estado de adoção em andamento
let animalEmAdocao = null;
let filtroEspecieAtivo = 'todos';

// ================================================
// INICIALIZAÇÃO — seed e boot
// ================================================
function inicializar() {
  console.log('[ARCA] Inicializando sistema...');

  // seed de animais apenas se não existir
  if (!localStorage.getItem(CHAVE_ANIMAIS)) {
    const seed = [
      { id: 1, nome: 'Thor',  especie: 'Cachorro', raca: 'Labrador', descricao: 'Thor é pura energia e alegria! Adora crianças e outros animais.', status: 'disponivel', usuario_id: null, data: '2026-01-10' },
      { id: 2, nome: 'Mel',   especie: 'Gato',     raca: 'SRD',      descricao: 'Mel é aquela gatinha que parece sorrir com o olhar. Calma e carinhosa.', status: 'disponivel', usuario_id: null, data: '2026-01-15' },
      { id: 3, nome: 'Barão', especie: 'Cachorro', raca: 'SRD',      descricao: 'Barão é imponente, mas com coração gigante. Fiel e protetor.', status: 'disponivel', usuario_id: null, data: '2026-02-01' },
      { id: 4, nome: 'Luna',  especie: 'Gato',     raca: 'Persa',    descricao: 'Luna é curiosa e independente. Adora observar o mundo pela janela.', status: 'disponivel', usuario_id: null, data: '2026-02-10' }
    ];
    localStorage.setItem(CHAVE_ANIMAIS, JSON.stringify(seed));
    console.log('[ARCA] Seed de animais carregado.');
  }

  // inicializar arrays se inexistentes
  ['arca_adocoes','arca_resgates','arca_denuncias','arca_agendamentos'].forEach(k => {
    if (!localStorage.getItem(k)) localStorage.setItem(k, JSON.stringify([]));
  });
  if (!localStorage.getItem(CHAVE_USUARIOS)) localStorage.setItem(CHAVE_USUARIOS, JSON.stringify([]));

  // navbar scroll effect
  window.addEventListener('scroll', () => {
    document.querySelector('.navbar-arca')?.classList.toggle('scrolled', window.scrollY > 30);
  });

  // scroll reveal
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); } });
  }, { threshold: 0.12 });
  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

  // máscaras
  aplicarMascaras();

  // roteamento inicial
  rotear();
  window.addEventListener('hashchange', rotear);

  console.log('[ARCA] Sistema pronto.');
}

// ================================================
// ROTEAMENTO POR HASH
// ================================================
function rotear() {
  const hash = window.location.hash || '#inicio';
  const usuario = getSessao();
  console.log('[ARCA] Rota:', hash, '| Logado:', !!usuario);

  if (hash.startsWith('#dashboard')) {
    if (!usuario) { window.location.hash = '#login'; return; }
    mostrarDashboard(hash.replace('#dashboard/', '').replace('#dashboard', '') || 'inicio');
  } else {
    mostrarSitePublico();
    if (hash === '#login')    { setTimeout(abrirModalLogin, 80); }
    if (hash === '#cadastro') { setTimeout(abrirModalCadastro, 80); }
    if (hash !== '#login' && hash !== '#cadastro') {
      const alvo = document.querySelector(hash);
      if (alvo) setTimeout(() => alvo.scrollIntoView({ behavior: 'smooth' }), 100);
    }
  }
}

function mostrarSitePublico() {
  document.getElementById('site-publico').style.display = '';
  document.getElementById('dashboard').style.display = 'none';
}

function mostrarDashboard(pagina) {
  document.getElementById('site-publico').style.display = 'none';
  document.getElementById('dashboard').style.display = '';
  carregarDadosDash();
  navegarDash(pagina);
}

// ================================================
// LOCALSTORAGE — HELPERS
// ================================================
function getSessao() {
  try { return JSON.parse(localStorage.getItem(CHAVE_SESSAO)); } catch { return null; }
}
function getUsuarioLogado() {
  const s = getSessao();
  if (!s) return null;
  const usuarios = JSON.parse(localStorage.getItem(CHAVE_USUARIOS) || '[]');
  return usuarios.find(u => u.id === s.usuario_id) || null;
}
function salvarSessao(usuarioId, lembrar) {
  localStorage.setItem(CHAVE_SESSAO, JSON.stringify({ usuario_id: usuarioId, lembrar }));
}
function limparSessao() { localStorage.removeItem(CHAVE_SESSAO); }

function getAnimais() { try { return JSON.parse(localStorage.getItem(CHAVE_ANIMAIS) || '[]'); } catch { return []; } }
function getAdocoes()  { try { return JSON.parse(localStorage.getItem(CHAVE_ADOCOES) || '[]'); } catch { return []; } }
function getResgates() { try { return JSON.parse(localStorage.getItem(CHAVE_RESGATES) || '[]'); } catch { return []; } }
function getDenuncias(){ try { return JSON.parse(localStorage.getItem(CHAVE_DENUNCIAS) || '[]'); } catch { return []; } }
function getAgendamentos(){ try { return JSON.parse(localStorage.getItem(CHAVE_AGENDAMENTOS) || '[]'); } catch { return []; } }

function gerarId() { return Date.now(); }

// ================================================
// AUTENTICAÇÃO
// ================================================
function abrirModalLogin() {
  fecharTodosModais();
  const m = bootstrap.Modal.getOrCreateInstance(document.getElementById('modalLogin'));
  m.show();
}
function abrirModalCadastro() {
  fecharTodosModais();
  const m = bootstrap.Modal.getOrCreateInstance(document.getElementById('modalCadastro'));
  m.show();
}
function fecharTodosModais() {
  ['modalLogin','modalCadastro','modalAdocao'].forEach(id => {
    const el = document.getElementById(id);
    if (el) bootstrap.Modal.getInstance(el)?.hide();
  });
}
function fecharLoginAbrirCadastro() { fecharTodosModais(); setTimeout(abrirModalCadastro, 200); }
function fecharCadastroAbrirLogin() { fecharTodosModais(); setTimeout(abrirModalLogin, 200); }

// Login
document.addEventListener('DOMContentLoaded', () => {
  inicializar();

  document.getElementById('form-login').addEventListener('submit', function(e) {
    e.preventDefault();
    const id    = document.getElementById('login-cpf-email').value.trim();
    const senha = document.getElementById('login-senha').value;
    const lembrar = document.getElementById('login-lembrar').checked;

    limparErros(['erro-login-id','erro-login-senha']);
    document.getElementById('alerta-login-erro').style.display = 'none';

    let valido = true;
    if (!id) { mostrarErro('erro-login-id', 'Campo obrigatório.'); valido = false; }
    if (!senha) { mostrarErro('erro-login-senha', 'Campo obrigatório.'); valido = false; }
    if (!valido) return;

    const usuarios = JSON.parse(localStorage.getItem(CHAVE_USUARIOS) || '[]');
    const usuario = usuarios.find(u =>
      (u.cpf === id || u.email === id.toLowerCase()) && u.senha === senha
    );

    if (!usuario) {
      document.getElementById('alerta-login-erro').style.display = 'flex';
      console.log('[ARCA] Login falhou para:', id);
      return;
    }

    salvarSessao(usuario.id, lembrar);
    fecharTodosModais();
    console.log('[ARCA] Login OK:', usuario.nome);
    window.location.hash = '#dashboard/inicio';
  });

  // Cadastro
  document.getElementById('form-cadastro').addEventListener('submit', function(e) {
    e.preventDefault();
    const campos = {
      nome:       document.getElementById('cad-nome').value.trim(),
      cpf:        document.getElementById('cad-cpf').value.trim(),
      email:      document.getElementById('cad-email').value.trim().toLowerCase(),
      nascimento: document.getElementById('cad-nascimento').value.trim(),
      senha:      document.getElementById('cad-senha').value,
      cep:        document.getElementById('cad-cep').value.trim(),
      rua:        document.getElementById('cad-rua').value.trim(),
      numero:     document.getElementById('cad-numero').value.trim(),
      bairro:     document.getElementById('cad-bairro').value.trim(),
      complemento: document.getElementById('cad-complemento').value.trim()
    };

    limparErros(['erro-cad-nome','erro-cad-cpf','erro-cad-email','erro-cad-nasc','erro-cad-senha','erro-cad-cep','erro-cad-rua']);
    document.getElementById('alerta-cad-erro').style.display = 'none';

    let valido = true;
    if (!campos.nome)   { mostrarErro('erro-cad-nome', 'Nome obrigatório.'); valido = false; }
    if (campos.cpf.length < 14) { mostrarErro('erro-cad-cpf', 'CPF inválido.'); valido = false; }
    if (!campos.email.includes('@')) { mostrarErro('erro-cad-email', 'E-mail inválido.'); valido = false; }
    if (campos.nascimento.length < 10) { mostrarErro('erro-cad-nasc', 'Data inválida.'); valido = false; }
    if (campos.senha.length < 6) { mostrarErro('erro-cad-senha', 'Mínimo 6 caracteres.'); valido = false; }
    if (campos.cep.length < 9) { mostrarErro('erro-cad-cep', 'CEP inválido.'); valido = false; }
    if (!campos.rua) { mostrarErro('erro-cad-rua', 'Endereço obrigatório.'); valido = false; }
    if (!valido) return;

    const usuarios = JSON.parse(localStorage.getItem(CHAVE_USUARIOS) || '[]');
    if (usuarios.find(u => u.cpf === campos.cpf || u.email === campos.email)) {
      const err = document.getElementById('alerta-cad-erro');
      err.textContent = 'CPF ou e-mail já cadastrado.';
      err.style.display = 'flex';
      return;
    }

    const novoUsuario = {
      id: gerarId(),
      nome: campos.nome,
      cpf: campos.cpf,
      email: campos.email,
      senha: campos.senha,
      data_nascimento: campos.nascimento,
      endereco: `${campos.rua}, ${campos.numero}${campos.complemento ? ' – ' + campos.complemento : ''}`,
      bairro: campos.bairro,
      cep: campos.cep,
      cidade: 'Serra - ES',
      is_admin: false,
      data_cadastro: new Date().toLocaleDateString('pt-BR')
    };

    usuarios.push(novoUsuario);
    localStorage.setItem(CHAVE_USUARIOS, JSON.stringify(usuarios));
    salvarSessao(novoUsuario.id, false);
    fecharTodosModais();
    console.log('[ARCA] Usuário cadastrado:', novoUsuario.nome);
    window.location.hash = '#dashboard/inicio';
  });

  // Cadastro de animal
  document.getElementById('form-cadastro-animal').addEventListener('submit', function(e) {
    e.preventDefault();
    const especie  = document.getElementById('animal-especie').value;
    const raca     = document.getElementById('animal-raca').value.trim();
    const descricao = document.getElementById('animal-descricao').value.trim();

    limparErros(['erro-animal-especie','erro-animal-raca']);
    let valido = true;
    if (!especie) { mostrarErro('erro-animal-especie', 'Selecione a espécie.'); valido = false; }
    if (!raca)    { mostrarErro('erro-animal-raca', 'Raça obrigatória.'); valido = false; }
    if (!valido) return;

    const usuario = getUsuarioLogado();
    const animais = getAnimais();
    const novoId = gerarId();
    animais.push({
      id: novoId,
      nome: raca,
      especie, raca, descricao,
      status: 'cadastrado',
      usuario_id: usuario.id,
      data: new Date().toLocaleDateString('pt-BR')
    });
    localStorage.setItem(CHAVE_ANIMAIS, JSON.stringify(animais));

    document.getElementById('form-cadastro-animal-wrap').style.display = 'none';
    document.getElementById('cadastro-animal-sucesso').style.display = '';
    document.getElementById('id-animal-gerado').textContent = '#' + novoId.toString().slice(-6);
    adicionarAtividade('animal', `Animal ${especie} (${raca}) cadastrado`);
    atualizarStats();
    console.log('[ARCA] Animal cadastrado. ID:', novoId);
  });

  // Agendamento
  document.getElementById('form-agendamento').addEventListener('submit', function(e) {
    e.preventDefault();
    const animalId = document.getElementById('ag-animal-id').value;
    const data     = document.getElementById('ag-data').value;
    const obs      = document.getElementById('ag-obs').value.trim();
    const tipo     = document.getElementById('agendamento-tipo').value;

    limparErros(['erro-ag-animal','erro-ag-data']);
    document.getElementById('alerta-ag-erro').style.display = 'none';
    let valido = true;
    if (!animalId) { mostrarErro('erro-ag-animal', 'Informe o ID do animal.'); valido = false; }
    if (!data)     { mostrarErro('erro-ag-data', 'Selecione uma data.'); valido = false; }
    if (!valido) return;

    const usuario = getUsuarioLogado();
    const agendamentos = getAgendamentos();
    agendamentos.push({
      id: gerarId(), tipo, animal_id: animalId, data, obs,
      usuario_id: usuario.id,
      data_solicitacao: new Date().toLocaleDateString('pt-BR')
    });
    localStorage.setItem(CHAVE_AGENDAMENTOS, JSON.stringify(agendamentos));

    document.getElementById('form-agendamento-wrap').style.display = 'none';
    document.getElementById('ag-sucesso').style.display = '';
    document.getElementById('grid-servicos-vet').style.display = 'none';
    adicionarAtividade('veterinario', `Agendamento de ${tipo} solicitado`);
    console.log('[ARCA] Agendamento criado:', tipo);
  });

  // Denúncia
  document.getElementById('form-denuncia').addEventListener('submit', function(e) {
    e.preventDefault();
    const tipo     = document.getElementById('den-tipo').value;
    const local    = document.getElementById('den-local').value.trim();
    const descricao = document.getElementById('den-descricao').value.trim();
    const anonima  = document.getElementById('den-anonima').checked;

    limparErros(['erro-den-tipo','erro-den-local','erro-den-desc']);
    document.getElementById('alerta-den-erro').style.display = 'none';
    let valido = true;
    if (!tipo)      { mostrarErro('erro-den-tipo', 'Selecione o tipo.'); valido = false; }
    if (!local)     { mostrarErro('erro-den-local', 'Local obrigatório.'); valido = false; }
    if (!descricao) { mostrarErro('erro-den-desc', 'Descrição obrigatória.'); valido = false; }
    if (!valido) return;

    const usuario = getUsuarioLogado();
    const denuncias = getDenuncias();
    const protocolo = '#DEN-' + gerarId().toString().slice(-6);
    denuncias.push({
      id: gerarId(), protocolo, tipo, local, descricao, anonima,
      usuario_id: anonima ? null : usuario?.id,
      data: new Date().toLocaleDateString('pt-BR')
    });
    localStorage.setItem(CHAVE_DENUNCIAS, JSON.stringify(denuncias));

    document.getElementById('form-denuncia-wrap').style.display = 'none';
    document.getElementById('den-sucesso').style.display = '';
    document.getElementById('protocolo-denuncia').textContent = protocolo;
    adicionarAtividade('denuncia', `Denúncia de ${tipo} registrada — ${protocolo}`);
    atualizarStats();
    console.log('[ARCA] Denúncia registrada:', protocolo);
  });

  // Resgate
  document.getElementById('form-resgate').addEventListener('submit', function(e) {
    e.preventDefault();
    const tipo        = document.getElementById('res-tipo').value;
    const localizacao = document.getElementById('res-localizacao').value.trim();
    const bairro      = document.getElementById('res-bairro').value.trim();
    const risco       = document.getElementById('res-risco').value;
    const descricao   = document.getElementById('res-descricao').value.trim();

    limparErros(['erro-res-tipo','erro-res-loc','erro-res-bairro','erro-res-risco','erro-res-desc']);
    document.getElementById('alerta-res-erro').style.display = 'none';
    let valido = true;
    if (!tipo)       { mostrarErro('erro-res-tipo',  'Selecione o tipo.'); valido = false; }
    if (!localizacao){ mostrarErro('erro-res-loc',   'Localização obrigatória.'); valido = false; }
    if (!bairro)     { mostrarErro('erro-res-bairro','Bairro obrigatório.'); valido = false; }
    if (!risco)      { mostrarErro('erro-res-risco', 'Selecione o nível.'); valido = false; }
    if (!descricao)  { mostrarErro('erro-res-desc',  'Descrição obrigatória.'); valido = false; }
    if (!valido) return;

    const usuario = getUsuarioLogado();
    const resgates = getResgates();
    const protocolo = '#RSG-' + gerarId().toString().slice(-6);
    resgates.push({
      id: gerarId(), protocolo, tipo, localizacao, bairro, risco, descricao,
      usuario_id: usuario?.id,
      data: new Date().toLocaleDateString('pt-BR')
    });
    localStorage.setItem(CHAVE_RESGATES, JSON.stringify(resgates));

    document.getElementById('form-resgate-wrap').style.display = 'none';
    document.getElementById('res-sucesso').style.display = '';
    document.getElementById('protocolo-resgate').textContent = protocolo;
    adicionarAtividade('resgate', `Resgate de ${tipo} solicitado — ${protocolo}`);
    atualizarStats();
    console.log('[ARCA] Resgate solicitado:', protocolo);
  });

  // Perfil
  document.getElementById('form-perfil').addEventListener('submit', function(e) {
    e.preventDefault();
    const nome   = document.getElementById('perf-nome').value.trim();
    const email  = document.getElementById('perf-email').value.trim().toLowerCase();
    const senha  = document.getElementById('perf-senha').value;
    const senha2 = document.getElementById('perf-senha2').value;

    document.getElementById('alerta-perf-erro').style.display = 'none';
    document.getElementById('alerta-perf-sucesso').style.display = 'none';

    if (senha && senha !== senha2) {
      const err = document.getElementById('alerta-perf-erro');
      err.textContent = 'As senhas não coincidem.';
      err.style.display = 'flex';
      return;
    }
    if (senha && senha.length < 6) {
      const err = document.getElementById('alerta-perf-erro');
      err.textContent = 'Senha deve ter mínimo 6 caracteres.';
      err.style.display = 'flex';
      return;
    }

    const usuarios = JSON.parse(localStorage.getItem(CHAVE_USUARIOS) || '[]');
    const sessao = getSessao();
    const idx = usuarios.findIndex(u => u.id === sessao.usuario_id);
    if (idx === -1) return;

    if (nome)  usuarios[idx].nome  = nome;
    if (email) usuarios[idx].email = email;
    if (senha) usuarios[idx].senha = senha;
    localStorage.setItem(CHAVE_USUARIOS, JSON.stringify(usuarios));

    document.getElementById('alerta-perf-sucesso').style.display = '';
    carregarDadosDash();
    renderizarPerfil();
    console.log('[ARCA] Perfil atualizado.');
  });
});

// ================================================
// NAVEGAÇÃO DO DASHBOARD
// ================================================
function navegarDash(pagina, event) {
  if (event) event.preventDefault();

  const offcanvas = bootstrap.Offcanvas.getInstance(document.getElementById('sidebarOffcanvas'));
  if (offcanvas) offcanvas.hide();

  // esconder todas as páginas
  document.querySelectorAll('.dash-page').forEach(p => p.style.display = 'none');

  // atualizar links ativos (desktop + mobile)
  document.querySelectorAll('.sidebar-link[data-pagina]').forEach(l => {
    l.classList.toggle('active', l.dataset.pagina === pagina);
  });

  // breadcrumb
  const nomes = {
    'inicio':'Início','meus-animais':'Meus Animais','cadastrar-animal':'Cadastrar Animal',
    'adocao':'Adoção','veterinario':'Atendimento Veterinário','denuncias':'Canal de Denúncia',
    'resgate':'Solicitação de Resgate','historico':'Histórico','ajuda':'Ajuda','perfil':'Perfil'
  };
  document.getElementById('breadcrumb-atual').textContent = nomes[pagina] || pagina;

  const el = document.getElementById('page-' + pagina);
  if (el) {
    el.style.display = '';
    // carregar dados específicos da página
    if (pagina === 'inicio')          renderizarInicio();
    if (pagina === 'meus-animais')    renderizarMeusAnimais();
    if (pagina === 'adocao')          renderizarAdocao();
    if (pagina === 'historico')       renderizarHistorico();
    if (pagina === 'perfil')          renderizarPerfil();
  }
}

// ================================================
// LOGOUT
// ================================================
function fazerLogout(event) {
  if (event) event.preventDefault();
  limparSessao();
  console.log('[ARCA] Logout realizado.');
  window.location.hash = '#inicio';
  window.location.reload();
}

// ================================================
// DADOS DO DASHBOARD
// ================================================
function carregarDadosDash() {
  const usuario = getUsuarioLogado();
  if (!usuario) return;

  const iniciais = usuario.nome.split(' ').map(n => n[0]).slice(0,2).join('').toUpperCase();
  document.getElementById('topbar-avatar').textContent = iniciais;
  document.getElementById('topbar-nome').textContent   = usuario.nome.split(' ')[0];
  document.getElementById('topbar-cargo').textContent  = usuario.is_admin ? 'Administrador' : 'Cidadão';

  if (usuario.is_admin) document.getElementById('badge-admin').style.display = '';

  atualizarStats();
}

function atualizarStats() {
  const usuario = getUsuarioLogado();
  if (!usuario) return;

  const adocoes  = getAdocoes().filter(a => a.usuario_id === usuario.id).length;
  const resgates = getResgates().filter(r => r.usuario_id === usuario.id).length;
  const denuncias= getDenuncias().filter(d => d.usuario_id === usuario.id).length;
  const meus     = getAnimais().filter(a => a.usuario_id === usuario.id).length;

  ['stat-adocoes','stat-resgates','stat-denuncias','stat-meus-animais'].forEach((id, i) => {
    const el = document.getElementById(id);
    if (el) el.textContent = [adocoes, resgates, denuncias, meus][i];
  });
}

// ================================================
// RENDERIZAÇÃO — INÍCIO
// ================================================
function renderizarInicio() {
  const usuario = getUsuarioLogado();
  if (!usuario) return;

  const hora = new Date().getHours();
  const saud = hora < 12 ? 'Bom dia' : hora < 18 ? 'Boa tarde' : 'Boa noite';
  document.getElementById('banner-saudacao').textContent = `${saud}, ${usuario.nome.split(' ')[0]}!`;

  atualizarStats();

  // atividade recente
  const lista = document.getElementById('lista-atividade-recente');
  const chave = 'arca_atividades_' + usuario.id;
  const atividades = JSON.parse(localStorage.getItem(chave) || '[]').slice(0,5);

  if (!atividades.length) {
    lista.innerHTML = `<div class="estado-vazio"><i class="bi bi-inbox estado-vazio-icon"></i><p>Nenhuma atividade registrada ainda.</p></div>`;
    return;
  }

  const cores = { adocao:'#025920', animal:'var(--azul-primario)', denuncia:'#7c3aed', resgate:'#e07b39', veterinario:'#1F82BF' };
  const icones = { adocao:'bi-house-heart', animal:'bi-heart-pulse', denuncia:'bi-megaphone', resgate:'bi-truck', veterinario:'bi-bandaid' };

  lista.innerHTML = atividades.reverse().map(a => `
    <div class="atividade-item">
      <div class="atividade-avatar" style="background:${cores[a.tipo] || '#ccc'}22">
        <i class="bi ${icones[a.tipo] || 'bi-activity'}" style="color:${cores[a.tipo] || '#888'}"></i>
      </div>
      <div class="atividade-desc">${a.descricao}</div>
      <div class="atividade-data">${a.data}</div>
    </div>
  `).join('');
}

function adicionarAtividade(tipo, descricao) {
  const usuario = getUsuarioLogado();
  if (!usuario) return;
  const chave = 'arca_atividades_' + usuario.id;
  const lista = JSON.parse(localStorage.getItem(chave) || '[]');
  lista.push({ tipo, descricao, data: new Date().toLocaleDateString('pt-BR') });
  localStorage.setItem(chave, JSON.stringify(lista));
}

// ================================================
// RENDERIZAÇÃO — MEUS ANIMAIS
// ================================================
function renderizarMeusAnimais() {
  const usuario = getUsuarioLogado();
  const animais = getAnimais().filter(a => a.usuario_id === usuario?.id);
  const grid = document.getElementById('grid-meus-animais');

  if (!animais.length) {
    grid.innerHTML = `<div class="col-12"><div class="estado-vazio"><i class="bi bi-heart-pulse estado-vazio-icon"></i><p>Você ainda não cadastrou nenhum animal.</p><button class="btn btn-primary-arca mt-2" onclick="navegarDash('cadastrar-animal')">Cadastrar agora</button></div></div>`;
    return;
  }

  grid.innerHTML = animais.map(a => `
    <div class="col-md-6 col-lg-4">
      <div class="animal-card">
        <div class="animal-card-icon">${a.especie === 'Cachorro' ? '<i class="bi bi-heart-pulse fs-1 text-primary"></i>' : a.especie === 'Gato' ? '<i class="bi bi-heart fs-1" style="color:#7c3aed"></i>' : '<i class="bi bi-house-heart fs-1 text-secondary"></i>'}</div>
        <div class="animal-card-body">
          <div class="d-flex justify-content-between align-items-start mb-1">
            <div class="animal-card-titulo">${a.raca}</div>
            <span class="badge-status badge-${a.status === 'disponivel' ? 'disponivel' : 'cadastrado'}">${a.status === 'disponivel' ? 'Disponível' : 'Cadastrado'}</span>
          </div>
          <div class="animal-card-sub mb-1"><span class="badge-status badge-${a.especie.toLowerCase()}">${a.especie}</span> · ID #${String(a.id).slice(-6)}</div>
          <div class="animal-card-sub mt-2" style="font-size:.82rem;color:#666">${a.descricao || '—'}</div>
          <div class="animal-card-sub mt-2" style="font-size:.75rem;color:#aaa">Cadastrado em ${a.data || '—'}</div>
        </div>
      </div>
    </div>
  `).join('');
}

// ================================================
// RENDERIZAÇÃO — ADOÇÃO
// ================================================
function renderizarAdocao() {
  filtrarAdocao();
}

function filtrarAdocao() {
  const busca = (document.getElementById('busca-adocao')?.value || '').toLowerCase();
  const animais = getAnimais().filter(a => {
    const matchStatus  = a.status === 'disponivel';
    const matchEspecie = filtroEspecieAtivo === 'todos' || a.especie === filtroEspecieAtivo;
    const matchBusca   = !busca || a.nome?.toLowerCase().includes(busca) || a.raca.toLowerCase().includes(busca);
    return matchStatus && matchEspecie && matchBusca;
  });

  const grid = document.getElementById('grid-adocao');
  if (!animais.length) {
    grid.innerHTML = `<div class="col-12"><div class="estado-vazio"><i class="bi bi-heart estado-vazio-icon"></i><p>Nenhum animal disponível para adoção no momento.</p></div></div>`;
    return;
  }

  grid.innerHTML = animais.map(a => `
    <div class="col-md-6 col-lg-4">
      <div class="animal-card">
        <div class="animal-card-icon">${a.especie === 'Cachorro' ? '<i class="bi bi-heart-pulse fs-1 text-primary"></i>' : '<i class="bi bi-heart fs-1" style="color:#7c3aed"></i>'}</div>
        <div class="animal-card-body">
          <div class="d-flex justify-content-between align-items-start mb-1">
            <div class="animal-card-titulo">${a.nome || a.raca}</div>
            <span class="badge-status badge-disponivel">Disponível</span>
          </div>
          <div class="animal-card-sub mb-2"><span class="badge-status badge-${a.especie.toLowerCase()}">${a.especie}</span> · ${a.raca}</div>
          <div class="animal-card-sub" style="font-size:.83rem;color:#555">${a.descricao || '—'}</div>
          <button class="btn btn-primary-arca w-100 mt-3" onclick="iniciarAdocao(${a.id})">
            <i class="bi bi-heart me-2"></i>Quero adotar
          </button>
        </div>
      </div>
    </div>
  `).join('');
}

function filtrarEspecie(especie, btn) {
  filtroEspecieAtivo = especie;
  document.querySelectorAll('.btn-filtro').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  filtrarAdocao();
}

// ================================================
// ADOÇÃO — MODAL 3 ETAPAS
// ================================================
function iniciarAdocao(id) {
  animalEmAdocao = getAnimais().find(a => a.id === id);
  if (!animalEmAdocao) return;

  // resetar modal
  ['adocao-etapa1','adocao-etapa2','adocao-etapa3'].forEach((id,i) => {
    document.getElementById(id).style.display = i === 0 ? '' : 'none';
  });
  document.getElementById('adocao-sucesso').style.display = 'none';
  document.getElementById('adocao-termos').checked = false;
  document.getElementById('adocao-erro').style.display = 'none';
  document.getElementById('adocao-motivacao').value = '';

  atualizarStepper(1);

  document.getElementById('adocao-animal-info').innerHTML = `
    <div class="d-flex gap-3 align-items-center">
      <div style="font-size:2rem">${animalEmAdocao.especie === 'Cachorro' ? '<i class="bi bi-heart-pulse"></i>' : '<i class="bi bi-heart"></i>'}</div>
      <div>
        <div class="fw-bold">${animalEmAdocao.nome || animalEmAdocao.raca}</div>
        <div class="small text-muted">${animalEmAdocao.especie} · ${animalEmAdocao.raca}</div>
        <div class="small mt-1" style="color:#555">${animalEmAdocao.descricao || ''}</div>
      </div>
    </div>
  `;

  bootstrap.Modal.getOrCreateInstance(document.getElementById('modalAdocao')).show();
}

function adocaoProxima(etapa) {
  mostrarEtapa(etapa);
}
function adocaoAnterior(etapa) {
  mostrarEtapa(etapa);
}

function mostrarEtapa(n) {
  for (let i = 1; i <= 3; i++) {
    const el = document.getElementById('adocao-etapa' + i);
    if (el) el.style.display = i === n ? '' : 'none';
  }
  atualizarStepper(n);
}

function atualizarStepper(ativa) {
  for (let i = 1; i <= 3; i++) {
    const el = document.getElementById('step-ind-' + i);
    if (!el) continue;
    el.className = 'step' + (i < ativa ? ' done' : i === ativa ? ' active' : '');
  }
}

function confirmarAdocao() {
  if (!document.getElementById('adocao-termos').checked) {
    document.getElementById('adocao-erro').style.display = '';
    return;
  }
  document.getElementById('adocao-erro').style.display = 'none';

  const usuario = getUsuarioLogado();
  const protocolo = '#ADO-' + gerarId().toString().slice(-6);
  const adocoes = getAdocoes();
  adocoes.push({
    id: gerarId(), protocolo,
    animal_id: animalEmAdocao.id,
    animal_nome: animalEmAdocao.nome || animalEmAdocao.raca,
    motivacao: document.getElementById('adocao-motivacao').value.trim(),
    usuario_id: usuario.id,
    data: new Date().toLocaleDateString('pt-BR')
  });
  localStorage.setItem(CHAVE_ADOCOES, JSON.stringify(adocoes));

  for (let i = 1; i <= 3; i++) {
    const el = document.getElementById('adocao-etapa' + i);
    if (el) el.style.display = 'none';
  }
  document.getElementById('adocao-sucesso').style.display = '';
  document.getElementById('protocolo-adocao').textContent = protocolo;

  adicionarAtividade('adocao', `Adoção solicitada: ${animalEmAdocao.nome || animalEmAdocao.raca} — ${protocolo}`);
  atualizarStats();
  console.log('[ARCA] Adoção solicitada:', protocolo);
}

// ================================================
// AGENDAMENTO VETERINÁRIO
// ================================================
function abrirAgendamento(tipo) {
  document.getElementById('grid-servicos-vet').style.display = 'none';
  document.getElementById('form-agendamento-wrap').style.display = '';
  document.getElementById('ag-sucesso').style.display = 'none';
  document.getElementById('agendamento-tipo').value = tipo;
  document.getElementById('titulo-agendamento').textContent = 'Agendar — ' + tipo;
  document.getElementById('form-agendamento').reset();
  limparErros(['erro-ag-animal','erro-ag-data']);

  const hoje = new Date().toISOString().split('T')[0];
  document.getElementById('ag-data').min = hoje;
}

function fecharAgendamento() {
  document.getElementById('grid-servicos-vet').style.display = '';
  document.getElementById('form-agendamento-wrap').style.display = 'none';
}

function resetAgendamento() {
  document.getElementById('grid-servicos-vet').style.display = '';
  document.getElementById('form-agendamento-wrap').style.display = 'none';
  document.getElementById('ag-sucesso').style.display = 'none';
}

// ================================================
// RESETS
// ================================================
function resetCadastroAnimal() {
  document.getElementById('form-cadastro-animal-wrap').style.display = '';
  document.getElementById('cadastro-animal-sucesso').style.display = 'none';
  document.getElementById('form-cadastro-animal').reset();
}
function resetDenuncia() {
  document.getElementById('form-denuncia-wrap').style.display = '';
  document.getElementById('den-sucesso').style.display = 'none';
  document.getElementById('form-denuncia').reset();
}
function resetResgate() {
  document.getElementById('form-resgate-wrap').style.display = '';
  document.getElementById('res-sucesso').style.display = 'none';
  document.getElementById('form-resgate').reset();
}

// ================================================
// RENDERIZAÇÃO — HISTÓRICO
// ================================================
function renderizarHistorico() {
  const usuario = getUsuarioLogado();
  if (!usuario) return;

  const uid = usuario.id;
  const itens = [];

  getAdocoes().filter(a => a.usuario_id === uid).forEach(a => itens.push({
    tipo: 'adocao', cor: '#025920', icone: 'bi-house-heart',
    titulo: `Adoção: ${a.animal_nome}`, detalhe: a.protocolo, data: a.data
  }));
  getResgates().filter(r => r.usuario_id === uid).forEach(r => itens.push({
    tipo: 'resgate', cor: '#e07b39', icone: 'bi-truck',
    titulo: `Resgate: ${r.tipo}`, detalhe: `${r.protocolo} · ${r.bairro}`, data: r.data
  }));
  getDenuncias().filter(d => d.usuario_id === uid).forEach(d => itens.push({
    tipo: 'denuncia', cor: '#7c3aed', icone: 'bi-megaphone',
    titulo: `Denúncia: ${d.tipo}`, detalhe: `${d.protocolo}`, data: d.data
  }));
  getAgendamentos().filter(g => g.usuario_id === uid).forEach(g => itens.push({
    tipo: 'veterinario', cor: 'var(--azul-primario)', icone: 'bi-bandaid',
    titulo: `Agendamento: ${g.tipo}`, detalhe: `Animal ID #${g.animal_id} · ${g.data}`, data: g.data_solicitacao
  }));

  const lista = document.getElementById('lista-historico');
  if (!itens.length) {
    lista.innerHTML = `<div class="estado-vazio"><i class="bi bi-inbox estado-vazio-icon"></i><p>Nenhuma atividade registrada.</p></div>`;
    return;
  }

  lista.innerHTML = itens.map(i => `
    <div class="historico-item">
      <div class="historico-avatar" style="background:${i.cor}22">
        <i class="bi ${i.icone}" style="color:${i.cor}"></i>
      </div>
      <div class="historico-corpo">
        <div class="historico-titulo">${i.titulo}</div>
        <div class="historico-detalhe">${i.detalhe}</div>
      </div>
      <div class="historico-data">${i.data || '—'}</div>
    </div>
  `).join('');
}

// ================================================
// RENDERIZAÇÃO — PERFIL
// ================================================
function renderizarPerfil() {
  const u = getUsuarioLogado();
  if (!u) return;

  const iniciais = u.nome.split(' ').map(n => n[0]).slice(0,2).join('').toUpperCase();
  document.getElementById('perfil-avatar-grande').textContent = iniciais;
  document.getElementById('perfil-nome-display').textContent  = u.nome;
  document.getElementById('perfil-cargo-display').textContent = u.is_admin ? 'Administrador' : 'Cidadão';
  document.getElementById('p-cpf').textContent     = u.cpf || '—';
  document.getElementById('p-email').textContent   = u.email || '—';
  document.getElementById('p-endereco').textContent = u.endereco || '—';

  document.getElementById('perf-nome').value  = u.nome || '';
  document.getElementById('perf-email').value = u.email || '';
}

// ================================================
// UTILITÁRIOS — FORMULÁRIOS
// ================================================
function mostrarErro(id, msg) {
  const el = document.getElementById(id);
  if (el) { el.textContent = msg; }
}
function limparErros(ids) {
  ids.forEach(id => { const el = document.getElementById(id); if (el) el.textContent = ''; });
}
function toggleSenha(inputId, btn) {
  const input = document.getElementById(inputId);
  const icon  = btn.querySelector('i');
  if (input.type === 'password') {
    input.type = 'text';
    icon.className = 'bi bi-eye-slash';
  } else {
    input.type = 'password';
    icon.className = 'bi bi-eye';
  }
}

// ================================================
// MÁSCARAS DE INPUT
// ================================================
function aplicarMascaras() {
  // CPF
  const cpfInputs = document.querySelectorAll('#cad-cpf, #login-cpf-email');
  cpfInputs.forEach(input => {
    if (input.id === 'cad-cpf') {
      input.addEventListener('input', function() {
        let v = this.value.replace(/\D/g,'');
        if (v.length > 11) v = v.slice(0,11);
        v = v.replace(/(\d{3})(\d)/,'$1.$2')
             .replace(/(\d{3})(\d)/,'$1.$2')
             .replace(/(\d{3})(\d{1,2})$/,'$1-$2');
        this.value = v;
      });
    }
  });

  // CEP
  const cep = document.getElementById('cad-cep');
  if (cep) {
    cep.addEventListener('input', function() {
      let v = this.value.replace(/\D/g,'');
      if (v.length > 8) v = v.slice(0,8);
      v = v.replace(/(\d{5})(\d)/,'$1-$2');
      this.value = v;
    });
  }

  // Data de nascimento dd/mm/aaaa
  const nasc = document.getElementById('cad-nascimento');
  if (nasc) {
    nasc.addEventListener('input', function() {
      let v = this.value.replace(/\D/g,'');
      if (v.length > 8) v = v.slice(0,8);
      v = v.replace(/(\d{2})(\d)/,'$1/$2')
           .replace(/(\d{2})(\d)/,'$1/$2');
      this.value = v;
    });
  }
}

// ================================================
// ACESSIBILIDADE
// ================================================
function _atualizarLabelFonte(ativo) {
  ['label-fonte', 'label-fonte-dash'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.textContent = ativo ? 'Fonte normal' : 'Aumentar fonte';
  });
}

function _atualizarLabelTema(dark) {
  ['icone-tema', 'icone-tema-dash'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.className = dark ? 'bi bi-sun me-2' : 'bi bi-moon me-2';
  });
  ['label-tema', 'label-tema-dash'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.textContent = dark ? 'Modo claro' : 'Modo escuro';
  });
}

function toggleFonte() {
  const ativo = document.documentElement.classList.toggle('fonte-grande');
  localStorage.setItem('arca_fonte', ativo ? '1' : '0');
  _atualizarLabelFonte(ativo);
}

function toggleDarkMode() {
  const dark = document.body.classList.toggle('dark-mode');
  localStorage.setItem('arca_dark', dark ? '1' : '0');
  _atualizarLabelTema(dark);
}

// Restaurar preferências salvas
if (localStorage.getItem('arca_fonte') === '1') {
  document.documentElement.classList.add('fonte-grande');
  _atualizarLabelFonte(true);
}
if (localStorage.getItem('arca_dark') === '1') {
  document.body.classList.add('dark-mode');
  _atualizarLabelTema(true);
}
