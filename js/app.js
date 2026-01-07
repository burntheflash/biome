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

function criarSlidesCategorias() {
    const swiperWrapper = document.querySelector('.swiper-wrapper');
    if (!swiperWrapper) return;

    // 1. Gera os slides dos Produtos (Apenas categorias reais, na ordem correta)
    const ordemCategorias = [
        'aparadores',
        'bancos',
        'artisticas',
        'champanheiras',
        'esculturas',
        'mesas',
        'mesas_jantar',
        'mesas_centro',
        'poltronas',
        'sofas'
    ];

    ordemCategorias.forEach(key => {
        if (window.catalogoData.hasOwnProperty(key)) {
            const categoria = window.catalogoData[key];

            // MAPA DE FORMATAÇÃO DE TÍTULOS
            const titulosPersonalizados = {
                'mesas_centro': 'MESAS DE CENTRO',
                'mesas_jantar': 'MESAS DE JANTAR',
                'sofas': 'SOFÁS',
                'artisticas': 'ARTÍSTICAS'
            };
            const nomeCategoria = titulosPersonalizados[key] || key.toUpperCase();

            let imgCapa = 'imagens/placeholder.jpg';

            // Lógica para pegar a capa
            if (categoria.story_image) {
                imgCapa = categoria.story_image;
            } else if (key === 'mesas') {
                const subCategorias = categoria.subcategories ? Object.values(categoria.subcategories) : [];
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

    // 1.5 CRIA O SLIDE DE PERSONALIZAÇÃO (SOB MEDIDA) - EDITÁVEL
    const infoSobMedida = window.catalogoData.sob_medida || {};
    const imgSobMedida = infoSobMedida.imagem_capa || 'imagens/placeholder.jpg';
    const tituloSobMedida = infoSobMedida.titulo || 'SOB MEDIDA';
    const textoSobMedida = infoSobMedida.texto || 'Peças exclusivas, criadas especialmente para o seu ambiente.';
    const btnTextoSobMedida = infoSobMedida.botao_texto || 'Personalizar Projeto';
    const btnLinkSobMedida = infoSobMedida.botao_link || '#';

    const slidePersonalizacao = document.createElement('div');
    slidePersonalizacao.className = 'swiper-slide slide-personalizacao';
    slidePersonalizacao.style.backgroundImage = `url('${imgSobMedida}')`;

    slidePersonalizacao.innerHTML = `
        <div class="slide-conteudo">
            <img src="imagens/hand_s_biome.svg" alt="BIOMÊ Ícone" class="slide-icone-marca">
            <h2>${tituloSobMedida}</h2>
            <div class="slide-texto-descritivo">
                <p>${textoSobMedida}</p>
            </div>
            <div class="cta-container">
                 <a href="${btnLinkSobMedida}" target="_blank" class="btn-ver-modelos">
                    ${btnTextoSobMedida}
                </a>
            </div>
        </div>
    `;
    swiperWrapper.appendChild(slidePersonalizacao);

    // 2. CRIA O SLIDE DE CONTATO - EDITÁVEL
    const infoContato = window.catalogoData.contato || {};
    const imgContato = infoContato.imagem_fundo || 'imagens/contato.jpg';
    const tituloContato = infoContato.titulo || 'CONTATO';
    const linksContato = infoContato.links || {};

    const slideContato = document.createElement('div');
    slideContato.className = 'swiper-slide slide-contato';
    slideContato.style.backgroundImage = `url('${imgContato}')`;

    slideContato.innerHTML = `
        <div class="slide-conteudo">
            <img src="imagens/hand_s_biome.svg" alt="BIOMÊ Ícone" class="slide-icone-marca">
            <h2>${tituloContato}</h2>
            <div class="contato-links-container">
                <a href="${linksContato.whatsapp || '#'}" target="_blank" class="btn-contato whatsapp">
                    <i class="fa-brands fa-whatsapp"></i>
                    WhatsApp
                </a>
                <a href="${linksContato.email || '#'}" class="btn-contato email">
                    <i class="fa-regular fa-envelope"></i>
                    E-mail
                </a>
                <a href="${linksContato.instagram || '#'}" target="_blank" class="btn-contato instagram">
                    <i class="fa-brands fa-instagram"></i>
                    Instagram
                </a>
            </div>
        </div>
    `;

    swiperWrapper.appendChild(slideContato);

    // Inicializa o Swiper depois de adicionar tudo
    initSwiper();

    // Reatacha os eventos dos botões de produto (REMOVIDO: Usar onclick inline é mais seguro aqui)
    // document.querySelectorAll('.btn-ver-modelos').forEach...
}

function initSwiper() {
    window.swiperInstance = new Swiper('.swiper', {
        loop: true,

        // MUDANÇA: Velocidade mais lenta para suavizar (0.8s)
        speed: 800,

        // MUDANÇA: Volta para o efeito 'slide' (horizontal)
        effect: 'slide',

        pagination: { el: '.swiper-pagination', clickable: true },
        autoplay: { delay: 5000, disableOnInteraction: false },
        grabCursor: true,

        // Ativa a navegação por toques nos cantos
        navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
        },
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
        ? (categoria.subcategories ? categoria.subcategories.apoio : null)
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
    // O JS agora sabe que a ordem é a que está no JSON
    const ordemCategorias = Object.keys(window.catalogoData); // Apenas para Mesas

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
        const titulosPersonalizados = {
            'mesas_centro': 'Mesas de Centro',
            'mesas_jantar': 'Mesas de Jantar',
            'sofas': 'Sofás',
            'artisticas': 'Artísticas'
        };
        const nomeCategoria = titulosPersonalizados[categoriaKey] || (categoriaKey.charAt(0).toUpperCase() + categoriaKey.slice(1));
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

    let specsHtml = '<ul class="produto-feed-specs">';
    if (produto.codigo) specsHtml += `<li><strong>Código:</strong> ${produto.codigo}</li>`;
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

    // Renderização Condicional da Imagem Principal
    let mainImageHtml = '';
    if (produto.imagem_principal) {
        mainImageHtml = `<img class="produto-feed-imagem-principal" src="${produto.imagem_principal}" alt="${produto.nome}">`;
    }

    item.innerHTML = `
        <div class="produto-feed-header">
            <h3 class="produto-feed-titulo">
                Biomê <span style="color: var(--cor-acento-laranja);">${produto.nome}</span>
            </h3>
            <img src="imagens/hand_s_biome.svg" alt="Ícone Biomê">
        </div>

        <p class="produto-feed-descricao">
            ${(produto.descricao && produto.descricao !== '-') ? produto.descricao : ''}
        </p>
        
        ${specsHtml}

        ${mainImageHtml}

        ${portfolioHtml}
    `;

    return item;
}

/* ==========================================================================
   FOOTER NAV (Pílulas Arrastáveis)
========================================================================== */



function initFooterNav() {
    const footerWrapper = document.getElementById('footer-nav-wrapper');
    // Se o elemento não existe (rodapé estático), sai sem erro
    if (!footerWrapper) return;

    // Se existir, limpa conteúdo antigo (rodapé dinâmico)
    footerWrapper.innerHTML = '';
    footerWrapper.className = 'swiper footer-nav-links';
    const swiperWrapper = document.createElement('div');
    swiperWrapper.className = 'swiper-wrapper';

    // MUDANÇA 1: Adiciona 'sofas' e troca 'bancadas' por 'artisticas'
    const ordemCategorias = ['aparadores', 'bancos', 'artisticas', 'champanheiras', 'esculturas', 'mesas', 'mesas_jantar', 'mesas_centro', 'poltronas', 'sofas'];

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
            swiperWrapper.appendChild(slide);
        }
    });

    footerWrapper.appendChild(swiperWrapper);

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
    const TEMPO_PARA_APARECER = 100000;
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