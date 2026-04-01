let dadosSalvos = JSON.parse(localStorage.getItem("user")) || {};

let usuario = {
    nome: dadosSalvos.nome || "",
    xp: dadosSalvos.xp || 0,
    nivel: dadosSalvos.nivel || 1,
    historico: Array.isArray(dadosSalvos.historico) ? dadosSalvos.historico : []
};

window.onload = () => {
    if(usuario.nome) {
        iniciarApp(); 
    }
}

function salvar(){
    localStorage.setItem("user", JSON.stringify(usuario));
}

function fazerLogin(){
    const nomeInput = document.getElementById("nome").value.trim();
    const erroMsg = document.getElementById("erro-login");
    
    if(!nomeInput) {
        erroMsg.innerText = "Digita um nome aí pra gente começar!";
        erroMsg.classList.remove("hidden");
        return;
    }
    
    erroMsg.classList.add("hidden"); 
    usuario.nome = nomeInput;
    salvar();
    
    iniciarApp();
}

function iniciarApp() {
    document.getElementById("login").classList.add("hidden");
    document.getElementById("dashboard").classList.remove("hidden");
    saudacao();
    atualizarXP();
    atualizarHistorico();
    montarQuiz();
}

function saudacao(){
    const h = new Date().getHours();
    let s = h < 12 ? "Bom dia" : h < 18 ? "Boa tarde" : "Boa noite";
    let primeiroNome = usuario.nome ? usuario.nome.split(' ')[0] : "Estagiário";
    document.getElementById("saudacao").innerText = `${s}, ${primeiroNome}!`;
}

function toggleTema(){
    document.body.classList.toggle("light");
}

function abrir(sec, btnElement){
    document.querySelectorAll(".secao").forEach(s => s.classList.add("hidden"));
    document.getElementById(sec).classList.remove("hidden");
    
    document.querySelectorAll(".nav-item").forEach(b => b.classList.remove("active"));
    if(btnElement) btnElement.classList.add("active");
    
    document.querySelector('.content-area').scrollTop = 0;
}

function ganharXP(v){
    usuario.xp += v;
    let upou = false;
    while(usuario.xp >= 100){
        usuario.xp -= 100;
        usuario.nivel++;
        upou = true;
    }
    salvar();
    atualizarXP();
    
    if(upou) alert("🎉 Aeee! Você subiu pro Nível " + usuario.nivel + "!");
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

    if(!e || !s) {
        msgBox.innerText = "Preenche as duas horas, chefia!";
        msgBox.classList.add("error");
        return;
    }

    let [he, me] = e.split(":").map(Number);
    let [hs, ms] = s.split(":").map(Number);
    let horas = ((hs * 60 + ms) - (he * 60 + me)) / 60;

    if(horas <= 0) {
        msgBox.innerText = "Hora de saída menor que entrada? 🤔";
        msgBox.classList.add("error");
        return;
    }

    let hoje = new Date().toLocaleDateString("pt-BR", {day: "2-digit", month: "2-digit"});
    
    usuario.historico.unshift({dia: hoje, horas: horas}); 
    if(usuario.historico.length > 5) usuario.historico.pop(); 
    salvar();
    atualizarHistorico();

    if(horas <= 6){
        ganharXP(20);
        msgBox.innerText = "✅ Ponto batido perfeitamente! +20XP";
        msgBox.classList.add("success");
    } else {
        msgBox.innerText = "⚠️ Eita! Estagiário não pode fazer mais de 6h. Se liga na Lei!";
        msgBox.classList.add("error");
    }
    
    document.getElementById("entrada").value = "";
    document.getElementById("saida").value = "";
}

function atualizarHistorico(){
    let ul = document.getElementById("historico");
    ul.innerHTML = "";
    let totalSemana = 0;
    
    usuario.historico.forEach(h => {
        totalSemana += h.horas;
        let li = document.createElement("li");
        li.innerHTML = `<span>📅 ${h.dia}</span> <span><strong>${h.horas.toFixed(1)}h</strong></span>`;
        ul.appendChild(li);
    });

    document.getElementById("resumo-semana").innerText = totalSemana.toFixed(1) + "h";
    document.getElementById("resumo-mes").innerText = (totalSemana * 4).toFixed(1) + "h";
}

const quiz = {
    pergunta: "Segundo a Lei do Estágio, qual a carga máxima diária permitida?",
    alt: ["4 horas", "6 horas", "8 horas (Padrão CLT)"],
    correta: 1
};
let quizRespondido = false;

function montarQuiz() {
    quizRespondido = false;
    document.getElementById("pergunta").innerText = quiz.pergunta;
    const container = document.getElementById("alternativas");
    container.innerHTML = "";
    document.getElementById("quiz-msg").classList.add("hidden");
    
    quiz.alt.forEach((a, i) => {
        let b = document.createElement("button");
        b.className = "alternativa-btn";
        b.innerText = a;
        b.id = "alt-" + i;
        b.onclick = () => responderQuiz(i);
        container.appendChild(b);
    });
}

function responderQuiz(i) {
    if(quizRespondido) return; 
    quizRespondido = true;
    
    const msgBox = document.getElementById("quiz-msg");
    msgBox.classList.remove("hidden", "success", "error");
    
    document.querySelectorAll(".alternativa-btn").forEach((btn, index) => {
        btn.disabled = true;
        if(index === quiz.correta) btn.classList.add("certa");
    });

    if(i === quiz.correta){
        ganharXP(15);
        msgBox.innerText = "Mandou bem! Resposta correta. +15XP ✨";
        msgBox.classList.add("success");
    } else {
        document.getElementById("alt-" + i).classList.add("errada");
        msgBox.innerText = "Putz, errou! A lei diz que o máximo são 6 horas.";
        msgBox.classList.add("error");
    }
}

let diasSelecionados = 0;
function calcularRecesso(meses){
    diasSelecionados = (30/12) * meses;
    
    document.getElementById("resultado-recesso").classList.remove("hidden");
    document.getElementById("dias-recesso").innerText = diasSelecionados;
    document.getElementById("area-email-recesso").classList.add("hidden");
}

function gerarEmailRecesso(){
    let texto = `Olá time, tudo bem?

Gostaria de solicitar o agendamento do meu recesso remunerado de ${diasSelecionados} dias, direito previsto na Lei do Estágio (Lei 11.788/2008).

Podemos conversar para alinhar as melhores datas?

Atenciosamente,
${usuario.nome}`;
    
    document.getElementById("email-recesso").value = texto;
    document.getElementById("area-email-recesso").classList.remove("hidden");
}

function gerarReducao(){
    let i = document.getElementById("inicio-prova").value;
    let f = document.getElementById("fim-prova").value;

    if(!i || !f){
        alert("Preencha as datas certinho!");
        return;
    }

    const formatar = (dataString) => {
        const [ano, mes, dia] = dataString.split('-');
        return `${dia}/${mes}/${ano}`;
    }

    let texto = `Olá gestor(a), tudo bem?

Conforme o artigo 10º da Lei do Estágio, gostaria de informar que minha semana de provas será do dia ${formatar(i)} até ${formatar(f)}.

Estarei atuando com carga horária reduzida nestes dias.

Obrigado(a)!
Atenciosamente,
${usuario.nome}`;

    document.getElementById("email-reducao").value = texto;
    document.getElementById("area-email-reducao").classList.remove("hidden");
}

function copiarTexto(idElemento, botao) {
    let t = document.getElementById(idElemento);
    t.select();
    t.setSelectionRange(0, 99999); 
    
    navigator.clipboard.writeText(t.value).then(() => {
        let textoOriginal = botao.innerText;
        botao.innerText = "Copiado! ✅";
        setTimeout(() => {
            botao.innerText = textoOriginal;
        }, 2000);
    }).catch(err => {
        document.execCommand("copy");
        botao.innerText = "Copiado! ✅";
    });
}