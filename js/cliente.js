const API_URL = "http://localhost:8080/api/pratos";

const listaPratos = document.getElementById("listaPratos");
const template = document.getElementById("cardTemplate");

const modal = document.getElementById("modal");
const fecharModal = document.getElementById("fecharModal");

const modalImagem = document.getElementById("modalImagem");
const modalNome = document.getElementById("modalNome");
const modalDescricao = document.getElementById("modalDescricao");
const modalCategoria = document.getElementById("modalCategoria");
const modalPreco = document.getElementById("modalPreco");

const campoPesquisa = document.getElementById("pesquisa");

const botoesCategoria = document.querySelectorAll(
    ".categorias button"
);

let pratos = [];

let categoriaAtual = "Todos";


async function carregarPratos() {

    try {

        console.log("Buscando pratos em:", API_URL);

        const resposta = await fetch(API_URL);

        if (!resposta.ok) {

            throw new Error(
                "Erro HTTP: " + resposta.status
            );

        }

        pratos = await resposta.json();

        console.log(
            "Pratos recebidos:",
            pratos
        );

        aplicarFiltros();

    } catch (erro) {

        console.error(
            "Erro ao carregar pratos:",
            erro
        );

        listaPratos.innerHTML = `
            <p style="
                grid-column: 1 / -1;
                text-align: center;
                font-size: 20px;
                padding: 40px;
            ">
                Erro ao carregar os pratos.
            </p>
        `;

    }

}


function aplicarFiltros() {

    const pesquisa = campoPesquisa.value
        .toLowerCase()
        .trim();


    listaPratos.innerHTML = "";


    const pratosFiltrados = pratos.filter(
        prato => {

            const nome = (prato.nome || "")
                .toLowerCase();

            const descricao =
                (prato.descricao || "")
                .toLowerCase();


            const correspondePesquisa =

                nome.includes(pesquisa)

                ||

                descricao.includes(pesquisa);


            const correspondeCategoria =

                categoriaAtual === "Todos"

                ||

                prato.categoria === categoriaAtual;


            return (
                correspondePesquisa
                &&
                correspondeCategoria
            );

        }
    );


    if (pratosFiltrados.length === 0) {

        listaPratos.innerHTML = `
            <p style="
                grid-column: 1 / -1;
                text-align: center;
                font-size: 20px;
                padding: 40px;
            ">
                Nenhum prato encontrado.
            </p>
        `;

        return;

    }


    pratosFiltrados.forEach(
        prato => {

            criarCard(prato);

        }
    );

}


function criarCard(prato) {

    const clone =
        template.content.cloneNode(true);


    const imagem =
        clone.querySelector(".imagem img");

    const nome =
        clone.querySelector(".nome");

    const descricao =
        clone.querySelector(".descricao");

    const categoria =
        clone.querySelector(".categoria");

    const preco =
        clone.querySelector(".preco");


    if (
        prato.imagem &&
        prato.imagem.trim() !== ""
    ) {

        imagem.src = prato.imagem;

    } else {

        imagem.src =
            "imagens/sem-imagem.png";

    }


    imagem.onerror = function () {

        this.src =
            "imagens/sem-imagem.png";

    };


    nome.textContent =
        prato.nome || "Sem nome";


    descricao.textContent =
        prato.descricao || "Sem descrição";


    categoria.textContent =
        prato.categoria || "Sem categoria";


    preco.textContent =
        "R$ " +
        Number(prato.preco || 0)
            .toFixed(2)
            .replace(".", ",");


    const card =
        clone.querySelector(".card");


    card.addEventListener(
        "click",
        function () {

            abrirModal(prato);

        }
    );


    listaPratos.appendChild(clone);

}


function abrirModal(prato) {

    modalImagem.src =
        prato.imagem ||
        "imagens/sem-imagem.png";


    modalImagem.onerror = function () {

        this.src =
            "imagens/sem-imagem.png";

    };


    modalNome.textContent =
        prato.nome || "Sem nome";


    modalDescricao.textContent =
        prato.descricao ||
        "Sem descrição";


    modalCategoria.textContent =
        prato.categoria ||
        "Sem categoria";


    modalPreco.textContent =
        "R$ " +
        Number(prato.preco || 0)
            .toFixed(2)
            .replace(".", ",");


    modal.style.display = "flex";

}


fecharModal.addEventListener(
    "click",
    function () {

        modal.style.display = "none";

    }
);


window.addEventListener(
    "click",
    function (evento) {

        if (evento.target === modal) {

            modal.style.display = "none";

        }

    }
);


campoPesquisa.addEventListener(
    "input",
    function () {

        aplicarFiltros();

    }
);


botoesCategoria.forEach(
    botao => {

        botao.addEventListener(
            "click",
            function () {

                botoesCategoria.forEach(
                    outroBotao => {

                        outroBotao.classList.remove(
                            "ativa"
                        );

                    }
                );


                botao.classList.add(
                    "ativa"
                );


                categoriaAtual =
                    botao.dataset.categoria;


                aplicarFiltros();

            }
        );

    }
);


carregarPratos();