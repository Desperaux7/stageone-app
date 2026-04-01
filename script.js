let dadosSalvos = JSON.parse(localStorage.getItem("user")) || {};

let usuario = {
    nome: dadosSalvos.nome || "",
    area: dadosSalvos.area || "",
    xp: dadosSalvos.xp || 0,
    nivel: dadosSalvos.nivel || 1,
    conquistas: Array.isArray(dadosSalvos.conquistas) ? dadosSalvos.conquistas : [],
    foto: dadosSalvos.foto || "",
    empresa: dadosSalvos.empresa || "",
    linkedin: dadosSalvos.linkedin || "",
    instagram: dadosSalvos.instagram || "",
    
    skillsStatus: dadosSalvos.skillsStatus || {},
    diario: Array.isArray(dadosSalvos.diario) ? dadosSalvos.diario : [],
    
    quizDataUltimaTentativa: dadosSalvos.quizDataUltimaTentativa || null,
    quizCategoriasLiberadas: dadosSalvos.quizCategoriasLiberadas || 1,
    fezNovePontos: dadosSalvos.fezNovePontos || false
};

window.onload = () => {
    if(usuario.nome && usuario.area) { iniciarApp(); }
}

function salvar(){ localStorage.setItem("user", JSON.stringify(usuario)); }

function fazerLogin(){
    const nomeInput = document.getElementById("nome").value.trim();
    const areaInput = document.getElementById("area-atuacao").value;
    const erroMsg = document.getElementById("erro-login");
    
    if(!nomeInput || !areaInput) {
        erroMsg.innerText = "Por favor, preencha seu nome e selecione sua área de atuação.";
        erroMsg.classList.remove("hidden"); return;
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
    carregarDicasArea();
    renderizarSkills();
    renderizarDiario();
    renderizarCategoriasQuiz();
    verificarConquistas();
}

function saudacao(){
    const h = new Date().getHours();
    let s = h < 12 ? "Bom dia" : h < 18 ? "Boa tarde" : "Boa noite";
    let primeiroNome = usuario.nome ? usuario.nome.split(' ')[0] : "Profissional";
    document.getElementById("saudacao").innerText = `${s}, ${primeiroNome}!`;
    atualizarAvatarVisual();
}

function toggleTema(){ document.body.classList.toggle("light"); }

function abrir(sec, btnElement){
    document.querySelectorAll(".secao").forEach(s => s.classList.add("hidden"));
    document.getElementById(sec).classList.remove("hidden");
    
    if(btnElement) {
        document.querySelectorAll(".nav-item").forEach(b => b.classList.remove("active"));
        btnElement.classList.add("active");
    }
    document.querySelector('.content-area').scrollTop = 0;
    if(sec === 'conquistas') verificarConquistas();
    if(sec === 'quiz') {
        document.getElementById("tela-quiz-jogo").classList.add("hidden");
        document.getElementById("tela-quiz-resultado").classList.add("hidden");
        document.getElementById("tela-quiz-categorias").classList.remove("hidden");
        renderizarCategoriasQuiz();
    }
}

/* ================== SISTEMA DE TOAST ================== */
function mostrarToast(titulo, desc, icone) {
    const container = document.getElementById("toast-container");
    const toast = document.createElement("div");
    toast.className = "toast";
    toast.innerHTML = `
        <div class="toast-icon"><i class="ph ${icone}"></i></div>
        <div class="toast-content">
            <h5>${titulo}</h5>
            <p>${desc}</p>
        </div>
    `;
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.add("hide");
        setTimeout(() => toast.remove(), 400);
    }, 4000);
}

/* ================== XP E DICAS ================== */
const nomesAreas = { "ti": "Tecnologia", "saude": "Saúde", "adm": "Administração", "comunicacao": "Comunicação", "direito": "Direito", "eng": "Engenharia", "outros": "Geral" };

const bancoDicas = {
    "ti": ["Compreenda as regras de negócio antes de iniciar a codificação.", "A documentação oficial é sua principal aliada na resolução de problemas.", "Realize testes rigorosos antes de abrir um Pull Request."],
    "saude": ["O prontuário é um documento legal: exija de si mesmo o máximo de detalhes.", "A escuta humanizada revela sintomas que exames não mostram.", "Os protocolos de biossegurança são inegociáveis."],
    "adm": ["Não seja apenas um operador de planilhas; entenda o impacto estratégico dos dados.", "Busque ativamente automatizar rotinas operacionais.", "Estruture e-mails com clareza, objetividade e chamadas para ação."],
    "comunicacao": ["Métricas de conversão são mais valiosas do que métricas de vaidade (curtidas).", "O feedback criativo não é pessoal; é focado no objetivo da marca.", "Domine o manual e o tom de voz da marca com a qual trabalha."],
    "direito": ["Desenvolva agilidade e precisão na pesquisa jurisprudencial.", "Em redação jurídica, a objetividade é mais valorizada que a prolixidade.", "O controle rigoroso de prazos é a espinha dorsal da profissão."],
    "eng": ["A teoria acadêmica é fundamental, mas a vivência prática ensina a realidade do mercado.", "Domine as Normas Regulamentadoras (NRs) pertinentes ao seu setor.", "Valorize a experiência técnica dos operadores do chão de fábrica/obra."],
    "outros": ["Documente processos e rotinas para evitar retrabalho.", "Apresente soluções proativas em vez de focar apenas em relatar problemas.", "Cultive um networking genuíno e agregador no seu ambiente corporativo."]
};

function carregarDicasArea() {
    let dicas = bancoDicas[usuario.area] || bancoDicas["outros"];
    document.getElementById("label-area-user").innerText = nomesAreas[usuario.area] || "você";
    let container = document.getElementById("dicas-container");
    container.innerHTML = "";
    dicas.forEach(dica => { container.innerHTML += `<div class="dica-box">${dica}</div>`; });
}

function getXpProxNivel() { return usuario.nivel * 100; }

function ganharXP(v){
    if (usuario.nivel >= 5) return;
    
    usuario.xp += v;
    let upou = false;
    
    while(usuario.xp >= getXpProxNivel() && usuario.nivel < 5){ 
        usuario.xp -= getXpProxNivel(); 
        usuario.nivel++; 
        upou = true; 
    }
    
    if(usuario.nivel >= 5) {
        usuario.xp = getXpProxNivel();
    }
    
    salvar();
    atualizarXP();
    verificarConquistas();
    
    if(upou) {
        if(usuario.nivel === 5) {
            mostrarToast("🏆 NÍVEL MÁXIMO ALCANÇADO!", "Você atingiu o grau de maturidade sênior no app!", "ph-star");
        } else {
            mostrarToast("Nível Atualizado!", `Você agora é nível ${usuario.nivel}.`, "ph-rocket");
        }
    }
}

function atualizarXP(){
    const textNivel = document.getElementById("nivel");
    const xpFill = document.getElementById("xp-fill");
    const xpRestanteText = document.getElementById("xp-restante").parentElement;
    
    if(usuario.nivel >= 5) {
        textNivel.innerText = "MAX";
        xpFill.style.width = "100%";
        xpFill.classList.add("xp-fill-max");
        xpRestanteText.innerText = "Você alcançou a progressão máxima de XP.";
    } else {
        textNivel.innerText = usuario.nivel;
        let xpNecessario = getXpProxNivel();
        let pct = (usuario.xp / xpNecessario) * 100;
        xpFill.style.width = pct + "%";
        xpFill.classList.remove("xp-fill-max");
        document.getElementById("xp-restante").innerText = (xpNecessario - usuario.xp);
        xpRestanteText.innerHTML = `Faltam <span id="xp-restante">${xpNecessario - usuario.xp}</span> XP para o próximo nível`;
    }
}

/* ================== SKILL TREE PERSONALIZADA ================== */
const bancoSkills = {
    "ti": ["Lógica de Programação", "Git / GitHub", "Banco de Dados SQL", "Clean Code", "Metodologias Ágeis", "APIs REST"],
    "saude": ["Biossegurança", "Prontuário Eletrônico", "Atendimento Humanizado", "Primeiros Socorros", "Legislação SUS"],
    "adm": ["Excel Avançado", "Gestão de Tempo", "Análise de Dados", "Comunicação Corporativa", "Ferramentas ERP"],
    "comunicacao": ["Copywriting", "Ferramentas de Design (Adobe/Figma)", "Métricas de Redes", "Gestão de Crise", "SEO Básico"],
    "direito": ["Pesquisa Jurisprudencial", "Redação Jurídica", "Gestão de Prazos", "Atendimento ao Cliente", "Processo Eletrônico"],
    "eng": ["AutoCAD / SolidWorks", "Normas Regulamentadoras (NRs)", "Gestão de Projetos", "Leitura de Plantas", "Cálculo Estrutural Básico"],
    "outros": ["Comunicação Assertiva", "Trabalho em Equipe", "Resolução de Problemas", "Organização Pessoal", "Pacote Office"]
};

// Dicionário com Vantagens e Dicas individualizadas
const detalhesSkills = {
    "Lógica de Programação": { desc: "A base fundamental para resolução algorítmica de problemas.", vantagens: ["Agiliza a curva de aprendizado em novas linguagens.", "Permite criar códigos mais eficientes e performáticos.", "Essencial em testes técnicos de empresas de tecnologia."], dica: "Pratique em plataformas como HackerRank ou LeetCode diariamente." },
    "Git / GitHub": { desc: "Sistema vital para versionamento e trabalho colaborativo em código.", vantagens: ["Evita perda catastrófica de projetos.", "Possibilita a colaboração simultânea com outros desenvolvedores.", "Atua como portfólio prático para recrutadores."], dica: "Acostume-se a commitar pequenas alterações com mensagens semânticas." },
    "Banco de Dados SQL": { desc: "A linguagem padrão para manipulação e consulta em bancos relacionais.", vantagens: ["Independência na extração e análise de dados complexos.", "Competência exigida tanto em Dev quanto em Data Science.", "Otimiza consideravelmente a performance de aplicações."], dica: "Crie um banco de dados local com dados fictícios para praticar JOINs." },
    "Clean Code": { desc: "Práticas de escrita de software para criar códigos legíveis e manuteníveis.", vantagens: ["Reduz a probabilidade de bugs em produção.", "Acelera o onboarding de novos devs no projeto.", "Demonstra maturidade profissional ao time técnico."], dica: "Sempre refatore seu código focando em nomes de variáveis autoexplicativos." },
    "Metodologias Ágeis": { desc: "Frameworks (Scrum/Kanban) focados na entrega contínua de valor.", vantagens: ["Garante total alinhamento sobre as prioridades do negócio.", "Melhora drasticamente a organização do fluxo de trabalho.", "Habilidade transversal altamente valorizada por Product Owners."], dica: "Aplique um Kanban pessoal (Trello) para gerenciar suas atividades acadêmicas." },
    "APIs REST": { desc: "Padrão arquitetural essencial para a integração entre sistemas e serviços.", vantagens: ["Permite o desenvolvimento pleno em arquitetura de microserviços.", "Base absoluta do desenvolvimento backend moderno.", "Viabiliza integrações com serviços externos."], dica: "Construa uma API de testes simples utilizando Node.js ou Python (FastAPI/Flask)." },
    
    "Biossegurança": { desc: "Conjunto de ações voltadas para a prevenção de riscos em ambientes clínicos.", vantagens: ["Proteção direta da sua integridade física e saúde.", "Prevenção de infecções cruzadas e surtos hospitalares.", "Conformidade obrigatória com normas regulamentadoras."], dica: "Revise mentalmente os POPs (Procedimentos Operacionais Padrão) antes dos atendimentos." },
    "Prontuário Eletrônico": { desc: "Sistemas digitais para registro e gestão do histórico clínico de pacientes.", vantagens: ["Garante agilidade na consulta ao histórico do paciente.", "Reduz expressivamente erros de interpretação clínica.", "Possui imenso respaldo jurídico e ético."], dica: "Foque em anotações claras, sem jargões desnecessários e cronológicas." },
    "Atendimento Humanizado": { desc: "Acolhimento e compreensão integral das necessidades físicas e emocionais do paciente.", vantagens: ["Aumenta consideravelmente a adesão ao tratamento prescrito.", "Estabelece relações de confiança com pacientes e familiares.", "Diferencial altamente notado pela gestão hospitalar."], dica: "Pratique a escuta ativa: ouça sem interromper e demonstre empatia." },
    "Legislação SUS": { desc: "Base legal e diretrizes estruturais do Sistema Único de Saúde brasileiro.", vantagens: ["Essencial para aprovação em concursos da área da saúde.", "Entendimento crítico do fluxo de regulação e direitos dos usuários.", "Visão ampla sobre saúde coletiva e epidemiologia."], dica: "Estude focando nos princípios da Universalidade, Equidade e Integralidade." },

    "Excel Avançado": { desc: "Domínio técnico de funções complexas, macros e estruturação de dados.", vantagens: ["Automatiza processos e economiza horas de trabalho.", "Permite construção de dashboards para tomada de decisão.", "Destaque garantido nas primeiras semanas de estágio."], dica: "Aprofunde-se no uso de Tabelas Dinâmicas, PROCV/XLOOKUP e introdução a Macros." },
    "Gestão de Tempo": { desc: "Capacidade de priorizar tarefas e otimizar recursos para maximizar entregas.", vantagens: ["Evita burnout e acúmulo de horas extras indesejadas.", "Garante a pontualidade na entrega de relatórios e projetos.", "Aumenta o seu nível de confiabilidade junto à liderança."], dica: "Utilize a Matriz de Eisenhower para classificar tarefas (Urgente vs Importante)." },
    "Análise de Dados": { desc: "Competência de converter números brutos em insights de negócios.", vantagens: ["Permite justificar propostas e ideias com base estatística.", "Habilidade fundamental para crescimento em áreas estratégicas.", "Minimiza o viés na tomada de decisão gerencial."], dica: "Comece a questionar o 'porquê' dos números apresentados em relatórios mensais." },

    "Copywriting": { desc: "Técnicas de escrita persuasiva voltadas para conversão e engajamento.", vantagens: ["Eleva de forma imediata o ROI (Retorno sobre Investimento) em anúncios.", "Aumenta métricas de conversão e taxas de clique.", "Habilidade extremamente versátil em marketing."], dica: "Estude gatilhos mentais e pratique a reescrita de e-mails corporativos." },
    "Ferramentas de Design (Adobe/Figma)": { desc: "Domínio das ferramentas essenciais da indústria visual moderna.", vantagens: ["Maior velocidade e qualidade na produção de peças visuais.", "Comunicação mais eficiente com desenvolvedores Front-end (Figma).", "Melhora drástica no apuro estético do seu portfólio."], dica: "Reconstrua interfaces de aplicativos famosos para praticar a proporção e alinhamento." },

    "Pesquisa Jurisprudencial": { desc: "Eficiência na busca por decisões anteriores dos tribunais.", vantagens: ["Aumenta significativamente as chances de êxito processual.", "Garante embasamento técnico inquestionável às suas petições.", "Agiliza o fluxo de trabalho do seu escritório."], dica: "Domine o uso de operadores booleanos (AND, OR, NOT) nos buscadores dos Tribunais." },
    "Redação Jurídica": { desc: "Habilidade de argumentar e relatar fatos jurídicos com clareza processual.", vantagens: ["Transmite autoridade e domínio técnico sobre a causa.", "Garante a fácil compreensão por parte do juízo.", "Diferencia você no rigoroso mercado advocatício."], dica: "Abandone o excesso de 'juridiquês' quando não for estritamente necessário." },
    "Gestão de Prazos": { desc: "Controle rigoroso sobre prazos prescricionais e processuais.", vantagens: ["Mitiga riscos de perdas de causas por questões administrativas.", "Passa credibilidade absoluta aos sócios do escritório.", "Evita crises de ansiedade na véspera do encerramento de prazos."], dica: "Sempre agende um aviso prévio no software de gestão dois dias antes do prazo real." },

    "AutoCAD / SolidWorks": { desc: "A base do desenvolvimento de projetos de engenharia assistidos por computador.", vantagens: ["Requisito técnico em quase 100% dos projetos práticos.", "Proporciona precisão milimétrica e minimiza erros de execução.", "Aumenta sua velocidade de entrega no escritório técnico."], dica: "Domine os atalhos de teclado do software; isso cortará seu tempo de desenho pela metade." },
    "Normas Regulamentadoras (NRs)": { desc: "Legislação mandatória relativa à segurança e medicina do trabalho.", vantagens: ["Garante a integridade física e legal da sua equipe e empresa.", "Conhecimento obrigatório em inspeções e vistorias técnicas.", "Qualifica você para participar do gerenciamento de riscos no canteiro."], dica: "Inicie focando nas normas estruturantes como NR-1, NR-18 e a correspondente ao seu setor." }
};

// Fallback genérico para skills não listadas
const fallbackSkill = {
    desc: "O aprofundamento contínuo nesta competência agregará expressivo valor ao seu perfil profissional.",
    vantagens: ["Gera autonomia nas operações diárias.", "Aumenta sua visibilidade para a liderança.", "Estrutura as bases para futuras efetivações."],
    dica: "Alinhe um plano de estudos com seu supervisor e busque aplicar a teoria em suas entregas."
};

function renderizarSkills() {
    document.getElementById("nome-area-skills").innerText = nomesAreas[usuario.area] || "sua área";
    const lista = bancoSkills[usuario.area] || bancoSkills["outros"];
    const container = document.getElementById("lista-skills");
    container.innerHTML = "";

    lista.forEach(skill => {
        let statusNum = usuario.skillsStatus[skill] || 0; 
        let statusText = statusNum === 2 ? "Dominado" : statusNum === 1 ? "Em Estudo" : "Não Iniciado";
        let statusIcon = statusNum === 2 ? "ph-check-circle" : statusNum === 1 ? "ph-book-open" : "ph-lock-key";
        let classCard = statusNum === 2 ? "dominado" : statusNum === 1 ? "estudando" : "";
        
        container.innerHTML += `
            <div class="skill-card ${classCard}" onclick="abrirModalSkill('${skill}')">
                <div class="skill-info">
                    <h5>${skill}</h5>
                    <p>Clique para gerenciar detalhes</p>
                </div>
                <div class="skill-status"><i class="ph ${statusIcon}"></i> ${statusText}</div>
            </div>
        `;
    });
}

function abrirModalSkill(skillNome) {
    let atual = usuario.skillsStatus[skillNome] || 0;
    const detalhes = detalhesSkills[skillNome] || fallbackSkill;
    
    document.getElementById("modal-skill-titulo").innerText = skillNome;
    document.getElementById("modal-skill-desc").innerText = detalhes.desc;
    document.getElementById("modal-skill-dica").innerText = detalhes.dica;
    
    let htmlVantagens = detalhes.vantagens.map(v => `<li style="margin-bottom: 4px;"><i class="ph ph-check-circle" style="color:var(--success); vertical-align: middle;"></i> ${v}</li>`).join('');
    document.getElementById("modal-skill-vantagens").innerHTML = htmlVantagens;
    
    const btnAcao = document.getElementById("btn-acao-skill");
    
    if (atual === 0) {
        btnAcao.innerText = "Iniciar Plano de Estudos";
        btnAcao.className = "primary-btn w-100 mt-15";
        btnAcao.style.cssText = "";
        btnAcao.onclick = () => evoluirSkill(skillNome, 1);
    } else if (atual === 1) {
        btnAcao.innerHTML = "<i class='ph ph-check'></i> Certificar Domínio";
        btnAcao.className = "primary-btn w-100 mt-15";
        btnAcao.style.background = "var(--success)";
        btnAcao.style.boxShadow = "0 4px 15px rgba(16, 185, 129, 0.3)";
        btnAcao.onclick = () => evoluirSkill(skillNome, 2);
    } else {
        btnAcao.innerHTML = "<i class='ph ph-medal'></i> Competência Consolidada";
        btnAcao.className = "secondary-btn w-100 mt-15";
        btnAcao.style.borderColor = "var(--success)";
        btnAcao.style.color = "var(--success)";
        btnAcao.onclick = fecharModalSkill; 
    }
    
    document.getElementById("modal-skill").classList.remove("hidden");
}

function fecharModalSkill() { document.getElementById("modal-skill").classList.add("hidden"); }

function evoluirSkill(skillNome, novoStatus) {
    usuario.skillsStatus[skillNome] = novoStatus;
    let xpGanha = novoStatus === 2 ? 60 : 30;
    
    ganharXP(xpGanha);
    salvar();
    renderizarSkills();
    verificarConquistas();
    fecharModalSkill();
    
    let msgToast = novoStatus === 2 ? `Domínio atestado em ${skillNome}.` : `Estudos iniciados em ${skillNome}.`;
    mostrarToast("Status de Competência", msgToast, "ph-star");
}

/* ================== LOG DE ATIVIDADES ================== */
function abrirModalDiario(id = null) {
    const modal = document.getElementById("modal-diario");
    const dataInput = document.getElementById("diario-data");
    const assuntoInput = document.getElementById("diario-assunto");
    const textoInput = document.getElementById("diario-texto");
    const idInput = document.getElementById("diario-id");
    const tituloModal = document.getElementById("modal-diario-titulo");

    if (id) {
        const nota = usuario.diario.find(n => n.id === id);
        if(nota) {
            tituloModal.innerText = "Editar Registro";
            idInput.value = nota.id;
            dataInput.value = nota.dataIso;
            assuntoInput.value = nota.titulo;
            textoInput.value = nota.texto;
        }
    } else {
        tituloModal.innerText = "Novo Registro";
        idInput.value = "";
        dataInput.value = new Date().toISOString().split('T')[0];
        assuntoInput.value = "";
        textoInput.value = "";
    }
    modal.classList.remove("hidden");
}

function fecharModalDiario() { document.getElementById("modal-diario").classList.add("hidden"); }

function salvarNotaDiario() {
    const idInput = document.getElementById("diario-id").value;
    const dataIso = document.getElementById("diario-data").value;
    const titulo = document.getElementById("diario-assunto").value.trim();
    const texto = document.getElementById("diario-texto").value.trim();

    if(!dataIso || !titulo || !texto) { alert("Por gentileza, preencha todos os campos obrigatórios do log."); return; }

    if (idInput) {
        let index = usuario.diario.findIndex(n => n.id == idInput);
        if(index > -1) {
            usuario.diario[index].dataIso = dataIso;
            usuario.diario[index].titulo = titulo;
            usuario.diario[index].texto = texto;
        }
    } else {
        usuario.diario.unshift({ id: Date.now(), dataIso: dataIso, titulo: titulo, texto: texto });
        ganharXP(15);
    }

    salvar();
    fecharModalDiario();
    renderizarDiario();
    verificarConquistas();
}

function excluirNotaDiario(id) {
    if(confirm("Confirma a exclusão definitiva deste registro de atividade?")) {
        usuario.diario = usuario.diario.filter(n => n.id !== id);
        salvar();
        renderizarDiario();
    }
}

function renderizarDiario() {
    const container = document.getElementById("lista-diario");
    container.innerHTML = "";
    
    if (usuario.diario.length === 0) {
        container.innerHTML = `<div class="text-center subtitle mt-15">Nenhum registro encontrado. Mantenha seu log atualizado.</div>`;
        return;
    }

    usuario.diario.forEach(nota => {
        let [a, m, d] = nota.dataIso.split('-');
        let dataStr = `${d}/${m}/${a}`;
        container.innerHTML += `
            <div class="note-card">
                <div class="note-header">
                    <span class="note-date"><i class="ph ph-calendar-blank"></i> ${dataStr}</span>
                </div>
                <h5 class="note-title">${nota.titulo}</h5>
                <p class="note-text">${nota.texto}</p>
                <div class="note-actions">
                    <button onclick="abrirModalDiario(${nota.id})"><i class="ph ph-pencil-simple"></i> Editar</button>
                    <button class="btn-delete" onclick="excluirNotaDiario(${nota.id})"><i class="ph ph-trash"></i></button>
                </div>
            </div>
        `;
    });
}

/* ================== QUIZ GAMIFICADO ================== */
const bancoQuizCategorias = [
    {
        id: 1, titulo: "Módulo 1: Direitos Básicos", desc: "Regras de ouro da Lei 11.788/08.",
        perguntas: [
            { p: "Estagiários têm o direito garantido por lei de receber o 13º salário.", v: false },
            { p: "Para alunos do ensino superior, a jornada máxima é limitada a 6h diárias (30h semanais).", v: true },
            { p: "A formalização do estágio gera vínculo empregatício formal (CLT).", v: false },
            { p: "O estágio curricular classificado como obrigatório pode ser não remunerado.", v: true },
            { p: "A contratação de seguro contra acidentes pessoais é de total responsabilidade da empresa.", v: true },
            { p: "É permitida a realização de horas extras no estágio, desde que pagas em dobro.", v: false },
            { p: "Estagiários têm direito assegurado ao auxílio-transporte em modalidades presenciais remuneradas.", v: true },
            { p: "As atividades delegadas ao estagiário podem divergir do escopo de sua matriz curricular.", v: false },
            { p: "É dever da empresa concedente designar um profissional para atuar como supervisor das atividades.", v: true },
            { p: "O prazo máximo de permanência na mesma empresa como estagiário é estritamente de 2 anos.", v: true }
        ]
    },
    {
        id: 2, titulo: "Módulo 2: Férias e Provas", desc: "Regulamentação de recesos e avaliações.",
        perguntas: [
            { p: "Estagiários adquirem o direito a 30 dias de recesso remunerado a cada 1 ano de trabalho prestado.", v: true },
            { p: "É legalmente permitido que o estagiário converta ('venda') parte de seu recesso em remuneração extra.", v: false },
            { p: "O recesso (férias) deve ser obrigatoriamente remunerado caso o estágio preveja pagamento de bolsa.", v: true },
            { p: "A empresa possui a prerrogativa legal de impedir o estagiário de tirar férias em período coincidente com as férias escolares.", v: false },
            { p: "Em caso de encerramento do contrato antes de 1 ano, é devido o pagamento do recesso proporcional.", v: true },
            { p: "É garantida a redução da carga horária pela metade nos dias correspondentes a avaliações acadêmicas.", v: true },
            { p: "A redução da jornada para a realização de provas acarreta desconto proporcional na bolsa-auxílio.", v: false },
            { p: "A comunicação prévia do calendário de avaliações à empresa é um dever formal do estagiário.", v: true },
            { p: "Faltas injustificadas conferem à empresa o direito de efetuar o desconto correspondente na remuneração.", v: true },
            { p: "A legislação permite que o horário do estágio sobreponha ou conflite com o horário acadêmico do aluno.", v: false }
        ]
    },
    {
        id: 3, titulo: "Módulo 3: Postura e Contratos", desc: "Responsabilidades legais e éticas.",
        perguntas: [
            { p: "O Termo de Compromisso de Estágio (TCE) atua como o documento fundamental que rege as diretrizes do estágio.", v: true },
            { p: "O desligamento exige a formalização de um termo de rescisão, independentemente de ser estágio.", v: true },
            { p: "Ao completar 2 anos de estágio, a empresa possui a obrigação legal de efetivar o profissional.", v: false },
            { p: "A entrega periódica de relatórios de atividades para a instituição de ensino é um requisito obrigatório.", v: true },
            { p: "A empresa possui respaldo para aplicar descontos na bolsa-auxílio decorrentes de atrasos frequentes.", v: true },
            { p: "Estar com a matrícula ativa e frequência regular é a premissa inegociável para a continuidade do estágio.", v: true },
            { p: "O encerramento do contrato de estágio pelo empregador exige o cumprimento de aviso prévio.", v: false },
            { p: "A legislação estabelece que descontos referentes à contribuição do INSS devem ocorrer diretamente na bolsa-auxílio.", v: false },
            { p: "Estagiárias gestantes possuem, por força de lei, estabilidade contratual idêntica às trabalhadoras CLT.", v: false },
            { p: "O contrato de estágio pode ser rescindido unilateralmente por qualquer uma das partes sem a incidência de multas contratuais.", v: true }
        ]
    }
];

let quizEstado = { idCat: null, perguntas: [], indexAtual: 0, acertos: 0 };

function renderizarCategoriasQuiz() {
    const container = document.getElementById("lista-categorias-quiz");
    const avisoDiario = document.getElementById("aviso-quiz-diario");
    container.innerHTML = "";
    
    let hojeIso = new Date().toISOString().split('T')[0];
    let jogouHoje = usuario.quizDataUltimaTentativa === hojeIso;
    
    if (jogouHoje) { avisoDiario.classList.remove("hidden"); } 
    else { avisoDiario.classList.add("hidden"); }

    bancoQuizCategorias.forEach(cat => {
        let liberada = cat.id <= usuario.quizCategoriasLiberadas;
        let concluida = cat.id < usuario.quizCategoriasLiberadas;
        let classCss = concluida ? "concluido" : liberada ? "" : "bloqueado";
        let icone = concluida ? "ph-check-circle" : liberada ? "ph-lock-key-open" : "ph-lock-key";
        
        container.innerHTML += `
            <div class="quiz-category ${classCss}" onclick="iniciarJogoQuiz(${cat.id}, ${liberada}, ${jogouHoje})">
                <div class="icon-cat"><i class="ph ${icone}"></i></div>
                <div class="cat-info text-left">
                    <h5>${cat.titulo}</h5>
                    <p>${concluida ? "Módulo Concluído com Sucesso!" : cat.desc}</p>
                </div>
            </div>
        `;
    });
}

function iniciarJogoQuiz(idCat, liberada, jogouHoje) {
    if (!liberada) { alert("Acesso restrito: Conclua os módulos anteriores para habilitar esta avaliação."); return; }
    if (idCat < usuario.quizCategoriasLiberadas) { alert("Você já certificou sua aprovação neste módulo!"); return; }
    if (jogouHoje) { return; } 

    let catData = bancoQuizCategorias.find(c => c.id === idCat);
    quizEstado = { idCat: idCat, perguntas: [...catData.perguntas].sort(() => Math.random() - 0.5), indexAtual: 0, acertos: 0 };
    
    document.getElementById("tela-quiz-categorias").classList.add("hidden");
    document.getElementById("tela-quiz-jogo").classList.remove("hidden");
    mostrarPerguntaQuiz();
}

function mostrarPerguntaQuiz() {
    document.getElementById("quiz-progresso").innerText = `${quizEstado.indexAtual + 1}/10`;
    document.getElementById("quiz-pontos").innerText = quizEstado.acertos * 10;
    document.getElementById("quiz-pergunta-ativa").innerText = quizEstado.perguntas[quizEstado.indexAtual].p;
}

function responderMitoVerdade(respostaUser) {
    let pAtual = quizEstado.perguntas[quizEstado.indexAtual];
    if (respostaUser === pAtual.v) { quizEstado.acertos++; }
    
    quizEstado.indexAtual++;
    
    if (quizEstado.indexAtual < 10) {
        mostrarPerguntaQuiz();
    } else {
        finalizarQuiz();
    }
}

function finalizarQuiz() {
    document.getElementById("tela-quiz-jogo").classList.add("hidden");
    const telaResultado = document.getElementById("tela-quiz-resultado");
    telaResultado.classList.remove("hidden");
    
    let hojeIso = new Date().toISOString().split('T')[0];
    usuario.quizDataUltimaTentativa = hojeIso;
    
    const titulo = document.getElementById("resultado-titulo");
    const msg = document.getElementById("resultado-msg");
    const icone = document.getElementById("resultado-icone");
    
    if (quizEstado.acertos === 9) {
        usuario.fezNovePontos = true;
    }
    
    if (quizEstado.acertos === 10) {
        usuario.quizCategoriasLiberadas++;
        ganharXP(100);
        titulo.innerText = "Excelente! Módulo concluído!";
        titulo.style.color = "var(--success)";
        msg.innerText = "Mandou bem!. O acesso ao próximo módulo foi liberado, além de uma recompensa de 100XP.";
        icone.innerHTML = '<i class="ph ph-trophy"></i>';
    } else {
        let xpGanha = quizEstado.acertos * 2;
        ganharXP(xpGanha);
        titulo.innerText = "Foi Quase!.";
        titulo.style.color = "var(--warning)";
        msg.innerText = `Seu resultado foi ${quizEstado.acertos}/10, convertidos em ${xpGanha}XP. Tente novamente amanhã!.`;
        icone.innerHTML = '<i class="ph ph-clock-counter-clockwise"></i>';
    }
    
    salvar();
    verificarConquistas();
}

function voltarCategoriasQuiz() {
    document.getElementById("tela-quiz-resultado").classList.add("hidden");
    document.getElementById("tela-quiz-categorias").classList.remove("hidden");
    renderizarCategoriasQuiz();
}

/* ================== DIREITOS E E-MAILS ================== */
let diasSelecionados = 0;
function calcularRecesso(meses){
    diasSelecionados = (30/12) * meses;
    document.getElementById("resultado-recesso").classList.remove("hidden");
    document.getElementById("dias-recesso").innerText = diasSelecionados;
    document.getElementById("area-email-recesso").classList.add("hidden");
}

function gerarEmailRecesso(){
    let texto = `Prezado(a) gestor(a),\n\nGostaria de formalizar a solicitação de agendamento do meu recesso remunerado de ${diasSelecionados} dias, direito assegurado pelo Art. 13 da Lei do Estágio (Lei 11.788/2008).\n\nPodemos agendar um breve alinhamento para definir as datas mais adequadas para a equipe?\n\nAtenciosamente,\n${usuario.nome}`;
    document.getElementById("email-recesso").value = texto;
    document.getElementById("area-email-recesso").classList.remove("hidden");
}

function gerarReducao(){
    let i = document.getElementById("inicio-prova").value;
    let f = document.getElementById("fim-prova").value;
    if(!i || !f){ alert("Certifique-se de preencher corretamente ambas as datas."); return; }
    const formatar = (d) => { const [a, m, dia] = d.split('-'); return `${dia}/${m}/${a}`; }
    let texto = `Prezado(a) gestor(a),\n\nConforme o Art. 10, § 2º da Lei do Estágio (Lei 11.788/2008), que garante a redução da jornada de estágio pela metade em períodos de avaliação, informo que meu calendário de provas ocorrerá de ${formatar(i)} a ${formatar(f)}.\n\nDurante este período, manterei minhas entregas com carga horária ajustada, garantindo o devido tempo para a dedicação aos estudos acadêmicos.\n\nAtenciosamente,\n${usuario.nome}`;
    document.getElementById("email-reducao").value = texto;
    document.getElementById("area-email-reducao").classList.remove("hidden");
}

function fecharEmail(idElemento) {
    document.getElementById(idElemento).classList.add("hidden");
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

/* ================== PERFIL E CONFIGS ================== */
function abrirPerfil() {
    document.getElementById("view-nome").innerText = usuario.nome || "Estagiário";
    document.getElementById("view-area").innerText = nomesAreas[usuario.area] || "Área não definida";
    document.getElementById("view-empresa").innerText = usuario.empresa ? usuario.empresa : "Empresa não informada";
    
    document.getElementById("stat-diario").innerText = usuario.diario.length;
    let skillsUpped = Object.values(usuario.skillsStatus).filter(v => v > 0).length;
    document.getElementById("stat-skills").innerText = skillsUpped;

    let divRedes = document.getElementById("view-redes-sociais");
    divRedes.innerHTML = "";
    if(usuario.linkedin) divRedes.innerHTML += `<a href="${usuario.linkedin}" target="_blank" class="social-btn btn-linkedin"><i class="ph ph-linkedin-logo"></i> LinkedIn</a>`;
    if(usuario.instagram) divRedes.innerHTML += `<a href="${usuario.instagram}" target="_blank" class="social-btn btn-instagram"><i class="ph ph-instagram-logo"></i> Instagram</a>`;

    document.getElementById("perfil-nome").value = usuario.nome;
    document.getElementById("perfil-empresa").value = usuario.empresa;
    document.getElementById("perfil-linkedin").value = usuario.linkedin;
    document.getElementById("perfil-insta").value = usuario.instagram;
    
    const divTitulo = document.getElementById("view-titulo-mestre");
    if (usuario.nivel >= 5 && usuario.quizCategoriasLiberadas > 3) {
        divTitulo.classList.remove("hidden");
    } else {
        divTitulo.classList.add("hidden");
    }

    atualizarAvatarVisual();
    abrir('perfil-view', null);
}

function salvarPerfil() {
    usuario.nome = document.getElementById("perfil-nome").value.trim();
    usuario.empresa = document.getElementById("perfil-empresa").value.trim();
    usuario.linkedin = document.getElementById("perfil-linkedin").value.trim();
    usuario.instagram = document.getElementById("perfil-insta").value.trim();
    salvar(); saudacao(); verificarConquistas();
    mostrarToast("Atualização Concluída", "Os dados do perfil foram gravados com sucesso.", "ph-check-circle");
    abrirPerfil();
}

function carregarFoto(event) {
    const file = event.target.files[0];
    if(!file) return;
    if(file.size > 2000000) { alert("O arquivo excede o limite técnico de 2MB. Selecione uma imagem mais leve."); return; }
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            usuario.foto = e.target.result; salvar(); atualizarAvatarVisual(); verificarConquistas();
        } catch(err) { alert("Ocorreu uma falha técnica ao tentar salvar a imagem."); }
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

/* ================== CONQUISTAS ================== */
const bancoConquistas = [
    { id: "c1", icone: "ph-star", titulo: "Primeiro Passo", desc: "Realizou o primeiro acesso.", condicao: () => true },
    { id: "c2", icone: "ph-book-open-text", titulo: "Anotador Clínico", desc: "Registrou sua primeira Anotação.", condicao: () => usuario.diario.length >= 1 },
    { id: "c3", icone: "ph-books", titulo: "Arquivo Vivo", desc: "Efetuou 10 registros nas Anotações.", condicao: () => usuario.diario.length >= 10 },
    { id: "c4", icone: "ph-tree-structure", titulo: "Buscando Conhecimento", desc: "Iniciou o plano de estudos de uma competência.", condicao: () => Object.values(usuario.skillsStatus).some(v => v >= 1) },
    { id: "c5", icone: "ph-certificate", titulo: "Especialista", desc: "Certificou o domínio técnico de uma competência.", condicao: () => Object.values(usuario.skillsStatus).some(v => v === 2) },
    { id: "c6", icone: "ph-brain", titulo: "Mente Brilhante", desc: "Atingiu pontuação máxima no 1º Módulo.", condicao: () => usuario.quizCategoriasLiberadas >= 2 },
    { id: "c7", icone: "ph-identification-badge", titulo: "Perfil Completo", desc: "Preencheu completamente o perfil.", condicao: () => usuario.foto && usuario.empresa && usuario.linkedin && usuario.instagram },
    { id: "c8", icone: "ph-rocket", titulo: "Veterano", desc: "Chegou ao Nível 5.", condicao: () => usuario.nivel >= 5 },
    { id: "c9", icone: "ph-target", titulo: "Skill Issue", desc: "Dominou todas as habilidades da sua área.", condicao: () => { const lista = bancoSkills[usuario.area] || bancoSkills["outros"]; return lista.length > 0 && lista.every(s => usuario.skillsStatus[s] === 2); } },
    { id: "c10", icone: "ph-thumbs-up", titulo: "Nice Try", desc: "Atingiu 9/10 pontos em uma avaliação.", condicao: () => usuario.fezNovePontos },
    { id: "c11", icone: "ph-coffee", titulo: "Descanso Merecido", desc: "Concluiu a avaliação do Módulo 2.", condicao: () => usuario.quizCategoriasLiberadas >= 3 },
    { id: "c12", icone: "ph-briefcase", titulo: "Pronto pro Mercado", desc: "Concluiu a avaliação do Módulo 3.", condicao: () => usuario.quizCategoriasLiberadas >= 4 },
    { id: "c13", icone: "ph-crown", titulo: "Diferenciado", desc: "Recebeu o título de Estagiário Consciente.", condicao: () => usuario.nivel >= 5 && usuario.quizCategoriasLiberadas > 3 }
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
            mostrarToast("Conquista Desbloqueada!", conq.titulo, conq.icone);
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