// Configuração do Firebase (substitua pelas suas credenciais se necessário)
const firebaseConfig = {
  apiKey: "SEU_API_KEY",
  authDomain: "SEU_PROJECT_ID.firebaseapp.com",
  projectId: "SEU_PROJECT_ID",
  storageBucket: "SEU_PROJECT_ID.appspot.com",
  messagingSenderId: "SEU_SENDER_ID",
  appId: "SEU_APP_ID"
};

// Inicializa o Firebase
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}
const db = firebase.firestore();

// Lista de participantes (exemplo)
const participantes = [
  "Bruna", "Marina", "Isa", "Lucas", "Carlos", "Fernanda"
];

// Preenche o <select> com os nomes ao carregar a página
window.addEventListener('DOMContentLoaded', () => {
  const select = document.getElementById('user-select');
  if (select) {
    participantes.forEach(nome => {
      const option = document.createElement('option');
      option.value = nome;
      option.textContent = nome;
      select.appendChild(option);
    });
  }
});

// Variáveis globais de sessão
let usuarioAtual = "";
window.amigoSorteado = "";

// Função de Login/Entrada
async function entrar() {
  const select = document.getElementById('user-select');
  const passwordInput = document.getElementById('password-input');
  
  const usuario = select.value;
  const senha = passwordInput.value;

  if (!usuario) {
    alert("Por favor, selecione o seu nome.");
    return;
  }

  // Palavra-passe simples de validação (exemplo: "1234" ou o próprio nome)
  if (senha !== "1234" && senha.toLowerCase() !== usuario.toLowerCase()) {
    alert("Palavra-passe incorreta!");
    return;
  }

  usuarioAtual = usuario;
  document.getElementById('user-display-name').innerText = usuario;

  // Verifica no Firestore se o utilizador já realizou o sorteio
  try {
    const docRef = db.collection("sorteios").doc(usuario);
    const doc = await docRef.get();

    if (doc.exists) {
      // Já realizou o sorteio anteriormente
      window.amigoSorteado = doc.data().tirou;
      document.getElementById('auth-card').classList.add('hidden');
      document.getElementById('result-card').classList.remove('hidden');
      document.getElementById('drawn-name').innerText = window.amigoSorteado;
    } else {
      // Novo sorteio pendente
      document.getElementById('auth-card').classList.add('hidden');
      document.getElementById('wheel-card').classList.remove('hidden');
    }
  } catch (error) {
    console.warn("Aviso: Banco de dados indisponível, a rodar localmente.", error);
    // Modo Fallback local caso o Firebase não esteja configurado
    document.getElementById('auth-card').classList.add('hidden');
    document.getElementById('wheel-card').classList.remove('hidden');
  }
}

// Lógica de Sorteio chamada pelo botão "Sortear Amigo Secreto"
async function girarRoleta() {
  // Filtra para não tirar a si próprio
  const possiveis = participantes.filter(nome => nome !== usuarioAtual);
  
  // Escolhe um nome aleatório
  const sorteado = possiveis[Math.floor(Math.random() * possiveis.length)];
  window.amigoSorteado = sorteado;

  // Guarda o resultado no Firestore
  try {
    await db.collection("sorteios").doc(usuarioAtual).set({
      de: usuarioAtual,
      tirou: sorteado,
      data: new Date().toISOString()
    });
  } catch (e) {
    console.log("Sorteio realizado localmente:", sorteado);
  }
}

// Reset para o organizador limpar os resultados no banco
async function reiniciarSorteio() {
  const pass = prompt("Digite a palavra-passe do organizador para resetar:");
  if (pass === "admin123") {
    try {
      const snapshot = await db.collection("sorteios").get();
      const batch = db.batch();
      snapshot.docs.forEach(doc => batch.delete(doc.ref));
      await batch.commit();
      alert("Sorteio resetado com sucesso!");
      location.reload();
    } catch (e) {
      alert("Sorteio resetado localmente!");
      location.reload();
    }
  } else if (pass) {
    alert("Palavra-passe incorreta!");
  }
}
