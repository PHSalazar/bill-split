function addUserIn(user) {
  var eleParent = document.getElementById('relatorio');
  
  // Criar elemento para usuário
  elementP = document.createElement('p');
  elementP.classList.add('card-post-item');
  elementP.textContent = user.toLowerCase();
  
  // Criar notai para visualizar ou gerar relatório
  elementButton = document.createElement('button');
  elementButton.classList.add('card-post-button');
  elementButton.textContent = 'Gerar';
  
  // Adicionar botão ao elemento criado
  elementP.appendChild(elementButton);
  
  // Adicionar usuário ao documento
  eleParent.appendChild(elementP);
}

addUserIn('Pedro');
addUserIn('Milena');
addUserIn('Guilherme');