function addUserIn(user) {
  var eleParent = document.getElementById('relatorio');
  
  // Verificar se o usuário já está no relatório
  
  if (!document.getElementById('relatorio_'+user.toLowerCase())) {
  // Criar elemento para usuário
  elementP = document.createElement('p');
  elementP.classList.add('card-post-item');
  elementP.textContent = user.toLowerCase();
  elementP.setAttribute('id', 'relatorio_'+user.toLowerCase());
  
  // Criar notai para visualizar ou gerar relatório
  elementButton = document.createElement('button');
  elementButton.classList.add('card-post-button');
  elementButton.textContent = 'Gerar';
  elementButton.addEventListener('click', () => {
    cobrarParaImage(user, document.querySelectorAll(`*[user=${user}]`), document.getElementById('vencimento').textContent);
  });
  
  // Adicionar botão ao elemento criado
  elementP.appendChild(elementButton);
  
  // Adicionar usuário ao documento
  eleParent.appendChild(elementP);
  }else{
   // Usuário já está no relatório
  }
}
/*
addUserIn('Pedro');
addUserIn('Milena');
addUserIn('Guilherme');
*/


// Ler Arquivo em PDF
var fullText = ''; //Fatura completa
// Variável para armazenar o total
var total = 0.00;
var repetirClone = 0;


document.getElementById('file-pdf').addEventListener('change', () => extractTextFromPage());
document.getElementById('loadBill').addEventListener('click', () => {
  document.getElementById('file-pdf').click();
});


function extractTextFromPage() {
    var fileInput = document.getElementById('file-pdf');
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
                        // Obter vencimento
                        var regexVencimento = /(?<=FATURA \d{2} ).*?(?= \d{4})/gi;
                        var venc = regexVencimento.exec(firstPageText)[0];
                        var vencElement = document.getElementById('vencimento');
                        vencElement.textContent = venc;

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

                                createTable(result, '05/' + venc);
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


function createTable(result){
// Após a extração do texto e o resultado estar disponível na variável 'result'

// Array com as opções para o select em ordem alfabética
var selectOptions = ['Fernanda', 'Gilza', 'Guilherme', 'Lorenna', 'Milena', 'Nadir', 'Paulo', 'Pedro'].sort();

// Adicionar a opção padrão "Usuário" no início do array
selectOptions.unshift('Usuário');

// Criar a tabela
var table = document.getElementById('tbody-itens')

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
        select.classList.add('default');

        // Adicionar as opções ao select
        selectOptions.forEach(function(option) {
            var optionElement = document.createElement('option');
            optionElement.textContent = option;
            optionElement.value = option;
            select.appendChild(optionElement);
        });

        

        // Adicionar o select à célula
        selectCell.appendChild(select);
        row.appendChild(selectCell);

        // Adicionar a nova linha ao corpo da tabela (tbody)
        table.appendChild(row);
  }
});
 
//Removendo padrão
document.getElementsByClassName('no-item-loaded')[0].parentNode.remove()
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
      }else if (selectedValue === 'Usuário') {
        event.target.classList.add('default');
      }else{
        event.target.classList.remove('default');
        addUserIn(selectedValue); // Adicionar usuário ao relatório
        event.target.parentNode.parentNode.querySelector('td').setAttribute('user', selectedValue); // Adicionando atributo
      }
    });
});

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
    imagem.src = './template.jpg';
    
    // Defina o callback de carregamento da imagem
    imagem.onload = function() {
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

      // Formate a data no formato desejado (05/{mês atual})
      var vencimento = 'Vencimento: ' + parentVenc;

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
        item = item.textContent;
            console.log(item);
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
      link.download = `fatura_${parentVenc.replaceAll('/',"_")}_${user}.jpg`;
      link.click();
      link.style.color = 'red';
      link.textContent = 'Download';
      
      document.body.appendChild(link);
      console.log('criado');

    };

}