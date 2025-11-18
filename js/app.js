/* ==========================================================================
   CONFIGURAÇÃO GLOBAL
========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    // Referências globais
    window.telaStories = document.getElementById('tela-stories');
    window.telaGrid = document.getElementById('tela-grid');
    window.btnVoltarGrid = document.getElementById('btn-voltar-grid');
    
    window.heroContainer = document.getElementById('hero-container');
    window.catalogoContainer = document.getElementById('catalogo-container');
    window.mainFooter = document.getElementById('main-footer-content');
    
    const logoHeader = document.querySelector('#main-header .logo');
    const splashScreen = document.getElementById('splash-screen');

    // --- LÓGICA DA SPLASH SCREEN ---
    window.addEventListener('load', () => {
        setTimeout(() => {
            if (splashScreen) {
                splashScreen.classList.add('splash-hidden');
                setTimeout(() => splashScreen.remove(), 1000);
            }
        }, 2000); // Tempo mínimo de 2s
    });

    // --- EVENT LISTENERS ---
    
    // Botão Voltar
    if (window.btnVoltarGrid) {
        window.btnVoltarGrid.addEventListener('click', mostrarTelaStories);
    }
    
    // Clique no Logo (Home)
    if (logoHeader) {
        logoHeader.addEventListener('click', mostrarTelaStories);
    }

    // Inicializa classes de transição
    if (window.telaStories) window.telaStories.classList.add('fade-transition', 'fade-visible');
    if (window.telaGrid) window.telaGrid.classList.add('fade-transition');

    // Inicia o app
    carregarDadosPrincipais();
    initInstagramNotification();
});

// Variáveis globais
window.catalogoData = null;
window.swiperInstance = null;

/* ==========================================================================
   CARREGAMENTO DE DADOS (COM CACHE BUSTING)
========================================================================== */

async function carregarDadosPrincipais() {
    try {
        // MUDANÇA: Força o navegador a buscar a versão mais recente
        const timestamp = new Date().getTime();
        const random = Math.random();
        
        const response = await fetch(`_data/catalogo.json?t=${timestamp}&r=${random}`, {
            cache: "no-store",
            headers: {
                'Pragma': 'no-cache',
                'Cache-Control': 'no-cache'
            }
        });

        if (!response.ok) {
            throw new Error(`Erro ao buscar: ${response.statusText}`);
        }
        window.catalogoData = await response.json();
        
        // 1. Cria os slides da Home
        criarSlidesCategorias();
        
        // 2. Cria o menu do rodapé (Pílulas)
        initFooterNav();

    } catch (error) {
        console.error('Erro fatal ao carregar catálogo:', error);
        // Opcional: Mostrar erro na tela
        // document.body.innerHTML = '<h1 style="text-align:center; margin-top:50px;">Erro ao carregar. Tente recarregar.</h1>';
    }
}

/* ==========================================================================
   SLIDER STORIES (HOME)
========================================================================== */

function criarSlidesCategorias() {
    const swiperWrapper = document.querySelector('.swiper-wrapper');
    if (!swiperWrapper) return;

    const ordemCategorias = ['aparadores', 'bancos', 'bancadas', 'champanheiras', 'esculturas', 'mesas', 'poltronas'];

    ordemCategorias.forEach(key => {
        if (window.catalogoData.hasOwnProperty(key)) {
            const categoria = window.catalogoData[key];
            const nomeCategoria = key.toUpperCase();
            
            let imgCapa = 'imagens/placeholder.jpg';
            
            // Lógica para pegar a capa
            if (key === 'mesas') {
                const subCategorias = Object.values(categoria);
                for (const sub of subCategorias) {
                    if (sub.length > 0 && sub[0].imagem_principal) {
                        imgCapa = sub[0].imagem_principal;
                        break;
                    }
                }
            } else if (categoria.length > 0 && categoria[0].imagem_principal) {
                imgCapa = categoria[0].imagem_principal;
            }

            const slide = document.createElement('div');
            slide.className = 'swiper-slide';
            slide.style.backgroundImage = `url('${imgCapa}')`;
            
            slide.innerHTML = `
                <div class="slide-conteudo">
                    <img src="imagens/hand_s_biome.svg" alt="BIOMÊ Ícone" class="slide-icone-marca">
                    <h2>${nomeCategoria}</h2>
                    <div class="cta-container">
                        <button class="btn-ver-modelos" data-categoria="${key}">
                            ver modelos
                        </button>
                    </div>
                </div>
            `;
            
            swiperWrapper.appendChild(slide);
        }
    });

    initSwiper();
    
    // Adiciona cliques nos botões
    document.querySelectorAll('.btn-ver-modelos').forEach(button => {
        button.addEventListener('click', (e) => {
            const categoriaKey = e.target.getAttribute('data-categoria');
            mostrarGridProdutos(categoriaKey);
        });
    });
}

function initSwiper() {
    window.swiperInstance = new Swiper('.swiper', {
        loop: true,
        speed: 1500, // Transição lenta e suave
        effect: 'fade',
        fadeEffect: { crossFade: true },
        pagination: { el: '.swiper-pagination', clickable: true },
        autoplay: { delay: 5000, disableOnInteraction: false },
        grabCursor: true,
    });
}

/* ==========================================================================
   NAVEGAÇÃO ENTRE TELAS
========================================================================== */

function mostrarGridProdutos(categoriaKey) {
    // Fade Out Stories
    window.telaStories.classList.remove('fade-visible');

    setTimeout(() => {
        window.telaStories.classList.add('tela-oculta');
        
        // Mostra Grid e Elementos
        window.telaGrid.classList.remove('tela-oculta');
        window.btnVoltarGrid.classList.remove('tela-oculta');
        window.mainFooter.classList.remove('tela-oculta');
        
        window.scrollTo(0, 0);
        document.body.style.overflow = 'auto';

        // Renderiza conteúdo
        window.heroContainer.innerHTML = '';
        window.catalogoContainer.innerHTML = '';
        
        renderizarPaginaDeCategoria(categoriaKey);

        // Fade In Grid
        requestAnimationFrame(() => {
            window.telaGrid.classList.add('fade-visible');
        });

    }, 400);
}

function mostrarTelaStories() {
    // 1. Fade Out Grid (Esconde o Feed)
    window.telaGrid.classList.remove('fade-visible');

    setTimeout(() => {
        // Troca as classes de visibilidade
        window.telaGrid.classList.add('tela-oculta');
        window.btnVoltarGrid.classList.add('tela-oculta');
        window.mainFooter.classList.add('tela-oculta');
        
        window.telaStories.classList.remove('tela-oculta');
        document.body.style.overflow = 'hidden'; // Trava o scroll

        // --- A CORREÇÃO MÁGICA ESTÁ AQUI ---
        // Força o Swiper a recalcular e reiniciar quando a tela reaparece
        if (window.swiperInstance) {
            window.swiperInstance.update(); // Recalcula tamanhos
            window.swiperInstance.autoplay.start(); // Reinicia o movimento
            window.swiperInstance.slideTo(0, 0); // (Opcional) Volta pro primeiro slide
        }
        // ----------------------------------

        // Fade In Stories (Mostra a tela suavemente)
        requestAnimationFrame(() => {
            window.telaStories.classList.add('fade-visible');
        });

        // Limpa o conteúdo da outra tela para economizar memória
        window.heroContainer.innerHTML = '';
        window.catalogoContainer.innerHTML = '';
    }, 400);
}

/* ==========================================================================
   RENDERIZAÇÃO DO FEED (HERO + PRODUTOS)
========================================================================== */

function renderizarPaginaDeCategoria(categoriaKey) {
    const categoriaData = window.catalogoData[categoriaKey];
    if (!categoriaData) return;

    // 1. Hero
    const heroSection = criarHeroSection(categoriaKey);
    heroSection.classList.add('animate-entry');
    window.heroContainer.appendChild(heroSection);

    // 2. Feed
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
                itemFeed.classList.add('animate-entry');
                itemFeed.style.animationDelay = `${(index + 1) * 0.15}s`; // Efeito cascata
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
    if (produto.info_origem) specsHtml += `<li><strong>Origem:</strong> ${produto.info_origem}</li>`;
    if (produto.projeto) specsHtml += `<li><strong>Projeto:</strong> ${produto.projeto}</li>`;
    if (produto.acabamentos) specsHtml += `<li><strong>Acabamentos:</strong> ${produto.acabamentos}</li>`;
    if (produto.medidas) specsHtml += `<li><strong>Medidas:</strong> ${produto.medidas.replace(/\n/g, '<br>')}</li>`;
    if (produto.peso) specsHtml += `<li><strong>Peso:</strong> ${produto.peso}</li>`;
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
   FOOTER NAV (Pílulas Arrastáveis)
========================================================================== */

function initFooterNav() {
    const footerWrapper = document.getElementById('footer-nav-wrapper');
    if (!footerWrapper) return;
    
    const ordemCategorias = ['aparadores', 'bancos', 'bancadas', 'champanheiras', 'esculturas', 'mesas', 'poltronas'];

    ordemCategorias.forEach(key => {
        if (window.catalogoData && window.catalogoData.hasOwnProperty(key)) {
            const nomeCategoria = key.charAt(0).toUpperCase() + key.slice(1);
            
            const slide = document.createElement('div');
            slide.className = 'swiper-slide';
            
            const btn = document.createElement('button');
            btn.className = 'footer-nav-link';
            btn.textContent = nomeCategoria;
            
            btn.addEventListener('click', () => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
                mostrarGridProdutos(key);
            });
            
            slide.appendChild(btn);
            footerWrapper.appendChild(slide);
        }
    });

    new Swiper('.footer-nav-swiper', {
        slidesPerView: 'auto',
        spaceBetween: 12,
        freeMode: true,
        grabCursor: true,
        mousewheel: true,
    });
}

/* ==========================================================================
   NOTIFICAÇÃO INSTAGRAM
========================================================================== */

function initInstagramNotification() {
    const notification = document.getElementById('insta-notification');
    const closeBtn = document.getElementById('close-notification');
    const actionBtn = document.querySelector('.notification-action-btn');
    const TEMPO_PARA_APARECER = 60000; // 1 min
    let notificationTimeout;

    if (!notification) return;

    function showNotification() {
        notification.classList.add('show');
    }

    function hideNotification() {
        notification.classList.remove('show');
        resetTimer();
    }

    function resetTimer() {
        clearTimeout(notificationTimeout);
        notificationTimeout = setTimeout(showNotification, TEMPO_PARA_APARECER);
    }

    resetTimer();

    if (closeBtn) closeBtn.addEventListener('click', hideNotification);
    if (actionBtn) actionBtn.addEventListener('click', () => {
        notification.classList.remove('show');
        resetTimer();
    });
}