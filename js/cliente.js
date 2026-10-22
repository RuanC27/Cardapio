/* =====================================================
                    CONFIGURAÇÕES
===================================================== */

const SUPABASE_URL =
    "https://fmwmgoxjmcvsmfbcpfsj.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_ZJR2Z6gOfNO5rFhZb-RWwg_qvyY2b9Y";


/* =====================================================
                    ELEMENTOS DA PÁGINA
===================================================== */

const listaPratos =
    document.getElementById("listaPratos");

const template =
    document.getElementById("cardTemplate");

const pesquisa =
    document.getElementById("pesquisa");

const botoesCategoria =
    document.querySelectorAll(".categoria");


/* =====================================================
                        MODAL
===================================================== */

const modal =
    document.getElementById("modal");

const fecharModal =
    document.getElementById("fecharModal");

const modalImagem =
    document.getElementById("modalImagem");

const modalNome =
    document.getElementById("modalNome");

const modalDescricao =
    document.getElementById("modalDescricao");

const modalQuantidade =
    document.getElementById("modalQuantidade");

const modalCategoria =
    document.getElementById("modalCategoria");

const modalPreco =
    document.getElementById("modalPreco");

const modalPrecosTamanho =
    document.getElementById("modalPrecosTamanho");

const modalPrecoPequeno =
    document.getElementById("modalPrecoPequeno");

const modalPrecoMedio =
    document.getElementById("modalPrecoMedio");

const modalPrecoGrande =
    document.getElementById("modalPrecoGrande");

const modalAlergias =
    document.getElementById("modalAlergias");


/* =====================================================
                        ESTADO
===================================================== */

let pratos = [];

let categoriaAtual = "Todos";


/* =====================================================
                    HEADERS SUPABASE
===================================================== */

function headers() {

    return {

        "apikey": SUPABASE_KEY,

        "Authorization":
            `Bearer ${SUPABASE_KEY}`,

        "Content-Type":
            "application/json"

    };

}


/* =====================================================
                    FORMATAR PREÇO
===================================================== */

function formatarPreco(valor) {

    if (
        valor === null ||
        valor === undefined ||
        valor === ""
    ) {

        return "";

    }


    const numero =
        Number(valor);


    if (isNaN(numero)) {

        return "";

    }


    return `R$ ${numero
        .toFixed(2)
        .replace(".", ",")}`;

}


/* =====================================================
                    IMAGEM PADRÃO
===================================================== */

function imagemPadrao() {

    return "imagens/sem-imagem.png";

}


/* =====================================================
                CARREGAR PRATOS
===================================================== */

async function carregarPratos() {

    listaPratos.innerHTML = `

        <p class="carregando">

            Carregando pratos...

        </p>

    `;


    try {

        console.log(
            "Buscando pratos no Supabase..."
        );


        /* =========================================
           BUSCAR PRATOS
        ========================================= */

        const respostaPratos =
            await fetch(

                `${SUPABASE_URL}/rest/v1/prato?select=*&order=id.asc`,

                {

                    method: "GET",

                    headers: headers()

                }

            );


        if (!respostaPratos.ok) {

            const erro =
                await respostaPratos.text();

            throw new Error(
                `Erro ao buscar pratos: ${erro}`
            );

        }


        const dadosPratos =
            await respostaPratos.json();


        /* =========================================
           BUSCAR RELAÇÕES PRATO ↔ ALERGIA
        ========================================= */

        const respostaRelacoes =
            await fetch(

                `${SUPABASE_URL}/rest/v1/prato_alergia?select=prato_id,alergia_id`,

                {

                    method: "GET",

                    headers: headers()

                }

            );


        if (!respostaRelacoes.ok) {

            const erro =
                await respostaRelacoes.text();

            throw new Error(
                `Erro ao buscar relações de alergias: ${erro}`
            );

        }


        const relacoes =
            await respostaRelacoes.json();


        /* =========================================
           BUSCAR ALERGIAS
        ========================================= */

        const respostaAlergias =
            await fetch(

                `${SUPABASE_URL}/rest/v1/alergia?select=id,nome,imagem&order=id.asc`,

                {

                    method: "GET",

                    headers: headers()

                }

            );


        if (!respostaAlergias.ok) {

            const erro =
                await respostaAlergias.text();

            throw new Error(
                `Erro ao buscar alergias: ${erro}`
            );

        }


        const alergias =
            await respostaAlergias.json();


        /* =========================================
           MONTAR MAPA DAS ALERGIAS
        ========================================= */

        const mapaAlergias =
            new Map();


        alergias.forEach(alergia => {

            mapaAlergias.set(
                String(alergia.id),
                alergia
            );

        });


        /* =========================================
           ADICIONAR ALERGIAS A CADA PRATO
        ========================================= */

        pratos =
            dadosPratos.map(prato => {

                const relacoesDoPrato =
                    relacoes.filter(relacao => {

                        return String(
                            relacao.prato_id
                        ) === String(prato.id);

                    });


                const alergiasDoPrato =
                    relacoesDoPrato

                        .map(relacao => {

                            return mapaAlergias.get(
                                String(relacao.alergia_id)
                            );

                        })

                        .filter(Boolean);


                return {

                    ...prato,

                    alergias:
                        alergiasDoPrato

                };

            });


        console.log(
            "Pratos recebidos:",
            pratos
        );


        mostrarPratos(
            aplicarFiltros()
        );

    }


    catch (erro) {

        console.error(
            "ERRO AO BUSCAR DADOS:",
            erro
        );


        listaPratos.innerHTML = `

            <p class="erro">

                Não foi possível carregar
                os pratos.

            </p>

        `;

    }

}


/* =====================================================
                    APLICAR FILTROS
===================================================== */

function aplicarFiltros() {

    const texto =
        pesquisa.value
            .toLowerCase()
            .trim();


    return pratos.filter(prato => {


        /* =========================================
           FILTRO DE CATEGORIA
        ========================================= */

        const pertenceCategoria =

            categoriaAtual === "Todos" ||

            prato.categoria === categoriaAtual;


        if (!pertenceCategoria) {

            return false;

        }


        /* =========================================
           FILTRO DE PESQUISA
        ========================================= */

        if (!texto) {

            return true;

        }


        const nome =
            (prato.nome || "")
                .toLowerCase();


        const descricao =
            (prato.descricao || "")
                .toLowerCase();


        const categoria =
            (prato.categoria || "")
                .toLowerCase();


        return (

            nome.includes(texto) ||

            descricao.includes(texto) ||

            categoria.includes(texto)

        );

    });

}


/* =====================================================
                    MOSTRAR PRATOS
===================================================== */

function mostrarPratos(lista) {

    listaPratos.innerHTML = "";


    if (!lista.length) {

        listaPratos.innerHTML = `

            <p class="nenhum-prato">

                Nenhum prato encontrado.

            </p>

        `;

        return;

    }


    lista.forEach(prato => {


        /* =========================================
           CLONAR TEMPLATE
        ========================================= */

        const card =
            template.content.cloneNode(true);


        const elementoCard =
            card.querySelector(".card");


        /* =========================================
           ELEMENTOS DO CARD
        ========================================= */

        const imagem =
            card.querySelector(".imagem img");

        const nome =
            card.querySelector(".nome");

        const descricao =
            card.querySelector(".descricao");

        const quantidade =
            card.querySelector(".quantidade");

        const categoria =
            card.querySelector(".categoria");

        const preco =
            card.querySelector(".preco");

        const precoPequeno =
            card.querySelector(".preco-pequeno");

        const precoMedio =
            card.querySelector(".preco-medio");

        const precoGrande =
            card.querySelector(".preco-grande");

        const precosTamanho =
            card.querySelector(".precos-tamanho");

        const alergias =
            card.querySelector(".alergias");


        /* =========================================
           IMAGEM
        ========================================= */

        imagem.src =
            prato.imagem ||
            imagemPadrao();

        imagem.alt =
            prato.nome ||
            "Prato";


        /* =========================================
           NOME
        ========================================= */

        nome.textContent =
            prato.nome ||
            "Sem nome";


        /* =========================================
           DESCRIÇÃO
        ========================================= */

        descricao.textContent =
            prato.descricao ||
            "Sem descrição";


        /* =========================================
           QUANTIDADE
        ========================================= */

        if (
            prato.quantidade !== null &&
            prato.quantidade !== undefined &&
            prato.quantidade !== ""
        ) {

            quantidade.textContent =
                `Quantidade disponível: ${prato.quantidade}`;

        }

        else {

            quantidade.textContent = "";

        }


        /* =========================================
           CATEGORIA
        ========================================= */

        categoria.textContent =
            prato.categoria ||
            "";


        /* =========================================
           PREÇO PRINCIPAL
        ========================================= */

        preco.textContent =
            formatarPreco(
                prato.preco
            );


        /* =========================================
           PREÇOS POR TAMANHO
        ========================================= */

        const temPrecoPequeno =
            prato.preco_pequeno !== null &&
            prato.preco_pequeno !== undefined &&
            prato.preco_pequeno !== "";


        const temPrecoMedio =
            prato.preco_medio !== null &&
            prato.preco_medio !== undefined &&
            prato.preco_medio !== "";


        const temPrecoGrande =
            prato.preco_grande !== null &&
            prato.preco_grande !== undefined &&
            prato.preco_grande !== "";


        const possuiPrecosTamanho =
            temPrecoPequeno ||
            temPrecoMedio ||
            temPrecoGrande;


        if (!possuiPrecosTamanho) {

            precosTamanho.style.display =
                "none";

        }

        else {

            precosTamanho.style.display =
                "flex";


            if (temPrecoPequeno) {

                precoPequeno.innerHTML = `

                    <strong>P</strong>

                    <span>
                        ${formatarPreco(
                            prato.preco_pequeno
                        )}
                    </span>

                `;

            }

            else {

                precoPequeno.style.display =
                    "none";

            }


            if (temPrecoMedio) {

                precoMedio.innerHTML = `

                    <strong>M</strong>

                    <span>
                        ${formatarPreco(
                            prato.preco_medio
                        )}
                    </span>

                `;

            }

            else {

                precoMedio.style.display =
                    "none";

            }


            if (temPrecoGrande) {

                precoGrande.innerHTML = `

                    <strong>G</strong>

                    <span>
                        ${formatarPreco(
                            prato.preco_grande
                        )}
                    </span>

                `;

            }

            else {

                precoGrande.style.display =
                    "none";

            }

        }


        /* =========================================
           ALERGIAS
        ========================================= */

        montarAlergiasCard(
            alergias,
            prato,
            alergias
        );


        /* =========================================
           ABRIR MODAL
        ========================================= */

        elementoCard.addEventListener(
            "click",
            () => {

                abrirModal(prato);

            }
        );


        /* =========================================
           ADICIONAR CARD
        ========================================= */

        listaPratos.appendChild(card);

    });

}


/* =====================================================
                MONTAR ALERGIAS DO CARD
===================================================== */

function montarAlergiasCard(
    containerAlergias,
    prato,
    listaAlergias
) {

    if (
        !listaAlergias ||
        !listaAlergias.length
    ) {

        containerAlergias.innerHTML = "";

        return;

    }


    containerAlergias.innerHTML = `

        <strong>
            ⚠ Alergias:
        </strong>

        <div class="alergias-lista"></div>

    `;


    const lista =
        containerAlergias.querySelector(
            ".alergias-lista"
        );


    listaAlergias.forEach(alergia => {

        const item =
            document.createElement("div");


        item.className =
            "alergia-item";


        const imagem =
            document.createElement("img");


        imagem.src =
            alergia.imagem ||
            imagemPadrao();


        imagem.alt =
            alergia.nome ||
            "Alergia";


        const nome =
            document.createElement("span");


        nome.textContent =
            alergia.nome ||
            "Alergia";


        item.appendChild(imagem);

        item.appendChild(nome);

        lista.appendChild(item);

    });

}


/* =====================================================
                    ABRIR MODAL
===================================================== */

function abrirModal(prato) {


    /* =========================================
       IMAGEM
    ========================================= */

    modalImagem.src =
        prato.imagem ||
        imagemPadrao();


    modalImagem.alt =
        prato.nome ||
        "Prato";


    /* =========================================
       NOME
    ========================================= */

    modalNome.textContent =
        prato.nome ||
        "";


    /* =========================================
       DESCRIÇÃO
    ========================================= */

    modalDescricao.textContent =
        prato.descricao ||
        "";


    /* =========================================
       QUANTIDADE
    ========================================= */

    if (
        prato.quantidade !== null &&
        prato.quantidade !== undefined &&
        prato.quantidade !== ""
    ) {

        modalQuantidade.textContent =
            `Quantidade disponível: ${prato.quantidade}`;

    }

    else {

        modalQuantidade.textContent =
            "";

    }


    /* =========================================
       CATEGORIA
    ========================================= */

    modalCategoria.textContent =
        prato.categoria ||
        "";


    /* =========================================
       PREÇO PRINCIPAL
    ========================================= */

    modalPreco.textContent =
        formatarPreco(
            prato.preco
        );


    /* =========================================
       PREÇOS POR TAMANHO
    ========================================= */

    const temPrecoPequeno =
        prato.preco_pequeno !== null &&
        prato.preco_pequeno !== undefined &&
        prato.preco_pequeno !== "";


    const temPrecoMedio =
        prato.preco_medio !== null &&
        prato.preco_medio !== undefined &&
        prato.preco_medio !== "";


    const temPrecoGrande =
        prato.preco_grande !== null &&
        prato.preco_grande !== undefined &&
        prato.preco_grande !== "";


    const possuiPrecos =
        temPrecoPequeno ||
        temPrecoMedio ||
        temPrecoGrande;


    if (!possuiPrecos) {

        modalPrecosTamanho.style.display =
            "none";

    }

    else {

        modalPrecosTamanho.style.display =
            "flex";


        modalPrecoPequeno.innerHTML =
            temPrecoPequeno

                ? `
                    <strong>P</strong>
                    <span>
                        ${formatarPreco(
                            prato.preco_pequeno
                        )}
                    </span>
                  `

                : "";


        modalPrecoMedio.innerHTML =
            temPrecoMedio

                ? `
                    <strong>M</strong>
                    <span>
                        ${formatarPreco(
                            prato.preco_medio
                        )}
                    </span>
                  `

                : "";


        modalPrecoGrande.innerHTML =
            temPrecoGrande

                ? `
                    <strong>G</strong>
                    <span>
                        ${formatarPreco(
                            prato.preco_grande
                        )}
                    </span>
                  `

                : "";

    }


    /* =========================================
       ALERGIAS
    ========================================= */

    montarAlergiasModal(
        prato.alergias || []
    );


    /* =========================================
       ABRIR
    ========================================= */

    modal.classList.add(
        "ativo"
    );


    /*
       Compatibilidade caso algum
       CSS antigo esteja usando display.
    */

    modal.style.display =
        "flex";

}


/* =====================================================
                MONTAR ALERGIAS DO MODAL
===================================================== */

function montarAlergiasModal(
    listaAlergias
) {

    modalAlergias.innerHTML =
        "";


    if (
        !listaAlergias ||
        !listaAlergias.length
    ) {

        return;

    }


    const titulo =
        document.createElement("strong");


    titulo.textContent =
        "⚠ Alergias presentes";


    modalAlergias.appendChild(
        titulo
    );


    const lista =
        document.createElement("div");


    lista.className =
        "modal-alergias-lista";


    listaAlergias.forEach(alergia => {

        const item =
            document.createElement("div");


        item.className =
            "modal-alergia-item";


        const imagem =
            document.createElement("img");


        imagem.src =
            alergia.imagem ||
            imagemPadrao();


        imagem.alt =
            alergia.nome ||
            "Alergia";


        const nome =
            document.createElement("span");


        nome.textContent =
            alergia.nome ||
            "Alergia";


        item.appendChild(imagem);

        item.appendChild(nome);

        lista.appendChild(item);

    });


    modalAlergias.appendChild(
        lista
    );

}


/* =====================================================
                    PESQUISA
===================================================== */

pesquisa.addEventListener(
    "input",
    () => {

        const resultado =
            aplicarFiltros();


        mostrarPratos(
            resultado
        );

    }
);


/* =====================================================
                FILTRO POR CATEGORIA
===================================================== */

botoesCategoria.forEach(
    botao => {

        botao.addEventListener(
            "click",
            () => {


                /* =================================
                   REMOVER ATIVAÇÃO
                ================================= */

                botoesCategoria.forEach(
                    outroBotao => {

                        outroBotao.classList.remove(
                            "ativa"
                        );

                    }
                );


                /* =================================
                   ATIVAR BOTÃO
                ================================= */

                botao.classList.add(
                    "ativa"
                );


                /* =================================
                   ATUALIZAR CATEGORIA
                ================================= */

                categoriaAtual =
                    botao.dataset.categoria;


                /* =================================
                   MOSTRAR RESULTADO
                ================================= */

                mostrarPratos(
                    aplicarFiltros()
                );

            }
        );

    }
);


/* =====================================================
                    FECHAR MODAL
===================================================== */

fecharModal.addEventListener(
    "click",
    () => {

        fecharModalPrato();

    }
);


/* =====================================================
                FECHAR MODAL
                CLICANDO FORA
===================================================== */

modal.addEventListener(
    "click",
    evento => {

        if (
            evento.target === modal
        ) {

            fecharModalPrato();

        }

    }
);


/* =====================================================
                FECHAR COM ESC
===================================================== */

document.addEventListener(
    "keydown",
    evento => {

        if (
            evento.key === "Escape"
        ) {

            fecharModalPrato();

        }

    }
);


/* =====================================================
                    FECHAR MODAL
===================================================== */

function fecharModalPrato() {

    modal.classList.remove(
        "ativo"
    );

    modal.style.display =
        "none";

}


/* =====================================================
                    INICIAR
===================================================== */



/* =====================================================
   COMANDA DIGITAL — ADIÇÃO SEM SUBSTITUIR O CARDÁPIO
===================================================== */
(() => {
    const estadoComanda = { mesa: null, itens: [] };
    const dinheiro = valor => Number(valor || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    const cabecalhos = {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json'
    };
    const urlTabela = (tabela, query = '') => `${SUPABASE_URL}/rest/v1/${tabela}${query}`;
    const requisitar = async (url, opcoes = {}) => {
        const resposta = await fetch(url, { ...opcoes, headers: { ...cabecalhos, ...(opcoes.headers || {}) } });
        const corpo = await resposta.text();
        let dados = null;
        try { dados = corpo ? JSON.parse(corpo) : null; } catch (_) { dados = corpo; }
        if (!resposta.ok) throw new Error((dados && (dados.message || dados.details || dados.hint)) || `Erro HTTP ${resposta.status}`);
        return dados;
    };

    const painel = document.createElement('section');
    painel.id = 'painelComanda';
    painel.innerHTML = `
      <div class="comanda-cabecalho"><strong>🧾 Minha comanda</strong><button type="button" id="alternarComanda" aria-expanded="true">Ocultar</button></div>
      <div id="conteudoComanda">
        <label for="numeroMesaComanda">Número da mesa</label>
        <input id="numeroMesaComanda" type="number" min="1" step="1" placeholder="Ex.: 4" inputmode="numeric">
        <p class="comanda-ajuda">Informe sua mesa antes de enviar o pedido.</p>
        <div id="itensComanda"><p>Nenhum item adicionado.</p></div>
        <div class="comanda-total">Total: <strong id="totalComanda">R$ 0,00</strong></div>
        <button type="button" id="enviarComanda" class="comanda-enviar">Enviar pedido</button>
        <p id="mensagemComanda" role="status" aria-live="polite"></p>
      </div>`;
    document.body.appendChild(painel);

    const lista = painel.querySelector('#itensComanda');
    const total = painel.querySelector('#totalComanda');
    const mensagem = painel.querySelector('#mensagemComanda');
    const campoMesa = painel.querySelector('#numeroMesaComanda');

    painel.querySelector('#alternarComanda').addEventListener('click', e => {
        const conteudo = painel.querySelector('#conteudoComanda');
        const oculto = conteudo.hidden;
        conteudo.hidden = !oculto;
        e.currentTarget.textContent = oculto ? 'Ocultar' : 'Mostrar';
        e.currentTarget.setAttribute('aria-expanded', String(oculto));
    });

    function renderizarComanda() {
        lista.innerHTML = '';
        if (!estadoComanda.itens.length) lista.innerHTML = '<p>Nenhum item adicionado.</p>';
        estadoComanda.itens.forEach((item, indice) => {
            const linha = document.createElement('div');
            linha.className = 'comanda-item';
            const tamanho = item.tamanho ? ` (${item.tamanho})` : '';
            linha.innerHTML = `<div><strong></strong><small></small><div class="comanda-controles"><button type="button" data-acao="menos">−</button><span>${item.quantidade}</span><button type="button" data-acao="mais">+</button><button type="button" data-acao="remover">Remover</button></div></div><strong>${dinheiro(item.preco * item.quantidade)}</strong>`;
            linha.querySelector('strong').textContent = item.nome + tamanho;
            linha.querySelector('small').textContent = `${dinheiro(item.preco)} cada`;
            linha.querySelector('[data-acao="menos"]').addEventListener('click', () => { if (item.quantidade > 1) item.quantidade--; else estadoComanda.itens.splice(indice, 1); renderizarComanda(); });
            linha.querySelector('[data-acao="mais"]').addEventListener('click', () => { item.quantidade++; renderizarComanda(); });
            linha.querySelector('[data-acao="remover"]').addEventListener('click', () => { estadoComanda.itens.splice(indice, 1); renderizarComanda(); });
            lista.appendChild(linha);
        });
        total.textContent = dinheiro(estadoComanda.itens.reduce((s, i) => s + i.preco * i.quantidade, 0));
    }

    function adicionarPrato(prato) {
        let tamanho = null;
        let preco = Number(prato.preco || 0);
        const tamanhos = [
            ['Pequeno', prato.preco_pequeno], ['Médio', prato.preco_medio], ['Grande', prato.preco_grande]
        ].filter(([, p]) => p !== null && p !== undefined && p !== '');
        if (tamanhos.length) {
            const escolha = prompt(`Escolha o tamanho de ${prato.nome}:\n${tamanhos.map(([n,p],i) => `${i+1} - ${n}: ${dinheiro(p)}`).join('\n')}\nDigite o número da opção:`);
            if (escolha === null) return;
            const selecionado = tamanhos[Number(escolha) - 1];
            if (!selecionado) { alert('Opção de tamanho inválida.'); return; }
            tamanho = selecionado[0].toLowerCase(); preco = Number(selecionado[1]);
        }
        const qtdTexto = prompt(`Quantas unidades de ${prato.nome}?`, '1');
        if (qtdTexto === null) return;
        const quantidade = Number(qtdTexto);
        if (!Number.isInteger(quantidade) || quantidade < 1) { alert('Informe uma quantidade inteira maior que zero.'); return; }
        const existente = estadoComanda.itens.find(i => String(i.prato_id) === String(prato.id) && i.tamanho === tamanho && i.preco === preco);
        if (existente) existente.quantidade += quantidade;
        else estadoComanda.itens.push({ prato_id: prato.id, nome: prato.nome, tamanho, quantidade, preco });
        mensagem.textContent = `${prato.nome} adicionado à comanda.`;
        renderizarComanda();
        painel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    // O botão novo não interfere no clique original do card, que continua abrindo o modal.
    const observer = new MutationObserver(() => {
        document.querySelectorAll('#listaPratos .card').forEach(card => {
            if (card.querySelector('.adicionar-comanda')) return;
            const nomeEl = card.querySelector('.nome');
            const prato = pratos.find(p => p.nome === nomeEl?.textContent?.trim());
            if (!prato) return;
            const botao = document.createElement('button');
            botao.type = 'button'; botao.className = 'adicionar-comanda'; botao.textContent = 'Adicionar à comanda';
            botao.addEventListener('click', evento => { evento.preventDefault(); evento.stopPropagation(); adicionarPrato(prato); });
            (card.querySelector('.rodape') || card).appendChild(botao);
        });
    });
    observer.observe(listaPratos, { childList: true, subtree: true });

    async function obterOuCriarComanda(mesa) {
        const existentes = await requisitar(urlTabela('comanda', `?numero_mesa=eq.${mesa}&status=eq.aberta&select=id&limit=1`));
        if (existentes?.length) return existentes[0].id;
        try {
            const criadas = await requisitar(urlTabela('comanda'), { method: 'POST', headers: { Prefer: 'return=representation' }, body: JSON.stringify({ numero_mesa: mesa, status: 'aberta' }) });
            if (criadas?.[0]?.id) return criadas[0].id;
        } catch (erro) {
            // Pode ter ocorrido envio simultâneo para a mesma mesa; consulta novamente.
            const reconsulta = await requisitar(urlTabela('comanda', `?numero_mesa=eq.${mesa}&status=eq.aberta&select=id&limit=1`));
            if (reconsulta?.length) return reconsulta[0].id;
            throw erro;
        }
        throw new Error('Não foi possível abrir a comanda da mesa.');
    }

    painel.querySelector('#enviarComanda').addEventListener('click', async () => {
        mensagem.textContent = '';
        const mesa = Number(campoMesa.value);
        if (!Number.isInteger(mesa) || mesa < 1) { mensagem.textContent = 'Informe um número de mesa válido.'; return; }
        if (!estadoComanda.itens.length) { mensagem.textContent = 'Adicione pelo menos um prato antes de enviar.'; return; }
        const botao = painel.querySelector('#enviarComanda');
        botao.disabled = true; botao.textContent = 'Enviando...';
        try {
            const comandaId = await obterOuCriarComanda(mesa);
            const pedidos = await requisitar(urlTabela('pedido'), { method: 'POST', headers: { Prefer: 'return=representation' }, body: JSON.stringify({ comanda_id: comandaId, status: 'aguardando_confirmacao' }) });
            const pedidoId = pedidos?.[0]?.id;
            if (!pedidoId) throw new Error('O pedido foi criado, mas o Supabase não retornou o ID.');
            const itens = estadoComanda.itens.map(i => ({ pedido_id: pedidoId, prato_id: i.prato_id, tamanho: i.tamanho, quantidade: i.quantidade, preco_unitario: i.preco }));
            await requisitar(urlTabela('item_pedido'), { method: 'POST', body: JSON.stringify(itens), headers: { Prefer: 'return=minimal' } });
            estadoComanda.itens = []; renderizarComanda();
            mensagem.textContent = `Pedido #${pedidoId} enviado para a mesa ${mesa}, aguardando confirmação do garçom.`;
        } catch (erro) {
            mensagem.textContent = `Não foi possível enviar o pedido: ${erro.message}. Confira as políticas RLS de SELECT/INSERT das tabelas comanda, pedido e item_pedido.`;
        } finally {
            botao.disabled = false; botao.textContent = 'Enviar pedido';
        }
    });
})();


carregarPratos();
