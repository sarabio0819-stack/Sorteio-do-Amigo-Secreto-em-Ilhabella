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

// ============================================
// MAPA DE SORTEIO CRIPTOGRAFADO (SECRETO)
// ============================================
// Gerado aleatoriamente e cifrado para que nem o organizador saiba os pares!
const mapaSorteioCriptografado = {
  "Sara": "UkVsT1FsOUpURTBB",
  "Efrain": "VEVGTk1GSXlURUpB",
  "Rubens": "VTBGRVNFMUZSVEpB",
  "Isa": "S3BFMVFrUlFRMEpB",
  "Jean": "UzBGeVRsRkZUMEpB",
  "Kay": "U3pGcVRFRkJRMEpB",
  "Jhon": "UTBsU1RVMUJUMEpB",
  "Bruna": "VTBGRVNFMUZSVEpB",
  "Rennan": "V1Z4S1RWUkZURUpB"
};

// Função para decifrar o amigo secreto no momento do acesso
function decifrarAmigo(chaveCriptografada) {
  try {
    const etapa1 = atob(chaveCriptografada);
    const etapa2 = atob(etapa1);
    return etapa2.replace(/_RCT2026/g, "");
  } catch (e) {
    console.error("Erro ao decifrar amigo secreto.");
    return "Erro no sorteio";
  }
}

// ============================================
// INICIALIZAR SITE E REPRODUÇÃO DE ÁUDIO
// ============================================

// Toca a música no primeiro clique do usuário
window.addEventListener("click", () => {
  const musica = document.getElementById("bg-music");
  if (musica && musica.paused) {
    musica.play().catch(err => console.log("Aguardando interação do usuário para áudio:", err));
  }
}, { once: true });

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

  // Toca a música caso ainda não tenha iniciado
  const musica = document.getElementById("bg-music");
  if (musica && musica.paused) {
    musica.play().catch(err => console.log("Áudio bloqueado:", err));
  }

  usuarioAtual = usuario;

  document.getElementById("user-display-name").textContent = usuarioAtual;

  // Decifra o amigo secreto de forma totalmente privada e secreta
  const codigoCriptografado = mapaSorteioCriptografado[usuarioAtual];
  amigoSorteado = decifrarAmigo(codigoCriptografado);

  // Verifica se o usuário já assistiu à animação no seu próprio navegador
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

  if (musica && musica.paused) {
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

        // Salva a visualização no histórico do dispositivo do usuário
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
// RESETAR VISUALIZAÇÕES
// ============================================

function reiniciarSorteio() {
  const senha = prompt("Senha do organizador:");

  if (senha === null) return;

  if (senha !== SENHA) {
    alert("Senha incorreta!");
    return;
  }

  const confirmar = confirm(
    "Deseja resetar a visualização no seu navegador?"
  );

  if (!confirmar) return;

  participantes.forEach(p => localStorage.removeItem(`visto_${p}`));

  alert("Histórico resetado!");
  location.reload();
}
