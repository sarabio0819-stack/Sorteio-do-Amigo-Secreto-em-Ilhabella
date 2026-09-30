// Substitua pelas suas credenciais do Firebase Console
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

let currentUser = null;

// Login Simples via Nome
async function login() {
  const nameInput = document.getElementById('username-input').value.trim();
  if (!nameInput) return alert("Por favor, digite seu nome!");

  currentUser = nameInput;
  localStorage.setItem('amigo_secreto_user', currentUser);

  // Registra participante no banco de dados
  await db.collection('participants').doc(currentUser).set({
    name: currentUser
  }, { merge: true });

  carregarInterface();
}

function carregarInterface() {
  document.getElementById('auth-section').classList.add('hidden');
  document.getElementById('app-section').classList.remove('hidden');
  document.getElementById('user-display-name').innerText = currentUser;

  escutarMudancas();
}

function escutarMudancas() {
  // Lista de participantes atualizada em tempo real
  db.collection('participants').onSnapshot(snapshot => {
    const list = document.getElementById('participant-list');
    list.innerHTML = '';
    document.getElementById('participant-count').innerText = snapshot.docs.length;
    
    snapshot.docs.forEach(doc => {
      const li = document.createElement('li');
      li.textContent = doc.data().name;
      list.appendChild(li);
    });
  });

  // Escuta o resultado do sorteio
  db.collection('draws').doc(currentUser).onSnapshot(doc => {
    if (doc.exists) {
      document.getElementById('target-name').innerText = doc.data().assignedTo;
    } else {
      document.getElementById('target-name').innerText = "Sorteio ainda não realizado!";
    }
  });
}

function toggleReveal() {
  const target = document.getElementById('target-name');
  const btn = document.getElementById('reveal-btn');
  if (target.classList.contains('hidden')) {
    target.classList.remove('hidden');
    btn.innerText = "Esconder";
  } else {
    target.classList.add('hidden');
    btn.innerText = "Clique para Revelar";
  }
}

// Algoritmo de Sorteio (Derangement: ninguém tira a si mesmo)
async function realizarSorteio() {
  const snapshot = await db.collection('participants').get();
  const names = snapshot.docs.map(doc => doc.data().name);

  if (names.length < 3) {
    return alert("É necessário pelo menos 3 pessoas para o sorteio!");
  }

  let shuffled = [...names];
  let isValid = false;

  // Garante que ninguém tira a si mesmo (Derangement / Desarranjo)
  while (!isValid) {
    // Embaralha (Fisher-Yates)
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    // Valida se algum participante tirou a si mesmo
    isValid = names.every((name, index) => name !== shuffled[index]);
  }

  // Salva os resultados no banco de dados
  const batch = db.batch();
  names.forEach((giver, index) => {
    const receiver = shuffled[index];
    const ref = db.collection('draws').doc(giver);
    batch.set(ref, { assignedTo: receiver });
  });

  await batch.commit();
  alert("Sorteio realizado com sucesso! Cada um já pode visualizar seu amigo secreto ao entrar.");
}

// Manter usuário logado ao recarregar a página
window.onload = () => {
  const savedUser = localStorage.getItem('amigo_secreto_user');
  if (savedUser) {
    currentUser = savedUser;
    carregarInterface();
  }
};
