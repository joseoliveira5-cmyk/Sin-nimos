/* ======================================================
CONFIGURAÇÕES
====================================================== */

const API_URL =
    "https://6b06520e57fa1297bb55a04a.mockapi.io/api/v1";


/* ======================================================
FUNÇÕES AUXILIARES
====================================================== */

function ObterElemento(id) {
    return document.getElementById(id);
}


/* ======================================================
OBTER ID DO ARTISTA PELA URL
====================================================== */

function ObterIdArtista() {
    const parametros = new URLSearchParams(window.location.search);

    return parametros.get("id");
}


/* ======================================================
CONSULTAR ARTISTA NA MOCKAPI
====================================================== */

async function ConsultarArtista(id) {
    const resposta = await fetch(
        `${API_URL}/artistas/${encodeURIComponent(id)}`
    );

    if (!resposta.ok) {
        throw new Error("Não foi possível localizar o artista.");
    }

    return await resposta.json();
}


/* ======================================================
EXIBIR MENSAGEM
====================================================== */

function ExibirMensagemPerfil(mensagem) {
    const elemento = ObterElemento("mensagemPerfil");

    if (!elemento) return;

    elemento.hidden = false;
    elemento.textContent = mensagem;
}


/* ======================================================
CRIAR LINK DE REDE SOCIAL
====================================================== */

function CriarLinkRede(nome, endereco) {
    if (!endereco || !String(endereco).trim()) {
        return null;
    }

    const link = document.createElement("a");

    link.textContent = nome;
    link.href = endereco.trim();

    link.target = "_blank";
    link.rel = "noopener noreferrer";

    return link;
}


/* ======================================================
EXIBIR REDES SOCIAIS E CANAIS
====================================================== */

function ExibirCanaisArtista(artista) {
    const container = ObterElemento("canaisArtista");

    if (!container) return;

    container.innerHTML = "";

    const canais = [
        {
            nome: "Instagram",
            endereco: artista.instagram
        },
        {
            nome: "YouTube",
            endereco: artista.youtube
        },
        {
            nome: "Spotify",
            endereco: artista.spotify
        },
        {
            nome: "Site oficial",
            endereco: artista.site
        }
    ];

    let encontrouCanal = false;

    canais.forEach(canal => {
        const link = CriarLinkRede(
            canal.nome,
            canal.endereco
        );

        if (!link) return;

        encontrouCanal = true;

        const paragrafo = document.createElement("p");

        paragrafo.appendChild(link);

        container.appendChild(paragrafo);
    });

    if (!encontrouCanal) {
        container.textContent =
            "Nenhuma rede social ou canal informado.";
    }
}


/* ======================================================
PREENCHER PERFIL DO ARTISTA
====================================================== */

function PreencherPerfilArtista(artista) {

    // NOME
    const nome = ObterElemento("nomeArtista");

    if (nome) {
        nome.textContent =
            artista.nome || "Nome não informado";
    }


    // LOCALIZAÇÃO
    const localizacao = ObterElemento("localizacaoArtista");

    if (localizacao) {
        const cidade = artista.cidade || "Cidade não informada";
        const estado = artista.estado || "Estado não informado";

        localizacao.textContent = `${cidade} - ${estado}`;
    }


    // GÊNERO MUSICAL
    const genero = ObterElemento("generoArtista");

    if (genero) {
        genero.textContent =
            `Gênero musical: ${artista.genero || "Não informado"}`;
    }


    // BIOGRAFIA
    const biografia = ObterElemento("biografiaArtista");

    if (biografia) {
        biografia.textContent =
            artista.biografia || "Este artista ainda não possui biografia cadastrada.";
    }


    // FOTO
    const foto = ObterElemento("fotoArtista");

    if (foto) {
        if (artista.foto && artista.foto.trim()) {

            foto.src = artista.foto.trim();
            foto.alt = `Foto de ${artista.nome || "artista"}`;
            foto.hidden = false;

            foto.onerror = function () {
                foto.hidden = true;
            };

        } else {
            foto.removeAttribute("src");
            foto.hidden = true;
        }
    }


    // REDES SOCIAIS
    ExibirCanaisArtista(artista);


    // MOSTRAR PERFIL
    const perfil = ObterElemento("perfilArtista");

    if (perfil) {
        perfil.hidden = false;
    }

    // OCULTAR MENSAGEM DE CARREGAMENTO
    const mensagem = ObterElemento("mensagemPerfil");

    if (mensagem) {
        mensagem.hidden = true;
    }

    document.title =
        `${artista.nome || "Artista"} | Biblioteca de Artistas`;
}


/* ======================================================
CARREGAR PERFIL
====================================================== */

async function CarregarPerfilArtista() {

    const perfil = ObterElemento("perfilArtista");

    if (perfil) {
        perfil.hidden = true;
    }

    const idArtista = ObterIdArtista();

    if (!idArtista) {
        ExibirMensagemPerfil(
            "Nenhum artista foi selecionado. Acesse o catálogo e escolha um artista."
        );
        return;
    }

    try {

        ExibirMensagemPerfil("Carregando perfil do artista...");

        const artista = await ConsultarArtista(idArtista);

        PreencherPerfilArtista(artista);

    } catch (erro) {

        console.error("Erro ao carregar perfil:", erro);

        ExibirMensagemPerfil(
            "Não foi possível carregar o perfil deste artista. Verifique se ele existe ou tente novamente."
        );
    }
}


/* ======================================================
INICIALIZAÇÃO
====================================================== */

document.addEventListener("DOMContentLoaded", function () {
    CarregarPerfilArtista();
});