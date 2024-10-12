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
  
  // Função para gerar a lista de modificações e enviar ao backend
  function generateModificationList() {
    // Coleta os dados do cliente
    const clienteNome = document.getElementById('nome-cliente').value.trim();
    const clientePassaporte = document.getElementById('passaporte').value.trim();
  
    if (!clienteNome || !clientePassaporte) {
      alert("Por favor, preencha o nome e o passaporte do cliente.");
      return;
    }
  
    // Coleta os dados do veículo
    const carroModelo = document.getElementById('modelo-carro').value.trim();
  
    if (!carroModelo) {
      alert("Por favor, preencha o nome e o modelo do carro.");
      return;
    }
  
    // Solicita o código de segurança
    const userCode = prompt("Por favor, insira o código de segurança do mecânico:");
  
    if (!userCode) {
      alert("Código de segurança é necessário.");
      return;
    }
  
    // Gera a lista de modificações
    const modificationsList = generateModificationsList();
    const valorTotal = calculateTotalValue();
  
    if (!modificationsList) {
      alert("Nenhuma modificação selecionada.");
      return;
    }
  
    // Prepara os dados para enviar ao backend sim
    const data = {
      clienteNome,
      clientePassaporte,
      carroModelo,
      userCode,
      modificationsList,
      valorTotal
    };
  
    // Envia os dados ao backend
    sendDataToBackend(data);
  }
  
  // Função para gerar a lista de modificações selecionadas
  function generateModificationsList() {
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
      return null;
    }
  
    return modificationsList;
  }
  
  // Função para calcular o valor total
  function calculateTotalValue() {
    const totalField = document.getElementById('total').innerText;
    const valorTotal = totalField.replace('Valor Total: ', '');
    return valorTotal;
  }
  
  // Função para enviar os dados ao backend
  function sendDataToBackend(data) {
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
          alert("Erro ao enviar a nota fiscal: " + text);
          console.error('Erro ao enviar para o servidor:', text);
        });
      }
    })
    .catch(error => {
      console.error('Erro:', error);
      alert('Erro ao enviar a nota fiscal.');
    });
  }
  
  // Função para atualizar o total quando houver mudanças nos itens
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
  
    // Evento para o botão "Gerar Nota Fiscal"
    const generateListBtn = document.getElementById('generate-list-btn');
    generateListBtn.addEventListener('click', generateModificationList);
  }
  
  // Inicializa os event listeners ao carregar a página
  window.onload = () => {
    addEventListeners();
    updateTotal(); // Atualiza o total ao carregar a página
  };
  