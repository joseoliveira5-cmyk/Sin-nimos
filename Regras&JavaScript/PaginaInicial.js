const API_URL = "https://6b06520e57fa1297bb55a04a.mockapi.io/api/v1/:endpoint";
// CONSULTAR
async function ConsultarAPI(recurso) {
    const resposta = await fetch(`${API_URL}/${recurso}`);
    if (!resposta.ok) {
        throw new Error(`Erro ao consultar ${recurso}: ${resposta.status}`);
    }
    return await resposta.json();
}

// CADASTRAR
async function CadastrarAPI(recurso, dados) {
    const resposta = await fetch(`${API_URL}/${recurso}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(dados)
    });
    if (!resposta.ok) {
        throw new Error(`Erro ao cadastrar em ${recurso}: ${resposta.status}`);
    }
    return await resposta.json();
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
        throw new Error(`Erro ao atualizar ${recurso}: ${resposta.status}`);
    }
    return await resposta.json();
}

// REMOVER
async function RemoverAPI(recurso, id) {
    const resposta = await fetch(`${API_URL}/${recurso}/${id}`, {
        method: "DELETE"
    });
    if (!resposta.ok) {
        throw new Error(`Erro ao remover ${recurso}: ${resposta.status}`);
    }
    return true;
}

// USUÁRIO ATUAL
const usuarioAtual = {
    id: 1,
    tipo: "visitante",
    autorizado: true
};

// ARMAZENAMENTO DOS ARTISTAS
let artistas = [];

// COMUNICAÇÃO COM A API
async function ConsultarAPI(recurso) {
    const resposta = await fetch(`${API_URL}/${recurso}`);
    if (!resposta.ok) {
        throw new Error(`Erro ao consultar ${recurso}.`);
    }
    return await resposta.json();
}
async function CadastrarAPI(recurso, dados) {
    const resposta = await fetch(`${API_URL}/${recurso}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(dados)
    });
    if (!resposta.ok) {
        throw new Error(`Erro ao cadastrar em ${recurso}.`);
    }
    return await resposta.json();
}
async function AtualizarAPI(recurso, id, dados) {
    const resposta = await fetch(`${API_URL}/${recurso}/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(dados)
    });
    if (!resposta.ok) {
        throw new Error(`Erro ao atualizar ${recurso}.`);
    }
    return await resposta.json();
}
async function RemoverAPI(recurso, id) {
    const resposta = await fetch(`${API_URL}/${recurso}/${id}`, {
        method: "DELETE"
    });
    if (!resposta.ok) {
        throw new Error(`Erro ao remover registro de ${recurso}.`);
    }
    return true;
}

// CARREGAR ARTISTAS DO BANCO DE DADOS
async function CarregarArtistas() {
    try {
        artistas = await ConsultarAPI("artistas");
        AtualizarListas();
    } catch (erro) {
        console.error(erro);
        alert("Não foi possível carregar os artistas.");
    }
}

// UC06 - CADASTRAR ARTISTA
document.getElementById("formCadastro").addEventListener("submit", async function(event) {
    event.preventDefault();
    const erroCadastro = document.getElementById("erroCadastro");
    const sucessoCadastro = document.getElementById("sucessoCadastro");
    erroCadastro.textContent = "";
    sucessoCadastro.textContent = "";

    // Verificar autorização
    if (usuarioAtual.tipo !== "visitante" || !usuarioAtual.autorizado) {
        erroCadastro.textContent =
            "Você não possui autorização para cadastrar artistas.";
        return;
    }

    // Capturar informações
    const nome = document.getElementById("nomeArtista").value.trim();
    const cidade = document.getElementById("cidadeArtista").value.trim();
    const estado = document.getElementById("estadoArtista").value.trim();
    const genero = document.getElementById("generoArtista").value.trim();

    // Validar informações
    if (!nome || !cidade || !estado || !genero) {
        erroCadastro.textContent =
            "Preencha todos os campos obrigatórios.";
        return;
    }

    // Criar objeto do artista
    const novoArtista = {
        usuarioId: usuarioAtual.id,
        nome: nome,
        cidade: cidade,
        estado: estado,
        genero: genero,
        status: "Pendente de revisão",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    try {

        // Enviar artista para o banco de dados
        await CadastrarAPI("artistas", novoArtista);
        sucessoCadastro.textContent =
            "Cadastro enviado com sucesso! Aguarde a revisão da equipe.";
        document.getElementById("formCadastro").reset();
        await CarregarArtistas();
    } catch (erro) {
        console.error(erro);
        erroCadastro.textContent =
            "Não foi possível cadastrar o artista. Tente novamente.";
    }
});

// UC07 - CARREGAR DADOS DO ARTISTA
async function CarregarDadosArtista() {
    const erroEdicao = document.getElementById("erroEdicao");
    erroEdicao.textContent = "";
    if (usuarioAtual.tipo !== "artista" || !usuarioAtual.autorizado) {
        erroEdicao.textContent =
            "Você não possui autorização para editar artistas.";
        return;
    }
    try {
        await CarregarArtistas();
        const artista = artistas.find(function(item) {
            return Number(item.usuarioId) === Number(usuarioAtual.id);
        });
        if (!artista) {
            erroEdicao.textContent =
                "Seu cadastro de artista não está disponível.";
            return;
        }
        document.getElementById("editarNome").value = artista.nome;
        document.getElementById("editarCidade").value = artista.cidade;
        document.getElementById("editarEstado").value = artista.estado;
        document.getElementById("editarGenero").value = artista.genero;
    } catch (erro) {
        console.error(erro);
        erroEdicao.textContent =
            "Não foi possível carregar os dados do artista.";
    }
}

// UC07 - EDITAR ARTISTA
document.getElementById("formEdicao").addEventListener("submit", async function(event) {
    event.preventDefault();
    const erroEdicao = document.getElementById("erroEdicao");
    const sucessoEdicao = document.getElementById("sucessoEdicao");
    erroEdicao.textContent = "";
    sucessoEdicao.textContent = "";

    // Verificar autorização
    if (usuarioAtual.tipo !== "artista" || !usuarioAtual.autorizado) {
        erroEdicao.textContent =
            "Você não possui autorização para editar artistas.";
        return;
    }
    try {
        // Encontrar o artista associado ao usuário
        const artista = artistas.find(function(item) {
            return Number(item.usuarioId) === Number(usuarioAtual.id);
        });
        if (!artista) {
            erroEdicao.textContent = "Artista não encontrado.";
            return;
        }

        // Capturar os novos dados
        const nome = document.getElementById("editarNome").value.trim();
        const cidade = document.getElementById("editarCidade").value.trim();
        const estado = document.getElementById("editarEstado").value.trim();
        const genero = document.getElementById("editarGenero").value.trim();

        // Validar campos
        if (!nome || !cidade || !estado || !genero) {
            erroEdicao.textContent =
                "Todos os campos são obrigatórios.";
            return;
        }

        // Preparar informações atualizadas
        const dadosAtualizados = {
            nome: nome,
            cidade: cidade,
            estado: estado,
            genero: genero,
            updatedAt: new Date().toISOString()
        };
        // Atualizar registro no banco de dados
        await AtualizarAPI("artistas", artista.id, dadosAtualizados);
        sucessoEdicao.textContent =
            "Informações atualizadas com sucesso!";
        await CarregarArtistas();
    } catch (erro) {
        console.error(erro);
        erroEdicao.textContent =
            "Não foi possível atualizar as informações. Tente novamente.";
    }
});

// UC08 - REMOVER ARTISTA
async function RemoverArtista(idArtista) {
    // Verificar autorização
    if (usuarioAtual.tipo !== "administrador" || !usuarioAtual.autorizado) {
        alert("Apenas administradores autorizados podem remover artistas.");
        return;
    }
    // Procurar artista
    const artista = artistas.find(function(item) {
        return String(item.id) === String(idArtista);
    });
    if (!artista) {
        alert("Artista não encontrado.");
        return;
    }

    // Solicitar confirmação
    const confirmar = confirm(
        "Deseja realmente remover o artista " + artista.nome + "?"
    );
    if (!confirmar) {
        return;
    }
    try {
        // Remover artista do banco de dados
        await RemoverAPI("artistas", artista.id);
        // Atualizar listagens
        await CarregarArtistas();
        alert("Artista removido com sucesso!");

    } catch (erro) {
        console.error(erro);
        alert("Não foi possível remover o artista. Tente novamente.");
    }
}

// ATUALIZAR LISTAGENS
function AtualizarListas() {
    const tabela = document.getElementById("tabelaArtistas");
    const listaAdmin = document.getElementById("listaAdministrativa");
    const listaVazia = document.getElementById("listaVazia");
    // Limpar listagens anteriores
    tabela.replaceChildren();
    listaAdmin.replaceChildren();

    // DIRETÓRIO PÚBLICO
    const artistasPublicados = artistas.filter(function(item) {
        return item.status === "Publicado";
    });
    if (artistasPublicados.length === 0) {
        listaVazia.textContent = "Nenhum artista publicado ainda.";
    } else {
        listaVazia.textContent = "";
        artistasPublicados.forEach(function(artista) {
            const linha = document.createElement("tr");
            [
                artista.nome,
                artista.cidade,
                artista.estado,
                artista.genero
            ].forEach(function(valor) {
                const coluna = document.createElement("td");
                coluna.textContent = valor;
                linha.appendChild(coluna);
            });
            tabela.appendChild(linha);
        });
    }

    // LISTAGEM ADMINISTRATIVA
    artistas.forEach(function(artista) {
        const item = document.createElement("div");
        const informacoes = document.createElement("p");
        const botao = document.createElement("button");
        informacoes.textContent =
            artista.nome + " | " +
            artista.cidade + " | " +
            artista.estado + " | " +
            artista.genero + " | " +
            artista.status;
        botao.textContent = "Remover";
        botao.addEventListener("click", function() {
            RemoverArtista(artista.id);
        });
        item.appendChild(informacoes);
        item.appendChild(botao);
        listaAdmin.appendChild(item);
    });
}

// INICIALIZAÇÃO DO SISTEMA
document.addEventListener("DOMContentLoaded", function() {
    CarregarArtistas();
});