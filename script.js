// Lista de códigos de segurança com informações do mecânico
const securityCodes = {
    "Piska45": {
        "passaporte": "365",
        "nome": "Gregory McGregory"
    },
    "Code123": {
        "passaporte": "123",
        "nome": "Maria da Silva"
    },
    // Adicione mais códigos conforme necessário
};

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

// Função para gerar a lista de modificações e enviar para o Discord
function generateModificationList() {
    // Solicita o código de segurança
    const userCode = prompt("Por favor, insira o código de segurança para gerar a nota fiscal:");

    // Verifica se o código de segurança é válido
    if (!securityCodes.hasOwnProperty(userCode)) {
        alert("Código de segurança inválido. A nota fiscal não pode ser gerada.");
        return;
    }

    // Obtém as informações do mecânico a partir do código de segurança
    const mecanicoInfo = securityCodes[userCode];
    const mecanicoNome = mecanicoInfo.nome;
    const mecanicoPassaporte = mecanicoInfo.passaporte;

    // Verifica se os campos do cliente estão preenchidos
    const clienteNome = document.getElementById('nome-cliente').value.trim();
    const clientePassaporte = document.getElementById('passaporte').value.trim();

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
                modificationsList += `${itemText}\n`;
                hasModifications = true;
            }
        } else if (checkbox && checkbox.checked) {
            // Itens com checkbox
            const quantity = parseInt(quantityInput.value) || 1;
            const itemName = item.querySelector('label').innerText;
            const itemNameWithoutPrice = itemName.split(' - ')[0];
            itemText = `${itemNameWithoutPrice} ${quantity}x`;
            modificationsList += `${itemText}\n`;
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
    const embed = {
        "embeds": [{
            "title": "Nota fiscal - Top Secret",
            "description": `**"${clienteNome} e ID ${clientePassaporte}"**\n**"${mecanicoNome} e ID ${mecanicoPassaporte}"**\n\n**Lista de modificações:**\n${modificationsList}`,
            "fields": [
                {
                    "name": "Valor da nota:",
                    "value": `${valorTotal}`
                }
            ],
            "color": 6331316
        }]
    };

    // Envia o embed diretamente para o webhook do Discord
    sendEmbed(embed);
}

// Função para enviar o embed ao webhook do Discord
function sendEmbed(embed) {
    // URL do webhook do Discord
    const webhookURL = "https://discord.com/api/webhooks/1293626145358745641/yzVkuytNvMoaBY2ZYMmh3tiiMitJhwvmVYyamFCko1K0jEsP_X6-H43yV9aTly2hM6e7";

    // Para contornar restrições de CORS durante os testes, você pode usar um proxy (não recomendado para produção)
    const proxyUrl = "https://cors-anywhere.herokuapp.com/";
    const discordWebhookProxyURL = proxyUrl + webhookURL;

    fetch(discordWebhookProxyURL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(embed)
    })
    .then(response => {
        if (response.ok) {
            alert('Nota fiscal enviada com sucesso!');
        } else {
            alert('Erro ao enviar a nota fiscal.');
            console.error('Erro:', response.statusText);
        }
    })
    .catch(error => {
        console.error('Erro:', error);
        alert('Erro ao enviar a nota fiscal.');
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
