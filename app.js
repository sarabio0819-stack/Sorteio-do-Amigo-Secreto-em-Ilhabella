// ========================================
// CONFIGURAÇÃO DO FIREBASE
// ========================================

// Substitua os valores abaixo pelos dados
// reais do seu projeto Firebase.

const firebaseConfig = {
  apiKey: "SEU_API_KEY",
  authDomain: "SEU_PROJECT_ID.firebaseapp.com",
  projectId: "SEU_PROJECT_ID",
  storageBucket: "SEU_PROJECT_ID.appspot.com",
  messagingSenderId: "SEU_SENDER_ID",
  appId: "SEU_APP_ID"
};

let db = null;

try {
  if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
  }

  db = firebase.firestore();

} catch (error) {
  console.error("Erro ao iniciar o Firebase:", error);
}


// ========================================
// PARTICIPANTES
// ========================================

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


// ========================================
// VARIÁVEIS
// ========================================

let usuarioAtual = "";
let amigoSorteado = "";

let sorteioEmAndamento = false;

let bingoAnimationId = null;
let balls = [];

window.amigoSorteado = "";

const colors = [
  "#ff7675",
  "#74b9ff",
  "#55efc4",
  "#ffeaa7",
  "#a29bfe",
  "#fd79a8",
  "#e17055",
  "#00b894"
];


// ========================================
// INICIALIZAÇÃO
// ========================================

window.addEventListener("DOMContentLoaded", () => {

  const select = document.getElementById("user-select");

  participantes.forEach(nome => {

    const option = document.createElement("option");

    option.value = nome;
    option.textContent = nome;

    select.appendChild(option);

  });

  initBingoCanvas();

});


// ========================================
// ENTRAR NO SITE
// ========================================

async function entrar() {

  const select = document.getElementById("user-select");
  const usuario = select.value;

  if (!usuario) {
    alert("Por favor, selecione o seu nome.");
    return;
  }

  usuarioAtual = usuario;

  document.getElementById("user-display-name").textContent = usuario;

  const enterBtn = document.getElementById("btn-enter");

  enterBtn.disabled = true;

  try {

    if (!db) {
      throw new Error("Firebase não configurado.");
    }

    const doc = await db
      .collection("sorteios")
      .doc(usuarioAtual)
      .get();

    if (doc.exists && doc.data().tirou) {

      amigoSorteado = doc.data().tirou;

      window.amigoSorteado = amigoSorteado;

      mostrarResultado(amigoSorteado);

    } else {

      mostrarGlobo();

    }

  } catch (error) {

    console.error("Erro ao consultar sorteio:", error);

    alert(
      "Não foi possível consultar o sorteio. " +
      "Confira a configuração e a conexão com o Firebase."
    );

    enterBtn.disabled = false;

  }

}


// ========================================
// MOSTRAR GLOBO
// ========================================

function mostrarGlobo() {

  document
    .getElementById("auth-card")
    .classList.add("hidden");

  document
    .getElementById("result-card")
    .classList.add("hidden");

  document
    .getElementById("wheel-card")
    .classList.remove("hidden");

}


// ========================================
// MOSTRAR RESULTADO
// ========================================

function mostrarResultado(nome) {

  document
    .getElementById("auth-card")
    .classList.add("hidden");

  document
    .getElementById("wheel-card")
    .classList.add("hidden");

  document
    .getElementById("result-card")
    .classList.remove("hidden");

  document
    .getElementById("drawn-name")
    .textContent = nome;

}


// ========================================
// ANIMAÇÃO DAS BOLINHAS DO GLOBO
// ========================================

function initBingoCanvas() {

  const canvas = document.getElementById("bingo-canvas");

  if (!canvas) return;

  const ctx = canvas.getContext("2d");

  balls = [];

  // Cria 18 bolinhas coloridas

  for (let i = 0; i < 18; i++) {

    balls.push({

      x: 40 + Math.random() * 120,

      y: 40 + Math.random() * 120,

      radius: 10,

      color: colors[i % colors.length],

      vx: (Math.random() - 0.5) * 3,

      vy: (Math.random() - 0.5) * 3

    });

  }


  // Desenha e movimenta as bolinhas

  function draw() {

    ctx.clearRect(
      0,
      0,
      canvas.width,
      canvas.height
    );

    balls.forEach(ball => {

      ball.x += ball.vx;
      ball.y += ball.vy;

      const dx = ball.x - 100;
      const dy = ball.y - 100;

      const distance = Math.sqrt(
        dx * dx + dy * dy
      );

      // Mantém as bolinhas dentro do globo

      if (distance + ball.radius > 94) {

        const angle = Math.atan2(dy, dx);

        ball.vx =
          -Math.cos(angle) * Math.abs(ball.vx);

        ball.vy =
          -Math.sin(angle) * Math.abs(ball.vy);

        ball.x =
          100 + Math.cos(angle) * (94 - ball.radius);

        ball.y =
          100 + Math.sin(angle) * (94 - ball.radius);

      }


      // Brilho das bolinhas

      const gradient = ctx.createRadialGradient(
        ball.x - 4,
        ball.y - 5,
        1,
        ball.x,
        ball.y,
        ball.radius + 2
      );

      gradient.addColorStop(0, "#ffffff");
      gradient.addColorStop(0.18, ball.color);
      gradient.addColorStop(1, ball.color);


      // Desenha a bolinha

      ctx.beginPath();

      ctx.arc(
        ball.x,
        ball.y,
        ball.radius,
        0,
        Math.PI * 2
      );

      ctx.fillStyle = gradient;
      ctx.fill();

      ctx.lineWidth = 1.5;
      ctx.strokeStyle = "rgba(255,255,255,.9)";
      ctx.stroke();

    });

    bingoAnimationId = requestAnimationFrame(draw);

  }


  if (bingoAnimationId) {
    cancelAnimationFrame(bingoAnimationId);
  }

  draw();

}


// ========================================
// REALIZAR O SORTEIO
// ========================================

async function sortearAmigo() {

  const possiveis = participantes.filter(
    nome => nome !== usuarioAtual
  );

  if (!possiveis.length) {
    throw new Error(
      "Não há participantes disponíveis para o sorteio."
    );
  }

  const sorteado = possiveis[
    Math.floor(Math.random() * possiveis.length)
  ];

  if (!db) {
    throw new Error(
      "Firebase não está configurado. O sorteio não foi salvo."
    );
  }

  await db
    .collection("sorteios")
    .doc(usuarioAtual)
    .set({

      de: usuarioAtual,

      tirou: sorteado,

      data: new Date().toISOString()

    });

  amigoSorteado = sorteado;

  window.amigoSorteado = sorteado;

  return sorteado;

}


// ========================================
// INICIAR SORTEIO E ANIMAÇÃO
// ========================================

async function executarSorteioEAnimacao() {

  if (sorteioEmAndamento) return;

  sorteioEmAndamento = true;

  const btn = document.getElementById("btn-spin");

  btn.disabled = true;

  try {

    const nomeFinal = await sortearAmigo();

    rodarSequenciaCompleta(nomeFinal);

  } catch (error) {

    console.error("Erro ao sortear:", error);

    alert(
      "Não foi possível salvar o sorteio. " +
      "Verifique a conexão e a configuração do Firebase e tente novamente."
    );

    btn.disabled = false;

    sorteioEmAndamento = false;

  }

}


// ========================================
// SEQUÊNCIA DA ANIMAÇÃO
// ========================================

function rodarSequenciaCompleta(nomeSorteado) {

  const btn = document.getElementById("btn-spin");

  const globo = document.getElementById("globo");

  const phraseEl = document.getElementById("bingo-phrase");

  const drawnBall = document.getElementById("drawn-ball");

  const ballName = document.getElementById("ball-name");

  const audio = document.getElementById("bg-music");


  // Limpa a animação anterior

  drawnBall.classList.remove(
    "drop-out",
    "shake-ball",
    "open-ball"
  );

  ballName.textContent = "";


  // Inicia a música

  if (audio) {

    audio.currentTime = 0;

    audio.play().catch(error => {
      console.log("Áudio não iniciado:", error);
    });

  }


  // Aumenta a velocidade das bolinhas

  balls.forEach(ball => {

    ball.vx = (Math.random() - 0.5) * 10;

    ball.vy = (Math.random() - 0.5) * 10;

  });


  // ETAPA 1: GLOBO GIRANDO

  globo.classList.add("shaking");

  phraseEl.textContent = "Agitando o globo...";


  // ETAPA 2: BOLINHA SAINDO

  setTimeout(() => {

    globo.classList.remove("shaking");

    phraseEl.textContent = "A bolinha está saindo!";

    drawnBall.classList.add("drop-out");


    // ETAPA 3: BOLINHA CHACOALHANDO

    setTimeout(() => {

      drawnBall.classList.add("shake-ball");

      phraseEl.textContent =
        "O que será que tem aqui?";


      // ETAPA 4: BOLINHA SE ABRINDO

      setTimeout(() => {

        drawnBall.classList.remove("shake-ball");

        drawnBall.classList.add("open-ball");

        ballName.textContent = nomeSorteado;

        phraseEl.textContent = "SURPRESA!";


        // ETAPA 5: EXPLOSÃO DE CONFETES

        dispararConfetes();


        // ETAPA 6: TELA FINAL

        setTimeout(() => {

          mostrarResultado(nomeSorteado);

          sorteioEmAndamento = false;

          if (btn) {
            btn.disabled = true;
          }

        }, 2000);

      }, 1200);

    }, 1000);

  }, 2500);

}


// ========================================
// EXPLOSÃO DE CONFETES
// ========================================

function dispararConfetes() {

  if (typeof confetti !== "function") return;


  // EXPLOSÃO CENTRAL

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


  // CONFETES À ESQUERDA

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


  // CONFETES À DIREITA

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


// ========================================
// RESETAR SORTEIO
// ========================================

async function reiniciarSorteio() {

  const pass = prompt(
    "Palavra-passe do organizador:"
  );


  // Senha demonstrativa
  // Não é uma proteção segura para produção.

  if (pass !== "admin123") {

    if (pass !== null) {
      alert("Palavra-passe incorreta!");
    }

    return;

  }


  if (!db) {

    alert(
      "Firebase não está configurado. Não foi possível resetar."
    );

    return;

  }


  try {

    const snapshot = await db
      .collection("sorteios")
      .get();

    const batch = db.batch();

    snapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });

    await batch.commit();

    alert("Sorteio resetado com sucesso!");

    location.reload();

  } catch (error) {

    console.error("Erro ao resetar:", error);

    alert(
      "Não foi possível resetar o sorteio. " +
      "Confira a conexão e as permissões do Firebase."
    );

  }

}
