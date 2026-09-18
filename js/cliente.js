const SUPABASE_URL =
    "https://fmwmgoxjmcvsmfbcpfsj.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_ZJR2Z6gOfNO5rFhZb-RWwg_qvyY2b9Y";


// =========================================
// ELEMENTOS DA PÁGINA
// =========================================

const listaPratos =
    document.getElementById("listaPratos");

const template =
    document.getElementById("cardTemplate");

const pesquisa =
    document.getElementById("pesquisa");

const botoesCategoria =
    document.querySelectorAll(".categoria");


// =========================================
// ELEMENTOS DO MODAL
// =========================================

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

const modalCategoria =
    document.getElementById("modalCategoria");

const modalPreco =
    document.getElementById("modalPreco");

const modalAlergias =
    document.getElementById("modalAlergias");


// =========================================
// VARIÁVEL DOS PRATOS
// =========================================

let pratos = [];


// =========================================
// FORMATAR PREÇO
// =========================================

function formatarPreco(valor) {

    if (
        valor === null ||
        valor === undefined ||
        valor === ""
    ) {

        return null;

    }


    const numero =
        Number(valor);


    if (isNaN(numero)) {

        return null;

    }


    return `R$ ${numero
        .toFixed(2)
        .replace(".", ",")}`;

}


// =========================================
// BUSCAR PRATOS E ALERGIAS NO SUPABASE
// =========================================

async function carregarPratos() {

    try {

        console.log(
            "Buscando pratos e alergias no Supabase..."
        );


        // =========================================
        // BUSCAR PRATOS
        // =========================================

        const respostaPratos =
            await fetch(
                `${SUPABASE_URL}/rest/v1/prato?select=*`,
                {
                    method: "GET",

                    headers: {
                        "apikey": SUPABASE_KEY,

                        "Authorization":
                            `Bearer ${SUPABASE_KEY}`
                    }
                }
            );


        if (!respostaPratos.ok) {

            const erro =
                await respostaPratos.text();

            throw new Error(
                `Erro ao buscar pratos: ${respostaPratos.status}: ${erro}`
            );

        }


        pratos =
            await respostaPratos.json();


        console.log(
            "Pratos recebidos:",
            pratos
        );


        // =========================================
        // BUSCAR RELAÇÕES PRATO -> ALERGIA
        // =========================================

        let relacoes = [];

        try {

            const respostaRelacoes =
                await fetch(
                    `${SUPABASE_URL}/rest/v1/prato_alergia?select=prato_id,alergia_id`,
                    {
                        method: "GET",

                        headers: {
                            "apikey": SUPABASE_KEY,

                            "Authorization":
                                `Bearer ${SUPABASE_KEY}`
                        }
                    }
                );


            if (respostaRelacoes.ok) {

                relacoes =
                    await respostaRelacoes.json();

            }
            else {

                console.warn(
                    "Não foi possível carregar as relações prato_alergia."
                );

            }

        }
        catch (erro) {

            console.warn(
                "Erro ao buscar prato_alergia:",
                erro
            );

        }


        // =========================================
        // BUSCAR ALERGIAS
        // =========================================

        let alergias = [];

        try {

            const respostaAlergias =
                await fetch(
                    `${SUPABASE_URL}/rest/v1/alergia?select=*`,
                    {
                        method: "GET",

                        headers: {
                            "apikey": SUPABASE_KEY,

                            "Authorization":
                                `Bearer ${SUPABASE_KEY}`
                        }
                    }
                );


            if (respostaAlergias.ok) {

                alergias =
                    await respostaAlergias.json();

            }
            else {

                console.warn(
                    "Não foi possível carregar as alergias."
                );

            }

        }
        catch (erro) {

            console.warn(
                "Erro ao buscar alergias:",
                erro
            );

        }


        // =========================================
        // MONTAR RELAÇÃO DAS ALERGIAS
        // =========================================

        pratos =
            pratos.map(prato => {

                const relacoesDoPrato =
                    relacoes.filter(
                        relacao =>
                            Number(relacao.prato_id) ===
                            Number(prato.id)
                    );


                const alergiasDoPrato =
                    relacoesDoPrato
                        .map(relacao => {

                            return alergias.find(
                                alergia =>
                                    Number(alergia.id) ===
                                    Number(relacao.alergia_id)
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
            "Pratos com alergias:",
            pratos
        );


        mostrarPratos(pratos);

    }


    catch (erro) {

        console.error(
            "ERRO AO BUSCAR PRATOS:",
            erro
        );


        listaPratos.innerHTML = `

            <p class="erro">

                Não foi possível carregar os pratos.

            </p>

        `;

    }

}


// =========================================
// MOSTRAR PRATOS
// =========================================

function mostrarPratos(lista) {

    listaPratos.innerHTML = "";


    if (lista.length === 0) {

        listaPratos.innerHTML = `

            <p>

                Nenhum prato cadastrado.

            </p>

        `;

        return;

    }


    lista.forEach(prato => {

        const card =
            template.content.cloneNode(true);


        const elementoCard =
            card.querySelector(".card");


        const imagem =
            card.querySelector(".imagem img");


        const nome =
            card.querySelector(".nome");


        const descricao =
            card.querySelector(".descricao");


        const categoria =
            card.querySelector(".categoria");


        const preco =
            card.querySelector(".preco");


        const rodape =
            card.querySelector(".rodape");


        const quantidadeElemento =
            card.querySelector(".quantidade");


        const alergiasElemento =
            card.querySelector(".alergias");


        // =========================================
        // IMAGEM
        // =========================================

        imagem.src =
            prato.imagem ||
            "imagens/sem-imagem.png";


        imagem.alt =
            prato.nome ||
            "Prato";


        // =========================================
        // NOME
        // =========================================

        nome.textContent =
            prato.nome ||
            "Sem nome";


        // =========================================
        // DESCRIÇÃO
        // =========================================

        descricao.textContent =
            prato.descricao ||
            "Sem descrição";


        // =========================================
        // CATEGORIA
        // =========================================

        categoria.textContent =
            prato.categoria ||
            "";


        // =========================================
        // PREÇO NORMAL
        // =========================================

        const precoFormatado =
            formatarPreco(prato.preco);


        if (precoFormatado !== null) {

            preco.textContent =
                precoFormatado;

        }
        else {

            preco.textContent = "";

        }


        // =========================================
        // QUANTIDADE
        // =========================================

        if (
            prato.quantidade !== null &&
            prato.quantidade !== undefined &&
            prato.quantidade !== ""
        ) {

            quantidadeElemento.textContent =
                `Quantidade: ${prato.quantidade}`;

        }
        else {

            quantidadeElemento.textContent = "";

        }


        // =========================================
        // PREÇOS POR TAMANHO
        // =========================================

        const tamanhos = [];


        const precoPequeno =
            formatarPreco(
                prato.preco_pequeno
            );


        const precoMedio =
            formatarPreco(
                prato.preco_medio
            );


        const precoGrande =
            formatarPreco(
                prato.preco_grande
            );


        if (precoPequeno !== null) {

            tamanhos.push({

                tamanho: "Pequeno",

                preco:
                    precoPequeno

            });

        }


        if (precoMedio !== null) {

            tamanhos.push({

                tamanho: "Médio",

                preco:
                    precoMedio

            });

        }


        if (precoGrande !== null) {

            tamanhos.push({

                tamanho: "Grande",

                preco:
                    precoGrande

            });

        }


        // =========================================
        // MOSTRAR PREÇOS POR TAMANHO NO CARD
        // =========================================

        const containerTamanhos =
            card.querySelector(".precos-tamanho");


        if (tamanhos.length > 0) {

            containerTamanhos.innerHTML = "";


            tamanhos.forEach(item => {

                const tamanho =
                    document.createElement("span");


                tamanho.className =
                    "preco-tamanho";


                tamanho.textContent =
                    `${item.tamanho}: ${item.preco}`;


                containerTamanhos.appendChild(
                    tamanho
                );

            });

        }
        else {

            containerTamanhos.style.display =
                "none";

        }


        // =========================================
        // ALERGIAS NO CARD
        // =========================================

        if (
            prato.alergias &&
            prato.alergias.length > 0
        ) {

            alergiasElemento.innerHTML = "";


            const titulo =
                document.createElement("strong");


            titulo.textContent =
                "⚠️ Alergias:";


            alergiasElemento.appendChild(
                titulo
            );


            const listaAlergias =
                document.createElement("div");


            listaAlergias.className =
                "alergias-lista";


            prato.alergias.forEach(alergia => {

                const item =
                    document.createElement("div");


                item.className =
                    "alergia-item";


                const imagemAlergia =
                    document.createElement("img");


                imagemAlergia.src =
                    alergia.imagem ||
                    "https://via.placeholder.com/60?text=Alergia";


                imagemAlergia.alt =
                    alergia.nome ||
                    "Alergia";


                const nomeAlergia =
                    document.createElement("span");


                nomeAlergia.textContent =
                    alergia.nome ||
                    "Sem nome";


                item.appendChild(
                    imagemAlergia
                );


                item.appendChild(
                    nomeAlergia
                );


                listaAlergias.appendChild(
                    item
                );

            });


            alergiasElemento.appendChild(
                listaAlergias
            );

        }
        else {

            alergiasElemento.innerHTML = "";

        }


        // =========================================
        // ABRIR MODAL
        // =========================================

        elementoCard.addEventListener(
            "click",

            () => {

                // =========================================
                // IMAGEM
                // =========================================

                modalImagem.src =
                    prato.imagem ||
                    "imagens/sem-imagem.png";


                // =========================================
                // NOME
                // =========================================

                modalNome.textContent =
                    prato.nome ||
                    "";


                // =========================================
                // DESCRIÇÃO
                // =========================================

                modalDescricao.textContent =
                    prato.descricao ||
                    "";


                // =========================================
                // CATEGORIA
                // =========================================

                modalCategoria.textContent =
                    prato.categoria ||
                    "";


                // =========================================
                // LIMPAR PREÇO
                // =========================================

                modalPreco.innerHTML =
                    "";


                // =========================================
                // PREÇO NORMAL NO MODAL
                // =========================================

                if (
                    precoFormatado !== null
                ) {

                    const precoNormal =
                        document.createElement("span");


                    precoNormal.className =
                        "modal-preco-normal";


                    precoNormal.textContent =
                        precoFormatado;


                    modalPreco.appendChild(
                        precoNormal
                    );

                }


                // =========================================
                // QUANTIDADE NO MODAL
                // =========================================

                const modalQuantidade =
                    document.getElementById(
                        "modalQuantidade"
                    );


                modalQuantidade.innerHTML =
                    "";


                if (
                    prato.quantidade !== null &&
                    prato.quantidade !== undefined &&
                    prato.quantidade !== ""
                ) {

                    const quantidadeModal =
                        document.createElement("span");


                    quantidadeModal.className =
                        "modal-quantidade";


                    quantidadeModal.textContent =
                        `Quantidade: ${prato.quantidade}`;


                    modalQuantidade.appendChild(
                        quantidadeModal
                    );

                }


                // =========================================
                // PREÇOS POR TAMANHO NO MODAL
                // =========================================

                const modalPrecosTamanho =
                    document.getElementById(
                        "modalPrecosTamanho"
                    );


                modalPrecosTamanho.innerHTML =
                    "";


                if (
                    tamanhos.length > 0
                ) {

                    tamanhos.forEach(item => {

                        const tamanho =
                            document.createElement("span");


                        tamanho.className =
                            "modal-preco-tamanho";


                        tamanho.textContent =
                            `${item.tamanho}: ${item.preco}`;


                        modalPrecosTamanho.appendChild(
                            tamanho
                        );

                    });

                }


                // =========================================
                // ALERGIAS NO MODAL
                // =========================================

                modalAlergias.innerHTML =
                    "";


                if (
                    prato.alergias &&
                    prato.alergias.length > 0
                ) {

                    const titulo =
                        document.createElement("strong");


                    titulo.textContent =
                        "⚠️ Alergias deste prato";


                    modalAlergias.appendChild(
                        titulo
                    );


                    const listaAlergiasModal =
                        document.createElement("div");


                    listaAlergiasModal.className =
                        "modal-alergias-lista";


                    prato.alergias.forEach(alergia => {

                        const item =
                            document.createElement("div");


                        item.className =
                            "modal-alergia-item";


                        const imagemAlergia =
                            document.createElement("img");


                        imagemAlergia.src =
                            alergia.imagem ||
                            "https://via.placeholder.com/60?text=Alergia";


                        imagemAlergia.alt =
                            alergia.nome ||
                            "Alergia";


                        const nomeAlergia =
                            document.createElement("span");


                        nomeAlergia.textContent =
                            alergia.nome ||
                            "Sem nome";


                        item.appendChild(
                            imagemAlergia
                        );


                        item.appendChild(
                            nomeAlergia
                        );


                        listaAlergiasModal.appendChild(
                            item
                        );

                    });


                    modalAlergias.appendChild(
                        listaAlergiasModal
                    );

                }


                // =========================================
                // MOSTRAR MODAL
                // =========================================

                modal.style.display =
                    "flex";

            }

        );


        // =========================================
        // ADICIONAR CARD À LISTA
        // =========================================

        listaPratos.appendChild(
            card
        );

    });

}


// =========================================
// PESQUISA
// =========================================

pesquisa.addEventListener(
    "input",

    () => {

        const texto =
            pesquisa.value
                .toLowerCase()
                .trim();


        const resultado =
            pratos.filter(prato => {

                const nome =
                    (
                        prato.nome ||
                        ""
                    )
                        .toLowerCase();


                const descricao =
                    (
                        prato.descricao ||
                        ""
                    )
                        .toLowerCase();


                const categoria =
                    (
                        prato.categoria ||
                        ""
                    )
                        .toLowerCase();


                return (

                    nome.includes(texto) ||

                    descricao.includes(texto) ||

                    categoria.includes(texto)

                );

            });


        mostrarPratos(
            resultado
        );

    }

);


// =========================================
// FILTRO POR CATEGORIA
// =========================================

botoesCategoria.forEach(botao => {

    botao.addEventListener(
        "click",

        () => {

            botoesCategoria.forEach(b =>
                b.classList.remove("ativa")
            );


            botao.classList.add(
                "ativa"
            );


            const categoriaSelecionada =
                botao.dataset.categoria;


            if (
                categoriaSelecionada ===
                "Todos"
            ) {

                mostrarPratos(
                    pratos
                );

                return;

            }


            const resultado =
                pratos.filter(prato => {

                    return (

                        prato.categoria ===
                        categoriaSelecionada

                    );

                });


            mostrarPratos(
                resultado
            );

        }

    );

});


// =========================================
// FECHAR MODAL
// =========================================

fecharModal.addEventListener(
    "click",

    () => {

        modal.style.display =
            "none";

    }

);


// =========================================
// FECHAR CLICANDO FORA DO MODAL
// =========================================

modal.addEventListener(
    "click",

    evento => {

        if (
            evento.target === modal
        ) {

            modal.style.display =
                "none";

        }

    }

);


// =========================================
// INICIAR
// =========================================

carregarPratos();
