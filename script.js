/* CÓDIGO CORRIGIDO * 01/03 * - INCLUÍDA GERAÇÃO DE PDF COM AJUSTES SOLICITADOS */

document.getElementById('precificacaoForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const codigo = document.getElementById('codigo').value.trim();
    const descricao = document.getElementById('descricao').value.trim();
    const custo = parseFloat(document.getElementById('custo').value);
    const precoMercado = parseFloat(document.getElementById('precoMercado').value);

    if (!codigo || !descricao || isNaN(custo) || isNaN(precoMercado) || custo <= 0 || precoMercado <= 0) {
        alert("Por favor, preencha todos os campos com valores válidos.");
        return;
    }

    // **Passo 1: Calcular Preço no Cartão (21x) respeitando a faixa de 80% a 120% do Preço de Mercado**
    let precoCartao = precoMercado;
    if (precoCartao < precoMercado * 0.8) precoCartao = precoMercado * 0.8;
    if (precoCartao > precoMercado * 1.2) precoCartao = precoMercado * 1.2;

    // **Passo 2: Calcular Preço Âncora (22% maior que o Preço no Cartão)**
    const precoAncora = precoCartao * 1.22;

    // **Passo 3: Calcular Preço no PIX (40% menor que Preço Âncora)**
    const precoPix = precoAncora * 0.60;

    // **Passo 4: Calcular Lucratividade**
    const lucroCartao = precoCartao - custo;
    const lucroPix = precoPix - custo;

    // **Passo 5: Verificar se a lucratividade está abaixo de 40% do custo da peça**
    if (lucroCartao < custo * 0.40 || lucroPix < custo * 0.40) {
        alert("Atenção: O preço da peça está incompatível com o preço do mercado, sua margem está menor que 40%.");
    }

    // **Passo 6: Calcular Rentabilidade**
    const rentabilidadeCartao = (lucroCartao / precoCartao) * 100;
    const rentabilidadePix = (lucroPix / precoPix) * 100;

    // Exibir os resultados na tabela
    const tbody = document.querySelector('#resultados tbody');
    const newRow = document.createElement('tr');
    newRow.innerHTML = `
        <td>${codigo}</td>
        <td>${descricao}</td>
        <td>${custo.toFixed(2)}</td>
        <td>${precoAncora.toFixed(2)}</td>
        <td>${precoCartao.toFixed(2)}</td>
        <td>${(precoCartao / 21).toFixed(2)}</td>
        <td>${precoPix.toFixed(2)}</td>
        <td>R$ ${lucroCartao.toFixed(2)}</td>
        <td>R$ ${lucroPix.toFixed(2)}</td>
        <td>${rentabilidadeCartao.toFixed(2)}%</td>
        <td>${rentabilidadePix.toFixed(2)}%</td>
    `;
    tbody.appendChild(newRow);
});

// Geração do PDF com layout melhorado e em paisagem
document.getElementById('baixarOrcamento').addEventListener('click', function() {
    if (!window.jspdf) {
        alert("Erro: jsPDF não carregado corretamente.");
        return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF("landscape"); // Agora o PDF será gerado na horizontal

    /* Adicionando logo (substituir pela URL do logo)
    const logoURL = 'URL_DA_LOGO'; 
    if (logoURL) {
        doc.addImage(logoURL, 'PNG', 120, 10, 50, 20); // Centraliza a logo no topo
    }*/

    // Estilizando título do PDF
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text("Pré-Orçamento", 148, 40, { align: "center" });

    // Adicionando data com melhor espaçamento
    const dataAtual = new Date().toLocaleDateString('pt-BR');
    doc.setFontSize(12);
    doc.text(`Data: ${dataAtual}`, 270, 50, { align: "right" });

    const tableRows = [];
    const tableData = document.querySelectorAll('#resultados tbody tr');

    if (tableData.length === 0) {
        alert("Nenhum dado disponível para gerar o orçamento.");
        return;
    }

    tableData.forEach(row => {
        const cols = [
            row.children[0].textContent, // Código/Modelo
            row.children[1].textContent, // Descrição do Serviço
            row.children[3].textContent, // Preço (Âncora)
            row.children[4].textContent, // Parcelado em 21x com 22% OFF
            row.children[6].textContent  // À vista no PIX com 40% OFF
        ];
        tableRows.push(cols);
    });

    // Criando a tabela com design melhorado
    doc.autoTable({
        head: [[
            "Modelo", 
            "Descrição do Serviço", 
            "Preço (R$)", 
            "Parcelado em 21x sem juros\ncom 22% OFF", 
            "À vista no PIX com 40% OFF"
        ]],
        body: tableRows,
        startY: 60,
        styles: {
            fontSize: 10,
            cellPadding: 5,
        },
        headStyles: {
            fillColor: [0, 102, 204], // Azul bonito para o cabeçalho
            textColor: [255, 255, 255], // Texto branco
            fontSize: 12,
            fontStyle: "bold"
        },
        alternateRowStyles: {
            fillColor: [240, 240, 240] // Linhas alternadas cinza claro
        },
        margin: { top: 60 }
    });

    doc.save("pre-orcamento.pdf");
});
