// Configuração do Firebase
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

// 1. LISTA FIXA DE PARTICIPANTES DA EQUIPE
const PARTICIPANTES = [
  "Cleia", "Jaque", "Tia Sol", "Carina", "Fatima", 
  "Irene", "Marly", "Cleide", "Cleisson", "Mateus", 
  "Emanuelly", "Samyra", "Isa", "Eriky", "Ninha", 
  "Leticia", "Gabriel", "Vitor", "Rayssa", "Cleber"
];

const SENHA_CORRETA = "velhadoecac";
let usuarioAtual = null;
let jaSorteou = false;

// Preenche o campo select com os nomes na inicialização
window.onload = () => {
  const select = document.getElementById("user-select");
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
    return alert("Palavra-passe incorreta! Fale com o organizador.");
  }

  usuarioAtual = nomeSelecionado;
  
  // Oculta login e mostra a tela do sorteio
  document.getElementById("auth-card").classList.add("hidden");
  document.getElementById("app-card").classList.remove("hidden");
  document.getElementById("user-display-name").innerText = usuarioAtual;

  // Verifica se a pessoa já sorteou anteriormente
  const docRef = await db.collection("sorteios").doc(usuarioAtual).get();
  if (docRef.exists) {
    jaSorteou = true;
    const tirado = docRef.data().tirou;
    mostrarResultadoFinal(tirado, true);
  }
}

// 3. LÓGICA DE GIRAR A ROLETA E SORTEAR
async function girarRoleta() {
  if (jaSorteou) return;

  const btnGirar = document.getElementById("btn-girar");
  btnGirar.disabled = true;

  try {
    // Busca todos os sorteios já realizados no banco de dados
    const snapshot = await db.collection("sorteios").get();
    const jaTirados = [];
    snapshot.docs.forEach(doc => {
      jaTirados.push(doc.data().tirou);
    });

    // Filtra opções válidas:
    // Não pode ser ele mesmo E não pode ter sido tirado por ninguém ainda
    const disponiveis = PARTICIPANTES.filter(nome => 
      nome !== usuarioAtual && !jaTirados.includes(nome)
    );

    if (disponiveis.length === 0) {
      btnGirar.disabled = false;
      return alert("Não há nomes disponíveis para você sortear. Entre em contato com o organizador!");
    }

    // Escolhe aleatoriamente dentre as opções disponíveis
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
        
        // Exibe o nome sorteado final
        rouletteDisplay.innerText = sorteado;
        
        // Salva a decisão no Firebase para que ninguém mais tire esse nome
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
    alert("Ocorreu um erro na conexão. Tente novamente.");
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
