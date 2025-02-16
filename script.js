document.getElementById('precificacaoForm').addEventListener('submit', function(event) {
    event.preventDefault();

    // Captura os valores do formulário
    const codigo = document.getElementById('codigo').value.trim();
    const descricao = document.getElementById('descricao').value.trim();
    const custo = parseFloat(document.getElementById('custo').value);
    const precoMercado = parseFloat(document.getElementById('precoMercado').value);

    // Validações
    if (!codigo || !descricao || isNaN(custo) || isNaN(precoMercado) || custo <= 0 || precoMercado <= 0) {
        alert("Por favor, preencha todos os campos com valores válidos e maiores que zero.");
        return;
    }

    // Cálculo do preço no cartão
    const precoCartao = precoMercado * 0.8; // 20% abaixo do mercado

    // Validação: preço no cartão deve estar dentro da margem de 20% para mais ou para menos
    if (precoCartao < precoMercado * 0.8 || precoCartao > precoMercado * 1.2) {
        alert("O preço no cartão deve estar dentro de 20% para mais ou para menos do preço de mercado.");
        return;
    }

    // Cálculo do preço âncora (22% maior que o preço do cartão)
    const precoAncora = precoCartao * 1.22;
    
    // Cálculo dos preços com descontos
    const preco22Off = precoAncora * 0.78;
    const precoPix = precoAncora * 0.6;

    // Cálculo de lucratividade e rentabilidade
    const lucroCartao = precoCartao - custo;
    const lucroPix = precoPix - custo;
    const lucratividadeCartao = (lucroCartao / precoCartao) * 100;
    const lucratividadePix = (lucroPix / precoPix) * 100;
    const rentabilidadeCartao = (lucroCartao / custo) * 100;
    const rentabilidadePix = (lucroPix / custo) * 100;

    // Validação: lucratividade mínima de 40%
    if (lucratividadeCartao < 40 || lucratividadePix < 40) {
        alert("A lucratividade não pode ser inferior a 40%. Verifique os valores.");
        return;
    }

    // Adiciona os resultados na tabela
    const tbody = document.querySelector('#resultados tbody');
    const newRow = document.createElement('tr');
    newRow.innerHTML = `
        <td>${codigo}</td>
        <td>${descricao}</td>
        <td>${custo.toFixed(2)}</td>
        <td>${precoAncora.toFixed(2)}</td>
        <td>${preco22Off.toFixed(2)}</td>
        <td>${(precoCartao / 21).toFixed(2)}</td>
        <td>${precoPix.toFixed(2)}</td>
        <td>${lucratividadeCartao.toFixed(2)}%</td>
        <td>${lucratividadePix.toFixed(2)}%</td>
        <td>${rentabilidadeCartao.toFixed(2)}%</td>
        <td>${rentabilidadePix.toFixed(2)}%</td>
    `;
    tbody.appendChild(newRow);
});

// Corrigindo o botão de baixar orçamento
document.getElementById('baixarOrcamento').addEventListener('click', function() {
    const { jsPDF } = window.jspdf;
    if (!jsPDF) {
        alert("Erro: jsPDF não foi carregado corretamente.");
        return;
    }
    const doc = new jsPDF('landscape');

    // Verifica se há dados na tabela
    const tableRows = document.querySelectorAll('#resultados tbody tr');
    if (tableRows.length === 0) {
        alert("Nenhum dado disponível para gerar o orçamento.");
        return;
    }

    // Título do PDF
    doc.setFontSize(18);
    doc.text("Pré-Orçamento de Reparos e Acessórios", 10, 20);

    // Data de geração do PDF
    const dataAtual = new Date().toLocaleDateString('pt-BR');
    doc.setFontSize(12);
    doc.text(`Data de geração: ${dataAtual}`, 10, 30);

    // Cabeçalho da tabela
    const headers = [
        "Código", "Descrição", "Custo (R$)", "Preço Âncora (R$)", "22% OFF (R$)", "21x de (R$)", "40% OFF PIX (R$)",
        "Lucratividade Cartão (%)", "Lucratividade PIX (%)", "Rentabilidade Cartão (%)", "Rentabilidade PIX (%)"
    ];

    // Dados da tabela
    const rows = [];
    tableRows.forEach(row => {
        const cols = Array.from(row.querySelectorAll('td')).map(td => td.textContent);
        rows.push(cols);
    });

    // Adiciona a tabela ao PDF
    doc.autoTable({ head: [headers], body: rows, startY: 40 });
    
    // Salva o PDF
    doc.save("pre-orcamento.pdf");
});
