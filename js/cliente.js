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
   BUSCAR PRATOS NO SUPABASE
========================================= */

async function carregarPratos() {

    try {

        console.log("Buscando pratos no Supabase...");

        const resposta = await fetch(
            `${SUPABASE_URL}/rest/v1/pratos?select=*`,
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

        pratos = await resposta.json();

        console.log("Pratos recebidos:", pratos);

        mostrarPratos(pratos);

    } catch (erro) {

        console.error("ERRO AO BUSCAR PRATOS:", erro);

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
            <p>Nenhum prato cadastrado.</p>
        `;

        return;
    }

    lista.forEach(prato => {

        const card = template.content.cloneNode(true);

        const elementoCard = card.querySelector(".card");

        const imagem = card.querySelector(".imagem img");
        const nome = card.querySelector(".nome");
        const descricao = card.querySelector(".descricao");
        const categoria = card.querySelector(".categoria");
        const preco = card.querySelector(".preco");


        /* IMAGEM */

        imagem.src = prato.imagem || "imagens/sem-imagem.png";

        imagem.alt = prato.nome || "Prato";


        /* NOME */

        nome.textContent = prato.nome || "Sem nome";


        /* DESCRIÇÃO */

        descricao.textContent =
            prato.descricao || "Sem descrição";


        /* CATEGORIA */

        categoria.textContent =
            prato.categoria || "";


        /* PREÇO */

        const valor = Number(prato.preco);

        if (!isNaN(valor)) {

            preco.textContent =
                `R$ ${valor.toFixed(2).replace(".", ",")}`;

        } else {

            preco.textContent = "R$ 0,00";
        }


        /* =====================================
           ABRIR MODAL
        ===================================== */

        elementoCard.addEventListener("click", () => {

            modalImagem.src =
                prato.imagem || "imagens/sem-imagem.png";

            modalNome.textContent =
                prato.nome || "";

            modalDescricao.textContent =
                prato.descricao || "";

            modalCategoria.textContent =
                prato.categoria || "";

            if (!isNaN(valor)) {

                modalPreco.textContent =
                    `R$ ${valor.toFixed(2).replace(".", ",")}`;

            } else {

                modalPreco.textContent = "R$ 0,00";
            }

            modal.style.display = "flex";

        });


        listaPratos.appendChild(card);

    });

}


/* =========================================
   PESQUISA
========================================= */

pesquisa.addEventListener("input", () => {

    const texto =
        pesquisa.value.toLowerCase().trim();

    const resultado = pratos.filter(prato => {

        const nome =
            (prato.nome || "").toLowerCase();

        const descricao =
            (prato.descricao || "").toLowerCase();

        return (
            nome.includes(texto) ||
            descricao.includes(texto)
        );

    });

    mostrarPratos(resultado);

});


/* =========================================
   FILTRO POR CATEGORIA
========================================= */

botoesCategoria.forEach(botao => {

    botao.addEventListener("click", () => {

        botoesCategoria.forEach(b =>
            b.classList.remove("ativa")
        );

        botao.classList.add("ativa");

        const categoriaSelecionada =
            botao.dataset.categoria;


        if (categoriaSelecionada === "Todos") {

            mostrarPratos(pratos);

            return;
        }


        const resultado = pratos.filter(prato => {

            return prato.categoria === categoriaSelecionada;

        });

        mostrarPratos(resultado);

    });

});


/* =========================================
   FECHAR MODAL
========================================= */

fecharModal.addEventListener("click", () => {

    modal.style.display = "none";

});


/* =========================================
   FECHAR CLICANDO FORA
========================================= */

modal.addEventListener("click", (evento) => {

    if (evento.target === modal) {

        modal.style.display = "none";

    }

});


/* =========================================
   INICIAR
========================================= */

carregarPratos();
    }
);


carregarPratos();
