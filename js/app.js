/* ==========================================================================
   FUNÇÃO AUXILIAR DA SPLASH SCREEN
========================================================================== */

function hideSplashScreen() {
    const splashScreen = document.getElementById('splash-screen');
    if (splashScreen) {
        splashScreen.classList.add('splash-hidden');
        setTimeout(() => { 
            splashScreen.remove();
        }, 1000);
    }
}

/* ==========================================================================
   CONFIGURAÇÃO GLOBAL E INICIALIZAÇÃO
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

    // --- CORREÇÃO CRÍTICA: Esconde a splash após 2s no DOMContentLoaded ---
    setTimeout(hideSplashScreen, 2000);
    // ----------------------------------------------------------------------

    // Inicializa classes de transição
    if (window.telaStories) window.telaStories.classList.add('fade-transition', 'fade-visible');
    if (window.telaGrid) window.telaGrid.classList.add('fade-transition');

    // Eventos
    if (window.btnVoltarGrid) window.btnVoltarGrid.addEventListener('click', mostrarTelaStories);
    if (logoHeader) logoHeader.addEventListener('click', mostrarTelaStories);

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
        const timestamp = new Date().getTime();
        const random = Math.random();
        
        const response = await fetch(`_data/catalogo.json?t=${timestamp}&r=${random}`, {
            cache: "no-store",
            headers: {
                'Pragma': 'no-cache',
                'Cache-Control': 'no-cache'
            }
        });

        if (!response.ok) throw new Error(`Erro ao buscar: ${response.statusText}`);
        window.catalogoData = await response.json();
        
        criarSlidesCategorias();
        initFooterNav();

    } catch (error) {
        console.error('Erro fatal ao carregar catálogo:', error);
    }
}

/* ==========================================================================
   SLIDER STORIES (HOME)
========================================================================== */

/* ==========================================================================
   SLIDER STORIES (HOME)
========================================================================== */

function criarSlidesCategorias() {
    const swiperWrapper = document.querySelector('.swiper-wrapper');
    if (!swiperWrapper) return;

    const ordemCategorias = ['aparadores', 'mesas', 'artisticas', 'champanheiras', 'esculturas', 'bancos', 'poltronas', 'sofas'];

    ordemCategorias.forEach(key => {
        if (window.catalogoData.hasOwnProperty(key)) {
            const categoria = window.catalogoData[key];
            const nomeCategoria = key.toUpperCase();
            
            let imgCapa = 'imagens/placeholder.jpg';
            
            // Lógica para pegar a capa
            if (categoria.story_image) {
                imgCapa = categoria.story_image;
            } else if (key === 'mesas') {
                const subCategorias = Object.values(categoria);
                for (const sub of subCategorias) {
                    if (sub.length > 0 && sub[0].imagem_principal) {
                        imgCapa = sub[0].imagem_principal;
                        break;
                    }
                }
            } else if (categoria.items && categoria.items[0] && categoria.items[0].imagem_principal) {
                imgCapa = categoria.items[0].imagem_principal;
            }

            const slide = document.createElement('div');
            slide.className = 'swiper-slide';
            slide.style.backgroundImage = `url('${imgCapa}')`;
            
            // MUDANÇA: Usamos onclick="${function}" no HTML para garantir que o clique funcione
            slide.innerHTML = `
                <div class="slide-conteudo">
                    <img src="imagens/hand_s_biome.svg" alt="BIOMÊ Ícone" class="slide-icone-marca">
                    <h2>${nomeCategoria}</h2>
                    <div class="cta-container">
                        <button class="btn-ver-modelos" onclick="mostrarGridProdutos('${key}')">
                            ver modelos
                        </button>
                    </div>
                </div>
            `;
            
            swiperWrapper.appendChild(slide);
        }
    });

    initSwiper();
    
    // REMOVIDO: O bloco document.querySelectorAll que estava aqui (ele era o bug)
}

function initSwiper() {
    window.swiperInstance = new Swiper('.swiper', {
        loop: true,
        speed: 1500,
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
    window.telaStories.classList.remove('fade-visible');

    setTimeout(() => {
        window.telaStories.classList.add('tela-oculta');
        
        window.telaGrid.classList.remove('tela-oculta');
        window.btnVoltarGrid.classList.remove('tela-oculta');
        window.mainFooter.classList.remove('tela-oculta');
        
        window.scrollTo({ top: 0, behavior: 'auto' }); // Rola para o topo
        document.body.style.overflow = 'auto';

        window.heroContainer.innerHTML = '';
        window.catalogoContainer.innerHTML = '';
        
        renderizarPaginaDeCategoria(categoriaKey);

        requestAnimationFrame(() => {
            window.telaGrid.classList.add('fade-visible');
        });

    }, 400);
}

function mostrarTelaStories() {
    window.telaGrid.classList.remove('fade-visible');

    setTimeout(() => {
        window.telaGrid.classList.add('tela-oculta');
        window.btnVoltarGrid.classList.add('tela-oculta');
        window.mainFooter.classList.add('tela-oculta');
        
        window.telaStories.classList.remove('tela-oculta');
        document.body.style.overflow = 'hidden';

        if (window.swiperInstance) {
            window.swiperInstance.update();
            window.swiperInstance.autoplay.start();
            window.swiperInstance.slideTo(0, 0);
        }

        requestAnimationFrame(() => {
            window.telaStories.classList.add('fade-visible');
        });

        window.heroContainer.innerHTML = '';
        window.catalogoContainer.innerHTML = '';
    }, 400);
}

/* ==========================================================================
   RENDERIZAÇÃO DO FEED (TELA 2)
========================================================================== */

function renderizarPaginaDeCategoria(categoriaKey) {
    const categoria = window.catalogoData[categoriaKey];
    if (!categoria) return;

    // 1. Hero Image Logic
    const productList = (categoriaKey === 'mesas') 
        ? categoria.subcategories.apoio
        : categoria.items; 

    const firstProduct = productList ? (Array.isArray(productList) ? productList[0] : null) : null;
    
    let heroImageUrl = 'imagens/hero_placeholder.png';
    if (firstProduct && firstProduct.imagem_principal) {
        heroImageUrl = firstProduct.imagem_principal;
    }

    const heroSection = criarHeroSection(categoriaKey, heroImageUrl);
    heroSection.classList.add('animate-entry');
    window.heroContainer.appendChild(heroSection);

    // 2. Feed
    if (categoriaKey === 'mesas') {
        const ordemSubMesas = ['apoio', 'canto', 'centro', 'curvas', 'jantar'];
        
        ordemSubMesas.forEach(chaveSub => {
            if (categoria.subcategories.hasOwnProperty(chaveSub)) {
                const listaProdutos = categoria.subcategories[chaveSub];
                let nomeSub = `Mesas de ${chaveSub.charAt(0).toUpperCase() + chaveSub.slice(1)}`;
                if (chaveSub === 'curvas') nomeSub = 'Mesas Curvas';
                
                criarSecaoFeed(nomeSub, window.catalogoContainer, listaProdutos, 'subcategoria', categoriaKey);
            }
        });
    } else {
        const nomeCategoria = categoriaKey.charAt(0).toUpperCase() + categoriaKey.slice(1);
        criarSecaoFeed(nomeCategoria, window.catalogoContainer, categoria.items, 'categoria', categoriaKey); 
    }
}

function criarHeroSection(categoriaKey, imageUrl) {
    const hero = document.createElement('div');
    hero.className = 'hero-section';
    
    let heroTitle = categoriaKey.toUpperCase();
    hero.style.backgroundImage = `url('${imageUrl}')`;

    hero.innerHTML = `
        <div class="hero-bottom-content">
            <img src="imagens/hand_s_biome.svg" alt="Icone" class="hero-icone-marca">
            <h1>${heroTitle}</h1>
            <p class="hero-scroll-cta">role para baixo</p>
        </div>
    `;
    return hero;
}

function criarSecaoFeed(nomeCategoria, containerPai, listaProdutos, tipoTitulo, categoriaChavePai) {
    if (listaProdutos && listaProdutos.length > 0) {
        
        const feedContainer = document.createElement('div');
        feedContainer.className = 'produto-feed-container';
        if (tipoTitulo === 'subcategoria') feedContainer.setAttribute('data-subcategoria', 'true');
        
        listaProdutos.forEach((produto, index) => {
            if (produto) {
                const itemFeed = criarItemFeed(produto, categoriaChavePai);
                itemFeed.classList.add('animate-entry');
                itemFeed.style.animationDelay = `${(index + 1) * 0.15}s`;
                feedContainer.appendChild(itemFeed);
            }
        });
        containerPai.appendChild(feedContainer);
    }
}

function criarItemFeed(produto, categoriaChavePai) {
    const item = document.createElement('div');
    item.className = 'produto-feed-item';

    // O nome da categoria foi removido daqui no último ajuste.
    
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
            if (p && p.imagem) portfolioHtml += `<img src="${p.imagem || 'imagens/placeholder.jpg'}" alt="Portfólio">`;
        });
    }
    portfolioHtml += '</div>';

    item.innerHTML = `
        <div class="produto-feed-header">
            <h3 class="produto-feed-titulo">
                Biomê <span style="color: var(--cor-acento-laranja);">${produto.nome}</span>
            </h3>
            <img src="imagens/hand_s_biome.svg" alt="Ícone Biomê">
        </div>

        <p class="produto-feed-descricao">${produto.descricao || 'Descrição indisponível.'}</p>
        
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
    
    // MUDANÇA 1: Adiciona 'sofas' e troca 'bancadas' por 'artísticas'
    const ordemCategorias = ['aparadores', 'bancos', 'artísticas', 'champanheiras', 'esculturas', 'mesas', 'poltronas', 'sofas'];

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

    new Swiper('.footer-nav-links', {
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
    const TEMPO_PARA_APARECER = 60000;
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