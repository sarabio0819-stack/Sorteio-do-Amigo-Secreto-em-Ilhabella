// ============================================
// AMIGO SECRETO RCT 2026
// ============================================

// CONFIGURAÇÃO DO FIREBASE
// Substitua pelos dados reais do seu projeto.

const firebaseConfig = {
  apiKey: "SEU_API_KEY",
  authDomain: "SEU_PROJECT_ID.firebaseapp.com",
  projectId: "SEU_PROJECT_ID",
  storageBucket: "SEU_PROJECT_ID.appspot.com",
  messagingSenderId: "SEU_SENDER_ID",
  appId: "SEU_APP_ID"
};

// ============================================
// CONFIGURAÇÕES DO SORTEIO
// ============================================

const SENHA = "velhadoecac";

const participantes = [
  "Sara",
  "Efrain",
  "Rubens",
  "Isa",
  "Jean",
  "Kay",
  "Jhon",
  "Bruna",
  "Rennan"
];

let db = null;
let usuarioAtual = "";
let amigoSorteado = "";
let sorteioEmAndamento = false;
let bolas = [];
let animacaoGlobo = null;

// ============================================
// INICIALIZAR FIREBASE
// ============================================

try {
  if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
  }

  db = firebase.firestore();

  console.log("Firebase inicializado.");

} catch (erro) {
  console.error("Erro ao inicializar Firebase:", erro);
}

// ============================================
// INICIALIZAR SITE
// ============================================

window.addEventListener("DOMContentLoaded", () => {
  const select = document.getElementById("user-select");

  if (select) {
    select.innerHTML =
      '<option value="">Selecione seu nome</option>';

    participantes.forEach(nome => {
      const option = document.createElement("option");

      option.value = nome;
      option.textContent = nome;

      select.appendChild(option);
    });
  }

  iniciarGlobo();
});

// ============================================
// ENTRAR NO SITE
// ============================================

async function entrar() {
  const select = document.getElementById("user-select");
  const passwordInput = document.getElementById("password-input");
  const btn = document.getElementById("btn-enter");

  const usuario = select.value;
  const senhaDigitada = passwordInput.value;

  // Verificar nome
  if (!usuario) {
    alert("Por favor, selecione seu nome.");
    return;
  }

  // VERIFICAR SENHA
  if (senhaDigitada !== SENHA) {
    alert("Senha incorreta! Tente novamente.");
    passwordInput.value = "";
    passwordInput.focus();
    return;
  }

  usuarioAtual = usuario;

  document.getElementById("user-display-name").textContent =
    usuarioAtual;

  btn.disabled = true;
  btn.textContent = "Verificando...";

  // Verificar Firebase
  if (!db) {
    alert(
      "O Firebase não foi inicializado. " +
      "Confira as credenciais no arquivo app.js."
    );

    btn.disabled = false;
    btn.textContent = "Entrar 🌊";
    return;
  }

  try {
    const docRef = db.collection("sorteios").doc(usuarioAtual);
    const doc = await docRef.get();

    if (doc.exists && doc.data().tirou) {
      amigoSorteado = doc.data().tirou;
      window.amigoSorteado = amigoSorteado;

      mostrarResultado(amigoSorteado);
    } else {
      mostrarGlobo();
    }

  } catch (erro) {
    console.error("Erro ao consultar o Firebase:", erro);

    alert(
      "Não foi possível consultar o sorteio.\n\n" +
      "Verifique:\n" +
      "1. As credenciais do Firebase.\n" +
      "2. As regras do Firestore.\n" +
      "3. A conexão com a internet."
    );

    btn.disabled = false;
    btn.textContent = "Entrar 🌊";
  }
}

// ============================================
// MOSTRAR GLOBO
// ============================================

function mostrarGlobo() {
  document.getElementById("auth-card").classList.add("hidden");

  document.getElementById("result-card").classList.add("hidden");

  document.getElementById("wheel-card").classList.remove("hidden");
}

// ============================================
// MOSTRAR RESULTADO
// ============================================

function mostrarResultado(nome) {
  document.getElementById("auth-card").classList.add("hidden");

  document.getElementById("wheel-card").classList.add("hidden");

  document.getElementById("result-card").classList.remove("hidden");

  document.getElementById("drawn-name").textContent = nome;
}

// ============================================
// GLOBO COM BOLINHAS COLORIDAS
// ============================================

function iniciarGlobo() {
  const canvas = document.getElementById("bingo-canvas");

  if (!canvas) return;

  const ctx = canvas.getContext("2d");

  const cores = [
    "#ff7675",
    "#74b9ff",
    "#55efc4",
    "#ffeaa7",
    "#a29bfe",
    "#fd79a8",
    "#e17055",
    "#00b894"
  ];

  bolas = [];

  for (let i = 0; i < 18; i++) {
    bolas.push({
      x: 35 + Math.random() * 130,
      y: 35 + Math.random() * 130,
      raio: 10,
      cor: cores[i % cores.length],
      vx: (Math.random() - 0.5) * 3,
      vy: (Math.random() - 0.5) * 3
    });
  }

  function desenhar() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    bolas.forEach(bola => {
      bola.x += bola.vx;
      bola.y += bola.vy;

      const dx = bola.x - 100;
      const dy = bola.y - 100;
      const distancia = Math.sqrt(dx * dx + dy * dy);

      if (distancia + bola.raio > 94) {
        const angulo = Math.atan2(dy, dx);

        bola.vx = -Math.cos(angulo) * Math.abs(bola.vx);
        bola.vy = -Math.sin(angulo) * Math.abs(bola.vy);

        bola.x = 100 + Math.cos(angulo) * (94 - bola.raio);
        bola.y = 100 + Math.sin(angulo) * (94 - bola.raio);
      }

      const gradiente = ctx.createRadialGradient(
        bola.x - 4,
        bola.y - 5,
        1,
        bola.x,
        bola.y,
        bola.raio + 2
      );

      gradiente.addColorStop(0, "#ffffff");
      gradiente.addColorStop(0.2, bola.cor);
      gradiente.addColorStop(1, bola.cor);

      ctx.beginPath();
      ctx.arc(
        bola.x,
        bola.y,
        bola.raio,
        0,
        Math.PI * 2
      );

      ctx.fillStyle = gradiente;
      ctx.fill();

      ctx.lineWidth = 1.5;
      ctx.strokeStyle = "rgba(255,255,255,0.9)";
      ctx.stroke();
    });

    animacaoGlobo = requestAnimationFrame(desenhar);
  }

  if (animacaoGlobo) {
    cancelAnimationFrame(animacaoGlobo);
  }

  desenhar();
}

// ============================================
// REALIZAR SORTEIO
// ============================================

async function sortearAmigo() {
  const possiveis = participantes.filter(
    nome => nome !== usuarioAtual
  );

  if (possiveis.length === 0) {
    throw new Error("Não há participantes disponíveis.");
  }

  const sorteado =
    possiveis[Math.floor(Math.random() * possiveis.length)];

  if (!db) {
    throw new Error("Firebase não está configurado.");
  }

  // Verificar novamente se o participante já sorteou
  const docRef = db.collection("sorteios").doc(usuarioAtual);
  const documento = await docRef.get();

  if (documento.exists && documento.data().tirou) {
    return documento.data().tirou;
  }

  // Salvar resultado
  await docRef.set({
    de: usuarioAtual,
    tirou: sorteado,
    data: new Date().toISOString()
  });

  amigoSorteado = sorteado;
  window.amigoSorteado = sorteado;

  return sorteado;
}

// ============================================
// BOTÃO DE SORTEAR
// ============================================

async function executarSorteioEAnimacao() {
  if (sorteioEmAndamento) return;

  sorteioEmAndamento = true;

  const btn = document.getElementById("btn-spin");

  btn.disabled = true;
  btn.textContent = "Sorteando...";

  try {
    const nome = await sortearAmigo();

    rodarSequenciaCompleta(nome);

  } catch (erro) {
    console.error("Erro ao realizar sorteio:", erro);

    alert(
      "Não foi possível realizar o sorteio.\n\n" +
      "Confira as configurações do Firebase e tente novamente."
    );

    btn.disabled = false;
    btn.textContent = "🎰 Sortear Amigo Secreto";

    sorteioEmAndamento = false;
  }
}

// ============================================
// ANIMAÇÃO COMPLETA
// ============================================

function rodarSequenciaCompleta(nomeSorteado) {
  const globo = document.getElementById("globo");
  const frase = document.getElementById("bingo-phrase");
  const bolinha = document.getElementById("drawn-ball");
  const nomeBolinha = document.getElementById("ball-name");

  const btn = document.getElementById("btn-spin");

  bolinha.classList.remove(
    "drop-out",
    "shake-ball",
    "open-ball"
  );

  nomeBolinha.textContent = "";

  // Música opcional
  const musica = document.getElementById("bg-music");

  if (musica) {
    musica.currentTime = 0;
    musica.play().catch(() => {});
  }

  // Aumentar a velocidade das bolinhas
  bolas.forEach(bola => {
    bola.vx = (Math.random() - 0.5) * 10;
    bola.vy = (Math.random() - 0.5) * 10;
  });

  // ETAPA 1: GLOBO GIRANDO
  globo.classList.add("shaking");
  frase.textContent = "Agitando o globo...";

  setTimeout(() => {
    // ETAPA 2: BOLINHA SAI
    globo.classList.remove("shaking");

    frase.textContent = "A bolinha está saindo!";

    bolinha.classList.add("drop-out");

    setTimeout(() => {
      // ETAPA 3: BOLINHA CHACOALHA
      bolinha.classList.add("shake-ball");

      frase.textContent = "O que será que tem aqui?";

      setTimeout(() => {
        // ETAPA 4: BOLINHA ABRE
        bolinha.classList.remove("shake-ball");
        bolinha.classList.add("open-ball");

        nomeBolinha.textContent = nomeSorteado;

        frase.textContent = "SURPRESA!";

        // ETAPA 5: CONFETES
        dispararConfetes();

        setTimeout(() => {
          // ETAPA 6: RESULTADO
          mostrarResultado(nomeSorteado);

          sorteioEmAndamento = false;
          btn.disabled = true;

        }, 2000);

      }, 1200);

    }, 1000);

  }, 2500);
}

// ============================================
// EXPLOSÃO DE CONFETES
// ============================================

function dispararConfetes() {
  if (typeof confetti !== "function") return;

  // Explosão central
  confetti({
    particleCount: 180,
    spread: 100,
    startVelocity: 45,
    origin: {
      x: 0.5,
      y: 0.5
    },
    gravity: 0.9,
    ticks: 250,
    scalar: 1.15
  });

  // Confetes à esquerda
  setTimeout(() => {
    confetti({
      particleCount: 70,
      angle: 60,
      spread: 70,
      origin: {
        x: 0,
        y: 0.65
      }
    });
  }, 150);

  // Confetes à direita
  setTimeout(() => {
    confetti({
      particleCount: 70,
      angle: 120,
      spread: 70,
      origin: {
        x: 1,
        y: 0.65
      }
    });
  }, 300);
}

// ============================================
// RESETAR SORTEIO
// ============================================

async function reiniciarSorteio() {
  const senha = prompt("Senha do organizador:");

  if (senha === null) return;

  if (senha !== SENHA) {
    alert("Senha incorreta!");
    return;
  }

  if (!db) {
    alert("Firebase não está configurado.");
    return;
  }

  const confirmar = confirm(
    "Tem certeza de que deseja apagar todos os sorteios?"
  );

  if (!confirmar) return;

  try {
    const snapshot = await db.collection("sorteios").get();

    // O Firestore permite até 500 operações por lote.
    // Esta implementação divide a exclusão em lotes.
    const documentos = snapshot.docs;

    for (let i = 0; i < documentos.length; i += 500) {
      const batch = db.batch();

      documentos.slice(i, i + 500).forEach(doc => {
        batch.delete(doc.ref);
      });

      await batch.commit();
    }

    alert("Sorteio resetado com sucesso!");

    location.reload();

  } catch (erro) {
    console.error("Erro ao resetar sorteio:", erro);

    alert(
      "Não foi possível resetar o sorteio. " +
      "Verifique as permissões do Firebase."
    );
  }
}
