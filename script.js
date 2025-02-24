// Configuração do Firebase
const firebaseConfig = {
    apiKey: "AIzaSyCiUa3NO3pcf4ZpXEs-1I63NS-ip71dVAE",
    authDomain: "desenvolvimentoweb-31da9.firebaseapp.com",
    projectId: "desenvolvimentoweb-31da9",
    storageBucket: "desenvolvimentoweb-31da9.firebasestorage.app",
    messagingSenderId: "154760099356",
    appId: "1:154760099356:web:da7f3c3301e1c8d8dbd1d9",
    measurementId: "G-D00DFXSMSX"
};

// Inicialize o Firebase
const app = firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Variáveis globais
const atividadesRegistradas = [];
const horasPorArea = { Ensino: 0, Extensao: 0, Pesquisa: 0 };
const horasPorTipo = {};

// Limites de horas por tipo de atividade
const limitesAtividades = {
    // Atividades de Ensino
    "Estágio Extracurricular": { maxHoras: 40, aproveitamento: 0.7 },
    "Monitoria": { maxHoras: 40, aproveitamento: 0.7 },
    "Concursos e campeonatos de atividades acadêmicas": { maxHoras: 50, aproveitamento: 0.7 },
    "Presença comprovada a defesas de TCC do curso de Engenharia de Computação": { maxHoras: 3, aproveitamento: 0.5 },
    "Cursos Profissionalizantes Específicos na área": { maxHoras: 40, aproveitamento: 0.8 },
    "Cursos Profissionalizantes em geral": { maxHoras: 10, aproveitamento: 0.2 },

    // Atividades de Extensão
    "Projeto de extensão": { maxHoras: 40, aproveitamento: 0.1 },
    "Atividades culturais": { maxHoras: 5, aproveitamento: 0.8 },
    "Visitas Técnicas": { maxHoras: 40, aproveitamento: 1.0 },
    "Visitas a Feiras e Exposições": { maxHoras: 5, aproveitamento: 0.2 },
    "Cursos de Idiomas": { maxHoras: 20, aproveitamento: 0.6 },
    "Palestras, Seminários e Congressos Extensionistas (ouvinte)": { maxHoras: 10, aproveitamento: 0.8 },
    "Palestras, Seminários e Congressos Extensionistas (apresentador)": { maxHoras: 15, aproveitamento: 1.0 },
    "Projeto Empresa Júnior": { maxHoras: 20, aproveitamento: 0.2 },

    // Atividades de Pesquisa
    "Iniciação Científica": { maxHoras: 40, aproveitamento: 0.8 },
    "Publicação de artigos em periódicos científicos": { maxHoras: 10, aproveitamento: 1.0, porPublicacao: true },
    "Publicação de artigos completos em anais de congressos": { maxHoras: 7, aproveitamento: 1.0, porPublicacao: true },
    "Publicação de capítulo de livro": { maxHoras: 7, aproveitamento: 1.0, porPublicacao: true },
    "Publicação de resumos de artigos em anais": { maxHoras: 5, aproveitamento: 1.0, porPublicacao: true },
    "Registro de patentes como auto/coautor": { maxHoras: 40, aproveitamento: 1.0, porPublicacao: true },
    "Premiação resultante de pesquisa científica": { maxHoras: 10, aproveitamento: 1.0, porPublicacao: true },
    "Colaborador em atividades como Seminários e Congressos": { maxHoras: 10, aproveitamento: 1.0 },
    "Palestras, Seminários e Congressos de Pesquisa (ouvinte)": { maxHoras: 10, aproveitamento: 0.8 },
    "Palestras, Seminários e Congressos de Pesquisa (apresentador)": { maxHoras: 15, aproveitamento: 1.0 }
};

// Função para carregar os tipos de atividades com base na área selecionada
function carregarTipos() {
    const categoriaSelecionada = document.getElementById("area").value;
    const tipoAtividade = document.getElementById("tipoAtividade");
    tipoAtividade.innerHTML = "";

    const tiposEnsino = [
        "Estágio Extracurricular", "Monitoria", "Concursos e campeonatos de atividades acadêmicas",
        "Presença comprovada a defesas de TCC do curso de Engenharia de Computação",
        "Cursos Profissionalizantes Específicos na área", "Cursos Profissionalizantes em geral"
    ];

    const tiposExtensao = [
        "Projeto de extensão", "Atividades culturais", "Visitas Técnicas",
        "Visitas a Feiras e Exposições", "Cursos de Idiomas",
        "Palestras, Seminários e Congressos Extensionistas (ouvinte)",
        "Palestras, Seminários e Congressos Extensionistas (apresentador)",
        "Projeto Empresa Júnior"
    ];

    const tiposPesquisa = [
        "Iniciação Científica", "Publicação de artigos em periódicos científicos",
        "Publicação de artigos completos em anais de congressos", "Publicação de capítulo de livro",
        "Publicação de resumos de artigos em anais", "Registro de patentes como auto/coautor",
        "Premiação resultante de pesquisa científica", "Colaborador em atividades como Seminários e Congressos",
        "Palestras, Seminários e Congressos de Pesquisa (ouvinte)", "Palestras, Seminários e Congressos de Pesquisa (apresentador)"
    ];

    const tipos = categoriaSelecionada === "Extensao" ? tiposExtensao : 
                  categoriaSelecionada === "Ensino" ? tiposEnsino : 
                  categoriaSelecionada === "Pesquisa" ? tiposPesquisa : [];

    tipos.forEach(t => {
        const opcao = document.createElement("option");
        opcao.value = t;
        opcao.textContent = t;
        tipoAtividade.appendChild(opcao);
    });
}

// Função para registrar uma nova atividade
function registrarAtividade() {
    const descricao = document.getElementById("descricaoAtividade").value;
    const area = document.getElementById("area").value;
    const tipo = document.getElementById("tipoAtividade").value;
    const horas = parseFloat(document.getElementById("horasAtividade").value);
    const data = document.getElementById("dataAtividade").value;
    const local = document.getElementById("localAtividade").value;
    const responsavel = document.getElementById("responsavelAtividade").value;
    const comprovante = document.getElementById("comprovanteAtividade").value;

    if (isNaN(horas) || horas <= 0) {
        alert("Por favor, insira um valor válido para as horas.");
        return;
    }

    if (limitesAtividades[tipo]) {
        let horasValidas = horas * limitesAtividades[tipo].aproveitamento;

        const horasRestantesAtividade = limitesAtividades[tipo].maxHoras - (horasPorTipo[tipo] || 0);
        if (limitesAtividades[tipo].porPublicacao) {
            horasValidas = Math.min(horasValidas, limitesAtividades[tipo].maxHoras);
        } else {
            if (horasValidas > horasRestantesAtividade) {
                horasValidas = horasRestantesAtividade;
            }
        }

        const horasRestantesArea = 90 - horasPorArea[area];
        if (horasValidas > horasRestantesArea) {
            horasValidas = horasRestantesArea;
        }

        if (horasValidas <= 0) {
            alert("Limite de horas para esta atividade ou área já foi atingido.");
            return;
        }

        if (!horasPorTipo[tipo]) {
            horasPorTipo[tipo] = 0;
        }
        horasPorTipo[tipo] += horasValidas;
        horasPorArea[area] += horasValidas;

        // Salvar no Firestore
        db.collection("atividades").add({
            descricao: descricao,
            area: area,
            tipo: tipo,
            horas: horasValidas,
            data: data,
            local: local,
            responsavel: responsavel,
            comprovante: comprovante,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        })
        .then(() => {
            console.log("Atividade salva com sucesso!");
            atividadesRegistradas.push({ descricao, area, tipo, horas: horasValidas, data, local, responsavel, comprovante });
            atualizarListaAtividades();
            limparCampos();
        })
        .catch((error) => {
            console.error("Erro ao salvar atividade: ", error);
        });
    } else {
        alert("Tipo de atividade não encontrado.");
    }
}

// Função para carregar atividades do Firestore
function carregarAtividades() {
    db.collection("atividades").orderBy("timestamp", "desc").get()
    .then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            atividadesRegistradas.push(data);
            horasPorArea[data.area] += data.horas;
            if (!horasPorTipo[data.tipo]) {
                horasPorTipo[data.tipo] = 0;
            }
            horasPorTipo[data.tipo] += data.horas;
        });
        atualizarListaAtividades();
    })
    .catch((error) => {
        console.error("Erro ao carregar atividades: ", error);
    });
}

// Função para atualizar a lista de atividades na interface
function atualizarListaAtividades() {
    const lista = document.getElementById("listaAtividades");
    lista.innerHTML = "";
    atividadesRegistradas.forEach((atv, index) => {
        lista.innerHTML += `<li>${atv.descricao} - ${atv.area} - ${atv.tipo} - ${atv.horas.toFixed(1)}h (Data: ${atv.data}, Local: ${atv.local}, Responsável: ${atv.responsavel}, Comprovante: <a href="${atv.comprovante}" target="_blank">Link</a>)</li>`;
    });

    document.getElementById("totalEnsino").textContent = horasPorArea["Ensino"].toFixed(1);
    document.getElementById("totalExtensao").textContent = horasPorArea["Extensao"].toFixed(1);
    document.getElementById("totalPesquisa").textContent = horasPorArea["Pesquisa"].toFixed(1);

    const totalHoras = horasPorArea["Ensino"] + horasPorArea["Extensao"] + horasPorArea["Pesquisa"];
    document.getElementById("totalHoras").textContent = totalHoras.toFixed(1);

    if (totalHoras >= 150) {
        alert("Parabéns! Você atingiu o mínimo de 150 horas.");
    }
}

// Função para limpar os campos do formulário
function limparCampos() {
    document.getElementById("descricaoAtividade").value = "";
    document.getElementById("horasAtividade").value = "";
    document.getElementById("area").selectedIndex = 0;
    document.getElementById("dataAtividade").value = "";
    document.getElementById("localAtividade").value = "";
    document.getElementById("responsavelAtividade").value = "";
    document.getElementById("comprovanteAtividade").value = "";
    carregarTipos();
}

// Função para resetar todos os registros
function resetarRegistros() {
    atividadesRegistradas.length = 0;
    horasPorArea.Ensino = 0;
    horasPorArea.Extensao = 0;
    horasPorArea.Pesquisa = 0;
    Object.keys(horasPorTipo).forEach(key => delete horasPorTipo[key]);
    atualizarListaAtividades();
    limparCampos();
    alert("Todos os registros foram resetados.");
}

// Carregar atividades ao iniciar a página
window.onload = carregarAtividades;