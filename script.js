// Não é necessário manter a URL do webhook no código cliente

// Função para atualizar o valor total
function updateTotal() {
    let total = 0;
    const items = document.querySelectorAll('.item');

    items.forEach(item => {
        const quantityInput = item.querySelector('input.quantity');
        const levelSelect = item.querySelector('select.level');
        const checkbox = item.querySelector('input[type="checkbox"]');
        let price = 0;
        let quantity = parseInt(quantityInput.value) || 1;

        if (levelSelect) {
            // Itens com níveis
            const selectedOption = levelSelect.options[levelSelect.selectedIndex];
            price = parseFloat(selectedOption.getAttribute('data-price')) || 0;
        } else if (checkbox) {
            // Itens com checkbox
            if (checkbox.checked) {
                quantityInput.disabled = false;
                price = parseFloat(checkbox.getAttribute('data-price')) || 0;
            } else {
                quantityInput.disabled = true;
                quantityInput.value = 1;
                quantity = 0; // Não contabilizar se o checkbox não estiver marcado
            }
        }

        total += price * quantity;
    });

    // Atualiza o valor total no HTML
    const totalField = document.getElementById('total');
    totalField.innerText = 'Valor Total: R$ ' + total.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// Função para gerar a lista de modificações e enviar para a função Netlify
function generateModificationList() {
    // Solicita o código de segurança
    const userCode = prompt("Por favor, insira o código de segurança para gerar a nota fiscal:");

    // Verifica se os campos do cliente estão preenchidos
    const clienteNome = document.getElementById('nome-cliente').value;
    const clientePassaporte = document.getElementById('passaporte').value;

    if (!clienteNome || !clientePassaporte) {
        alert("Por favor, preencha o nome e o passaporte do cliente antes de gerar a nota fiscal.");
        return;
    }

    // Gera a lista de modificações
    const items = document.querySelectorAll('.item');
    let modificationsList = '';
    let hasModifications = false;

    items.forEach(item => {
        const quantityInput = item.querySelector('input.quantity');
        const levelSelect = item.querySelector('select.level');
        const checkbox = item.querySelector('input[type="checkbox"]');
        let itemText = '';

        if (levelSelect) {
            // Itens com níveis
            const level = levelSelect.value;
            if (level !== '0') {
                const itemName = item.querySelector('label').innerText;
                const itemNameWithoutPrice = itemName.split(' - ')[0];
                itemText = `${itemNameWithoutPrice} - Nível ${level}`;
                modificationsList += `"${itemText}"\n`;
                hasModifications = true;
            }
        } else if (checkbox && checkbox.checked) {
            // Itens com checkbox
            const quantity = parseInt(quantityInput.value) || 1;
            const itemName = item.querySelector('label').innerText;
            const itemNameWithoutPrice = itemName.split(' - ')[0];
            itemText = `${itemNameWithoutPrice} ${quantity}x`;
            modificationsList += `"${itemText}"\n`;
            hasModifications = true;
        }
    });

    if (!hasModifications) {
        alert("Nenhuma modificação selecionada.");
        return;
    }

    // Valor total
    const totalField = document.getElementById('total').innerText;
    const valorTotal = totalField.replace('Valor Total: ', '');

    // Monta o objeto embed
    const embedObject = {
        "content": "",  // Mensagem opcional, pode estar vazia
        "embeds": [
          {
            "title": "Nota fiscal - Top Secret",
            "description": `**"${clienteNome} e ID ${clientePassaporte}"**\n**"${mecanicoNome} e ID ${mecanicoPassaporte}"**\n\n**Lista de modificações:**\n${modificationsList}`,
            "fields": [
              {
                "name": "Valor da nota:",
                "value": valorTotal
              }
            ],
            "color": 6331316  // Um código hexadecimal para a cor da barra lateral da embed
          }
        ]
      };
      

    // Prepara os dados para enviar ao backend
    const data = {
        userCode: userCode,
        embedObject: embedObject
    };

    // Envia os dados para a função Netlify
    sendToDiscord(data);
}

// Função para enviar os dados para a função Netlify
function sendToDiscord(data) {
    // URL da sua função Netlify
    const netlifyFunctionURL = 'https://mecdopiska.netlify.app/.netlify/functions/sendDiscordWebhook';

    fetch(netlifyFunctionURL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(response => {
        if (response.ok) {
            alert("Nota fiscal enviada com sucesso!");
        } else {
            response.text().then(text => {
                alert("Falha ao enviar a nota fiscal: " + text);
                console.error('Erro ao enviar para o servidor:', text);
            });
        }
    })
    .catch(error => {
        alert("Ocorreu um erro ao enviar a nota fiscal.");
        console.error('Erro:', error);
    });
}

// Adiciona eventos aos selects, inputs de quantidade e checkboxes
function addEventListeners() {
    const items = document.querySelectorAll('.item');

    items.forEach(item => {
        const quantityInput = item.querySelector('input.quantity');
        const levelSelect = item.querySelector('select.level');
        const checkbox = item.querySelector('input[type="checkbox"]');

        if (levelSelect) {
            levelSelect.addEventListener('change', updateTotal);
            quantityInput.addEventListener('input', updateTotal);
        }

        if (checkbox) {
            checkbox.addEventListener('change', () => {
                if (checkbox.checked) {
                    quantityInput.disabled = false;
                } else {
                    quantityInput.disabled = true;
                    quantityInput.value = 1;
                }
                updateTotal();
            });
            quantityInput.addEventListener('input', updateTotal);
        }
    });

    // Evento para o botão "Gerar Lista"
    const generateListBtn = document.getElementById('generate-list-btn');
    generateListBtn.addEventListener('click', generateModificationList);
}

// Inicializa os event listeners ao carregar a página
window.onload = addEventListeners;
