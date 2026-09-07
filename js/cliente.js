const SUPABASE_URL = "https://fmwmgoxjmcvsmfbcpfsj.supabase.co";
const SUPABASE_KEY = "sb_publishable_ZJR2Z6gOfNO5rFhZb-RWwg_qvyY2b9Y";

const listaPratos = document.getElementById("listaPratos");
const template = document.getElementById("cardTemplate");

const pesquisa = document.getElementById("pesquisa");
const botoesCategoria = document.querySelectorAll(".categoria");

const modal = document.getElementById("modal");
const fecharModal = document.getElementById("fecharModal");

const modalImagem = document.getElementById("modalImagem");
const modalNome = document.getElementById("modalNome");
const modalDescricao = document.getElementById("modalDescricao");
const modalCategoria = document.getElementById("modalCategoria");
const modalPreco = document.getElementById("modalPreco");

let pratos = [];


/* =========================================
   FORMATAR PREÇO
========================================= */

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


/* =========================================
   BUSCAR PRATOS NO SUPABASE
========================================= */

async function carregarPratos() {

    try {

        console.log("Buscando pratos no Supabase...");

        const resposta = await fetch(
            `${SUPABASE_URL}/rest/v1/prato?select=*`,
            {
                method: "GET",

                headers: {
                    "apikey": SUPABASE_KEY,
                    "Authorization": `Bearer ${SUPABASE_KEY}`
                }
            }
        );

        if (!resposta.ok) {

            const erro = await resposta.text();

            throw new Error(
                `Erro ${resposta.status}: ${erro}`
            );

        }


        pratos =
            await resposta.json();


        console.log(
            "Pratos recebidos:",
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


/* =========================================
   MOSTRAR PRATOS
========================================= */

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


        /* =====================================
           IMAGEM
        ===================================== */

        imagem.src =
            prato.imagem ||
            "imagens/sem-imagem.png";


        imagem.alt =
            prato.nome ||
            "Prato";


        /* =====================================
           NOME
        ===================================== */

        nome.textContent =
            prato.nome ||
            "Sem nome";


        /* =====================================
           DESCRIÇÃO
        ===================================== */

        descricao.textContent =
            prato.descricao ||
            "Sem descrição";


        /* =====================================
           CATEGORIA
        ===================================== */

        categoria.textContent =
            prato.categoria ||
            "";


        /* =====================================
           PREÇO NORMAL
        ===================================== */

        const precoFormatado =
            formatarPreco(prato.preco);


        if (precoFormatado !== null) {

            preco.textContent =
                precoFormatado;

        }

        else {

            preco.textContent = "";

        }


        /* =====================================
           QUANTIDADE
        ===================================== */

        if (
            prato.quantidade !== null &&
            prato.quantidade !== undefined
        ) {

            const quantidade =
                document.createElement("span");


            quantidade.className =
                "quantidade";


            quantidade.textContent =
                `Quantidade: ${prato.quantidade}`;


            rodape.appendChild(
                quantidade
            );

        }


        /* =====================================
           PREÇOS POR TAMANHO
        ===================================== */

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


        /* =====================================
           MOSTRAR PREÇOS POR TAMANHO NO CARD
        ===================================== */

        if (tamanhos.length > 0) {

            const containerTamanhos =
                document.createElement("div");


            containerTamanhos.className =
                "precos-tamanho";


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


            rodape.appendChild(
                containerTamanhos
            );

        }


        /* =====================================
           ABRIR MODAL
        ===================================== */

        elementoCard.addEventListener(
            "click",

            () => {

                modalImagem.src =
                    prato.imagem ||
                    "imagens/sem-imagem.png";


                modalNome.textContent =
                    prato.nome ||
                    "";


                modalDescricao.textContent =
                    prato.descricao ||
                    "";


                modalCategoria.textContent =
                    prato.categoria ||
                    "";


                /* =====================================
                   LIMPAR INFORMAÇÕES ANTIGAS DO MODAL
                ===================================== */

                modalPreco.innerHTML =
                    "";


                /* =====================================
                   PREÇO NORMAL NO MODAL
                ===================================== */

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


                /* =====================================
                   QUANTIDADE NO MODAL
                ===================================== */

                if (

                    prato.quantidade !== null &&

                    prato.quantidade !== undefined

                ) {

                    const quantidadeModal =
                        document.createElement("span");


                    quantidadeModal.className =
                        "modal-quantidade";


                    quantidadeModal.textContent =
                        `Quantidade: ${prato.quantidade}`;


                    modalPreco.appendChild(
                        quantidadeModal
                    );

                }


                /* =====================================
                   PREÇOS POR TAMANHO NO MODAL
                ===================================== */

                if (
                    tamanhos.length > 0
                ) {

                    const tamanhosModal =
                        document.createElement("div");


                    tamanhosModal.className =
                        "modal-precos-tamanho";


                    tamanhos.forEach(item => {

                        const tamanho =
                            document.createElement("span");


                        tamanho.className =
                            "modal-preco-tamanho";


                        tamanho.textContent =
                            `${item.tamanho}: ${item.preco}`;


                        tamanhosModal.appendChild(
                            tamanho
                        );

                    });


                    modalPreco.appendChild(
                        tamanhosModal
                    );

                }


                modal.style.display =
                    "flex";

            }

        );


        listaPratos.appendChild(card);

    });

}


/* =========================================
   PESQUISA
========================================= */

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


                return (

                    nome.includes(texto) ||

                    descricao.includes(texto)

                );

            });


        mostrarPratos(resultado);

    }

);


/* =========================================
   FILTRO POR CATEGORIA
========================================= */

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

                mostrarPratos(pratos);

                return;

            }


            const resultado =
                pratos.filter(prato => {

                    return (

                        prato.categoria ===
                        categoriaSelecionada

                    );

                });


            mostrarPratos(resultado);

        }

    );

});


/* =========================================
   FECHAR MODAL
========================================= */

fecharModal.addEventListener(
    "click",

    () => {

        modal.style.display =
            "none";

    }

);


/* =========================================
   FECHAR CLICANDO FORA
========================================= */

modal.addEventListener(
    "click",

    (evento) => {

        if (
            evento.target === modal
        ) {

            modal.style.display =
                "none";

        }

    }

);


/* =========================================
   INICIAR
========================================= */

carregarPratos();
