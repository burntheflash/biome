/* ==========================================================================
   CONFIGURAÇÃO GLOBAL
========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    // Referências globais para os elementos das "telas"
    window.telaStories = document.getElementById('tela-stories');
    window.telaGrid = document.getElementById('tela-grid');
    window.btnVoltarGrid = document.getElementById('btn-voltar-grid');
    
    // Containers de conteúdo
    window.heroContainer = document.getElementById('hero-container');
    window.catalogoContainer = document.getElementById('catalogo-container');
    
    // Referência do Footer
    window.mainFooter = document.getElementById('main-footer-content');
    
    // Referência do Logo no Header (para clique)
    const logoHeader = document.querySelector('#main-header .logo');

    // --- EVENT LISTENERS ---

    // 1. Botão Voltar (Seta flutuante)
    window.btnVoltarGrid.addEventListener('click', mostrarTelaStories);
    
    // 2. Clique no Logo (Volta para a Home)
    if (logoHeader) {
        logoHeader.addEventListener('click', () => {
            mostrarTelaStories();
        });
    }

    // Inicia o carregamento dos dados
    carregarDadosPrincipais();
});

// Variáveis globais de estado
window.catalogoData = null;
window.swiperInstance = null;

/* ==========================================================================
   CARREGAMENTO DE DADOS E CRIAÇÃO DOS SLIDES (TELA 1)
========================================================================== */

async function carregarDadosPrincipais() {
    try {
        // Adiciona timestamp para evitar cache do JSON
        const response = await fetch(`_data/catalogo.json?v=${new Date().getTime()}`);
        if (!response.ok) {
            throw new Error(`Erro ao buscar: ${response.statusText}`);
        }
        window.catalogoData = await response.json();
        
        // Dados carregados, cria os slides
        criarSlidesCategorias();

    } catch (error) {
        console.error('Erro fatal ao carregar catálogo:', error);
        document.body.innerHTML = '<h1 style="text-align: center; margin-top: 50px; color: red;">Não foi possível carregar os dados do catálogo. Verifique o console (F12).</h1>';
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
            
            // Define a imagem de capa (primeira imagem do primeiro produto)
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

            // Cria o HTML do Slide
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

    // Inicia o plugin Swiper
    initSwiper();
    
    // Adiciona eventos de clique nos botões "ver modelos"
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
        pagination: { el: '.swiper-pagination', clickable: true },
        effect: 'slide',
        grabCursor: true,
    });
}

/* ==========================================================================
   GESTÃO DAS "TELAS" (Navegação)
========================================================================== */

function mostrarGridProdutos(categoriaKey) {
    // 1. Esconde a Tela 1
    window.telaStories.classList.add('tela-oculta');
    
    // 2. Mostra a Tela 2 e elementos auxiliares
    window.telaGrid.classList.remove('tela-oculta');
    window.btnVoltarGrid.classList.remove('tela-oculta');
    window.mainFooter.classList.remove('tela-oculta'); // Mostra o Footer
    
    // 3. Permite scroll
    document.body.style.overflow = 'auto';

    // 4. Limpa conteúdo anterior
    window.heroContainer.innerHTML = '';
    window.catalogoContainer.innerHTML = '';
    
    // 5. Renderiza o conteúdo novo
    renderizarPaginaDeCategoria(categoriaKey);
}

function mostrarTelaStories() {
    // 1. Esconde a Tela 2 e elementos auxiliares
    window.telaGrid.classList.add('tela-oculta');
    window.btnVoltarGrid.classList.add('tela-oculta');
    window.mainFooter.classList.add('tela-oculta'); // Esconde o Footer
    
    // 2. Mostra a Tela 1
    window.telaStories.classList.remove('tela-oculta');
    
    // 3. Bloqueia scroll (efeito app)
    document.body.style.overflow = 'hidden';
    
    // 4. Limpa conteúdo da memória
    window.heroContainer.innerHTML = '';
    window.catalogoContainer.innerHTML = '';
}

/* ==========================================================================
   RENDERIZAÇÃO DO FEED (TELA 2)
========================================================================== */

function renderizarPaginaDeCategoria(categoriaKey) {
    const categoriaData = window.catalogoData[categoriaKey];
    if (!categoriaData) return;

    // 1. Cria e insere a Hero Section
    const heroSection = criarHeroSection(categoriaKey);
    window.heroContainer.appendChild(heroSection);

    // 2. Cria e insere o Feed de Produtos
    if (categoriaKey === 'mesas') {
        const ordemSubMesas = ['apoio', 'canto', 'centro', 'curvas', 'jantar'];
        
        ordemSubMesas.forEach(chaveSub => {
            if (categoriaData.hasOwnProperty(chaveSub)) {
                const listaProdutos = categoriaData[chaveSub];
                let nomeSub = `Mesas de ${chaveSub.charAt(0).toUpperCase() + chaveSub.slice(1)}`;
                if (chaveSub === 'curvas') nomeSub = 'Mesas Curvas';
                
                criarSecaoFeed(nomeSub, window.catalogoContainer, listaProdutos, 'subcategoria');
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
    
    // Lógica simples para escolher a imagem da Hero
    // (Você pode expandir isso com mais 'else if' para cada categoria)
    let backgroundImage = 'imagens/hero_placeholder.png';
    let heroTitle = categoriaKey.toUpperCase();

    if (categoriaKey === 'aparadores') {
        backgroundImage = 'imagens/hero_aparador_2.png';
        heroTitle = 'APARADORES';
    } 
    // Exemplo futuro:
    // else if (categoriaKey === 'mesas') { backgroundImage = 'imagens/hero_mesas.png'; }

    hero.style.backgroundImage = `url('${backgroundImage}')`;

    hero.innerHTML = `
        <div class="hero-bottom-content">
            <img src="imagens/hand_s_biome.svg" alt="BIOMÊ Ícone" class="hero-icone-marca">
            <h1>${heroTitle}</h1>
            <p class="hero-scroll-cta">role para baixo</p>
        </div>
    `;
    return hero;
}

function criarSecaoFeed(nomeCategoria, containerPai, listaProdutos, tipoTitulo = 'categoria') {
    if (listaProdutos && listaProdutos.length > 0) {
        
        // Cria o container do feed
        const feedContainer = document.createElement('div');
        feedContainer.className = 'produto-feed-container';
        
        if (tipoTitulo === 'subcategoria') {
            feedContainer.setAttribute('data-subcategoria', 'true');
            // Opcional: Adicionar um subtítulo visual se desejar separar as mesas
            // const subTitulo = document.createElement('h3');
            // subTitulo.className = 'subcategoria-titulo';
            // subTitulo.textContent = nomeCategoria;
            // containerPai.appendChild(subTitulo);
        }
        
        listaProdutos.forEach(produto => {
            if (produto) {
                const itemFeed = criarItemFeed(produto); 
                feedContainer.appendChild(itemFeed);
            }
        });
        containerPai.appendChild(feedContainer);
    }
}

function criarItemFeed(produto) {
    const item = document.createElement('div');
    item.className = 'produto-feed-item';

    // Monta a lista de especificações
    let specsHtml = '<ul class="produto-feed-specs">';
    if (produto.info_especie) specsHtml += `<li><strong>Espécie:</strong> ${produto.info_especie}</li>`;
    if (produto.info_origem) specsHtml += `<li><strong>Origem:</strong> ${produto.info_origem}</li>`;
    if (produto.projeto) specsHtml += `<li><strong>Projeto:</strong> ${produto.projeto}</li>`;
    if (produto.acabamentos) specsHtml += `<li><strong>Acabamentos:</strong> ${produto.acabamentos}</li>`;
    if (produto.medidas) specsHtml += `<li><strong>Medidas:</strong> ${produto.medidas.replace(/\n/g, '<br>')}</li>`;
    if (produto.peso) specsHtml += `<li><strong>Peso:</strong> ${produto.peso}</li>`;
    if (produto.preco) specsHtml += `<li><strong>Preço:</strong> R$ ${produto.preco}</li>`;
    specsHtml += '</ul>';

    // Monta a galeria de fotos extras (Portfolio)
    let portfolioHtml = '<div class="produto-feed-portfolio">';
    if (produto.portfolio && produto.portfolio.length > 0) {
        produto.portfolio.forEach(item => {
            if (item && item.imagem) {
                portfolioHtml += `<img src="${item.imagem || 'imagens/placeholder.jpg'}" alt="Portfólio ${produto.nome}">`;
            }
        });
    }
    portfolioHtml += '</div>';

    // Monta o HTML final do item
    item.innerHTML = `
        <div class="produto-feed-header">
            <h3 class="produto-feed-titulo">
                Aparador Biomê <span style="color: var(--cor-acento-laranja);">${produto.nome}</span>
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