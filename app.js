// ============================================
// AMIGO SECRETO RCT 2026
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

let usuarioAtual = "";
let amigoSorteado = "";
let sorteioEmAndamento = false;
let bolas = [];
let animacaoGlobo = null;

// Chaves para o LocalStorage
const STORAGE_PAIRS = "amigo_secreto_pairs_2026";

// ============================================
// LÓGICA DO SORTEIO (GERAÇÃO FIXA E SECRETA)
// ============================================

// Gera um ciclo perfeito onde ninguém tira a si mesmo
function gerarSorteioCompleto(lista) {
  let embaralhado = [...lista];
  let valido = false;

  while (!valido) {
    // Algoritmo de Fisher-Yates para embaralhar
    for (let i = embaralhado.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [embaralhado[i], embaralhado[j]] = [embaralhado[j], embaralhado[i]];
    }

    // Verifica se ninguém tirou a si mesmo
    valido = true;
    for (let i = 0; i < lista.length; i++) {
      if (lista[i] === embaralhado[i]) {
        valido = false;
        break;
      }
    }
  }

  const mapaSorteio = {};
  lista.forEach((p, index) => {
    mapaSorteio[p] = embaralhado[index];
  });

  return mapaSorteio;
}

// Obtém o mapa do sorteio (ou gera um novo se não existir)
function obterMapaSorteio() {
  let mapa = localStorage.getItem(STORAGE_PAIRS);
  if (!mapa) {
    mapa = gerarSorteioCompleto(participantes);
    localStorage.setItem(STORAGE_PAIRS, JSON.stringify(mapa));
  } else {
    mapa = JSON.parse(mapa);
  }
  return mapa;
}

// ============================================
// INICIALIZAR SITE
// ============================================

window.addEventListener("DOMContentLoaded", () => {
  const select = document.getElementById("user-select");

  if (select) {
    select.innerHTML = '<option value="">Selecione seu nome</option>';

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

function entrar() {
  const select = document.getElementById("user-select");
  const passwordInput = document.getElementById("password-input");
  const btn = document.getElementById("btn-enter");

  const usuario = select.value;
  const senhaDigitada = passwordInput.value;

  if (!usuario) {
    alert("Por favor, selecione seu nome.");
    return;
  }

  if (senhaDigitada !== SENHA) {
    alert("Senha incorreta! Tente novamente.");
    passwordInput.value = "";
    passwordInput.focus();
    return;
  }

  usuarioAtual = usuario;

  document.getElementById("user-display-name").textContent = usuarioAtual;

  // Carrega o sorteio
  const mapa = obterMapaSorteio();
  amigoSorteado = mapa[usuarioAtual];

  // Verifica se o usuário já realizou a animação anteriormente
  const jaViu = localStorage.getItem(`visto_${usuarioAtual}`);

  if (jaViu) {
    mostrarResultado(amigoSorteado);
  } else {
    mostrarGlobo();
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
// BOTÃO DE SORTEAR
// ============================================

function executarSorteioEAnimacao() {
  if (sorteioEmAndamento) return;

  sorteioEmAndamento = true;

  const btn = document.getElementById("btn-spin");
  btn.disabled = true;
  btn.textContent = "Sorteando...";

  rodarSequenciaCompleta(amigoSorteado);
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

  const musica = document.getElementById("bg-music");

  if (musica) {
    musica.currentTime = 0;
    musica.play().catch(() => {});
  }

  bolas.forEach(bola => {
    bola.vx = (Math.random() - 0.5) * 10;
    bola.vy = (Math.random() - 0.5) * 10;
  });

  globo.classList.add("shaking");
  frase.textContent = "Agitando o globo...";

  setTimeout(() => {
    globo.classList.remove("shaking");
    frase.textContent = "A bolinha está saindo!";
    bolinha.classList.add("drop-out");

    setTimeout(() => {
      bolinha.classList.add("shake-ball");
      frase.textContent = "O que será que tem aqui?";

      setTimeout(() => {
        bolinha.classList.remove("shake-ball");
        bolinha.classList.add("open-ball");

        nomeBolinha.textContent = nomeSorteado;
        frase.textContent = "SURPRESA!";

        dispararConfetes();

        // Marca que este usuário já realizou o sorteio
        localStorage.setItem(`visto_${usuarioAtual}`, "true");

        setTimeout(() => {
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

  confetti({
    particleCount: 180,
    spread: 100,
    startVelocity: 45,
    origin: { x: 0.5, y: 0.5 },
    gravity: 0.9,
    ticks: 250,
    scalar: 1.15
  });

  setTimeout(() => {
    confetti({
      particleCount: 70,
      angle: 60,
      spread: 70,
      origin: { x: 0, y: 0.65 }
    });
  }, 150);

  setTimeout(() => {
    confetti({
      particleCount: 70,
      angle: 120,
      spread: 70,
      origin: { x: 1, y: 0.65 }
    });
  }, 300);
}

// ============================================
// RESETAR SORTEIO
// ============================================

function reiniciarSorteio() {
  const senha = prompt("Senha do organizador:");

  if (senha === null) return;

  if (senha !== SENHA) {
    alert("Senha incorreta!");
    return;
  }

  const confirmar = confirm(
    "Tem certeza de que deseja apagar todos os sorteios?"
  );

  if (!confirmar) return;

  // Limpa o sorteio e as visualizações gravadas
  localStorage.removeItem(STORAGE_PAIRS);
  participantes.forEach(p => localStorage.removeItem(`visto_${p}`));

  alert("Sorteio resetado com sucesso!");
  location.reload();
}
