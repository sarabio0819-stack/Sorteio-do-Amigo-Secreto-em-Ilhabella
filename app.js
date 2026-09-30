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

// 1. PARTICIPANTES E SENHA
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

// Cores vibrantes estilo roleta da foto
const CORES = ["#e91e63", "#3f51b5", "#ffeb3b", "#e91e63", "#3f51b5", "#ffeb3b", "#e91e63", "#3f51b5"];
const jsConfetti = new JSConfetti();

let currentAngle = 0;
let isSpinning = false;

window.onload = () => {
  const select = document.getElementById("user-select");
  select.innerHTML = '<option value="">-- Selecione seu nome --</option>';

  PARTICIPANTES.sort().forEach(nome => {
    const opt = document.createElement("option");
    opt.value = nome;
    opt.textContent = nome;
    select.appendChild(opt);
  });

  desenharRoleta(0);
};

// 2. DESENHO DA ROLETA NO CANVAS (Igual à imagem)
function desenharRoleta(angleOffset) {
  const canvas = document.getElementById("wheel-canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const numSlices = PARTICIPANTES.length;
  const sliceAngle = (2 * Math.PI) / numSlices;
  const radius = canvas.width / 2;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Borda Externa Dourada com Luzes
  ctx.beginPath();
  ctx.arc(radius, radius, radius - 5, 0, 2 * Math.PI);
  ctx.fillStyle = "#d4af37"; // Cor Dourada
  ctx.fill();
  ctx.lineWidth = 4;
  ctx.strokeStyle = "#8b6b14";
  ctx.stroke();

  // Desenhar lâmpadas/luzes no aro exterior
  const numLights = 16;
  for (let i = 0; i < numLights; i++) {
    const lightAngle = (i * 2 * Math.PI) / numLights;
    const lx = radius + (radius - 12) * Math.cos(lightAngle);
    const ly = radius + (radius - 12) * Math.sin(lightAngle);
    ctx.beginPath();
    ctx.arc(lx, ly, 4, 0, 2 * Math.PI);
    ctx.fillStyle = i % 2 === 0 ? "#ffffff" : "#ffe082";
    ctx.fill();
  }

  // Raio interno do círculo das fatias
  const innerRadius = radius - 20;

  // Fatias
  ctx.save();
  ctx.translate(radius, radius);
  ctx.rotate(angleOffset);

  for (let i = 0; i < numSlices; i++) {
    const startAngle = i * sliceAngle;
    const endAngle = startAngle + sliceAngle;

    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, innerRadius, startAngle, endAngle);
    ctx.closePath();
    ctx.fillStyle = CORES[i % CORES.length];
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = "#ffffff";
    ctx.stroke();

    // Texto do Nome
    ctx.save();
    ctx.rotate(startAngle + sliceAngle / 2);
    ctx.textAlign = "right";
    ctx.fillStyle = CORES[i % CORES.length] === "#ffeb3b" ? "#222222" : "#ffffff";
    ctx.font = "bold 15px Segoe UI, sans-serif";
    ctx.fillText(PARTICIPANTES[i], innerRadius - 20, 5);
    ctx.restore();
  }

  // Centro Dourado
  ctx.beginPath();
  ctx.arc(0, 0, 32, 0, 2 * Math.PI);
  ctx.fillStyle = "#d4af37";
  ctx.fill();
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 3;
  ctx.stroke();

  ctx.restore();
}

// 3. ENTRADA/LOGIN
async function entrar() {
  const nomeSelecionado = document.getElementById("user-select").value;
  const senhaDigitada = document.getElementById("password-input").value.trim();

  if (!nomeSelecionado) return alert("Por favor, selecione seu nome!");
  if (senhaDigitada !== SENHA_CORRETA) return alert("Palavra-passe incorreta!");

  usuarioAtual = nomeSelecionado;

  document.getElementById("auth-card").classList.add("hidden");
  document.getElementById("user-display-name").innerText = usuarioAtual;

  // Verificar se o usuário já realizou o sorteio antes
  try {
    const docRef = await db.collection("sorteios").doc(usuarioAtual).get();
    if (docRef.exists) {
      jaSorteou = true;
      const tirado = docRef.data().tirou;
      exibirTelaFinal(tirado);
    } else {
      document.getElementById("wheel-card").classList.remove("hidden");
      desenharRoleta(0);
    }
  } catch (error) {
    console.error("Erro na verificação:", error);
  }
}

// 4. GIRAR ROLETA E SORTEAR
async function girarRoleta() {
  if (jaSorteou || isSpinning) return;

  const btnSpin = document.getElementById("btn-spin");
  btnSpin.disabled = true;

  try {
    // Buscar quem já foi sorteado no Firebase
    const snapshot = await db.collection("sorteios").get();
    const jaTirados = snapshot.docs.map(doc => doc.data().tirou);

    // Filtro: Não pode ser ele mesmo e não pode já ter sido sorteado por outro
    const disponiveis = PARTICIPANTES.filter(nome => nome !== usuarioAtual && !jaTirados.includes(nome));

    if (disponiveis.length === 0) {
      btnSpin.disabled = false;
      return alert("Não há nomes disponíveis para sorteio no momento!");
    }

    const sorteado = disponiveis[Math.floor(Math.random() * disponiveis.length)];
    const targetIndex = PARTICIPANTES.indexOf(sorteado);

    // Calcular o ângulo exato para o ponteiro parar no nome sorteado
    const numSlices = PARTICIPANTES.length;
    const sliceAngle = (2 * Math.PI) / numSlices;
    
    // Ponteiro está no topo (270 graus ou 1.5 * PI)
    const targetAngle = (1.5 * Math.PI) - (targetIndex * sliceAngle + sliceAngle / 2);
    const extraRounds = 5 * 2 * Math.PI; // 5 voltas completas de animação
    const finalAngle = currentAngle + extraRounds + (targetAngle - (currentAngle % (2 * Math.PI)));

    isSpinning = true;
    const startTime = performance.now();
    const duration = 4500; // 4.5 segundos de giro

    function animateWheel(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Suavização da desaceleração (Ease Out Cubic)
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const angle = currentAngle + (finalAngle - currentAngle) * easeOut;

      desenharRoleta(angle);

      if (progress < 1) {
        requestAnimationFrame(animateWheel);
      } else {
        currentAngle = finalAngle;
        isSpinning = false;

        // Salvar no banco de dados
        db.collection("sorteios").doc(usuarioAtual).set({
          tirou: sorteado,
          data: new Date().toISOString()
        }).then(() => {
          jaSorteou = true;
          exibirTelaFinal(sorteado);
        });
      }
    }

    requestAnimationFrame(animateWheel);

  } catch (error) {
    console.error("Erro ao girar:", error);
    btnSpin.disabled = false;
    alert("Erro na conexão. Tente novamente.");
  }
}

// 5. TELA FINAL + CONFETES
function exibirTelaFinal(nomeSorteado) {
  document.getElementById("wheel-card").classList.add("hidden");
  
  const resultCard = document.getElementById("result-card");
  document.getElementById("drawn-name").innerText = nomeSorteado;
  resultCard.classList.remove("hidden");

  // Solta chuva de confetes festivos!
  jsConfetti.addConfetti({
    emojis: ['🎉', '🎁', '✨', '🎄'],
    emojiSize: 30,
    confettiNumber: 60,
  });
  
  jsConfetti.addConfetti({
    confettiColors: ['#ff0000', '#00ff00', '#ffffff', '#ffeb3b'],
    confettiRadius: 6,
    confettiNumber: 100,
  });
}
