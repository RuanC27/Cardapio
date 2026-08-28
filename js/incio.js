/* =========================================
            PÁGINA INICIAL
========================================= */


/* =========================================
        BOTÃO VER CARDÁPIO
========================================= */

const botaoCliente = document.getElementById(
    "acessarCliente"
);


botaoCliente.addEventListener(
    "click",
    () => {

        window.location.href = "index.html";

    }
);


/* =========================================
        BOTÃO ÁREA DO GASTRÔNOMO
========================================= */

const botaoAdmin = document.getElementById(
    "acessarAdmin"
);


botaoAdmin.addEventListener(
    "click",
    () => {

        window.location.href = "Admin.html";

    }
);