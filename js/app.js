/* ==========================================================================
   CONFIGURAÇÃO GLOBAL
========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    window.telaStories = document.getElementById('tela-stories');
    window.telaGrid = document.getElementById('tela-grid');
    window.btnVoltarGrid = document.getElementById('btn-voltar-grid');
    window.heroContainer = document.getElementById('hero-container');
    window.catalogoContainer = document.getElementById('catalogo-container');
    window.mainFooter = document.getElementById('main-footer-content');
    const logoHeader = document.querySelector('#main-header .logo');

    // Inicializa classes de transição
    window.telaStories.classList.add('fade-transition', 'fade-visible');
    window.telaGrid.classList.add('fade-transition');

    // Eventos
    window.btnVoltarGrid.addEventListener('click', mostrarTelaStories);
    if (logoHeader) {
        logoHeader.addEventListener('click', mostrarTelaStories);
    }

    // --- LÓGICA DA SPLASH SCREEN ---
    const splashScreen = document.getElementById('splash-screen');
    
    // Quando a página inteira (incluindo imagens) carregar:
    window.addEventListener('load', () => {
        // Mantém a splash por pelo menos 2 segundos para branding
        setTimeout(() => {
            splashScreen.classList.add('splash-hidden');
            
            // Opcional: remove do DOM depois da animação para limpar memória
            setTimeout(() => {
                splashScreen.remove();
            }, 1000);
            
        }, 2000); // Tempo de exibição (2000ms = 2s)
    });

    carregarDadosPrincipais();
});

window.catalogoData = null;
window.swiperInstance = null;

/* ==========================================================================
   CARREGAMENTO DE DADOS (Sem mudanças)
========================================================================== */

async function carregarDadosPrincipais() {
    try {
        const response = await fetch(`_data/catalogo.json?v=${new Date().getTime()}`);
        if (!response.ok) throw new Error(`Erro: ${response.statusText}`);
        window.catalogoData = await response.json();
        criarSlidesCategorias();
    } catch (error) {
        console.error('Erro fatal:', error);
    }
}

function criarSlidesCategorias() {
    const swiperWrapper = document.querySelector('.swiper-wrapper');
    if (!swiperWrapper) return;
    const ordemCategorias = ['aparadores', 'bancos', 'bancadas', 'champanheiras', 'esculturas', 'mesas', 'poltronas'];

    ordemCategorias.forEach(key => {
        if (window.catalogoData.hasOwnProperty(key)) {
            const categoria = window.catalogoData[key];
            const nomeCategoria = key.toUpperCase();
            let imgCapa = 'imagens/placeholder.jpg';
            
            if (key === 'mesas') {
                const sub = Object.values(categoria)[0];
                if (sub?.[0]?.imagem_principal) imgCapa = sub[0].imagem_principal;
            } else if (categoria[0]?.imagem_principal) {
                imgCapa = categoria[0].imagem_principal;
            }

            const slide = document.createElement('div');
            slide.className = 'swiper-slide';
            slide.style.backgroundImage = `url('${imgCapa}')`;
            slide.innerHTML = `
                <div class="slide-conteudo">
                    <img src="imagens/hand_s_biome.svg" alt="Icone" class="slide-icone-marca">
                    <h2>${nomeCategoria}</h2>
                    <div class="cta-container">
                        <button class="btn-ver-modelos" data-categoria="${key}">ver modelos</button>
                    </div>
                </div>
            `;
            swiperWrapper.appendChild(slide);
        }
    });

    initSwiper();
    
    document.querySelectorAll('.btn-ver-modelos').forEach(button => {
        button.addEventListener('click', (e) => {
            const categoriaKey = e.target.getAttribute('data-categoria');
            mostrarGridProdutos(categoriaKey);
        });
    });
}

/**
 * Inicia a biblioteca Swiper.js com efeito FADE suave.
 */
function initSwiper() {
    window.swiperInstance = new Swiper('.swiper', {
        // Ciclo infinito
        loop: true,
        
        // Velocidade da transição (1500ms = 1.5 segundos)
        // Quanto maior o número, mais suave é a troca.
        speed: 1000,
        
        // Muda de 'slide' (padrão) para 'fade'
        effect: 'fade',
        
        // Configuração essencial para o fade não piscar
        fadeEffect: {
            crossFade: true 
        },

        // Paginação (bolinhas)
        pagination: {
            el: '.swiper-pagination',
            clickable: true,
        },
        
        // Autoplay suave (opcional: passa sozinho a cada 5 seg)
        autoplay: {
            delay: 5000,
            disableOnInteraction: false, // Continua rodando mesmo após o cliente tocar
        },

        grabCursor: true, // Mãozinha ao passar o mouse
    });
}

/* ==========================================================================
   GESTÃO DAS "TELAS" COM ANIMAÇÃO E SKELETONS
========================================================================== */

function mostrarGridProdutos(categoriaKey) {
    // 1. Fade Out Stories
    window.telaStories.classList.remove('fade-visible');

    // Aguarda o fade out (400ms)
    setTimeout(() => {
        // Esconde Stories e Mostra Grid (ainda invisível)
        window.telaStories.classList.add('tela-oculta');
        window.telaGrid.classList.remove('tela-oculta');
        window.btnVoltarGrid.classList.remove('tela-oculta');
        window.mainFooter.classList.remove('tela-oculta');
        
        // Reseta scroll
        window.scrollTo(0, 0);
        document.body.style.overflow = 'auto';

        // 2. Renderiza SKELETONS primeiro
        renderizarSkeletons(categoriaKey);

        // Fade In do Grid (com Skeletons)
        requestAnimationFrame(() => {
            window.telaGrid.classList.add('fade-visible');
        });

        // 3. Aguarda "tempo de carregamento" (ex: 800ms) e mostra conteúdo real
        setTimeout(() => {
            window.heroContainer.innerHTML = '';
            window.catalogoContainer.innerHTML = '';
            renderizarPaginaDeCategoria(categoriaKey);
        }, 800); 

    }, 400);
}

function mostrarTelaStories() {
    // 1. Fade Out Grid
    window.telaGrid.classList.remove('fade-visible');

    setTimeout(() => {
        window.telaGrid.classList.add('tela-oculta');
        window.btnVoltarGrid.classList.add('tela-oculta');
        window.mainFooter.classList.add('tela-oculta');
        
        window.telaStories.classList.remove('tela-oculta');
        document.body.style.overflow = 'hidden';

        // Fade In Stories
        requestAnimationFrame(() => {
            window.telaStories.classList.add('fade-visible');
        });

        // Limpa containers
        window.heroContainer.innerHTML = '';
        window.catalogoContainer.innerHTML = '';
    }, 400);
}

/* ==========================================================================
   SKELETONS (Renderização)
========================================================================== */

function renderizarSkeletons(categoriaKey) {
    // Hero Skeleton
    window.heroContainer.innerHTML = `
        <div class="hero-section" style="background-color: #222;">
            <div class="hero-bottom-content">
                 <div class="skeleton skeleton-title" style="width: 300px; height: 60px; background: rgba(255,255,255,0.1);"></div>
            </div>
        </div>
    `;

    // Feed Items Skeletons (Gera 2 placeholders)
    let skeletonsHtml = '';
    for (let i = 0; i < 2; i++) {
        skeletonsHtml += `
            <div class="skeleton-item">
                <div class="skeleton-header">
                    <div class="skeleton skeleton-title"></div>
                    <div class="skeleton skeleton-icon"></div>
                </div>
                <div class="skeleton skeleton-text"></div>
                <div class="skeleton skeleton-text skeleton-text-short"></div>
                <div class="skeleton-specs">
                    <div class="skeleton skeleton-spec-line"></div>
                    <div class="skeleton skeleton-spec-line"></div>
                    <div class="skeleton skeleton-spec-line"></div>
                </div>
                <div class="skeleton skeleton-image"></div>
            </div>
        `;
    }
    window.catalogoContainer.innerHTML = `<div class="produto-feed-container">${skeletonsHtml}</div>`;
}

/* ==========================================================================
   RENDERIZAÇÃO REAL (Com animação de entrada)
========================================================================== */

function renderizarPaginaDeCategoria(categoriaKey) {
    const categoriaData = window.catalogoData[categoriaKey];
    if (!categoriaData) return;

    const heroSection = criarHeroSection(categoriaKey);
    // Adiciona classe de animação na Hero
    heroSection.classList.add('animate-entry');
    window.heroContainer.appendChild(heroSection);

    if (categoriaKey === 'mesas') {
        const ordemSubMesas = ['apoio', 'canto', 'centro', 'curvas', 'jantar'];
        ordemSubMesas.forEach(chaveSub => {
            if (categoriaData.hasOwnProperty(chaveSub)) {
                const lista = categoriaData[chaveSub];
                let nomeSub = `Mesas de ${chaveSub.charAt(0).toUpperCase() + chaveSub.slice(1)}`;
                if (chaveSub === 'curvas') nomeSub = 'Mesas Curvas';
                criarSecaoFeed(nomeSub, window.catalogoContainer, lista, 'subcategoria');
            }
        });
    } else {
        const nomeCategoria = categoriaKey.charAt(0).toUpperCase() + categoriaKey.slice(1);
        criarSecaoFeed(nomeCategoria, window.catalogoContainer, categoriaData, 'categoria');
    }
}

function criarHeroSection(categoriaKey) {
    const hero = document.createElement('div');
    hero.className = 'hero-section';
    let backgroundImage = 'imagens/hero_placeholder.png';
    let heroTitle = categoriaKey.toUpperCase();

    if (categoriaKey === 'aparadores') {
        backgroundImage = 'imagens/hero_aparador_2.png';
        heroTitle = 'APARADORES';
    } 
    hero.style.backgroundImage = `url('${backgroundImage}')`;
    hero.innerHTML = `
        <div class="hero-bottom-content">
            <img src="imagens/hand_s_biome.svg" alt="Icone" class="hero-icone-marca">
            <h1>${heroTitle}</h1>
            <p class="hero-scroll-cta">role para baixo</p>
        </div>
    `;
    return hero;
}

function criarSecaoFeed(nomeCategoria, containerPai, listaProdutos, tipoTitulo) {
    if (listaProdutos && listaProdutos.length > 0) {
        const feedContainer = document.createElement('div');
        feedContainer.className = 'produto-feed-container';
        if (tipoTitulo === 'subcategoria') feedContainer.setAttribute('data-subcategoria', 'true');
        
        listaProdutos.forEach((produto, index) => {
            if (produto) {
                const itemFeed = criarItemFeed(produto);
                // Adiciona animação com delay progressivo
                itemFeed.classList.add('animate-entry');
                // Adiciona delay baseado no indice (efeito cascata)
                itemFeed.style.animationDelay = `${(index + 1) * 0.15}s`;
                feedContainer.appendChild(itemFeed);
            }
        });
        containerPai.appendChild(feedContainer);
    }
}

function criarItemFeed(produto) {
    const item = document.createElement('div');
    item.className = 'produto-feed-item';

    let specsHtml = '<ul class="produto-feed-specs">';
    if (produto.info_especie) specsHtml += `<li><strong>Espécie:</strong> ${produto.info_especie}</li>`;
    // ... (restante das specs igual) ...
    if (produto.preco) specsHtml += `<li><strong>Preço:</strong> R$ ${produto.preco}</li>`;
    specsHtml += '</ul>';

    let portfolioHtml = '<div class="produto-feed-portfolio">';
    if (produto.portfolio) {
        produto.portfolio.forEach(p => {
            if (p && p.imagem) portfolioHtml += `<img src="${p.imagem}" alt="Portfólio">`;
        });
    }
    portfolioHtml += '</div>';

    item.innerHTML = `
        <div class="produto-feed-header">
            <h3 class="produto-feed-titulo">
                Aparador Biomê <span style="color: var(--cor-acento-laranja);">${produto.nome}</span>
            </h3>
            <img src="imagens/hand_s_biome.svg" alt="Icone">
        </div>
        <p class="produto-feed-descricao">${produto.descricao || ''}</p>
        ${specsHtml}
        <img class="produto-feed-imagem-principal" src="${produto.imagem_principal || 'imagens/placeholder.jpg'}" alt="${produto.nome}">
        ${portfolioHtml}
    `;
    return item;
}
/* ==========================================================================
   NOTIFICAÇÃO INSTAGRAM (Timer)
========================================================================== */

// Configuração
const TEMPO_PARA_APARECER = 30000; // 30 segundos - Para teste, mude para 5000 (5s)
let notificationTimeout;

document.addEventListener('DOMContentLoaded', () => {
    const notification = document.getElementById('insta-notification');
    const closeBtn = document.getElementById('close-notification');
    const actionBtn = document.querySelector('.notification-action-btn');

    // Função para mostrar
    function showNotification() {
        notification.classList.add('show');
    }

    // Função para esconder e reiniciar o timer
    function hideNotification() {
        notification.classList.remove('show');
        // Reinicia a contagem para aparecer de novo em 1 min
        resetTimer();
    }

    // Inicia o timer assim que carrega
    resetTimer();

    function resetTimer() {
        clearTimeout(notificationTimeout);
        notificationTimeout = setTimeout(showNotification, TEMPO_PARA_APARECER);
    }

    // Eventos
    closeBtn.addEventListener('click', hideNotification);
    
    // Se clicar em "Seguir", também fecha e reinicia (opcional)
    actionBtn.addEventListener('click', () => {
        notification.classList.remove('show');
        // Se quiser que PARE de aparecer depois de seguir, comente a linha abaixo:
        resetTimer(); 
    });
});