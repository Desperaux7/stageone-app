let dadosSalvos = JSON.parse(localStorage.getItem("user")) || {};

let usuario = {
    nome: dadosSalvos.nome || "",
    area: dadosSalvos.area || "",
    xp: dadosSalvos.xp || 0,
    nivel: dadosSalvos.nivel || 1,
    historico: Array.isArray(dadosSalvos.historico) ? dadosSalvos.historico : [],
    conquistas: Array.isArray(dadosSalvos.conquistas) ? dadosSalvos.conquistas : [],
    ultimoQuizData: dadosSalvos.ultimoQuizData || null,
    
    foto: dadosSalvos.foto || "",
    empresa: dadosSalvos.empresa || "",
    linkedin: dadosSalvos.linkedin || "",
    instagram: dadosSalvos.instagram || "",
    quizAcertos: dadosSalvos.quizAcertos || 0,
    diasSeguidos: dadosSalvos.diasSeguidos || 0
};

window.onload = () => {
    if(usuario.nome && usuario.area) {
        iniciarApp(); 
    }
}

function salvar(){
    localStorage.setItem("user", JSON.stringify(usuario));
}

function fazerLogin(){
    const nomeInput = document.getElementById("nome").value.trim();
    const areaInput = document.getElementById("area-atuacao").value;
    const erroMsg = document.getElementById("erro-login");
    
    if(!nomeInput || !areaInput) {
        erroMsg.innerText = "Preencha seu nome e selecione sua área!";
        erroMsg.classList.remove("hidden");
        return;
    }
    
    erroMsg.classList.add("hidden"); 
    usuario.nome = nomeInput;
    usuario.area = areaInput;
    salvar();
    iniciarApp();
}

function iniciarApp() {
    document.getElementById("login").classList.add("hidden");
    document.getElementById("dashboard").classList.remove("hidden");
    saudacao();
    atualizarXP();
    atualizarHistorico();
    carregarDicasArea();
    montarQuizDiario();
    verificarConquistas();
}

function saudacao(){
    const h = new Date().getHours();
    let s = h < 12 ? "Bom dia" : h < 18 ? "Boa tarde" : "Boa noite";
    let primeiroNome = usuario.nome ? usuario.nome.split(' ')[0] : "Estagiário";
    document.getElementById("saudacao").innerText = `${s}, ${primeiroNome}!`;
    atualizarAvatarVisual();
}

function toggleTema(){
    document.body.classList.toggle("light");
}

function abrir(sec, btnElement){
    document.querySelectorAll(".secao").forEach(s => s.classList.add("hidden"));
    document.getElementById(sec).classList.remove("hidden");
    
    if(btnElement) {
        document.querySelectorAll(".nav-item").forEach(b => b.classList.remove("active"));
        btnElement.classList.add("active");
    }
    document.querySelector('.content-area').scrollTop = 0;
    if(sec === 'conquistas') verificarConquistas();
}

/* ================== PERFIL: VIEW E EDIÇÃO ================== */
const nomesAreas = { "ti": "Tecnologia", "saude": "Saúde/Bem-Estar", "adm": "Administração", "comunicacao": "Comunicação/Design", "direito": "Direito", "eng": "Engenharia", "outros": "Sua Carreira" };

function abrirPerfil() {
    // Carrega dados na VIEW
    document.getElementById("view-nome").innerText = usuario.nome || "Estagiário";
    document.getElementById("view-area").innerText = nomesAreas[usuario.area] || "Área não definida";
    document.getElementById("view-empresa").innerText = usuario.empresa ? usuario.empresa : "Empresa não informada";
    
    // Estatísticas da View
    document.getElementById("stat-acertos").innerText = usuario.quizAcertos;
    document.getElementById("stat-streak").innerText = usuario.diasSeguidos;

    // Redes Sociais na View
    let divRedes = document.getElementById("view-redes-sociais");
    divRedes.innerHTML = "";
    
    if(usuario.linkedin) {
        divRedes.innerHTML += `<a href="${usuario.linkedin}" target="_blank" class="social-btn btn-linkedin"><i class="ph ph-linkedin-logo"></i> LinkedIn</a>`;
    }
    if(usuario.instagram) {
        divRedes.innerHTML += `<a href="${usuario.instagram}" target="_blank" class="social-btn btn-instagram"><i class="ph ph-instagram-logo"></i> Instagram</a>`;
    }

    // Carrega dados para o formulário de EDIÇÃO (para quando o usuário clicar em editar)
    document.getElementById("perfil-nome").value = usuario.nome;
    document.getElementById("perfil-empresa").value = usuario.empresa;
    document.getElementById("perfil-linkedin").value = usuario.linkedin;
    document.getElementById("perfil-insta").value = usuario.instagram;
    
    atualizarAvatarVisual();
    
    // Abre a tela View (desmarcando o menu bottom nav)
    abrir('perfil-view', null);
}

function salvarPerfil() {
    // Pega os dados do form de edição
    usuario.nome = document.getElementById("perfil-nome").value.trim();
    usuario.empresa = document.getElementById("perfil-empresa").value.trim();
    usuario.linkedin = document.getElementById("perfil-linkedin").value.trim();
    usuario.instagram = document.getElementById("perfil-insta").value.trim();
    
    salvar();
    saudacao(); // Atualiza o nome no topo
    verificarConquistas();
    
    const feedback = document.getElementById("feedback-perfil");
    feedback.classList.remove("hidden");
    
    setTimeout(() => { 
        feedback.classList.add("hidden"); 
        abrirPerfil(); // Volta para a View após salvar
    }, 1200);
}

function carregarFoto(event) {
    const file = event.target.files[0];
    if(!file) return;
    
    if(file.size > 2000000) { 
        alert("A foto é muito pesada! Tente uma imagem com menos de 2MB.");
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            usuario.foto = e.target.result;
            salvar();
            atualizarAvatarVisual();
            verificarConquistas();
        } catch(err) {
            alert("Erro ao salvar foto no navegador. A imagem pode ser muito grande.");
        }
    };
    reader.readAsDataURL(file);
}

function atualizarAvatarVisual() {
    const imgTop = document.getElementById("avatar-img");
    const imgView = document.getElementById("view-foto");
    const imgEdit = document.getElementById("preview-foto");
    
    if (usuario.foto) {
        let style = `url(${usuario.foto})`;
        
        imgTop.innerHTML = ""; imgTop.style.backgroundImage = style;
        imgView.innerHTML = ""; imgView.style.backgroundImage = style; imgView.style.border = "none";
        imgEdit.innerHTML = ""; imgEdit.style.backgroundImage = style; imgEdit.style.border = "none";
    }
}

/* ================== OUTRAS LÓGICAS (XP, Dicas, etc) ================== */
const bancoDicas = {
    "ti": [
        "Antes de codar, entenda o problema do negócio. Código é só a ferramenta.",
        "Saber ler código legado e documentação é tão importante quanto criar do zero.",
        "Sempre revise e teste seu código antes de abrir um Pull Request. O tech lead agradece!"
    ],
    "saude": [
        "O prontuário é um documento legal: seja claro, técnico e extremamente detalhista nas anotações.",
        "A escuta ativa do paciente muitas vezes revela mais do que os exames iniciais.",
        "Domine os protocolos de biossegurança da sua unidade; eles protegem você e as pessoas ao seu redor."
    ],
    "adm": [
        "Não apenas preencha planilhas, entenda o que os dados dizem sobre a saúde do negócio.",
        "Se você faz uma tarefa repetitiva todo dia, pesquise formas de otimizá-la ou automatizá-la.",
        "Aprenda a estruturar um bom e-mail corporativo: direto, claro e com uma conclusão objetiva."
    ],
    "comunicacao": [
        "Métricas importam mais que curtidas. Aprenda a analisar os relatórios de conversão e alcance.",
        "Desapegue do seu design ou texto. O feedback do cliente ou diretor não é um ataque pessoal.",
        "Entenda o tom de voz e o manual da marca antes de criar qualquer conteúdo ou campanha."
    ],
    "direito": [
        "Aprenda a pesquisar jurisprudência nos sistemas dos tribunais de forma rápida e eficiente.",
        "Menos é mais: escreva peças claras e objetivas. O juiz tem pouco tempo para ler.",
        "O controle rigoroso de prazos e diligências é a habilidade mais vital de qualquer escritório."
    ],
    "eng": [
        "A teoria da faculdade é a base, mas a vivência no canteiro/chão de fábrica ensina a realidade.",
        "Conheça as Normas Regulamentadoras (NRs) da sua área. Elas ditam as regras do jogo e da segurança.",
        "Faça perguntas aos técnicos e operadores. A experiência prática deles vale ouro para seus projetos."
    ],
    "outros": [
        "Anote tudo nos primeiros dias. Evite perguntar a mesma coisa duas vezes se puder registrar.",
        "Seja a pessoa que traz soluções e sugestões, não apenas a que aponta os problemas.",
        "Aproveite o estágio para fazer networking genuíno: converse com pessoas de outras áreas da empresa."
    ]
};

function carregarDicasArea() {
    let dicas = bancoDicas[usuario.area] || bancoDicas["outros"];
    document.getElementById("label-area-user").innerText = nomesAreas[usuario.area] || "você";
    let container = document.getElementById("dicas-container");
    container.innerHTML = "";
    dicas.forEach(dica => { container.innerHTML += `<div class="dica-box">${dica}</div>`; });
}

function ganharXP(v){
    usuario.xp += v;
    let upou = false;
    while(usuario.xp >= 100){ usuario.xp -= 100; usuario.nivel++; upou = true; }
    salvar();
    atualizarXP();
    verificarConquistas();
    if(upou) alert("🎉 Subiu de Nível! Você agora é Nível " + usuario.nivel + "!");
}

function atualizarXP(){
    document.getElementById("nivel").innerText = usuario.nivel;
    document.getElementById("xp-fill").style.width = usuario.xp + "%";
    document.getElementById("xp-restante").innerText = (100 - usuario.xp);
}

function registrar(){
    let e = document.getElementById("entrada").value;
    let s = document.getElementById("saida").value;
    const msgBox = document.getElementById("feedback-jornada");
    
    msgBox.classList.remove("hidden", "success", "error");
    if(!e || !s) { msgBox.innerText = "Preenche as duas horas, chefia!"; msgBox.classList.add("error"); return; }

    let [he, me] = e.split(":").map(Number);
    let [hs, ms] = s.split(":").map(Number);
    let horas = ((hs * 60 + ms) - (he * 60 + me)) / 60;
    if(horas <= 0) { msgBox.innerText = "A hora de saída não bate com a entrada. 🤔"; msgBox.classList.add("error"); return; }

    let hoje = new Date();
    let dataFormatada = hoje.toISOString().split('T')[0]; 
    let diaApresentacao = hoje.toLocaleDateString("pt-BR", {day: "2-digit", month: "2-digit"});
    
    let ultimoReg = usuario.historico.length > 0 ? usuario.historico[0].dataIso : null;
    if (ultimoReg !== dataFormatada) { 
        if (ultimoReg) {
            let d1 = new Date(ultimoReg);
            let d2 = new Date(dataFormatada);
            let diffDays = Math.ceil(Math.abs(d2 - d1) / (1000 * 60 * 60 * 24));
            
            if (diffDays === 1 || (diffDays === 3 && hoje.getDay() === 1)) {
                usuario.diasSeguidos++;
            } else if (diffDays > 0) {
                usuario.diasSeguidos = 1; 
            }
        } else {
            usuario.diasSeguidos = 1; 
        }
    }

    usuario.historico.unshift({ dataIso: dataFormatada, dia: diaApresentacao, horas: horas }); 
    if(usuario.historico.length > 20) usuario.historico.pop(); 
    salvar();
    atualizarHistorico();

    if(horas <= 6.5){ 
        ganharXP(20);
        msgBox.innerText = "✅ Ponto batido perfeitamente! +20XP";
        msgBox.classList.add("success");
    } else {
        msgBox.innerText = "⚠️ Eita! Estagiário não deve passar de 6h (salvo raras exceções na lei).";
        msgBox.classList.add("error");
    }
    
    document.getElementById("entrada").value = "";
    document.getElementById("saida").value = "";
    verificarConquistas();
}

function atualizarHistorico(){
    let ul = document.getElementById("historico");
    ul.innerHTML = "";
    let totalSemana = 0;
    
    let ultimos5 = usuario.historico.slice(0, 5);
    ultimos5.forEach(h => {
        let li = document.createElement("li");
        li.innerHTML = `<span><i class="ph ph-calendar-blank"></i> ${h.dia}</span> <span><strong>${h.horas.toFixed(1)}h</strong></span>`;
        ul.appendChild(li);
    });

    usuario.historico.forEach(h => { totalSemana += h.horas; });
    
    document.getElementById("resumo-semana").innerText = (ultimos5.reduce((a, b) => a + b.horas, 0)).toFixed(1) + "h";
    document.getElementById("resumo-mes").innerText = (totalSemana).toFixed(1) + "h";
    document.getElementById("dias-seguidos").innerText = usuario.diasSeguidos;

    renderizarTrackerSemanal();
}

function renderizarTrackerSemanal() {
    const grid = document.getElementById("grid-dias-semana");
    grid.innerHTML = "";
    const nomesDias = ["D", "S", "T", "Q", "Q", "S", "S"];
    
    let hoje = new Date();
    let diaDaSemanaHoje = hoje.getDay(); 
    let domingo = new Date(hoje);
    domingo.setDate(hoje.getDate() - diaDaSemanaHoje);
    
    let historicoDataIsos = usuario.historico.map(h => h.dataIso);

    for(let i = 0; i < 7; i++) {
        let dataAtual = new Date(domingo);
        dataAtual.setDate(domingo.getDate() + i);
        let isoStr = dataAtual.toISOString().split('T')[0];
        
        let trabalhou = historicoDataIsos.includes(isoStr);
        let classeDone = trabalhou ? "done" : "";
        
        grid.innerHTML += `
            <div class="day-orb ${classeDone}">
                <span>${nomesDias[i]}</span>
                <div class="circle"></div>
            </div>
        `;
    }
}

/* ================== QUIZ DIÁRIO ================== */
const bancoDePerguntas = [
    { p: "Qual o limite de horas de estágio por semana?", alt: ["20h", "30h", "40h"], correta: 1 },
    { p: "O estagiário tem direito a vale-transporte?", alt: ["Não", "Sim, obrigatório se presencial", "Apenas no ensino superior"], correta: 1 },
    { p: "Quantos dias de recesso o estagiário ganha por ano?", alt: ["15 dias", "30 dias", "Nenhum"], correta: 1 },
    { p: "A empresa é obrigada a pagar 13º para estagiário?", alt: ["Sim", "Apenas no fim de ano", "Não, não é obrigatório"], correta: 2 },
    { p: "O seguro contra acidentes pessoais é...", alt: ["Opcional", "Obrigatório", "Pago pelo estagiário"], correta: 1 }
];

let indiceQuizDoDia = 0;

function montarQuizDiario() {
    const hojeIso = new Date().toISOString().split('T')[0];
    const numeroDia = Math.floor(Date.now() / 86400000); 
    indiceQuizDoDia = numeroDia % bancoDePerguntas.length; 
    
    const quiz = bancoDePerguntas[indiceQuizDoDia];
    const container = document.getElementById("alternativas");
    const containerPerguntaText = document.getElementById("pergunta");
    const msgBox = document.getElementById("quiz-msg");
    
    msgBox.classList.add("hidden");
    msgBox.classList.remove("success", "error");

    if (usuario.ultimoQuizData === hojeIso) {
        containerPerguntaText.classList.add("hidden");
        container.innerHTML = `<div class="feedback success text-center w-100"><i class="ph ph-check-circle" style="font-size: 24px; margin-bottom: 5px; display: block;"></i> Você já respondeu o quiz de hoje! Volte amanhã para ganhar mais XP.</div>`;
        return;
    }
    
    containerPerguntaText.classList.remove("hidden");
    containerPerguntaText.innerText = quiz.p;
    container.innerHTML = "";
    
    quiz.alt.forEach((a, i) => {
        let b = document.createElement("button");
        b.className = "alternativa-btn";
        b.innerText = a;
        b.id = "alt-" + i;
        b.onclick = () => responderQuiz(i, quiz.correta, hojeIso);
        container.appendChild(b);
    });
}

function responderQuiz(escolha, correta, hojeIso) {
    const msgBox = document.getElementById("quiz-msg");
    msgBox.classList.remove("hidden", "success", "error");
    
    usuario.ultimoQuizData = hojeIso; 

    document.querySelectorAll(".alternativa-btn").forEach((btn, index) => {
        btn.disabled = true;
        if(index === correta) btn.classList.add("certa");
    });

    if(escolha === correta){
        usuario.quizAcertos++; 
        ganharXP(15);
        msgBox.innerHTML = "Na mosca! +15XP ✨<br><small>Volte amanhã para uma nova pergunta.</small>";
        msgBox.classList.add("success");
    } else {
        document.getElementById("alt-" + escolha).classList.add("errada");
        msgBox.innerHTML = "Putz, não foi dessa vez.<br><small>Volte amanhã para tentar novamente!</small>";
        msgBox.classList.add("error");
    }
    salvar();
}

/* ================== SISTEMA DE CONQUISTAS ================== */
const bancoConquistas = [
    { id: "c1", icone: "ph-star", titulo: "Primeiro Passo", desc: "Acessou o app pela primeira vez.", condicao: () => true },
    { id: "c2", icone: "ph-clock-user", titulo: "Pontual", desc: "Registrou o primeiro ponto.", condicao: () => usuario.historico.length >= 1 },
    { id: "c3", icone: "ph-fire", titulo: "Semana Cheia", desc: "Bateu ponto a semana toda (5 dias seguidos).", condicao: () => usuario.diasSeguidos >= 5 },
    { id: "c4", icone: "ph-calendar-check", titulo: "Mês Perfeito", desc: "Bateu ponto o mês todo (20 dias seguidos).", condicao: () => usuario.diasSeguidos >= 20 },
    { id: "c5", icone: "ph-brain", titulo: "Sabe Tudo", desc: "Acertou seu primeiro Quiz.", condicao: () => usuario.quizAcertos >= 1 },
    { id: "c6", icone: "ph-student", titulo: "Estagiário Consciente", desc: "Acertou o quiz diário 30 vezes.", condicao: () => usuario.quizAcertos >= 30 },
    { id: "c7", icone: "ph-identification-badge", titulo: "Perfil Completo", desc: "Preencheu foto, empresa, LinkedIn e Instagram.", condicao: () => usuario.foto && usuario.empresa && usuario.linkedin && usuario.instagram },
    { id: "c8", icone: "ph-rocket", titulo: "Veterano", desc: "Atingiu o Nível 5 no app.", condicao: () => usuario.nivel >= 5 }
];

function verificarConquistas() {
    let container = document.getElementById("lista-conquistas");
    if(!container) return;
    container.innerHTML = "";

    bancoConquistas.forEach(conq => {
        let desbloqueada = usuario.conquistas.includes(conq.id);
        
        if(!desbloqueada && conq.condicao()) {
            usuario.conquistas.push(conq.id);
            desbloqueada = true;
            salvar();
        }

        let cls = desbloqueada ? "unlocked" : "";
        container.innerHTML += `
            <div class="achievement ${cls}">
                <div class="achievement-icon"><i class="ph ${conq.icone}"></i></div>
                <div class="achievement-info">
                    <h5>${conq.titulo}</h5>
                    <p>${conq.desc}</p>
                </div>
            </div>
        `;
    });
}

/* ================== CALCULADORAS ================== */
let diasSelecionados = 0;
function calcularRecesso(meses){
    diasSelecionados = (30/12) * meses;
    document.getElementById("resultado-recesso").classList.remove("hidden");
    document.getElementById("dias-recesso").innerText = diasSelecionados;
    document.getElementById("area-email-recesso").classList.add("hidden");
}

function gerarEmailRecesso(){
    let texto = `Olá time, tudo bem?\n\nGostaria de solicitar o agendamento do meu recesso remunerado de ${diasSelecionados} dias, direito previsto na Lei do Estágio (Lei 11.788/2008).\n\nPodemos conversar para alinhar as melhores datas?\n\nAtenciosamente,\n${usuario.nome}`;
    document.getElementById("email-recesso").value = texto;
    document.getElementById("area-email-recesso").classList.remove("hidden");
}

function gerarReducao(){
    let i = document.getElementById("inicio-prova").value;
    let f = document.getElementById("fim-prova").value;
    if(!i || !f){ alert("Preencha as duas datas certinho!"); return; }
    const formatar = (d) => { const [a, m, dia] = d.split('-'); return `${dia}/${m}/${a}`; }
    let texto = `Olá gestor(a), tudo bem?\n\nConforme o artigo 10º da Lei do Estágio, que prevê redução da jornada pela metade em dias de provas, gostaria de informar que minha semana de avaliações será de ${formatar(i)} a ${formatar(f)}.\n\nEstarei atuando com carga horária reduzida nestes dias.\n\nAtenciosamente,\n${usuario.nome}`;
    document.getElementById("email-reducao").value = texto;
    document.getElementById("area-email-reducao").classList.remove("hidden");
}

function copiarTexto(idElemento, botao) {
    let t = document.getElementById(idElemento);
    t.select(); t.setSelectionRange(0, 99999); 
    let htmlOriginal = botao.innerHTML;
    navigator.clipboard.writeText(t.value).then(() => {
        botao.innerHTML = "<i class='ph ph-check'></i> Copiado!";
        setTimeout(() => { botao.innerHTML = htmlOriginal; }, 2000);
    }).catch(() => {
        document.execCommand("copy");
        botao.innerHTML = "<i class='ph ph-check'></i> Copiado!";
        setTimeout(() => { botao.innerHTML = htmlOriginal; }, 2000);
    });
}