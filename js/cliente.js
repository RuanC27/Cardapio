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

carregarPratos();
