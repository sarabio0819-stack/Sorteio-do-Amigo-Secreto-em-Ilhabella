// Configuração do Firebase (Substitua pelos dados do seu console do Firebase)
const firebaseConfig = {
  apiKey: "SEU_API_KEY",
  authDomain: "SEU_PROJECT.firebaseapp.com",
  projectId: "SEU_PROJECT_ID",
  storageBucket: "SEU_PROJECT.appspot.com",
  messagingSenderId: "SEU_SENDER_ID",
  appId: "SEU_APP_ID"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// 1. LISTA ATUALIZADA DE PARTICIPANTES DA EQUIPE
const PARTICIPANTES = [
  "Sara", 
  "Efrain", 
  "Rubens", 
  "Isa", 
  "Jean", 
  "Kay", 
  "Jhon", 
  "Bruna"
];

const SENHA_CORRETA = "velhadoecac";
let usuarioAtual = null;
let jaSorteou = false;

// Preenche o menu suspenso com os nomes ao carregar a página
window.onload = () => {
  const select = document.getElementById("user-select");
  
  // Limpa as opções anteriores para evitar duplicados
  select.innerHTML = '<option value="">-- Selecione seu nome --</option>';

  // Ordena os nomes em ordem alfabética e adiciona ao menu
  PARTICIPANTES.sort().forEach(nome => {
    const opt = document.createElement("option");
    opt.value = nome;
    opt.textContent = nome;
    select.appendChild(opt);
  });
};

// 2. FUNÇÃO DE LOGIN / ENTRADA
async function entrar() {
  const nomeSelecionado = document.getElementById("user-select").value;
  const senhaDigitada = document.getElementById("password-input").value.trim();

  if (!nomeSelecionado) {
    return alert("Por favor, selecione seu nome!");
  }

  if (senhaDigitada !== SENHA_CORRETA) {
    return alert("Palavra-passe incorreta! Tente novamente.");
  }

  usuarioAtual = nomeSelecionado;
  
  // Transição de telas
  document.getElementById("auth-card").classList.add("hidden");
  document.getElementById("app-card").classList.remove("hidden");
  document.getElementById("user-display-name").innerText = usuarioAtual;

  // Verifica se o usuário já realizou o sorteio anteriormente
  try {
    const docRef = await db.collection("sorteios").doc(usuarioAtual).get();
    if (docRef.exists) {
      jaSorteou = true;
      const tirado = docRef.data().tirou;
      mostrarResultadoFinal(tirado, true);
    }
  } catch (error) {
    console.error("Erro ao verificar o sorteio:", error);
  }
}

// 3. LÓGICA DA ROLETA E SORTEIO SEM REPETIÇÃO
async function girarRoleta() {
  if (jaSorteou) return;

  const btnGirar = document.getElementById("btn-girar");
  btnGirar.disabled = true;

  try {
    // Busca no Firebase quem já foi tirado por outras pessoas
    const snapshot = await db.collection("sorteios").get();
    const jaTirados = [];
    snapshot.docs.forEach(doc => {
      jaTirados.push(doc.data().tirou);
    });

    // Filtra opções válidas:
    // 1. Não pode ser a própria pessoa que está logada.
    // 2. Não pode ser alguém que já foi tirado por outro membro.
    const disponiveis = PARTICIPANTES.filter(nome => 
      nome !== usuarioAtual && !jaTirados.includes(nome)
    );

    if (disponiveis.length === 0) {
      btnGirar.disabled = false;
      return alert("Não há nomes disponíveis no momento. Fale com o organizador!");
    }

    // Escolhe um nome aleatório da lista de disponíveis
    const sorteado = disponiveis[Math.floor(Math.random() * disponiveis.length)];

    // Animação visual da Roleta
    const rouletteDisplay = document.getElementById("roulette-display");
    let giros = 0;
    const maxGiros = 25;
    
    const interval = setInterval(() => {
      const nomeAleatorio = PARTICIPANTES[Math.floor(Math.random() * PARTICIPANTES.length)];
      rouletteDisplay.innerText = nomeAleatorio;
      giros++;

      if (giros >= maxGiros) {
        clearInterval(interval);
        
        // Exibe o resultado sorteado
        rouletteDisplay.innerText = sorteado;
        
        // Registo no Firebase para travar o nome sorteado
        db.collection("sorteios").doc(usuarioAtual).set({
          tirou: sorteado,
          data: new Date().toISOString()
        }).then(() => {
          jaSorteou = true;
          mostrarResultadoFinal(sorteado, false);
        });
      }
    }, 100);

  } catch (error) {
    console.error("Erro ao realizar o sorteio:", error);
    btnGirar.disabled = false;
    alert("Ocorreu um erro ao conectar ao banco de dados. Tente novamente.");
  }
}

function mostrarResultadoFinal(nomeSorteado, jaEstavaSalvo) {
  const btnGirar = document.getElementById("btn-girar");
  const resultArea = document.getElementById("result-area");
  const drawnName = document.getElementById("drawn-name");

  btnGirar.classList.add("hidden");
  document.getElementById("roulette-container").classList.add("hidden");
  
  drawnName.innerText = nomeSorteado;
  resultArea.classList.remove("hidden");

  if (jaEstavaSalvo) {
    document.getElementById("result-title").innerText = "Seu amigo secreto é:";
  } else {
    document.getElementById("result-title").innerText = "🎉 Parabéns! Seu amigo secreto é:";
  }
}
