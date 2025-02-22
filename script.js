const firebaseConfig = {
    apiKey: "AIzaSyDCMi6byyBpkNH-8BEEAqW47MIEckbq2eQ",
    authDomain: "trabalhofinal-783cc.firebaseapp.com",
    projectId: "trabalhofinal-783cc",
    storageBucket: "trabalhofinal-783cc.firebasestorage.app",
    messagingSenderId: "99731287284",
    appId: "1:99731287284:web:72e0d631c19f08513ec2a1",
    measurementId: "G-YSE1B1CYQ0"
  };

// Inicialize o Firebase
const app = firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Salvar no Firestore
db.collection("atividades").add({
    descricao: descricao,
    area: area,
    tipo: tipo,
    horas: horasValidas,
    timestamp: firebase.firestore.FieldValue.serverTimestamp()
})
.then(() => {
    console.log("Atividade salva com sucesso!");
    atividadesRegistradas.push({ descricao, area, tipo, horas: horasValidas });
    atualizarListaAtividades();
    limparCampos();
})
.catch((error) => {
    console.error("Erro ao salvar atividade: ", error);
});

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

// Chame a função ao carregar a página
window.onload = carregarAtividades;

const atividadesRegistradas = [];
const horasPorArea = { Ensino: 0, Extensao: 0, Pesquisa: 0 };
const limitesAtividades = {
    "Estágio Extracurricular": { maxHoras: 40, aproveitamento: 0.7 },
    "Monitoria": { maxHoras: 40, aproveitamento: 0.7 },
    "Concursos e campeonatos de atividades acadêmicas": { maxHoras: 50, aproveitamento: 0.7 },
    "Presença comprovada a defesas de TCC do curso de Engenharia de Computação": { maxHoras: 3, aproveitamento: 0.5 },
    "Cursos Profissionalizantes Específicos na área": { maxHoras: 40, aproveitamento: 0.8 },
    "Cursos Profissionalizantes em geral": { maxHoras: 10, aproveitamento: 0.2 },
    "Projeto de extensão": { maxHoras: 40, aproveitamento: 0.1 },
    "Atividades culturais": { maxHoras: 5, aproveitamento: 0.8 },
    "Visitas Técnicas": { maxHoras: 40, aproveitamento: 1.0 },
    "Visitas a Feiras e Exposições": { maxHoras: 5, aproveitamento: 0.2 },
    "Cursos de Idiomas": { maxHoras: 20, aproveitamento: 0.6 },
    "Palestras, Seminários e Congressos Extensionistas (ouvinte)": { maxHoras: 10, aproveitamento: 0.8 },
    "Palestras, Seminários e Congressos Extensionistas (apresentador)": { maxHoras: 15, aproveitamento: 1.0 },
    "Projeto Empresa Júnior": { maxHoras: 20, aproveitamento: 0.2 },
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
const horasPorTipo = {};

function carregarTipos() {
    const categoriaSelecionada = document.getElementById("area").value;
    const tipoAtividade = document.getElementById("tipoAtividade");
    tipoAtividade.innerHTML = "";

    const tiposEnsino = [
        "Estágio Extracurricular", "Monitoria", "Concursos e campeonatos de atividades acadêmicas",
        "Presença comprovada a defesas de TCC do curso de Engenharia de Computação",
        "Cursos Profissionalizantes Específicos na área", "Cursos Profissionalizantes em geral"
    ];

    const tiposExtensao = Object.keys(limitesAtividades).filter(
        key => !tiposEnsino.includes(key) && ![
            "Iniciação Científica", "Publicação de artigos em periódicos científicos",
            "Publicação de artigos completos em anais de congressos", "Publicação de capítulo de livro",
            "Publicação de resumos de artigos em anais", "Registro de patentes como auto/coautor",
            "Premiação resultante de pesquisa científica", "Colaborador em atividades como Seminários e Congressos",
            "Palestras, Seminários e Congressos de Pesquisa (ouvinte)", "Palestras, Seminários e Congressos de Pesquisa (apresentador)"
        ].includes(key)
    );

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

function registrarAtividade() {
    const descricao = document.getElementById("descricaoAtividade").value;
    const area = document.getElementById("area").value;
    const tipo = document.getElementById("tipoAtividade").value;
    const horas = parseFloat(document.getElementById("horasAtividade").value);

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

        atividadesRegistradas.push({ descricao, area, tipo, horas: horasValidas });
        atualizarListaAtividades();
        limparCampos();
    } else {
        alert("Tipo de atividade não encontrado.");
    }
}

function atualizarListaAtividades() {
    const lista = document.getElementById("listaAtividades");
    lista.innerHTML = "";
    atividadesRegistradas.forEach((atv, index) => {
        lista.innerHTML += `<li>${atv.descricao} - ${atv.area} - ${atv.tipo} - ${atv.horas.toFixed(1)}h</li>`;
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

function limparCampos() {
    document.getElementById("descricaoAtividade").value = "";
    document.getElementById("horasAtividade").value = "";
    document.getElementById("area").selectedIndex = 0;
    carregarTipos();
}

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