document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("formProduto");
    const nomeInput = document.getElementById("nomeProduto");
    const valorInput = document.getElementById("valorProduto");
    const quantidadeInput = document.getElementById("quantidadeProduto");
    const totalModal = document.getElementById("totalModal");
    const totalCarrinho = document.getElementById("totalCarrinho");

    const btnEditarOrcamento = document.querySelector(".edit-bg");
    const spanOrcamentoValor = document.getElementById("orcamento-valor");
    const formOrcamento = document.getElementById("formOrcamento");
    const inputNovoOrcamento = document.getElementById("novoOrcamento");

    let linhaEmEdicao = null;
    const formEditar = document.getElementById("formEditarProduto");
    const editarNomeInput = document.getElementById("editarNomeProduto");
    const editarValorInput = document.getElementById("editarValorProduto");
    const editarQuantidadeInput = document.getElementById("editarQuantidadeProduto");
    const totalModalEditar = document.getElementById("totalModalEditar");

    const formatarMoeda = (valor) => valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

    // Persistência
    function salvarDados() {
        const orcamento = spanOrcamentoValor.textContent;
        const itens = [];

        document.querySelectorAll(".item-lista").forEach(linha => {
            itens.push({
                nome: linha.querySelector(".produto").textContent,
                preco: Number(linha.dataset.preco) || 0,
                qtd: Number(linha.querySelector(".input-qtd").value.replace(/[^\d]/g, "")) || 1
            });
        });

        localStorage.setItem("totaliza_orcamento", orcamento);
        localStorage.setItem("totaliza_itens", JSON.stringify(itens));
    }

    function carregarDados() {
        const orcamentoSalvo = localStorage.getItem("totaliza_orcamento");
        if (orcamentoSalvo) spanOrcamentoValor.textContent = orcamentoSalvo;

        const itensSalvos = localStorage.getItem("totaliza_itens");
        if (itensSalvos) {
            try {
                JSON.parse(itensSalvos).forEach(item => {
                    criarLinha(item.nome, item.preco, item.qtd, false);
                });
            } catch (e) {
                console.error("Erro ao carregar dados salvos:", e);
            }
        }
        atualizarTotais();
    }

    // Regras de negócio e UI (Com verificação de orçamento estourado)
    function verificarOrcamento() {
        const valorOrcamento = Number(spanOrcamentoValor.textContent.replace(/[^\d,]/g, "").replace(",", ".")) || 0;
        const valorCarrinho = Number(totalCarrinho.textContent.replace(/[^\d,]/g, "").replace(",", ".")) || 0;
        
        const mensagemEstouro = document.getElementById("mensagemEstouro");

        if (valorCarrinho > valorOrcamento) {
            totalCarrinho.style.backgroundColor = "#ff0000";
            if (mensagemEstouro) mensagemEstouro.style.display = "block";
        } else {
            totalCarrinho.style.backgroundColor = "#11b30b";
            if (mensagemEstouro) mensagemEstouro.style.display = "none";
        }
    }

    function atualizarTotais() {
        let totalGeral = 0;

        document.querySelectorAll(".item-lista").forEach(linha => {
            const preco = Number(linha.dataset.preco) || 0;
            const qtd = Number(linha.querySelector(".input-qtd").value.replace(/[^\d]/g, "")) || 1;
            const totalItem = preco * qtd;

            linha.querySelector(".valor-total-item").textContent = formatarMoeda(totalItem);
            totalGeral += totalItem;
        });

        totalCarrinho.textContent = formatarMoeda(totalGeral);
        verificarOrcamento();
    }

    function criarLinha(nome, preco, quantidade, deveSalvar = true) {
        const linha = document.createElement("div");
        linha.className = "row item-lista align-items-center";
        linha.dataset.preco = preco;

        linha.innerHTML = `
            <div class="col-md-3">
                <div class="produto">${escapeHtml(nome)}</div>
            </div>
            <div class="col-md-2 text-center">
                <span class="produto-rotulo">Valor: </span>
                <span class="preco-unitario">${formatarMoeda(preco)}</span>
            </div>
            <div class="col-md-3 text-center">
                <div class="controle-quantidade">
                    <button type="button" class="btn-qtd btn-menos">−</button>
                    <div class="qtd-display">
                        <span class="qtd-label">QTD: </span>
                        <input type="text" class="input-qtd" value="${quantidade}x" readonly>
                    </div>
                    <button type="button" class="btn-qtd btn-mais">+</button>
                </div>
            </div>
            <div class="col-md-2 text-center">
                <span class="produto-rotulo">Valor total: </span>
                <span class="preco-unitario valor-total-item">${formatarMoeda(preco * quantidade)}</span>
            </div>
            <div class="col-md-2 text-center">
                <button type="button" class="edit-bg btn-editar-item">
                    <img src="./images/edit.png" alt="Editar" class="edit-icon">
                </button>
            </div>
        `;

        const divisor = document.createElement("hr");
        divisor.className = "divisor";

        const containerTotal = document.querySelector(".total-compra-container");
        containerTotal.parentNode.insertBefore(divisor, containerTotal);
        containerTotal.parentNode.insertBefore(linha, containerTotal);

        if (deveSalvar) {
            atualizarTotais();
            salvarDados();
        }
    }

    function escapeHtml(str) {
        return str.replace(/[&<>'"]/g, tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag));
    }

    // Orçamento
    if (btnEditarOrcamento) {
        btnEditarOrcamento.addEventListener("click", () => {
            const valorAtual = Number(spanOrcamentoValor.textContent.replace(/[^\d,]/g, "").replace(",", ".")) || 0;
            inputNovoOrcamento.value = valorAtual.toFixed(2);
            if (window.jQuery) $("#modalOrcamento").modal("show");
        });
    }

    if (formOrcamento) {
        formOrcamento.addEventListener("submit", (e) => {
            e.preventDefault();
            const novoValor = Number(inputNovoOrcamento.value);

            if (novoValor < 0) return alert("O orçamento não pode ser negativo.");

            spanOrcamentoValor.textContent = formatarMoeda(novoValor);
            verificarOrcamento();
            salvarDados();

            if (window.jQuery) $("#modalOrcamento").modal("hide");
        });
    }

    // Modais de Produto
    const atualizarTotalModal = (valInput, qtdInput, targetEl) => {
        const preco = Number(valInput.value) || 0;
        const qtd = Number(qtdInput.value) || 1;
        targetEl.textContent = formatarMoeda(preco * qtd);
    };

    valorInput.addEventListener("input", () => atualizarTotalModal(valorInput, quantidadeInput, totalModal));
    quantidadeInput.addEventListener("input", () => atualizarTotalModal(valorInput, quantidadeInput, totalModal));

    document.getElementById("diminuirQtd").addEventListener("click", () => {
        if (quantidadeInput.value > 1) {
            quantidadeInput.value--;
            atualizarTotalModal(valorInput, quantidadeInput, totalModal);
        }
    });

    document.getElementById("aumentarQtd").addEventListener("click", () => {
        quantidadeInput.value++;
        atualizarTotalModal(valorInput, quantidadeInput, totalModal);
    });

    if (editarValorInput && editarQuantidadeInput) {
        editarValorInput.addEventListener("input", () => atualizarTotalModal(editarValorInput, editarQuantidadeInput, totalModalEditar));
        editarQuantidadeInput.addEventListener("input", () => atualizarTotalModal(editarValorInput, editarQuantidadeInput, totalModalEditar));
    }

    // Cadastro de produto novo
    form.addEventListener("submit", (e) => {
        e.preventDefault();
        const nome = nomeInput.value.trim();
        const preco = Number(valorInput.value);
        const qtd = Number(quantidadeInput.value);

        if (!nome || preco <= 0 || qtd < 1) return alert("Preencha os campos corretamente.");

        criarLinha(nome, preco, qtd, true);
        form.reset();
        quantidadeInput.value = 1;
        atualizarTotalModal(valorInput, quantidadeInput, totalModal);

        if (window.jQuery) $("#modalProduto").modal("hide");
    });

    // Edição de produto existente
    if (formEditar) {
        formEditar.addEventListener("submit", (e) => {
            e.preventDefault();
            if (!linhaEmEdicao) return;

            const nome = editarNomeInput.value.trim();
            const preco = Number(editarValorInput.value);
            const qtd = Number(editarQuantidadeInput.value);

            if (!nome || preco <= 0 || qtd < 1) return alert("Preencha os campos corretamente.");

            linhaEmEdicao.dataset.preco = preco;
            linhaEmEdicao.querySelector(".produto").textContent = nome;
            linhaEmEdicao.querySelector(".preco-unitario").textContent = formatarMoeda(preco);
            linhaEmEdicao.querySelector(".input-qtd").value = qtd + "x";

            atualizarTotais();
            salvarDados();

            if (window.jQuery) $("#modalEditarProduto").modal("hide");
        });
    }

    // cliques (Aumentar, Diminuir, Editar)
    document.addEventListener("click", (e) => {
        const btnEditar = e.target.closest(".btn-editar-item");
        if (btnEditar) {
            linhaEmEdicao = btnEditar.closest(".item-lista");
            if (!linhaEmEdicao) return;

            editarNomeInput.value = linhaEmEdicao.querySelector(".produto").textContent;
            editarValorInput.value = Number(linhaEmEdicao.dataset.preco).toFixed(2);
            editarQuantidadeInput.value = Number(linhaEmEdicao.querySelector(".input-qtd").value.replace(/[^\d]/g, "")) || 1;
            atualizarTotalModal(editarValorInput, editarQuantidadeInput, totalModalEditar);

            if (window.jQuery) $("#modalEditarProduto").modal("show");
            return;
        }

        const btnQtd = e.target.closest(".btn-menos, .btn-mais");
        if (!btnQtd) return;

        const linha = btnQtd.closest(".item-lista");
        if (!linha) return;

        const inputQtd = linha.querySelector(".input-qtd");
        let qtd = parseInt(inputQtd.value) || 1;

        if (btnQtd.classList.contains("btn-mais")) {
            qtd++;
        } else {
            qtd--;
            if (qtd <= 0) {
                const divisor = linha.nextElementSibling;
                if (divisor && divisor.classList.contains("divisor")) divisor.remove();
                linha.remove();
                atualizarTotais();
                salvarDados();
                return;
            }
        }

        inputQtd.value = qtd + "x";
        atualizarTotais();
        salvarDados();
    });

    // Inicialização
    carregarDados();
    atualizarTotalModal(valorInput, quantidadeInput, totalModal);

    if (window.jQuery) {
        $("#modalProduto").on("shown.bs.modal", () => nomeInput.focus());
        $("#modalOrcamento").on("shown.bs.modal", () => inputNovoOrcamento.focus());
    }
});