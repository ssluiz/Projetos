const amigos = [];

function adicionarAmigo() {
  const nome = document.getElementById('amigo').value;
  if (nome !== "") {
    amigos.push(nome);
    document.getElementById('amigo').value = "";
    atualizarLista();
  }
}

function atualizarLista() {
  const listaAmigos = document.getElementById('listaAmigos');
  listaAmigos.innerHTML = "";
  amigos.forEach((amigo, index) => {
    const li = document.createElement('li');
    li.textContent = amigo;
    listaAmigos.appendChild(li);
  });
}

function sortearAmigo() {
  if (amigos.length < 2) {
    alert("Adicione pelo menos 2 amigos para sortear!");
    return;
  }
  const amigosEmbaralhados = embaralhar([...amigos]);
  const resultado = document.getElementById('resultado');
  resultado.innerHTML = "";
  amigos.forEach((amigo, index) => {
    const amigoSecreto = amigosEmbaralhados[index];
    const li = document.createElement('li');
    li.textContent = `${amigo} tirou ${amigoSecreto}`;
    resultado.appendChild(li);
  });
}

function embaralhar(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}
