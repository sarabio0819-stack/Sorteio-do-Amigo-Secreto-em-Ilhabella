// Configuração do Firebase
const firebaseConfig = {
  apiKey: "SEU_API_KEY",
  authDomain: "SEU_PROJECT_ID.firebaseapp.com",
  projectId: "SEU_PROJECT_ID",
  storageBucket: "SEU_PROJECT_ID.appspot.com",
  messagingSenderId: "SEU_SENDER_ID",
  appId: "SEU_APP_ID"
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}
const db = firebase.firestore();

// Lista de participantes
const participantes = [
  "Jhon", "Bruna", "Marina", "Isa", "Lucas", "Carlos", "Fernanda"
];

window.addEventListener('DOMContentLoaded', () => {
  const select = document.getElementById('user-select');
  if (select) {
    select.innerHTML = '<option value="">Selecione seu nome</option>';
    participantes.forEach(nome => {
      const option = document.createElement('option');
      option.value = nome;
      option.textContent = nome;
      select.appendChild(option);
    });
  }
});

let usuarioAtual = "";
window.amigoSorteado = "";

async function entrar() {
  const select = document.getElementById('user-select');
  const passwordInput = document.getElementById('password-input');
  
  usuarioAtual = select.value;
  const senha = passwordInput.value;

  if (!usuarioAtual) {
    alert("Por favor, selecione o seu nome.");
    return;
  }

  document.getElementById('user-display-name').innerText = usuarioAtual;

  try {
    const docRef = db.collection("sorteios").doc(usuarioAtual);
    const doc = await docRef.get();

    if (doc.exists) {
      window.amigoSorteado = doc.data().tirou;
      document.getElementById('auth-card').classList.add('hidden');
      document.getElementById('result-card').classList.remove('hidden');
      document.getElementById('drawn-name').innerText = window.amigoSorteado;
    } else {
      document.getElementById('auth-card').classList.add('hidden');
      document.getElementById('wheel-card').classList.remove('hidden');
    }
  } catch (error) {
    document.getElementById('auth-card').classList.add('hidden');
    document.getElementById('wheel-card').classList.remove('hidden');
  }
}

// Função de sorteio chamada pelo index.html
async function sortearAmigo() {
  const possiveis = participantes.filter(nome => nome !== usuarioAtual);
  const sorteado = possiveis[Math.floor(Math.random() * possiveis.length)];
  window.amigoSorteado = sorteado;

  try {
    await db.collection("sorteios").doc(usuarioAtual).set({
      de: usuarioAtual,
      tirou: sorteado,
      data: new Date().toISOString()
    });
  } catch (e) {
    console.log("Salvo localmente.");
  }

  return sorteado;
}

async function reiniciarSorteio() {
  const pass = prompt("Palavra-passe do organizador:");
  if (pass === "velhadoecac") {
    try {
      const snapshot = await db.collection("sorteios").get();
      const batch = db.batch();
      snapshot.docs.forEach(doc => batch.delete(doc.ref));
      await batch.commit();
      alert("Sorteio resetado!");
      location.reload();
    } catch (e) {
      alert("Sorteio resetado localmente!");
      location.reload();
    }
  }
}
