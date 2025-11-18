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
    if (window.telaStories) window.telaStories.classList.add('fade-transition', 'fade-visible');
    if (window.telaGrid) window.telaGrid.classList.add('fade-transition');

    // Eventos
    if (window.btnVoltarGrid) window.btnVoltarGrid.addEventListener('click', mostrarTelaStories);
    if (logoHeader) logoHeader.addEventListener('click', mostrarTelaStories);

    carregarDadosPrincipais();
    initInstagramNotification();
});

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

        if (!response.ok) {
            throw new Error(`Erro ao buscar: ${response.statusText}`);
        }
        window.catalogoData = await response.json();
        
        criarSlidesCategorias();
        initFooterNav();

    } catch (error) {
        console.error('Erro fatal ao carregar catálogo:', error);
    }
}

/* ==========================================================================
   SLIDER STORIES (HOME) - (Nenhuma mudança)
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
        speed: 1500,
        effect: 'fade',
        fadeEffect: { crossFade: true },
        pagination: { el: '.swiper-pagination', clickable: true },
        autoplay: { delay: 5000, disableOnInteraction: false },
        grabCursor: true,
    });
}

/* ==========================================================================
   NAVEGAÇÃO ENTRE TELAS (Nenhuma mudança)
========================================================================== */

function mostrarGridProdutos(categoriaKey) {
    window.telaStories.classList.remove('fade-visible');

    setTimeout(() => {
        window.telaStories.classList.add('tela-oculta');
        
        window.telaGrid.classList.remove('tela-oculta');
        window.btnVoltarGrid.classList.remove('tela-oculta');
        window.mainFooter.classList.remove('tela-oculta');
        
        window.scrollTo(0, 0);
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

        requestAnimationFrame(() => {
            window.telaStories.classList.add('fade-visible');
        });

        window.heroContainer.innerHTML = '';
        window.catalogoContainer.innerHTML = '';
    }, 400);
}

/* ==========================================================================
   RENDERIZAÇÃO DO FEED (CORREÇÕES IMPLEMENTADAS)
========================================================================== */

/**
 * Corrige o problema do Hero (Bug 1) e inicia a renderização.
 */
function renderizarPaginaDeCategoria(categoriaKey) {
    const categoriaData = window.catalogoData[categoriaKey];
    if (!categoriaData) return;

    // --- FIX 1: Determinar a imagem do Hero Dinamicamente ---
    const firstProduct = Array.isArray(categoriaData) ? categoriaData[0] : (categoriaData.apoio && categoriaData.apoio[0]);
    
    let heroImageUrl = 'imagens/hero_placeholder.png'; 
    if (firstProduct && firstProduct.imagem_principal) {
        heroImageUrl = firstProduct.imagem_principal;
    }
    // --------------------------------------------------------

    const heroSection = criarHeroSection(categoriaKey, heroImageUrl); // Passando a URL
    heroSection.classList.add('animate-entry');
    window.heroContainer.appendChild(heroSection);

    // 2. Renderiza o Feed de Produtos
    if (categoriaKey === 'mesas') {
        const ordemSubMesas = ['apoio', 'canto', 'centro', 'curvas', 'jantar'];
        
        ordemSubMesas.forEach(chaveSub => {
            if (categoriaData.hasOwnProperty(chaveSub)) {
                const listaProdutos = categoriaData[chaveSub];
                let nomeSub = `Mesas de ${chaveSub.charAt(0).toUpperCase() + chaveSub.slice(1)}`;
                if (chaveSub === 'curvas') nomeSub = 'Mesas Curvas';
                
                // Passa a chave da categoria pai para o feed (para o título)
                criarSecaoFeed(nomeSub, window.catalogoContainer, listaProdutos, 'subcategoria', categoriaKey);
            }
        });
    } else {
        const nomeCategoria = categoriaKey.charAt(0).toUpperCase() + categoriaKey.slice(1);
        // Passa a chave da categoria (ex: 'aparadores')
        criarSecaoFeed(nomeCategoria, window.catalogoContainer, categoriaData, 'categoria', categoriaKey); 
    }
}

/**
 * Cria a Hero Section para a categoria.
 * (Atualizada para receber a imagem)
 */
function criarHeroSection(categoriaKey, imageUrl) { // Recebe a imagem URL
    const hero = document.createElement('div');
    hero.className = 'hero-section';
    
    let heroTitle = categoriaKey.toUpperCase();

    // FIX 1: Usa a URL da imagem principal do primeiro produto
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

/**
 * Cria uma seção (título) e, abaixo dela, o feed.
 * (Atualizada para passar o ProductType)
 */
function criarSecaoFeed(nomeCategoria, containerPai, listaProdutos, tipoTitulo, categoriaChavePai) {
    if (listaProdutos && listaProdutos.length > 0) {
        const feedContainer = document.createElement('div');
        feedContainer.className = 'produto-feed-container';
        if (tipoTitulo === 'subcategoria') feedContainer.setAttribute('data-subcategoria', 'true');
        
        listaProdutos.forEach((produto, index) => {
            if (produto) {
                // FIX 2: Passa a chave da categoria (ex: 'aparadores' ou 'mesas') para o item
                const itemFeed = criarItemFeed(produto, categoriaChavePai);
                itemFeed.classList.add('animate-entry');
                itemFeed.style.animationDelay = `${(index + 1) * 0.15}s`;
                feedContainer.appendChild(itemFeed);
            }
        });
        containerPai.appendChild(feedContainer);
    }
}

/**
 * Cria o HTML para um único item do feed.
 * (Atualizada para usar o nome da categoria para o título)
 */
function criarItemFeed(produto, categoriaChavePai) { // Recebe a chave da categoria
    const item = document.createElement('div');
    item.className = 'produto-feed-item';

    // Formata o nome do produto dinamicamente (ex: APARADOR Biomê GAIA)
    const nomeCategoriaFormatado = categoriaChavePai.toUpperCase();
    
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
                ${nomeCategoriaFormatado} Biomê <span style="color: var(--cor-acento-laranja);">${produto.nome}</span>
            </h3>
            <img src="imagens/hand_s_biome.svg" alt="Ícone Biomê">
        </div>

        <p class="produto-feed-descricao">
            ${produto.descricao || 'Descrição indisponível.'}
        </p>
        
        ${specsHtml}

        <img class="produto-feed-imagem-principal" src="${produto.imagem_principal || 'imagens/placeholder.jpg'}" alt="${produto.nome}">

        ${portfolioHtml}
    `;
    
    return item;
}

/* ==========================================================================
   FOOTER NAV (Pílulas Arrastáveis) - (Nenhuma mudança)
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
   NOTIFICAÇÃO INSTAGRAM - (Nenhuma mudança)
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