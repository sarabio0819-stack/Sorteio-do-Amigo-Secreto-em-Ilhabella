// Configuração do Firebase
const firebaseConfig = {
  apiKey: "SEU_API_KEY",
  authDomain: "SEU_PROJECT.firebaseapp.com",
  projectId: "SEU_PROJECT_ID",
  storageBucket: "SEU_PROJECT.appspot.com",
  messagingSenderId: "SEU_SENDER_ID",
  appId: "SEU_APP_ID"
};

// Inicialização segura do Firebase
let db = null;
try {
  if (firebaseConfig.apiKey !== "SEU_API_KEY") {
    firebase.initializeApp(firebaseConfig);
    db = firebase.firestore();
  }
} catch (e) {
  console.warn("Firebase não configurado. Usando modo de teste local.", e);
}

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

// Cores vibrantes estilo cassino
const CORES = ["#e91e63", "#3f51b5", "#ffeb3b", "#e91e63", "#3f51b5", "#ffeb3b", "#e91e63", "#3f51b5"];

let currentAngle = 0;
let isSpinning = false;

window.onload = () => {
  const select = document.getElementById("user-select");
  if (!select) return;
  select.innerHTML = '<option value="">-- Selecione seu nome --</option>';

  [...PARTICIPANTES].sort().forEach(nome => {
    const opt = document.createElement("option");
    opt.value = nome;
    opt.textContent = nome;
    select.appendChild(opt);
  });
};

// 2. DESENHO DA ROLETA NO CANVAS
function desenharRoleta(angleOffset) {
  const canvas = document.getElementById("wheel-canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const numSlices = PARTICIPANTES.length;
  const sliceAngle = (2 * Math.PI) / numSlices;
  const radius = canvas.width / 2;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Borda Externa Dourada
  ctx.beginPath();
  ctx.arc(radius, radius, radius - 5, 0, 2 * Math.PI);
  ctx.fillStyle = "#d4af37";
  ctx.fill();
  ctx.lineWidth = 4;
  ctx.strokeStyle = "#8b6b14";
  ctx.stroke();

  // Luzes no aro
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

    // Nomes
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

  let tiradoAnteriormente = null;

  // Tenta verificar via Firebase ou via LocalStorage
  if (db) {
    try {
      const docRef = await db.collection("sorteios").doc(usuarioAtual).get();
      if (docRef.exists) {
        tiradoAnteriormente = docRef.data().tirou;
      }
    } catch (e) {
      console.error(e);
    }
  } else {
    tiradoAnteriormente = localStorage.getItem("sorteio_" + usuarioAtual);
  }

  if (tiradoAnteriormente) {
    jaSorteou = true;
    exibirTelaFinal(tiradoAnteriormente);
  } else {
    document.getElementById("wheel-card").classList.remove("hidden");
    setTimeout(() => desenharRoleta(0), 100);
  }
}

// 4. GIRAR ROLETA
async function girarRoleta() {
  if (jaSorteou || isSpinning) return;

  const btnSpin = document.getElementById("btn-spin");
  btnSpin.disabled = true;

  let jaTirados = [];

  // Busca nomes já tirados
  if (db) {
    try {
      const snapshot = await db.collection("sorteios").get();
      jaTirados = snapshot.docs.map(doc => doc.data().tirou);
    } catch (e) {
      console.error(e);
    }
  } else {
    // Modo local para testes
    PARTICIPANTES.forEach(p => {
      const val = localStorage.getItem("sorteio_" + p);
      if (val) jaTirados.push(val);
    });
  }

  const disponiveis = PARTICIPANTES.filter(nome => nome !== usuarioAtual && !jaTirados.includes(nome));

  if (disponiveis.length === 0) {
    btnSpin.disabled = false;
    return alert("Não há nomes disponíveis para sorteio no momento!");
  }

  const sorteado = disponiveis[Math.floor(Math.random() * disponiveis.length)];
  const targetIndex = PARTICIPANTES.indexOf(sorteado);

  const numSlices = PARTICIPANTES.length;
  const sliceAngle = (2 * Math.PI) / numSlices;
  const targetAngle = (1.5 * Math.PI) - (targetIndex * sliceAngle + sliceAngle / 2);
  const extraRounds = 5 * 2 * Math.PI;
  const finalAngle = currentAngle + extraRounds + (targetAngle - (currentAngle % (2 * Math.PI)));

  isSpinning = true;
  const startTime = performance.now();
  const duration = 4500;

  function animateWheel(now) {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const easeOut = 1 - Math.pow(1 - progress, 3);
    const angle = currentAngle + (finalAngle - currentAngle) * easeOut;

    desenharRoleta(angle);

    if (progress < 1) {
      requestAnimationFrame(animateWheel);
    } else {
      currentAngle = finalAngle;
      isSpinning = false;

      // Salva o resultado
      if (db) {
        db.collection("sorteios").doc(usuarioAtual).set({
          tirou: sorteado,
          data: new Date().toISOString()
        }).then(() => {
          jaSorteou = true;
          exibirTelaFinal(sorteado);
        });
      } else {
        localStorage.setItem("sorteio_" + usuarioAtual, sorteado);
        jaSorteou = true;
        exibirTelaFinal(sorteado);
      }
    }
  }

  requestAnimationFrame(animateWheel);
}

// 5. REVELAÇÃO E CONFETES
function exibirTelaFinal(nomeSorteado) {
  document.getElementById("wheel-card").classList.add("hidden");
  
  const resultCard = document.getElementById("result-card");
  document.getElementById("drawn-name").innerText = nomeSorteado;
  resultCard.classList.remove("hidden");

  // Disparo seguro dos confetes
  try {
    if (typeof JSConfetti !== 'undefined') {
      const jsConfetti = new JSConfetti();
      jsConfetti.addConfetti({
        emojis: ['🎉', '🎁', '✨', '🎄'],
        emojiSize: 30,
        confettiNumber: 60,
      });
    }
  } catch (e) {
    console.log("Confetes indisponíveis:", e);
  }
}

// 6. REINICIAR / RESETAR SORTEIO DO ZERO
async function reiniciarSorteio() {
  const confirmacao = confirm("⚠️ Tem certeza que deseja apagar TODOS os sorteios e começar do ZERO?\nEsta ação não pode ser desfeita.");
  
  if (!confirmacao) return;

  try {
    // Limpa banco do Firebase (se configurado)
    if (db) {
      const snapshot = await db.collection("sorteios").get();
      const batch = db.batch();
      snapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
      });
      await batch.commit();
    }

    // Limpa os dados de teste salvos localmente
    PARTICIPANTES.forEach(p => {
      localStorage.removeItem("sorteio_" + p);
    });

    alert("✅ Sorteio reiniciado com sucesso! Todos os nomes foram liberados.");
    window.location.reload();

  } catch (e) {
    console.error("Erro ao reiniciar:", e);
    alert("Ocorreu um erro ao reiniciar. Verifique a conexão.");
  }
}
