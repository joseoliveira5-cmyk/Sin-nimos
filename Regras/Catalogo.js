/* ======================================================
CONFIGURAÇÕES
====================================================== */

const API_URL =
    "https://6b06520e57fa1297bb55a04a.mockapi.io/api/v1";

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

function NormalizarEstado(estado) {
    const estados = {
        "ac": "acre",
        "al": "alagoas",
        "ap": "amapa",
        "am": "amazonas",
        "ba": "bahia",
        "ce": "ceara",
        "df": "distrito federal",
        "es": "espirito santo",
        "go": "goias",
        "ma": "maranhao",
        "mt": "mato grosso",
        "ms": "mato grosso do sul",
        "mg": "minas gerais",
        "pa": "para",
        "pb": "paraiba",
        "pr": "parana",
        "pe": "pernambuco",
        "pi": "piaui",
        "rj": "rio de janeiro",
        "rn": "rio grande do norte",
        "rs": "rio grande do sul",
        "ro": "rondonia",
        "rr": "roraima",
        "sc": "santa catarina",
        "sp": "sao paulo",
        "se": "sergipe",
        "to": "tocantins"
    };

    const estadoNormalizado = NormalizarTexto(estado);

    return estados[estadoNormalizado] || estadoNormalizado;
}


/* ======================================================
COMUNICAÇÃO COM A MOCKAPI
====================================================== */

async function ConsultarAPI(recurso) {
    const resposta = await fetch(`${API_URL}/${recurso}`);

    if (!resposta.ok) {
        throw new Error("Erro ao consultar a API.");
    }

    return await resposta.json();
}


/* ======================================================
CARREGAR ARTISTAS
====================================================== */

async function CarregarArtistas() {
    const tabela = ObterElemento("tabelaArtistas");
    const listaVazia = ObterElemento("listaVazia");

    if (listaVazia) {
        listaVazia.textContent = "Carregando artistas...";
    }

    try {
        artistas = await ConsultarAPI("artistas");

        AtualizarListas();

    } catch (erro) {
        console.error("Erro ao carregar artistas:", erro);

        artistas = [];

        if (tabela) {
            tabela.innerHTML = "";
        }

        if (listaVazia) {
            listaVazia.textContent =
                "Não foi possível carregar os artistas. Tente novamente.";
        }
    }
}


/* ======================================================
PESQUISAR ARTISTAS
====================================================== */

function PesquisarArtistas(lista) {
    const campoPesquisa = ObterElemento("pesquisaArtista");

    if (!campoPesquisa) return lista;

    const pesquisa = NormalizarTexto(campoPesquisa.value);

    if (!pesquisa) return lista;

    return lista.filter(artista => {

        const nome = NormalizarTexto(artista.nome);
        const cidade = NormalizarTexto(artista.cidade);
        const estado = NormalizarEstado(artista.estado);
        const genero = NormalizarTexto(artista.genero);

        return (
            nome.includes(pesquisa) ||
            cidade.includes(pesquisa) ||
            estado.includes(pesquisa) ||
            genero.includes(pesquisa)
        );
    });
}


/* ======================================================
FILTRAR ARTISTAS
====================================================== */

function FiltrarArtistas(lista) {
    const cidadeSelecionada = NormalizarTexto(
        ObterElemento("filtroCidade")?.value
    );

    const estadoSelecionado = NormalizarEstado(
        ObterElemento("filtroEstado")?.value
    );

    const generoSelecionado = NormalizarTexto(
        ObterElemento("filtroGenero")?.value
    );

    return lista.filter(artista => {

        const cidadeArtista = NormalizarTexto(artista.cidade);
        const estadoArtista = NormalizarEstado(artista.estado);
        const generoArtista = NormalizarTexto(artista.genero);

        const correspondeCidade =
            !cidadeSelecionada ||
            cidadeSelecionada === "todas" ||
            cidadeArtista === cidadeSelecionada;

        const correspondeEstado =
            !estadoSelecionado ||
            estadoSelecionado === "todos" ||
            estadoArtista === estadoSelecionado;

        const correspondeGenero =
            !generoSelecionado ||
            generoSelecionado === "todos" ||
            generoArtista === generoSelecionado;

        return (
            correspondeCidade &&
            correspondeEstado &&
            correspondeGenero
        );
    });
}


/* ======================================================
OBTER RESULTADOS
====================================================== */

function ObterResultados() {
    let resultados = [...artistas];

    resultados = PesquisarArtistas(resultados);

    resultados = FiltrarArtistas(resultados);

    return resultados;
}


/* ======================================================
ATUALIZAR TABELA DO CATÁLOGO
====================================================== */

function AtualizarListas() {
    const tabela = ObterElemento("tabelaArtistas");
    const listaVazia = ObterElemento("listaVazia");

    if (!tabela) {
        console.error("Elemento tabelaArtistas não encontrado.");
        return;
    }

    tabela.innerHTML = "";

    const resultados = ObterResultados();

    if (resultados.length === 0) {
        if (listaVazia) {
            listaVazia.textContent =
                "Nenhum artista encontrado.";
        }

        return;
    }

    if (listaVazia) {
        listaVazia.textContent = "";
    }

    resultados.forEach(artista => {

        const linha = document.createElement("tr");

        // NOME
        const colunaNome = document.createElement("td");

        const linkPerfil = document.createElement("a");

        linkPerfil.href =
            `perfil.html?id=${encodeURIComponent(artista.id)}`;

        linkPerfil.textContent =
            artista.nome || "Nome não informado";

        colunaNome.appendChild(linkPerfil);


        // CIDADE
        const colunaCidade = document.createElement("td");

        colunaCidade.textContent =
            artista.cidade || "Não informada";


        // ESTADO
        const colunaEstado = document.createElement("td");

        colunaEstado.textContent =
            artista.estado || "Não informado";


        // GÊNERO
        const colunaGenero = document.createElement("td");

        colunaGenero.textContent =
            artista.genero || "Não informado";


        linha.append(
            colunaNome,
            colunaCidade,
            colunaEstado,
            colunaGenero
        );

        tabela.appendChild(linha);
    });
}


/* ======================================================
ATUALIZAR RESULTADOS
====================================================== */

function AtualizarResultados() {
    AtualizarListas();
}


/* ======================================================
LIMPAR FILTROS
====================================================== */

function LimparFiltros() {
    const pesquisa = ObterElemento("pesquisaArtista");
    const cidade = ObterElemento("filtroCidade");
    const estado = ObterElemento("filtroEstado");
    const genero = ObterElemento("filtroGenero");

    if (pesquisa) pesquisa.value = "";
    if (cidade) cidade.value = "";
    if (estado) estado.value = "";
    if (genero) genero.value = "";

    AtualizarResultados();
}


/* ======================================================
INICIALIZAÇÃO
====================================================== */

document.addEventListener("DOMContentLoaded", async function () {

    const botaoPesquisar = ObterElemento("btnPesquisar");
    const campoPesquisa = ObterElemento("pesquisaArtista");

    const botaoFiltrar = ObterElemento("btnFiltrar");
    const botaoLimpar = ObterElemento("btnLimpar");

    // PESQUISA PELO BOTÃO
    if (botaoPesquisar) {
        botaoPesquisar.addEventListener(
            "click",
            AtualizarResultados
        );
    }

    // PESQUISA AO PRESSIONAR ENTER
    if (campoPesquisa) {
        campoPesquisa.addEventListener("keydown", function (event) {
            if (event.key === "Enter") {
                event.preventDefault();
                AtualizarResultados();
            }
        });
    }

    // APLICAR FILTROS
    if (botaoFiltrar) {
        botaoFiltrar.addEventListener(
            "click",
            AtualizarResultados
        );
    }

    // LIMPAR FILTROS
    if (botaoLimpar) {
        botaoLimpar.addEventListener(
            "click",
            LimparFiltros
        );
    }

    // CARREGAR DADOS DA API
    await CarregarArtistas();

});