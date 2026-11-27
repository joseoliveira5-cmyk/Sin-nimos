/* ======================================================
CONFIGURAÇÕES
====================================================== */

window.API_URL = window.API_URL ||
    "https://6b06520e57fa1297bb55a04a.mockapi.io/api/v1";

const API_URL = window.API_URL;

const usuarioAtual = {
    id: 1,
    tipo: "visitante",
    autorizado: true
};

let artistas = [];


/* ======================================================
FUNÇÕES AUXILIARES
====================================================== */

function ObterElemento(id) {
    return document.getElementById(id);
}

function NormalizarTexto(texto) {
    return String(texto || "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim()
        .toLowerCase();
}

function ExibirMensagem(id, mensagem) {
    const elemento = ObterElemento(id);

    if (elemento) {
        elemento.textContent = mensagem;
    }
}


/* ======================================================
COMUNICAÇÃO COM A MOCKAPI
====================================================== */

// CONSULTAR
async function ConsultarAPI(recurso) {
    const resposta = await fetch(`${API_URL}/${recurso}`);

    if (!resposta.ok) {
        throw new Error("Erro ao consultar a API.");
    }

    return await resposta.json();
}


// CADASTRAR
async function CadastrarAPI(recurso, dados) {

    const url = `${API_URL}/${recurso}`;

    console.log("Enviando cadastro para:", url);
    console.log("Dados enviados:", dados);

    const resposta = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
        },
        body: JSON.stringify(dados)
    });

    const respostaTexto = await resposta.text();

    let resultado;

    try {
        resultado = respostaTexto
            ? JSON.parse(respostaTexto)
            : null;
    } catch {
        resultado = respostaTexto;
    }

    console.log("Status HTTP:", resposta.status);
    console.log("Resposta do MockAPI:", resultado);

    if (!resposta.ok) {
        throw new Error(
            `Erro HTTP ${resposta.status}: ${
                typeof resultado === "string"
                    ? resultado
                    : JSON.stringify(resultado)
            }`
        );
    }

    if (!resultado || !resultado.id) {
        throw new Error(
            "O MockAPI não confirmou a criação do artista."
        );
    }

    return resultado;
}


// ATUALIZAR
async function AtualizarAPI(recurso, id, dados) {
    const resposta = await fetch(`${API_URL}/${recurso}/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(dados)
    });

    if (!resposta.ok) {
        throw new Error("Erro ao atualizar os dados.");
    }

    return await resposta.json();
}


// REMOVER
async function RemoverAPI(recurso, id) {
    const resposta = await fetch(`${API_URL}/${recurso}/${id}`, {
        method: "DELETE"
    });

    if (!resposta.ok) {
        throw new Error("Erro ao remover os dados.");
    }

    return true;
}


/* ======================================================
CARREGAR ARTISTAS
====================================================== */

async function CarregarArtistas() {
    try {
        artistas = await ConsultarAPI("artistas");

        AtualizarListaAdministrativa();

        return artistas;

    } catch (erro) {
        console.error("Erro ao carregar artistas:", erro);

        ExibirMensagem(
            "erroCadastro",
            "Não foi possível carregar os artistas."
        );

        return [];
    }
}


/* ======================================================
CADASTRAR ARTISTA
====================================================== */

async function CadastrarArtista(event) {

    event.preventDefault();

    ExibirMensagem("erroCadastro", "");
    ExibirMensagem("sucessoCadastro", "");

    const nome = ObterElemento("nomeArtista")?.value.trim();
    const cidade = ObterElemento("cidadeArtista")?.value;
    const estado = ObterElemento("estadoArtista")?.value;
    const genero = ObterElemento("generoArtista")?.value;

    if (!nome || !cidade || !estado || !genero) {

        ExibirMensagem(
            "erroCadastro",
            "Preencha todos os campos obrigatórios."
        );

        return;
    }

    const dadosArtista = {
        nome: nome,
        cidade: cidade,
        estado: estado,
        genero: genero,
        usuarioId: 1,
        status: "Pendente de revisão",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };

    try {

        const artistaCriado = await CadastrarAPI(
            "artistas",
            dadosArtista
        );

        console.log(
            "ARTISTA CADASTRADO COM SUCESSO:",
            artistaCriado
        );

        ExibirMensagem(
            "sucessoCadastro",
            `Artista ${artistaCriado.nome} cadastrado com sucesso!`
        );

        ObterElemento("formCadastro").reset();

        await CarregarArtistas();

    } catch (erro) {

        console.error("ERRO AO CADASTRAR ARTISTA:", erro);

        ExibirMensagem(
            "erroCadastro",
            erro.message || "Não foi possível cadastrar o artista."
        );
    }
}

/* ======================================================
LISTA ADMINISTRATIVA
====================================================== */

function AtualizarListaAdministrativa() {
    const lista = ObterElemento("listaAdministrativa");

    if (!lista) return;

    lista.innerHTML = "";

    if (!artistas.length) {
        lista.innerHTML = "<p>Nenhum artista cadastrado.</p>";
        return;
    }

    artistas.forEach(artista => {
        const item = document.createElement("div");
        item.className = "itemAdministrativo";

        const informacoes = document.createElement("div");

        // NOME CLICÁVEL
        const nome = document.createElement("h3");
        const linkPerfil = document.createElement("a");

        linkPerfil.href =
            `perfil.html?id=${encodeURIComponent(artista.id)}`;

        linkPerfil.textContent =
            artista.nome || "Nome não informado";

        nome.appendChild(linkPerfil);

        const localizacao = document.createElement("p");
        localizacao.textContent =
            `${artista.cidade || "Cidade não informada"} - ${artista.estado || ""}`;

        const genero = document.createElement("p");
        genero.textContent =
            `Gênero: ${artista.genero || "Não informado"}`;

        const status = document.createElement("p");
        status.textContent =
            `Status: ${artista.status || "Não informado"}`;

        informacoes.append(nome, localizacao, genero, status);

        const botoes = document.createElement("div");

        const botaoEditar = document.createElement("button");
        botaoEditar.type = "button";
        botaoEditar.textContent = "Editar";

        botaoEditar.addEventListener("click", () => {
            PrepararEdicao(artista.id);
        });

        const botaoRemover = document.createElement("button");
        botaoRemover.type = "button";
        botaoRemover.textContent = "Remover";

        botaoRemover.addEventListener("click", () => {
            RemoverArtista(artista.id);
        });

        botoes.append(botaoEditar, botaoRemover);

        item.append(informacoes, botoes);

        lista.appendChild(item);
    });
}

/* ======================================================
PREPARAR EDIÇÃO
====================================================== */

function PrepararEdicao(idArtista) {
    const artista = artistas.find(
        item => String(item.id) === String(idArtista)
    );

    if (!artista) {
        alert("Artista não encontrado.");
        return;
    }

    const campoNome = ObterElemento("editarNome");
    const campoCidade = ObterElemento("editarCidade");
    const campoEstado = ObterElemento("editarEstado");
    const campoGenero = ObterElemento("editarGenero");

    if (!campoNome || !campoCidade || !campoEstado || !campoGenero) {
        alert("Os campos de edição não foram encontrados no HTML.");
        return;
    }

    campoNome.value = artista.nome || "";
    campoCidade.value = artista.cidade || "";
    campoEstado.value = artista.estado || "";
    campoGenero.value = artista.genero || "";

    // Guarda o ID do artista selecionado para edição.
    window.idArtistaEmEdicao = artista.id;

    ExibirMensagem("erroEdicao", "");
    ExibirMensagem("sucessoEdicao", "");

    ObterElemento("formEdicao")?.scrollIntoView({
        behavior: "smooth"
    });
}


/* ======================================================
EDITAR ARTISTA
====================================================== */

async function EditarArtista(event) {
    event.preventDefault();

    ExibirMensagem("erroEdicao", "");
    ExibirMensagem("sucessoEdicao", "");

    const id = window.idArtistaEmEdicao;

    if (!id) {
        ExibirMensagem(
            "erroEdicao",
            "Selecione um artista antes de editar."
        );
        return;
    }

    const nome = ObterElemento("editarNome")?.value.trim();
    const cidade = ObterElemento("editarCidade")?.value;
    const estado = ObterElemento("editarEstado")?.value;
    const genero = ObterElemento("editarGenero")?.value;

    if (!nome || !cidade || !estado || !genero) {
        ExibirMensagem(
            "erroEdicao",
            "Preencha todos os campos obrigatórios."
        );
        return;
    }

    const dadosAtualizados = {
        nome,
        cidade,
        estado,
        genero,
        updatedAt: new Date().toISOString()
    };

    try {
        await AtualizarAPI(
            "artistas",
            id,
            dadosAtualizados
        );

        ExibirMensagem(
            "sucessoEdicao",
            "Artista atualizado com sucesso!"
        );

        window.idArtistaEmEdicao = null;

        ObterElemento("formEdicao").reset();

        await CarregarArtistas();

    } catch (erro) {
        console.error("Erro ao editar artista:", erro);

        ExibirMensagem(
            "erroEdicao",
            "Não foi possível atualizar o artista."
        );
    }
}


/* ======================================================
REMOVER ARTISTA
====================================================== */

async function RemoverArtista(idArtista) {
    const confirmacao = confirm(
        "Tem certeza de que deseja remover este artista?"
    );

    if (!confirmacao) return;

    try {
        await RemoverAPI("artistas", idArtista);

        if (
            String(window.idArtistaEmEdicao) ===
            String(idArtista)
        ) {
            window.idArtistaEmEdicao = null;

            ObterElemento("formEdicao")?.reset();
        }

        await CarregarArtistas();

        alert("Artista removido com sucesso!");

    } catch (erro) {
        console.error("Erro ao remover artista:", erro);

        alert("Não foi possível remover o artista.");
    }
}


/* ======================================================
INICIALIZAÇÃO
====================================================== */

document.addEventListener("DOMContentLoaded", async function () {

    const formCadastro = ObterElemento("formCadastro");
    const formEdicao = ObterElemento("formEdicao");

    if (formCadastro) {
        formCadastro.addEventListener(
            "submit",
            CadastrarArtista
        );
    }

    if (formEdicao) {
        formEdicao.addEventListener(
            "submit",
            EditarArtista
        );
    }

    await CarregarArtistas();

});