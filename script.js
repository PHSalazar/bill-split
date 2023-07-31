var fullText = ''; //Fatura completa
// Variável para armazenar o total
var total = 0.00;
var repetirClone = 0;

function extractTextFromPage() {
    var fileInput = document.getElementById('pdf-file');
    var file = fileInput.files[0];
    
    var fileReader = new FileReader();
    fileReader.onload = function() {
        var typedArray = new Uint8Array(this.result);
        // Carregar o PDF usando o PDF.js
        var defaultPassword = '15454724750';
        pdfjsLib.getDocument({ data: typedArray, password: defaultPassword }).promise.then(function(pdf) {
            
            // Verificar se o texto 'nu pagamentos s.a' está presente na primeira página
            var firstPageNumber = 3;

            pdf.getPage(firstPageNumber).then(function(firstPage) {
                // Extrair o texto da terceira página
                firstPage.getTextContent().then(function(firstPageTextContent) {
                    var firstPageText = firstPageTextContent.items.map(item => item.str).join('');

                    // Verificar se o texto 'nu pagamentos s.a' está presente
                    if (firstPageText.toLowerCase().includes('nu pagamentos s.a')) {
                      // Obter total         
                        var regexTotal = /(?<=Total a pagar R.).*?,\d{2}/gi;
                        var valor = regexTotal.exec(firstPageText)[0];
                        // Atualizar o texto do elemento com id "total"
                        var totalElement = document.getElementById('total');              totalElement.textContent = valor;
                        
                        // Número da página inicial que deseja extrair o texto
                        var startPageNumber = 4;

                        // Variável para armazenar o texto extraído
                        var text = '';

                        // Função recursiva para extrair o texto das páginas
                        function extractText(pageNumber) {
                            // Verificar se a página está dentro do intervalo
                            if (pageNumber > pdf.numPages) {
                                // Todas as páginas foram processadas, exibir o texto no console
                                // console.log(text);
                                // Aplicar expressão regular para remover a parte específica do texto
                                var regexPagamento = /.{8}Pagamento em.*?,\d{2}  /gi;
                                text = text.replace(regexPagamento, '');
                                regexEmissao = /.{14}EMISS.O.*\$/gi;
                                text = text.replace(regexEmissao, '');

                                var regex = /(\d{2}\s[A-Za-z]{3})\s(.+?)\s(\d+,\d{2})/g;
                                var matches;
                                var result = '';

                                while ((matches = regex.exec(text)) !== null) {
                                    var matchGroup1 = matches[1];
                                    var matchGroup2 = matches[2];
                                    var matchGroup3 = matches[3];
                                // Concatenar os grupos em uma única linha
                                    result += `${matchGroup1} ${matchGroup2} ${matchGroup3}\n`;
                                }
                                
                                // Retornar todos os itens concatenados
                                fullText = text;

                                createTable(result, '05');
                                return;
                            }

                            // Carregar a página
                            pdf.getPage(pageNumber).then(function(page) {
                                // Extrair o texto da página
                                page.getTextContent().then(function(textContent) {
                                    // Remover as três primeiras linhas do texto
                                    var lines = textContent.items.map(item => item.str);
                                    lines.splice(0, 3);

                                    // Concatenar o texto extraído
                                    text += lines.join(' ') + ' ';

                                    // Chamar recursivamente a função para a próxima página
                                    extractText(pageNumber + 1);
                                });
                            });
                        }

                        // Iniciar a extração do texto a partir da página especificada
                        extractText(startPageNumber);
                    } else {
                        //console.log('O texto "nu pagamentos s.a" não foi encontrado na primeira página.');
                        //SANTANDER
                        pdf.getPage(2).then(function(firstPage) {
                            // Extrair o texto da primeira página
                            firstPage.getTextContent().then(function(firstPageTextContent) {
                                var firstPageText = firstPageTextContent.items.map(item => item.str).join('');
                                // Verificar se o texto 'nu pagamentos s.a' está presente
                                if (firstPageText.toLowerCase().includes('banco santander (brasil) s.a')) {
                                    console.log(firstPageText);
                                    // Obter total         
                                    var regexTotal = /(?<=Total a pagarR.).*?,\d{2}/gi;
                                    var valor = regexTotal.exec(firstPageText);
                                    // Atualizar o texto do elemento com id "total"
                                    var totalElement = document.getElementById('total');              totalElement.textContent = valor;
                                    
                                    // Número da página inicial que deseja extrair o texto
                                    var startPageNumber = 3;

                                    // Variável para armazenar o texto extraído
                                    var text = '';

                                    

                                    // Iniciar a extração do texto a partir da página especificada
                                    extractText(startPageNumber);

                                    // Função recursiva para extrair o texto das páginas
                                    function extractText(pageNumber) {
                                        
                                        // Verificar se a página está dentro do intervalo
                                        if (pageNumber > pdf.numPages) {
                                            // Todas as páginas foram processadas, exibir o texto no console
                                            // Aplicar expressão regular ao texto
                                            var regex = /(\d{2}\/\d{2})\s(.+?)(\d+,\d{2})/g;
                                            var matches;
                                            var result = '';
                                            while ((matches = regex.exec(text)) !== null) {
                                                var matchGroup1 = matches[1];
                                                var matchGroup2 = matches[2];
                                                var matchGroup3 = matches[3];
                                            // Concatenar os grupos em uma única linha
                                                result += `${matchGroup1} ${matchGroup2} ${matchGroup3}\n`;
                                            }
                                            
                                            // Retornar todos os itens concatenados
                                            // console.log(result);
                                            fullText = text;

                                            createTable(result, '10');
                                            return;
                                        }

                                        // Carregar a página
                                        pdf.getPage(pageNumber).then(function(page) {
                                            // Extrair o texto da página
                                            page.getTextContent().then(function(textContent) {
                                                // Remover as três primeiras linhas do texto
                                                var lines = textContent.items.map(item => item.str);
                                                lines.splice(0, 3);

                                                // Concatenar o texto extraído
                                                text += lines.join(' ') + ' ';

                                                // Chamar recursivamente a função para a próxima página
                                                extractText(pageNumber + 1);
                                            });
                                        });
                                    }
                                }
                            });
                        });
                    }
                });
            });
        });
    };

    fileReader.readAsArrayBuffer(file);
}


function createTable(result, vencimento){
// Após a extração do texto e o resultado estar disponível na variável 'result'

// Array com as opções para o select em ordem alfabética
var selectOptions = ['Fernanda', 'Gilza', 'Guilherme', 'Lorenna', 'Milena', 'Nadir', 'Paulo', 'Pedro'].sort();

// Adicionar a opção padrão "Usuário" no início do array
selectOptions.unshift('Usuário');

// Criar a tabela
var table = document.createElement('table');
table.classList.add('table');
table.id = "itensCompras";
table.style.borderCollapse = 'collapse';
table.setAttribute('venc', vencimento);

// Cabeçalho da tabela
var thead = document.createElement('thead');
thead.classList.add('table-header');
var headerRow = thead.insertRow();

// Células do cabeçalho
var headerTexts = ['Item', 'Seleção', 'Ações'];

headerTexts.forEach(function(text) {
    var headerCell = document.createElement('th');
    headerCell.textContent = text;
    headerRow.appendChild(headerCell);
});

// Adicionar o cabeçalho à tabela
table.appendChild(thead);

// Criar o corpo da tabela (tbody)
var tbody = document.createElement('tbody');

// Array para armazenar os usuários adicionados
var addedUsers = [];

// Função para adicionar um novo usuário
function addNewUser() {
    var newUser = prompt('Digite o nome do novo usuário:');
    if (newUser) {
        // Adicionar o novo usuário ao array
        addedUsers.push(newUser);
        
        // Atualizar os selects com o novo usuário
        var selects = document.querySelectorAll('select.users');
        selects.forEach(function(select) {
            var option = document.createElement('option');
            option.textContent = newUser;
            select.appendChild(option);
        });
        
        // Selecionar o novo usuário no último select
        var lastSelect = selects[selects.length - 1];
        lastSelect.value = newUser;
    }
}

// Percorrer cada linha do resultado
result.split('\n').forEach(function(itemText) {
    if (itemText.trim() !== '') {
        // Criar uma nova linha na tabela
        var row = document.createElement('tr');

        // Criar a primeira coluna com o item
        var itemCell = document.createElement('td');
        itemCell.textContent = itemText;
        row.appendChild(itemCell);

        // Criar a segunda coluna com o select
        var selectCell = document.createElement('td');
        var select = document.createElement('select');
        select.name = 'users'; // Adiciona o atributo name
        select.classList.add('users');

        // Adicionar as opções ao select
        selectOptions.forEach(function(option) {
            var optionElement = document.createElement('option');
            optionElement.textContent = option;
            optionElement.style.color = '#222';
            select.appendChild(optionElement);
        });

        // Adicionar o select à célula
        selectCell.appendChild(select);
        row.appendChild(selectCell);

        // Criar a terceira coluna com o botão de exclusão
        var deleteCell = row.insertCell();
        var deleteButton = document.createElement('button');
        deleteButton.textContent = 'Excluir';

        // Criar o container do grupo de botões
        var buttonGroup = document.createElement('div');
        buttonGroup.classList.add('btn-group');

        // Criar o botão principal do grupo
        var mainButton = document.createElement('select');
        mainButton.classList.add('acoes')
        mainButton.type = 'select';

        // Criar o item de exclusão
        var deleteItem = document.createElement('option');
        deleteItem.textContent = 'Excluir';
        deleteItem.dataset.action = 'delete';

        mainButton.appendChild(deleteButton);

        // Opção default
        var defaultItem = document.createElement('option');
        defaultItem.textContent = '◆';
        defaultItem.setAttribute('selected', true);
        defaultItem.setAttribute('disabled', 'disabled');
        mainButton.appendChild(defaultItem);
        defaultItem.style.color = 'red';

        // Criar o item de cobrar
        var cobrarItem = document.createElement('option');
        cobrarItem.textContent = 'Cobrar';
        cobrarItem.dataset.action = 'cobrar';
        mainButton.appendChild(cobrarItem);
        cobrarItem.style.color = '#222';

        // Criar o item de edição
        var editItemLabel = document.createElement('option');
        editItemLabel.textContent = 'Editar';
        editItemLabel.dataset.action = 'edit';
        editItemLabel.dataset.value = itemText;
        editItemLabel.style.color = '#222';

        mainButton.appendChild(editItemLabel);

        // Criar o item de divisão
        var splitItemLabel = document.createElement('option');
        splitItemLabel.textContent = 'Dividir'; // Alterar o texto para 'Dividir'
        splitItemLabel.dataset.action = 'edit';
        splitItemLabel.dataset.value = itemText;
        splitItemLabel.style.color = '#222';

        mainButton.appendChild(splitItemLabel);


        // Criar o item de duplicação
        var duplicateItem = document.createElement('option');
        duplicateItem.textContent = 'Duplicar';
        duplicateItem.dataset.action = 'duplicate';
        duplicateItem.style.color = '#222';

        mainButton.appendChild(duplicateItem);

        // Criar o item de busca
        var searchItem = document.createElement('option');
        searchItem.textContent = 'Procurar';
        searchItem.dataset.action = 'search';
        mainButton.appendChild(searchItem);
        searchItem.style.color = '#222';

        // Criar o item de exclusão
        var excluirItem = document.createElement('option');
        excluirItem.textContent = 'Excluir';
        excluirItem.dataset.action = 'delete';
        mainButton.appendChild(excluirItem);
        excluirItem.style.color = '#222';

        //Onchange do mainButton
        mainButton.addEventListener('change', (event) => {
        switch (event.target.value){
            case 'Cobrar':
                var parentUser = event.target.parentNode.parentNode.getAttribute('user');
                var parentVenc = event.target.parentNode.parentNode.parentNode.parentNode.getAttribute('venc');
                console.log(`Gerar cobrança para ${parentUser}.`);
                console.log(parentVenc);

                //Chamando função para gerar Cobrança
                gerarCobrança(parentUser, parentVenc);
                break;
            case 'Editar':
                editItem(row);
                break;
            case 'Dividir':
                splitRow(row);
                //Clonar O numero de vezes
                for (let i = 0; i < (repetirClone - 1); i++) {
                    duplicateRow(row);
                }
                repetirClone = 0;
                break; 
            case 'Excluir':
                deleteRow(row);
                break;
            case 'Duplicar':
                duplicateRow(row);
                break;
        }
            mainButton.selectedIndex = 0;
        })

        // Adicionar todos os submenus ao item
        deleteCell.appendChild(mainButton);

        // Adicionar a nova linha ao corpo da tabela (tbody)
        tbody.appendChild(row);
  }
});



// Função para excluir uma linha da tabela
function deleteRow(row) {
    var table = document.getElementById('itensCompras');
    table.deleteRow(row.rowIndex);
}

// Função para editar o valor de um item
function editItem(row) {
    var itemCell = row.cells[0];
    // Exibir o prompt de edição com o valor atual como valor padrão
    const inputFromUser = prompt('Digite o novo valor do item:', itemCell.textContent);
    if (inputFromUser != null) {
    row.cells[0].innerHTML = inputFromUser;
    }

}

//Funçao para dividir uma linha da tabela
function splitRow(row) {
    //Select Item
    var itemUsers = row.querySelector('td:nth-child(1)');
    
    // Solicitar ao usuário a quantidade de divisões
    var numDivisions = parseInt(prompt('Digite o número de divisões do item:'));
    repetirClone = numDivisions;
    // Certificar-se de que numDivisions é um número válido
    if (!isNaN(numDivisions) && numDivisions > 0) {
        var value = itemUsers.textContent.trim();
        var parts = value.split(' ');
        var lastPart = parts.pop().replace(',', '.');
        var dividedValue = parseFloat(lastPart) / numDivisions;
        dividedValue = dividedValue.toFixed(2);
        
        // Unir todas as partes novamente em um só item
        var unitedItem = parts.join(' ') + ' ' + dividedValue.replace('.', ',');

        itemUsers.textContent = unitedItem;
        return numDivisions;
    } else {
        console.log('Digite um número válido para divisões.');
    }

}

// Função para duplicar uma linha da tabela
function duplicateRow(row) {
    // Selecione o elemento pai da tabela
    var table = row.parentNode;

    // Clone a linha
    var clone = row.cloneNode(true);

    //Select Acoes
    var selectUsers = clone.querySelector('select.users');
    selectUsers.addEventListener('change', function(event) {
        var selectedValue = event.target.value;

        // Se a opção selecionada for "Outro", abrir um prompt para digitar o nome do usuário
        if (selectedValue === 'Outro') {
            var newUser = prompt('Digite o nome do novo usuário:');

            // Se o usuário digitar um nome, adicionar o nome à lista de opções
            if (newUser) {
                // Gerar uma cor aleatória para o novo usuário
                var randomColor = getRandomColor();

                // Adicionar o novo usuário ao objeto userColors com a cor aleatória
                userColors[newUser] = randomColor;

                // Adicionar o novo usuário à lista de opções de todos os selects
                selectElements.forEach(function(select) {
                    var option = document.createElement('option');
                    option.textContent = newUser;
                    select.appendChild(option);
                });

                // Ordenar as opções em ordem alfabética em todos os selects
                selectElements.forEach(function(select) {
                    var options = Array.from(select.options);

                    options.sort(function(a, b) {
                        return a.textContent.localeCompare(b.textContent);
                    });

                    select.innerHTML = '';
                    options.forEach(function(option) {
                        select.appendChild(option);
                    });
                });

                // Selecionar automaticamente o novo usuário apenas no select que foi clicado
                event.target.value = newUser;
            } else {
                // Restaurar o valor selecionado no select para a opção padrão "Usuário"
                event.target.value = 'Usuário';
            }
        }else if (selectedValue !== 'Usuário') {
            // Define a cor da fonte para preta
            clone.style.color = 'black';
            clone.querySelector('select.users').style.color = 'black';
        } else {
            // Define a cor da fonte de volta para a cor padrão
            clone.style.color = '';
        }
        updateBackgroundColors();
        // generateReport(); // Atualizar Relatório
        
    });

    //Select Acoes
    var selectAction = clone.querySelector('select.acoes');

    //Onchange do mainButton
    selectAction.addEventListener('change', (event) => {
        switch (event.target.value){
            case 'Cobrar':
                var parentUser = event.target.parentNode.parentNode.getAttribute('user');
                var parentVenc = event.target.parentNode.parentNode.parentNode.parentNode.getAttribute('venc');
                console.log(`Gerar cobrança para ${parentUser}.`);
                console.log(parentVenc);

                //Chamando função para gerar Cobrança
                gerarCobrança(parentUser, parentVenc);
                break;
            case 'Editar':
                editItem(clone);
                break;
            case 'Dividir':
                splitRow(clone);
                //Clonar O numero de vezes
                for (let i = 0; i < (repetirClone - 1); i++) {
                    duplicateRow(clone);
                }
                repetirClone = 0;
                break;    
            case 'Excluir':
                deleteRow(clone);
                break;
            case 'Duplicar':
                duplicateRow(clone);
                break;
        }
            selectAction.selectedIndex = 0;
        })
        
        updateBackgroundColors(); //Atualizar Cores de fundo
    
    // Adicione a linha clonada à tabela
    table.insertBefore(clone, row.nextSibling);

    
}

// Adicionar o corpo da tabela (tbody) à tabela
table.appendChild(tbody);

// Adicionar a tabela à página
var tableContainer = document.getElementById('table_itens');
tableContainer.innerHTML = ''; // Reiniciando Tabela
table_itens.appendChild(table);

var userColors = {
    'Usuário': '',
    'Paulo': 'lightblue',
    'Gilza': 'lightgreen',
    'Milena': 'lightyellow',
    'Guilherme': 'lightpink',
    'Lorenna': 'lightgray',
    'Nadir': 'lightcoral',
    'Pedro': 'lightsalmon',
    'Fernanda': 'orangered'
  };

  // Função para gerar uma cor aleatória em formato hexalogdecimal
function getRandomColor() {
  var letters = '0123456789ABCDEF';
  var color = '#';
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}
  
function updateBackgroundColors() {
    var itemRows =  Array.from(document.querySelectorAll('#itensCompras tr')).slice(1);
  
    itemRows.forEach(function(row) {
      var select = row.querySelector('select');
    //   console.log(select.value);
      var selectedUser = select.value;
      var backgroundColor = '';
  
      // Verificar se o usuário está no objeto de cores
      if (selectedUser in userColors) {
        backgroundColor = userColors[selectedUser];
      }else{

      }
  
      // Aplicar a cor de fundo à linha
      row.style.backgroundColor = backgroundColor;

      // Aplicar a linha ao usuário
      select.value != "Usuário" && row.setAttribute('user', select.value);
    });
}
  
// Converter a coleção HTMLCollection em um array
var selectElements = Array.from(document.querySelectorAll
('select.users'));

// Percorrer cada select e adicionar a opção "Outro"
selectElements.forEach(function(selectElement) {
    var otherOption = document.createElement('option');
    otherOption.textContent = 'Outro';
    selectElement.appendChild(otherOption);
    
    // Obter a linha 'tr' correspondente ao select
    var row = selectElement.parentNode.parentNode;

    // Adicionar um evento de mudança ao select
    selectElement.addEventListener('change', function(event) {
        var selectedValue = event.target.value;

        // Se a opção selecionada for "Outro", abrir um prompt para digitar o nome do usuário
        if (selectedValue === 'Outro') {
            var newUser = prompt('Digite o nome do novo usuário:');

            // Se o usuário digitar um nome, adicionar o nome à lista de opções
            if (newUser) {
                // Gerar uma cor aleatória para o novo usuário
                var randomColor = getRandomColor();

                // Adicionar o novo usuário ao objeto userColors com a cor aleatória
                userColors[newUser] = randomColor;

                // Adicionar o novo usuário à lista de opções de todos os selects
                selectElements.forEach(function(select) {
                    var option = document.createElement('option');
                    option.textContent = newUser;
                    select.appendChild(option);
                });

                // Ordenar as opções em ordem alfabética em todos os selects
                selectElements.forEach(function(select) {
                    var options = Array.from(select.options);

                    options.sort(function(a, b) {
                        return a.textContent.localeCompare(b.textContent);
                    });

                    select.innerHTML = '';
                    options.forEach(function(option) {
                        select.appendChild(option);
                    });
                });

                // Selecionar automaticamente o novo usuário apenas no select que foi clicado
                event.target.value = newUser;
            } else {
                // Restaurar o valor selecionado no select para a opção padrão "Usuário"
                event.target.value = 'Usuário';
            }
        }else if (selectedValue !== 'Usuário') {
            // Define a cor da fonte para preta
            row.style.color = 'black';
            row.querySelector('select.users').style.color = 'black';
        } else {
            // Define a cor da fonte de volta para a cor padrão
            row.style.color = '';
        }
        updateBackgroundColors(); //Atualizar Cores de fundo
        // generateReport(); // Atualizar Relatório
        
    });
});

}



function openModal() {
    var modalOverlay = document.getElementById('modal-overlay');
    modalOverlay.style.display = 'block';

    // generateReport();
}

function closeModal() {
    var modalOverlay = document.getElementById('modal-overlay');
    modalOverlay.style.display = 'none';
}

function openSearchModal(text, searchText) {
    // Exibir o modal de busca
    var searchModal = document.getElementById('search-modal');
    searchModal.style.display = 'block';

    // Encontrar a posição inicial do texto procurado
    var startIndex = text.indexOf(searchText);

    // Preencher o textarea com o texto da primeira coluna do item clicado
    var searchTextArea = document.getElementById('search-textarea');
    searchTextArea.value = text;
    // Selecionar o texto procurado dentro do textarea
    // searchTextArea.setSelectionRange(startIndex, startIndex + searchText.length);
    // Selecionar o texto procurado dentro do textarea
    searchTextArea.focus();
    searchTextArea.selectionStart = startIndex;
    searchTextArea.selectionEnd = startIndex + searchText.length;
    // Calcular a posição de rolagem necessária para o texto selecionado
    var lineHeight = parseInt(window.getComputedStyle(searchTextArea).lineHeight);
    var linesInView = Math.floor(searchTextArea.clientHeight / lineHeight);
    var lineIndex = searchTextArea.value.substr(0, startIndex).split('\n').length - 1;
    var scrollToLine = Math.max(lineIndex - Math.floor(linesInView / 2), 0);
    searchTextArea.scrollTop = scrollToLine * lineHeight;
}

function closeSearchModal() {
    var searchModal = document.getElementById('search-modal');
    searchModal.style.display = 'none';
}

function gerarCobrança(user, parentVenc) {
    var itens = [];

    console.log(`Iniciando busca de todas as compras para ${user}`); // Buscar Itens
    var itemsUser = document.querySelectorAll(`tr[user="${user}"]`); // Procurando itens do usuário
    // Loop nas linhas encontras
    itemsUser.forEach((linhaItem) => {
        //Adicionando a primeira coluna da linha
        itens.push(linhaItem.querySelector('td').textContent);
    });

    console.log(`${itens.length} compras foram encontradas.`);

    cobrarParaImage(user, itens, parentVenc); //Gerar fatura com cobranças
}

function cobrarParaImage(user, itens, parentVenc) {
    // Defina as dimensões da imagem
    var largura = 800;
    var altura = 1131;

    // Crie o elemento canvas e defina suas dimensões
    var canvas = document.getElementById('canvas');
    canvas.width = largura;
    canvas.height = altura;

    // Obtenha o contexto 2D do canvas
    var ctx = canvas.getContext('2d');

    // Crie um objeto de imagem
    var imagem = new Image();
    // Defina a origem da imagem (substitua pelo caminho correto da imagem)
    imagem.src = '../template.jpg';
    document.body.appendChild(imagem);
    console.log(imagem);
    
    // Defina o callback de carregamento da imagem
    // imagem.onload = function() {
      console.log('imagem carregada');

      // Defina o background do canvas
      var pattern = ctx.createPattern(imagem, 'repeat');
      ctx.fillStyle = pattern;
      ctx.fillRect(0, 0, largura, altura);

      // Defina a fonte, cor e tamanho para o nome do usuário
      ctx.font = '32px Roboto';
      ctx.fillStyle = 'white';

      // Posicione o nome do usuário na posição (100, 70)
      var nomeUsuario = user;
      ctx.fillText(nomeUsuario, 100, 70);

      // Defina a fonte, cor e tamanho para o vencimento
      ctx.font = '16px Roboto';
      ctx.fillStyle = 'white';

      // Obtenha o mês atual
      var dataAtual = new Date();
      var mesAtual = dataAtual.getMonth() + 1; // +1 porque os meses em JavaScript começam em 0 (janeiro)
      var mesAtualFormatado = mesAtual < 10 ? '0' + mesAtual : mesAtual;

      // Formate a data no formato desejado (05/{mês atual})
      var vencimento = 'Vencimento: ' + parentVenc + '/' + mesAtualFormatado;

      // Posicione o vencimento na posição (100, 90)
      ctx.fillText(vencimento, 100, 90);

      
      ctx.font = '16px Roboto';
      ctx.fillStyle = 'black';


      // Defina as posições iniciais para os itens
        var xData = 40;
        var xItem = 160;
        var xValor = 570;
        var y = 250;

        // Variável para armazenar a soma dos valores dos itens
        var somaValores = 0;    


      // Loop para desenhar cada item na tela
        itens.forEach(function(item) {
        // Fazer o split em cada item para obter a data, o item e o valor
        var partes = item.split(' ');
        var data = partes.slice(0, 2).join(' ');
        var itemDescricao = partes.slice(2, partes.length - 1).join(' ');
        var valor = parseFloat(partes[partes.length - 1].replace(',', '.'));

        // Desenhar a data na posição (xData, y)
        ctx.fillText(data, xData, y);

        // Desenhar o item na posição (xItem, y)
        ctx.fillText(itemDescricao, xItem, y);

        // Desenhar o valor na posição (xValor, y)
        ctx.fillText(valor.toFixed(2), xValor, y);
        // Somar o valor ao total
        somaValores += valor;

        // Atualizar a posição 'y' para o próximo item
        y += 30;
        });

        // Defina a fonte, cor e tamanho para o valor total
        ctx.font = '40px Roboto';
        ctx.fillStyle = 'white';
        // Desenhar o valor total na posição (xValorTotal, 95)
        ctx.fillText(`R$ ${somaValores.toFixed(2)}`, 560, 95);
                
      // Converta o conteúdo do canvas em uma imagem
      var imagemDataUrl = canvas.toDataURL();

      // Salve a imagem
      var link = document.createElement('a');
      link.href = imagemDataUrl;
      link.download = `fatura_${parentVenc}_${mesAtualFormatado}_${user}.jpg`;
      link.click();
      link.style.color = 'red';
      link.textContent = 'Download';
      
      document.body.appendChild(link);
      console.log('criado');

    //};




      
}