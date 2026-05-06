/* ============================================================
   PAUL GAMES - Script principal
   Funcionalidades:
   1) Menu mobile
   2) Validação de formulário
   3) Galeria dinâmica + filtros + modal (lightbox)
   4) Carrossel de notícias
   5) To-do list (com persistência em localStorage)
   6) Cronómetro (start/pause/reset)
   7) Quiz temático
   8) Notificações automáticas
   9) Loja simulada (cálculo de total)
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
    inicializarMenuMobile();
    marcarLinkAtivo();
    inicializarValidacaoFormulario();
    inicializarGaleria();
    inicializarCarrossel();
    inicializarTodoList();
    inicializarCronometro();
    inicializarQuiz();
    inicializarLoja();
    inicializarModalGenerico();

    // Notificação de boas-vindas
    if (!sessionStorage.getItem('boasVindas')) {
        setTimeout(() => {
            mostrarNotificacao('Bem-vindo à Paul Games! 🎮', 'info');
            sessionStorage.setItem('boasVindas', 'true');
        }, 800);
    }
});

/* ============================================================
   1) MENU MOBILE
   ============================================================ */
function inicializarMenuMobile() {
    const toggle = document.querySelector('.menu-toggle');
    const menu = document.querySelector('nav ul');
    if (!toggle || !menu) return;

    toggle.addEventListener('click', () => {
        menu.classList.toggle('aberto');
    });
}

/* ============================================================
   MARCAR LINK ATIVO NA NAV
   ============================================================ */
function marcarLinkAtivo() {
    const paginaAtual = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('nav a').forEach(link => {
        const href = link.getAttribute('href');
        if (href === paginaAtual) {
            link.classList.add('ativo');
        }
    });
}

/* ============================================================
   2) VALIDAÇÃO DE FORMULÁRIO
   ============================================================ */
function inicializarValidacaoFormulario() {
    const form = document.querySelector('#formulario-contacto');
    if (!form) return;

    const campos = {
        nome: form.querySelector('#nome'),
        email: form.querySelector('#email'),
        telefone: form.querySelector('#telefone'),
        assunto: form.querySelector('#assunto'),
        mensagem: form.querySelector('#mensagem'),
        idade: form.querySelector('#idade')
    };

    function validarCampo(campo, regra, mensagem) {
        const erro = campo.parentElement.querySelector('.mensagem-erro');
        if (!regra(campo.value)) {
            campo.classList.add('erro');
            if (erro) {
                erro.textContent = mensagem;
                erro.classList.add('visivel');
            }
            return false;
        }
        campo.classList.remove('erro');
        if (erro) erro.classList.remove('visivel');
        return true;
    }

    // Validação em tempo real
    if (campos.email) {
        campos.email.addEventListener('input', () => {
            validarCampo(
                campos.email,
                v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
                'Insira um email válido (ex: nome@exemplo.com)'
            );
        });
    }

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        let valido = true;

        if (campos.nome) {
            valido &= validarCampo(
                campos.nome,
                v => v.trim().length >= 3,
                'O nome deve ter pelo menos 3 caracteres'
            );
        }
        if (campos.email) {
            valido &= validarCampo(
                campos.email,
                v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
                'Insira um email válido'
            );
        }
        if (campos.telefone) {
            valido &= validarCampo(
                campos.telefone,
                v => v === '' || /^[0-9+\s()-]{9,15}$/.test(v),
                'Telefone inválido (9 a 15 dígitos)'
            );
        }
        if (campos.assunto) {
            valido &= validarCampo(
                campos.assunto,
                v => v !== '',
                'Selecione um assunto'
            );
        }
        if (campos.mensagem) {
            valido &= validarCampo(
                campos.mensagem,
                v => v.trim().length >= 10,
                'A mensagem deve ter pelo menos 10 caracteres'
            );
        }
        if (campos.idade) {
            valido &= validarCampo(
                campos.idade,
                v => {
                    const n = parseInt(v, 10);
                    return !isNaN(n) && n >= 13 && n <= 120;
                },
                'Idade entre 13 e 120 anos'
            );
        }

        if (valido) {
            mostrarNotificacao('Mensagem enviada com sucesso! ✅', 'sucesso');
            form.reset();
        } else {
            mostrarNotificacao('Por favor, corrija os erros do formulário', 'erro');
        }
    });
}

/* ============================================================
   3) GALERIA DINÂMICA + FILTROS + MODAL
   ============================================================ */
const dadosGaleria = [
    { src: 'https://picsum.photos/seed/game1/600/400', titulo: 'Cyber Runner', categoria: 'acao' },
    { src: 'https://picsum.photos/seed/game2/600/400', titulo: 'Mystic Quest', categoria: 'rpg' },
    { src: 'https://picsum.photos/seed/game3/600/400', titulo: 'Race Storm', categoria: 'corrida' },
    { src: 'https://picsum.photos/seed/game4/600/400', titulo: 'Pixel Wars', categoria: 'acao' },
    { src: 'https://picsum.photos/seed/game5/600/400', titulo: 'Dragon Realms', categoria: 'rpg' },
    { src: 'https://picsum.photos/seed/game6/600/400', titulo: 'Neon Drift', categoria: 'corrida' },
    { src: 'https://picsum.photos/seed/game7/600/400', titulo: 'Space Fleet', categoria: 'estrategia' },
    { src: 'https://picsum.photos/seed/game8/600/400', titulo: 'Empire Builder', categoria: 'estrategia' },
    { src: 'https://picsum.photos/seed/game9/600/400', titulo: 'Last Hero', categoria: 'acao' }
];

function inicializarGaleria() {
    const galeria = document.querySelector('.galeria');
    if (!galeria) return;

    function renderizar(filtro = 'todas') {
        galeria.innerHTML = '';
        const filtrados = filtro === 'todas'
            ? dadosGaleria
            : dadosGaleria.filter(j => j.categoria === filtro);

        filtrados.forEach(jogo => {
            const figura = document.createElement('figure');
            figura.classList.add('fade-in');
            figura.innerHTML = `
                <img src="${jogo.src}" alt="${jogo.titulo}" loading="lazy">
                <figcaption>${jogo.titulo}</figcaption>
            `;
            figura.addEventListener('click', () => abrirLightbox(jogo));
            galeria.appendChild(figura);
        });

        if (filtrados.length === 0) {
            galeria.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: var(--cor-texto-secundario);">Sem jogos nesta categoria.</p>';
        }
    }

    // Filtros
    document.querySelectorAll('.filtro-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.filtro-btn').forEach(b => b.classList.remove('ativo'));
            btn.classList.add('ativo');
            renderizar(btn.dataset.filtro);
        });
    });

    renderizar();
}

function abrirLightbox(jogo) {
    const modal = document.querySelector('#modal-galeria');
    if (!modal) return;
    modal.querySelector('.modal-img').src = jogo.src;
    modal.querySelector('.modal-titulo').textContent = jogo.titulo;
    modal.querySelector('.modal-categoria').textContent = 'Categoria: ' + jogo.categoria;
    modal.classList.add('aberto');
}

/* ============================================================
   MODAL GENÉRICO (fechar)
   ============================================================ */
function inicializarModalGenerico() {
    document.querySelectorAll('.modal').forEach(modal => {
        const fechar = modal.querySelector('.fechar');
        if (fechar) {
            fechar.addEventListener('click', () => modal.classList.remove('aberto'));
        }
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.classList.remove('aberto');
        });
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            document.querySelectorAll('.modal.aberto').forEach(m => m.classList.remove('aberto'));
        }
    });

    // Botões que abrem modais por data-modal
    document.querySelectorAll('[data-abrir-modal]').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = btn.dataset.abrirModal;
            const modal = document.querySelector('#' + id);
            if (modal) modal.classList.add('aberto');
        });
    });
}

/* ============================================================
   4) CARROSSEL DE NOTÍCIAS
   ============================================================ */
function inicializarCarrossel() {
    const carrossel = document.querySelector('.carrossel');
    if (!carrossel) return;

    const pista = carrossel.querySelector('.carrossel-pista');
    const slides = carrossel.querySelectorAll('.carrossel-slide');
    const btnAnterior = carrossel.querySelector('.btn-anterior');
    const btnProximo = carrossel.querySelector('.btn-proximo');
    const indicadoresContainer = carrossel.querySelector('.carrossel-indicadores');

    let indiceAtual = 0;
    let intervaloAuto;

    // Criar indicadores
    if (indicadoresContainer) {
        slides.forEach((_, i) => {
            const ind = document.createElement('button');
            ind.classList.add('indicador');
            ind.setAttribute('aria-label', 'Ir para slide ' + (i + 1));
            ind.addEventListener('click', () => irParaSlide(i));
            indicadoresContainer.appendChild(ind);
        });
    }

    function atualizar() {
        pista.style.transform = `translateX(-${indiceAtual * 100}%)`;
        carrossel.querySelectorAll('.indicador').forEach((ind, i) => {
            ind.classList.toggle('ativo', i === indiceAtual);
        });
    }

    function irParaSlide(i) {
        indiceAtual = (i + slides.length) % slides.length;
        atualizar();
        reiniciarAuto();
    }

    function proximo() { irParaSlide(indiceAtual + 1); }
    function anterior() { irParaSlide(indiceAtual - 1); }

    function iniciarAuto() {
        intervaloAuto = setInterval(proximo, 5000);
    }

    function reiniciarAuto() {
        clearInterval(intervaloAuto);
        iniciarAuto();
    }

    if (btnProximo) btnProximo.addEventListener('click', proximo);
    if (btnAnterior) btnAnterior.addEventListener('click', anterior);

    carrossel.addEventListener('mouseenter', () => clearInterval(intervaloAuto));
    carrossel.addEventListener('mouseleave', iniciarAuto);

    atualizar();
    iniciarAuto();
}

/* ============================================================
   5) TO-DO LIST (com localStorage)
   ============================================================ */
function inicializarTodoList() {
    const form = document.querySelector('#todo-form');
    const lista = document.querySelector('#todo-list');
    const input = document.querySelector('#todo-input');
    if (!form || !lista) return;

    let tarefas = JSON.parse(localStorage.getItem('paulgames-todos') || '[]');

    function guardar() {
        localStorage.setItem('paulgames-todos', JSON.stringify(tarefas));
    }

    function renderizar() {
        lista.innerHTML = '';
        if (tarefas.length === 0) {
            lista.innerHTML = '<li style="border-left-color: var(--cor-texto-secundario); justify-content: center;">Sem tarefas. Adicione uma acima!</li>';
            return;
        }
        tarefas.forEach((tarefa, i) => {
            const li = document.createElement('li');
            if (tarefa.concluida) li.classList.add('concluida');
            li.innerHTML = `
                <span style="flex: 1;">${escaparHTML(tarefa.texto)}</span>
                <div>
                    <button class="btn-toggle" aria-label="Alternar conclusão">${tarefa.concluida ? '↺' : '✓'}</button>
                    <button class="btn-remover" aria-label="Remover">✕</button>
                </div>
            `;
            li.querySelector('.btn-toggle').addEventListener('click', () => {
                tarefas[i].concluida = !tarefas[i].concluida;
                guardar();
                renderizar();
            });
            li.querySelector('.btn-remover').addEventListener('click', () => {
                tarefas.splice(i, 1);
                guardar();
                renderizar();
                mostrarNotificacao('Tarefa removida', 'info');
            });
            lista.appendChild(li);
        });
    }

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const valor = input.value.trim();
        if (!valor) return;
        tarefas.push({ texto: valor, concluida: false });
        guardar();
        renderizar();
        input.value = '';
        mostrarNotificacao('Tarefa adicionada! 📝', 'sucesso');
    });

    renderizar();
}

function escaparHTML(texto) {
    const div = document.createElement('div');
    div.textContent = texto;
    return div.innerHTML;
}

/* ============================================================
   6) CRONÓMETRO
   ============================================================ */
function inicializarCronometro() {
    const display = document.querySelector('#cronometro-display');
    const btnIniciar = document.querySelector('#cron-iniciar');
    const btnPausar = document.querySelector('#cron-pausar');
    const btnReset = document.querySelector('#cron-reset');
    if (!display) return;

    let segundos = 0;
    let intervalo = null;

    function formatar(s) {
        const h = String(Math.floor(s / 3600)).padStart(2, '0');
        const m = String(Math.floor((s % 3600) / 60)).padStart(2, '0');
        const seg = String(s % 60).padStart(2, '0');
        return `${h}:${m}:${seg}`;
    }

    function atualizar() {
        display.textContent = formatar(segundos);
    }

    if (btnIniciar) {
        btnIniciar.addEventListener('click', () => {
            if (intervalo) return;
            intervalo = setInterval(() => {
                segundos++;
                atualizar();
            }, 1000);
            mostrarNotificacao('Cronómetro iniciado ⏱️', 'info');
        });
    }

    if (btnPausar) {
        btnPausar.addEventListener('click', () => {
            clearInterval(intervalo);
            intervalo = null;
            mostrarNotificacao('Cronómetro pausado', 'info');
        });
    }

    if (btnReset) {
        btnReset.addEventListener('click', () => {
            clearInterval(intervalo);
            intervalo = null;
            segundos = 0;
            atualizar();
            mostrarNotificacao('Cronómetro reiniciado', 'info');
        });
    }

    atualizar();
}

/* ============================================================
   7) QUIZ TEMÁTICO
   ============================================================ */
const perguntasQuiz = [
    {
        pergunta: 'Qual é o videojogo mais vendido de todos os tempos?',
        opcoes: ['Tetris', 'Minecraft', 'GTA V', 'Wii Sports'],
        correta: 1
    },
    {
        pergunta: 'Em que ano foi lançado o primeiro Super Mario Bros?',
        opcoes: ['1983', '1985', '1987', '1990'],
        correta: 1
    },
    {
        pergunta: 'Que empresa criou o Pac-Man?',
        opcoes: ['Atari', 'Sega', 'Namco', 'Nintendo'],
        correta: 2
    },
    {
        pergunta: 'Quem é o protagonista da série The Legend of Zelda?',
        opcoes: ['Zelda', 'Ganon', 'Link', 'Sheik'],
        correta: 2
    },
    {
        pergunta: 'Qual destes jogos é um RPG?',
        opcoes: ['FIFA', 'Final Fantasy', 'Tetris', 'Pong'],
        correta: 1
    }
];

function inicializarQuiz() {
    const container = document.querySelector('#quiz');
    if (!container) return;

    let indice = 0;
    let pontuacao = 0;

    function renderizarPergunta() {
        if (indice >= perguntasQuiz.length) {
            mostrarResultado();
            return;
        }
        const q = perguntasQuiz[indice];
        container.innerHTML = `
            <div class="quiz-progresso">Pergunta ${indice + 1} de ${perguntasQuiz.length} • Pontos: ${pontuacao}</div>
            <div class="quiz-pergunta">${q.pergunta}</div>
            <div class="quiz-opcoes"></div>
        `;
        const opcoesContainer = container.querySelector('.quiz-opcoes');
        q.opcoes.forEach((opt, i) => {
            const btn = document.createElement('button');
            btn.classList.add('quiz-opcao');
            btn.textContent = opt;
            btn.addEventListener('click', () => responder(i, btn));
            opcoesContainer.appendChild(btn);
        });
    }

    function responder(escolha, botao) {
        const q = perguntasQuiz[indice];
        const todosBotoes = container.querySelectorAll('.quiz-opcao');
        todosBotoes.forEach(b => b.disabled = true);

        if (escolha === q.correta) {
            botao.classList.add('correta');
            pontuacao++;
            mostrarNotificacao('Correto! ✅', 'sucesso');
        } else {
            botao.classList.add('errada');
            todosBotoes[q.correta].classList.add('correta');
            mostrarNotificacao('Errado! ❌', 'erro');
        }

        setTimeout(() => {
            indice++;
            renderizarPergunta();
        }, 1500);
    }

    function mostrarResultado() {
        const percentagem = Math.round((pontuacao / perguntasQuiz.length) * 100);
        let mensagem;
        if (percentagem === 100) mensagem = '🏆 Mestre dos jogos!';
        else if (percentagem >= 60) mensagem = '🎮 Bom conhecimento!';
        else mensagem = '🕹️ Continua a jogar!';

        container.innerHTML = `
            <div class="quiz-resultado">
                <h3>${mensagem}</h3>
                <p style="font-size: 1.5rem; color: var(--cor-neon);">${pontuacao} / ${perguntasQuiz.length}</p>
                <p style="margin: 1rem 0;">Acertaste ${percentagem}% das perguntas.</p>
                <button class="botao" id="quiz-reiniciar">Tentar novamente</button>
            </div>
        `;
        container.querySelector('#quiz-reiniciar').addEventListener('click', () => {
            indice = 0;
            pontuacao = 0;
            renderizarPergunta();
        });
    }

    renderizarPergunta();
}

/* ============================================================
   8) NOTIFICAÇÕES AUTOMÁTICAS
   ============================================================ */
function mostrarNotificacao(mensagem, tipo = 'sucesso') {
    const existente = document.querySelector('.notificacao');
    if (existente) existente.remove();

    const notif = document.createElement('div');
    notif.classList.add('notificacao');
    if (tipo === 'erro') notif.classList.add('erro');
    if (tipo === 'info') notif.classList.add('info');
    notif.textContent = mensagem;
    notif.setAttribute('role', 'alert');
    document.body.appendChild(notif);

    setTimeout(() => {
        if (notif.parentNode) notif.remove();
    }, 3000);
}

/* ============================================================
   9) LOJA SIMULADA
   ============================================================ */
const produtosLoja = [
    { id: 1, nome: 'Cyber Runner', preco: 29.99, img: 'https://picsum.photos/seed/loja1/300/200' },
    { id: 2, nome: 'Mystic Quest', preco: 49.99, img: 'https://picsum.photos/seed/loja2/300/200' },
    { id: 3, nome: 'Race Storm', preco: 39.99, img: 'https://picsum.photos/seed/loja3/300/200' },
    { id: 4, nome: 'Pixel Wars', preco: 19.99, img: 'https://picsum.photos/seed/loja4/300/200' },
    { id: 5, nome: 'Dragon Realms', preco: 59.99, img: 'https://picsum.photos/seed/loja5/300/200' },
    { id: 6, nome: 'Space Fleet', preco: 34.99, img: 'https://picsum.photos/seed/loja6/300/200' }
];

function inicializarLoja() {
    const grid = document.querySelector('.loja-grid');
    const itensCarrinho = document.querySelector('#carrinho-itens');
    const totalEl = document.querySelector('#carrinho-total');
    const btnLimpar = document.querySelector('#carrinho-limpar');
    const btnFinalizar = document.querySelector('#carrinho-finalizar');
    if (!grid || !itensCarrinho || !totalEl) return;

    let carrinho = [];

    function renderizarProdutos() {
        grid.innerHTML = '';
        produtosLoja.forEach(p => {
            const div = document.createElement('div');
            div.classList.add('produto');
            div.innerHTML = `
                <img src="${p.img}" alt="${p.nome}" loading="lazy">
                <h4>${p.nome}</h4>
                <p class="preco">€ ${p.preco.toFixed(2)}</p>
                <button class="botao botao-rosa" data-id="${p.id}">Adicionar</button>
            `;
            div.querySelector('button').addEventListener('click', () => adicionar(p));
            grid.appendChild(div);
        });
    }

    function adicionar(produto) {
        const existente = carrinho.find(i => i.id === produto.id);
        if (existente) {
            existente.quantidade++;
        } else {
            carrinho.push({ ...produto, quantidade: 1 });
        }
        renderizarCarrinho();
        mostrarNotificacao(`${produto.nome} adicionado! 🛒`, 'sucesso');
    }

    function remover(id) {
        carrinho = carrinho.filter(i => i.id !== id);
        renderizarCarrinho();
    }

    function renderizarCarrinho() {
        itensCarrinho.innerHTML = '';
        if (carrinho.length === 0) {
            itensCarrinho.innerHTML = '<li style="justify-content: center; color: var(--cor-texto-secundario);">Carrinho vazio</li>';
            totalEl.textContent = 'Total: € 0,00';
            return;
        }
        let total = 0;
        carrinho.forEach(item => {
            const li = document.createElement('li');
            const subtotal = item.preco * item.quantidade;
            total += subtotal;
            li.innerHTML = `
                <span>${item.nome} × ${item.quantidade}</span>
                <span>
                    € ${subtotal.toFixed(2)}
                    <button class="btn-remover" data-id="${item.id}" style="margin-left: 0.5rem;">✕</button>
                </span>
            `;
            li.querySelector('button').addEventListener('click', () => remover(item.id));
            itensCarrinho.appendChild(li);
        });
        totalEl.textContent = `Total: € ${total.toFixed(2)}`;
    }

    if (btnLimpar) {
        btnLimpar.addEventListener('click', () => {
            carrinho = [];
            renderizarCarrinho();
            mostrarNotificacao('Carrinho limpo', 'info');
        });
    }

    if (btnFinalizar) {
        btnFinalizar.addEventListener('click', () => {
            if (carrinho.length === 0) {
                mostrarNotificacao('Adiciona produtos primeiro', 'erro');
                return;
            }
            const total = carrinho.reduce((s, i) => s + i.preco * i.quantidade, 0);
            mostrarNotificacao(`Compra simulada concluída! Total: € ${total.toFixed(2)} 🎉`, 'sucesso');
            carrinho = [];
            renderizarCarrinho();
        });
    }

    renderizarProdutos();
    renderizarCarrinho();
}
