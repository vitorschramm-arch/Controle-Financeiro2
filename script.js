document.addEventListener('DOMContentLoaded', () => {
    // --- Seletores de Elementos do DOM ---
    const addTransactionBtn = document.getElementById('add-transaction-btn');
    const transactionModal = document.getElementById('transaction-modal');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const transactionForm = document.getElementById('transaction-form');
    const transactionTypeBtns = document.querySelectorAll('.transaction-type-btn');
    const isFixedCheckbox = document.getElementById('is-fixed');
    const isVariableContainer = document.getElementById('is-variable-container');
    const amountInput = document.getElementById('amount');
    const dateInput = document.getElementById('date');
    const categorySelect = document.getElementById('category');
    const subcategorySelect = document.getElementById('subcategory');
    const paymentMethodContainer = document.getElementById('payment-method-container');
    const paymentMethodSelect = document.getElementById('payment-method');
    const formErrorMessage = document.getElementById('form-error-message');
    
    const balanceValueEl = document.getElementById('balance-value');
    const debtsValueEl = document.getElementById('debts-value');
    const investmentsValueEl = document.getElementById('investments-value');
    const invoiceValueEl = document.getElementById('invoice-value');
    const toggleVisibilityBtns = document.querySelectorAll('.toggle-visibility-btn');
    const valueElements = document.querySelectorAll('[id$="-value"], .value-visible');
    
    const transactionsModal = document.getElementById('transactions-modal');
    const closeTransactionsModalBtn = document.getElementById('close-transactions-modal-btn');
    const transactionsModalTitle = document.getElementById('transactions-modal-title');
    const transactionsModalFilters = document.getElementById('transactions-modal-filters');
    const transactionsModalList = document.getElementById('transactions-modal-list');
    const exportBtn = document.getElementById('export-btn');
    const cards = document.querySelectorAll('[data-card-type]');
    
    const pendingListDashboard = document.getElementById('pending-list-dashboard');
    const prevMonthBtn = document.getElementById('prev-month-btn');
    const nextMonthBtn = document.getElementById('next-month-btn');
    const pendingMonthDisplay = document.getElementById('pending-month-display');

    const settingsBtn = document.getElementById('settings-btn');
    const settingsModal = document.getElementById('settings-modal');
    const closeSettingsModalBtn = document.getElementById('close-settings-modal-btn');
    const settingsForm = document.getElementById('settings-form');
    const categoryManagementContainer = document.getElementById('category-management-container');
    const invoiceClosingDayInput = document.getElementById('invoice-closing-day');
    const savingsGoalInput = document.getElementById('savings-goal');
    const downloadTemplateBtn = document.getElementById('download-template-btn');
    const exportAllBtn = document.getElementById('export-all-btn');
    const importAllBtn = document.getElementById('import-all-btn');
    const importFileInput = document.getElementById('import-file-input');

    const forecastBtn = document.getElementById('forecast-btn');
    const forecastModal = document.getElementById('forecast-modal');
    const closeForecastModalBtn = document.getElementById('close-forecast-modal-btn');
    const exportForecastBtn = document.getElementById('export-forecast-btn');
    const forecastChartCanvas = document.getElementById('forecast-chart');

    const aiBtn = document.getElementById('ai-btn');
    const aiModal = document.getElementById('ai-modal');
    const closeAiModalBtn = document.getElementById('close-ai-modal-btn');
    const analyzeFinanceBtn = document.getElementById('analyze-finance-btn');
    const aiInitialState = document.getElementById('ai-initial-state');
    const aiLoadingState = document.getElementById('ai-loading-state');
    const aiResultState = document.getElementById('ai-result-state');
    
    const genericModal = document.getElementById('generic-modal');
    const genericModalTitle = document.getElementById('generic-modal-title');
    const genericModalMessage = document.getElementById('generic-modal-message');
    const genericModalInputContainer = document.getElementById('generic-modal-input-container');
    const genericModalInput = document.getElementById('generic-modal-input');
    const genericModalButtons = document.getElementById('generic-modal-buttons');

    // --- Seletores de Elementos de Dívidas ---
    const debtManagementModal = document.getElementById('debt-management-modal');
    const closeDebtManagementModalBtn = document.getElementById('close-debt-management-modal-btn');
    const debtListContainer = document.getElementById('debt-list-container');
    const addNewDebtBtn = document.getElementById('add-new-debt-btn');
    const addEditDebtModal = document.getElementById('add-edit-debt-modal');
    const closeAddEditDebtModalBtn = document.getElementById('close-add-edit-debt-modal-btn');
    const addEditDebtModalTitle = document.getElementById('add-edit-debt-modal-title');
    const debtForm = document.getElementById('debt-form');
    const debtFormErrorMessage = document.getElementById('debt-form-error-message');
    const debtDetailsModal = document.getElementById('debt-details-modal');
    const closeDebtDetailsModalBtn = document.getElementById('close-debt-details-modal-btn');
    const debtDetailsModalTitle = document.getElementById('debt-details-modal-title');
    const debtSummaryContainer = document.getElementById('debt-summary-container');
    const debtAmortizationTableContainer = document.getElementById('debt-amortization-table-container');
    const simulatePrepaymentBtn = document.getElementById('simulate-prepayment-btn');
    const confirmPrepaymentBtn = document.getElementById('confirm-prepayment-btn');
    const prepaymentSimulationResult = document.getElementById('prepayment-simulation-result');


    // --- Seletores do Card de Visão Geral ---
    const overviewIncomeEl = document.getElementById('overview-income');
    const overviewExpensesEl = document.getElementById('overview-expenses');
    const overviewBalanceEl = document.getElementById('overview-balance');
    const overviewIncomePendingEl = document.getElementById('overview-income-pending');
    const overviewExpensesPendingEl = document.getElementById('overview-expenses-pending');
    const categoryChartCanvas = document.getElementById('category-chart');
    const budgetBarsContainer = document.getElementById('budget-bars-container');

    // --- Estado da Aplicação ---
    let transactions = []; 
    let fixedTransactionTemplates = [];
    let debts = []; // Novo estado para dívidas
    let currentPendingDate = new Date();
    let selectedTransactionType = null;
    let areValuesVisible = true;
    let currentSort = { key: 'date', direction: 'desc' };
    let modalTransactionData = [];
    let currentFilteredModalData = []; // Para exportação
    let activeFilters = { type: 'all', category: 'all', startDate: '', endDate: '' };
    let categoryChartInstance = null;
    let forecastChartInstance = null;
    let forecastDataForExport = [];
    let editingTransactionId = null; // ID da transação sendo editada
    let editingDebtId = null; // ID da dívida sendo editada
    let viewingDebtId = null; // ID da dívida sendo visualizada

    let settings = {
        invoiceClosingDay: 1,
        savingsGoal: 0,
        budgets: {}
    };

    let categoryData = {
        'entrada': { 'Salário': ['Adiantamento', 'Salário Mensal', 'Bônus', 'Férias'],'Investimentos': ['Dividendos', 'Venda de Ativos', 'Juros'],'Outras Receitas': ['Freelance', 'Vendas', 'Presente', 'Reembolso']},
        'saida': {'Alimentação': ['Supermercado', 'Restaurante', 'Delivery', 'Lanche'],'Moradia': ['Aluguel', 'Condomínio', 'Luz', 'Água', 'Internet', 'Gás', 'Manutenção'],'Transporte': ['Combustível', 'App de Transporte', 'Transporte Público', 'Manutenção Veículo'],'Lazer': ['Cinema', 'Shows', 'Viagens', 'Hobbies', 'Streaming'],'Saúde': ['Farmácia', 'Consulta', 'Plano de Saúde', 'Academia'],'Educação': ['Cursos', 'Livros', 'Mensalidade'],'Compras': ['Roupas', 'Eletrônicos', 'Casa', 'Pets'],'Dívidas': ['Parcela Empréstimo', 'Parcela Financiamento'],'Outras Despesas': ['Impostos', 'Presentes', 'Doações', 'Serviços']},
        'investimento': {'Renda Fixa': ['CDB', 'Tesouro Direto', 'LCI/LCA'],'Renda Variável': ['Ações', 'Fundos Imobiliários', 'ETFs'],'Outros': ['Criptomoedas', 'Previdência Privada']}
    };
    
    const STORAGE_KEYS = {
        TRANSACTIONS: 'financeApp_transactions',
        TEMPLATES: 'financeApp_fixedTemplates',
        CATEGORIES: 'financeApp_categories',
        SETTINGS: 'financeApp_settings',
        DEBTS: 'financeApp_debts' // Nova chave para dívidas
    };

    // --- Funções de Persistência de Dados ---
    const saveData = () => {
        try {
            localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
            localStorage.setItem(STORAGE_KEYS.TEMPLATES, JSON.stringify(fixedTransactionTemplates));
            localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categoryData));
            localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
            localStorage.setItem(STORAGE_KEYS.DEBTS, JSON.stringify(debts)); // Salva as dívidas
        } catch (error) {
            console.error("Erro ao salvar dados no localStorage:", error);
            showGenericModal({type: 'alert', title: 'Erro de Salvamento', message: 'Não foi possível salvar seus dados. O armazenamento do navegador pode estar cheio ou desativado.'});
        }
    };

    const loadData = () => {
        try {
            const loadedTransactions = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
            if (loadedTransactions) {
                transactions = JSON.parse(loadedTransactions);
            }

            const loadedTemplates = localStorage.getItem(STORAGE_KEYS.TEMPLATES);
            if (loadedTemplates) {
                fixedTransactionTemplates = JSON.parse(loadedTemplates);
            }

            const loadedCategories = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
            if (loadedCategories) {
                categoryData = JSON.parse(loadedCategories);
            }

            const loadedSettings = localStorage.getItem(STORAGE_KEYS.SETTINGS);
            if (loadedSettings) {
                settings = JSON.parse(loadedSettings);
            }
            
            const loadedDebts = localStorage.getItem(STORAGE_KEYS.DEBTS); // Carrega as dívidas
            if (loadedDebts) {
                debts = JSON.parse(loadedDebts);
            }
        } catch (error) {
            console.error("Erro ao carregar dados do localStorage:", error);
            showGenericModal({type: 'alert', title: 'Erro ao Carregar', message: 'Não foi possível carregar seus dados salvos. Eles podem estar corrompidos.'});
            // Reset to default if data is corrupt
            transactions = [];
            fixedTransactionTemplates = [];
            debts = [];
        }
    };


    // --- Funções ---
    const formatCurrency = (value) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    const formatDate = (dateString) => new Date(dateString + 'T00:00:00').toLocaleDateString('pt-BR');

    const renderPendingTransactionsOnDashboard = () => {
        const monthName = currentPendingDate.toLocaleString('pt-BR', { month: 'long' });
        const year = currentPendingDate.getFullYear();
        pendingMonthDisplay.textContent = `${monthName.charAt(0).toUpperCase() + monthName.slice(1)} ${year}`;

        const currentMonth = currentPendingDate.getMonth();
        const currentYear = currentPendingDate.getFullYear();

        const pendingTransactionsThisMonth = transactions.filter(t => {
            const tDate = new Date(t.date + 'T00:00:00');
            return t.status === 'pending' && tDate.getMonth() === currentMonth && tDate.getFullYear() === currentYear;
        }).sort((a, b) => new Date(a.date) - new Date(b.date));

        if (pendingTransactionsThisMonth.length === 0) {
            pendingListDashboard.innerHTML = '<div class="space-y-3"><p class="text-sm text-gray-500 text-center py-4">Nenhuma transação pendente para este mês.</p></div>';
            return;
        }
        
        let html = '<div class="space-y-3">';
        html += pendingTransactionsThisMonth.map(t => {
            const isDebtPayment = t.debtId;
            const amountField = t.isVariable && !isDebtPayment
                ? `<input type="number" step="0.01" data-amount-input-id="${t.id}" value="${t.amount.toFixed(2)}" class="w-32 border border-gray-300 rounded-md py-1 px-2 text-right font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500">`
                : `<p class="font-bold text-gray-800">${formatCurrency(t.amount)}</p>`;

            return `
            <div class="flex items-center justify-between p-3 bg-gray-50 rounded-md border space-x-4">
                <div class="flex-1 min-w-0">
                    <p class="font-medium text-gray-800 truncate">${t.description || 'Transação Fixa'}</p>
                    <p class="text-sm text-gray-500">${formatDate(t.date)} 
                        ${t.isVariable ? '<span class="text-xs font-semibold bg-blue-100 text-blue-800 py-0.5 px-1.5 rounded-full ml-2">Valor Variável</span>' : ''}
                        ${isDebtPayment ? `<span class="text-xs font-semibold bg-orange-100 text-orange-800 py-0.5 px-1.5 rounded-full ml-2">Dívida ${t.installmentNumber}/${t.installmentsTotal}</span>` : ''}
                    </p>
                </div>
                <div class="flex-shrink-0">
                    ${amountField}
                </div>
                <div class="flex-shrink-0 flex items-center space-x-2">
                    <button data-action="approve" data-id="${t.id}" title="Aprovar" class="p-2 text-green-600 hover:bg-green-100 rounded-full transition-colors">
                        <svg class="w-5 h-5 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                    </button>
                    <button data-action="delete" data-id="${t.id}" title="Excluir" class="p-2 text-red-600 hover:bg-red-100 rounded-full transition-colors">
                        <svg class="w-5 h-5 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                </div>
            </div>
            `;
        }).join('');
        html += '</div>';
        pendingListDashboard.innerHTML = html;
    };

    const updateDashboard = () => {
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        const completedTransactions = transactions.filter(t => t.status === 'completed');
        
        const totalEntradas = completedTransactions.filter(t => t.type === 'entrada').reduce((acc, t) => acc + t.amount, 0);
        const totalSaidas = completedTransactions.filter(t => t.type === 'saida' || t.type === 'investimento').reduce((acc, t) => acc + t.amount, 0);
        const totalInvestido = completedTransactions.filter(t => t.type === 'investimento').reduce((acc, t) => acc + t.amount, 0);
        
        const totalDebtBalance = debts.reduce((sum, debt) => {
            const remainingPrincipal = debt.installments.filter(p => p.status === 'pending').reduce((s, p) => s + p.principal, 0);
            return sum + remainingPrincipal;
        }, 0);

        const faturaAtual = completedTransactions.filter(t => {
            const transactionDate = new Date(t.date + 'T00:00:00');
            return t['payment-method'] === 'Cartão de Crédito' &&
                   transactionDate.getMonth() === currentMonth &&
                   transactionDate.getFullYear() === currentYear;
        }).reduce((acc, t) => acc + t.amount, 0);

        balanceValueEl.textContent = formatCurrency(totalEntradas - totalSaidas);
        investmentsValueEl.textContent = formatCurrency(totalInvestido);
        invoiceValueEl.textContent = formatCurrency(faturaAtual);
        debtsValueEl.textContent = formatCurrency(totalDebtBalance); 

        renderPendingTransactionsOnDashboard();
        updateOverviewCard();
    };
    
    const generateTransactionListHTML = (data) => {
        if (data.length === 0) return '<p class="text-gray-500 text-center py-4">Nenhuma transação encontrada.</p>';
        const headers = [{ key: 'date', label: 'Data' },{ key: 'description', label: 'Descrição' },{ key: 'category', label: 'Categoria' },{ key: 'amount', label: 'Valor' }];
        const headerHTML = headers.map(h => {
            const isSorted = currentSort.key === h.key;
            const sortClass = isSorted ? currentSort.direction : '';
            return `<th class="p-3 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider sortable-header ${sortClass}" data-sort-key="${h.key}">${h.label} <span class="sort-icon">▲</span></th>`;
        }).join('');

        const rowsHTML = data.map(t => `
            <tr class="border-b border-gray-200 hover:bg-gray-50" data-id="${t.id}" title="Clique para editar">
                <td class="p-3 whitespace-nowrap">${formatDate(t.date)}</td>
                <td class="p-3">${t.description || '-'}</td>
                <td class="p-3">${t.category}${t.subcategory ? ' (' + t.subcategory + ')' : ''}</td>
                <td class="p-3 text-right font-medium">${(t.type === 'saida' || t.type === 'investimento') ? '-' : ''}${formatCurrency(t.amount)}</td>
            </tr>`).join('');

        return `<div class="overflow-x-auto"><table class="w-full"><thead class="bg-gray-100"><tr>${headerHTML}</tr></thead><tbody id="transaction-list-body">${rowsHTML}</tbody></table></div>`;
    };

    const handlePendingAction = async (e) => {
        const button = e.target.closest('button[data-action]');
        if (!button) return;

        const { action, id } = button.dataset;
        const transactionId = parseInt(id);
        const transactionIndex = transactions.findIndex(t => t.id === transactionId);

        if (transactionIndex === -1) return;
        const transaction = transactions[transactionIndex];

        if (action === 'approve') {
            if (transaction.isVariable && !transaction.debtId) {
                const inputEl = document.querySelector(`input[data-amount-input-id="${transactionId}"]`);
                if (inputEl) {
                    const newAmount = parseFloat(inputEl.value);
                    if (!isNaN(newAmount) && newAmount > 0) {
                        transaction.amount = newAmount;
                    } else {
                        inputEl.focus();
                        inputEl.classList.add('invalid-field');
                        setTimeout(() => inputEl.classList.remove('invalid-field'), 2000);
                        return;
                    }
                }
            }
            transaction.status = 'completed';

            // Se for uma transação recorrente, cria a próxima
            if (transaction.templateId) {
                const template = fixedTransactionTemplates.find(t => t.id === transaction.templateId);
                if(template) {
                    const currentTransactionDate = new Date(transaction.date + 'T12:00:00Z');
                    const nextDate = new Date(currentTransactionDate.getTime());
                    nextDate.setUTCMonth(nextDate.getUTCMonth() + 1);

                    const originalDay = currentTransactionDate.getUTCDate();
                    if (nextDate.getUTCDate() !== originalDay) {
                        nextDate.setUTCDate(0);
                    }

                    const nextInstance = { ...template, id: Date.now(), templateId: template.id, status: 'pending', date: nextDate.toISOString().split('T')[0] };
                    transactions.push(nextInstance);
                }
            }

            // Se for pagamento de dívida, atualiza o status da parcela
            if (transaction.debtId && transaction.installmentNumber) {
                const debt = debts.find(d => d.id === transaction.debtId);
                if (debt) {
                    const installment = debt.installments.find(p => p.number === transaction.installmentNumber);
                    if (installment) installment.status = 'paid';
                }
            }

            updateDashboard();
            saveData();
        } else if (action === 'delete') {
            if (transaction.templateId) { // Se for transação fixa recorrente
                const choice = await showGenericModal({
                    title: 'Excluir Transação Pendente',
                    message: 'Esta é uma transação recorrente. O que você deseja fazer?',
                    buttons: [
                        { text: 'Cancelar', value: 'cancel', classes: 'bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300 font-semibold' },
                        { text: 'Excluir Somente Esta', value: 'one', classes: 'bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 font-semibold' },
                        { text: 'Parar Recorrência', value: 'all', classes: 'bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 font-semibold' }
                    ]
                });

                if (choice === 'one') {
                    const template = fixedTransactionTemplates.find(t => t.id === transaction.templateId);
                    if (template) {
                        const currentTransactionDate = new Date(transaction.date + 'T12:00:00Z');
                        const nextDate = new Date(currentTransactionDate.getTime());
                        nextDate.setUTCMonth(nextDate.getUTCMonth() + 1);

                        const originalDay = currentTransactionDate.getUTCDate();
                        if (nextDate.getUTCDate() !== originalDay) {
                            nextDate.setUTCDate(0);
                        }
                        const nextInstance = { ...template, id: Date.now(), templateId: template.id, status: 'pending', date: nextDate.toISOString().split('T')[0] };
                        transactions.push(nextInstance);
                    }
                    transactions.splice(transactionIndex, 1);
                } else if (choice === 'all') {
                    const templateIdToDelete = transaction.templateId;
                    fixedTransactionTemplates = fixedTransactionTemplates.filter(t => t.id !== templateIdToDelete);
                    transactions.splice(transactionIndex, 1);
                }
            } else if (transaction.debtId) { // Se for parcela de dívida
                await showGenericModal({ type: 'alert', title: 'Ação Inválida', message: 'Parcelas de dívidas não podem ser excluídas por aqui. Para cancelar, gerencie a dívida original.' });
                return; // Impede a exclusão
            } else { // Transação normal
                transactions.splice(transactionIndex, 1);
            }
            updateDashboard();
            saveData();
        }
    };
    
    const applyFiltersAndRender = (baseData) => {
        let filteredData = [...baseData];
        
        // Aplicar filtro de período
        const startDate = document.getElementById('modal-start-date-filter')?.value;
        const endDate = document.getElementById('modal-end-date-filter')?.value;
        if (startDate) {
            filteredData = filteredData.filter(t => new Date(t.date) >= new Date(startDate));
        }
        if (endDate) {
            filteredData = filteredData.filter(t => new Date(t.date) <= new Date(endDate));
        }

        if (activeFilters.type !== 'all') {
            filteredData = filteredData.filter(t => t.type === activeFilters.type);
        }
        if (activeFilters.category !== 'all') {
            filteredData = filteredData.filter(t => t.category === activeFilters.category);
        }
        if (activeFilters.subcategory !== 'all') {
            filteredData = filteredData.filter(t => t.subcategory === activeFilters.subcategory);
        }

        // Calcular soma e atualizar total
        const totalAmount = filteredData.reduce((sum, t) => {
            if (t.type === 'entrada') return sum + t.amount;
            if (t.type === 'saida' || t.type === 'investimento') return sum - t.amount;
            return sum;
        }, 0);
        const totalEl = document.getElementById('modal-filtered-total');
        if (totalEl) {
            totalEl.textContent = `Total Filtrado: ${formatCurrency(totalAmount)}`;
            totalEl.className = totalAmount >= 0 ? 'font-bold text-green-600' : 'font-bold text-red-600';
        }

        filteredData.sort((a, b) => {
            let valA = a[currentSort.key]; let valB = b[currentSort.key];
            if (typeof valA === 'string') { valA = valA.toLowerCase(); valB = valB.toLowerCase(); }
            if (valA < valB) return currentSort.direction === 'asc' ? -1 : 1;
            if (valA > valB) return currentSort.direction === 'asc' ? 1 : -1;
            return 0;
        });
        
        currentFilteredModalData = filteredData; // Salva para exportação
        transactionsModalList.innerHTML = generateTransactionListHTML(filteredData);
        
        transactionsModalList.querySelectorAll('.sortable-header').forEach(header => {
            header.addEventListener('click', () => {
                const sortKey = header.dataset.sortKey;
                if (currentSort.key === sortKey) {
                    currentSort.direction = currentSort.direction === 'asc' ? 'desc' : 'asc';
                } else {
                    currentSort.key = sortKey;
                    currentSort.direction = 'desc';
                }
                applyFiltersAndRender(baseData);
            });
        });
    };

    const openTransactionsModal = (config) => {
        transactionsModalTitle.textContent = config.title;
        modalTransactionData = config.transactions;
        transactionsModalFilters.innerHTML = '';
        transactionsModalList.innerHTML = '';
        activeFilters = { type: 'all', category: 'all', subcategory: 'all', startDate: '', endDate: '' };
        currentSort = { key: 'date', direction: 'desc' };
        exportBtn.classList.toggle('hidden', config.cardType !== 'balance');


        let filtersHTML = '<div class="space-y-4 p-3 bg-gray-50 rounded-md border">';
        let mainFiltersHTML = '<div class="flex flex-wrap items-end gap-4">';
        
        // Adiciona filtro de período se especificado
        if (config.filters.includes('period')) {
            mainFiltersHTML += `
                <div class="flex-shrink-0">
                    <label for="modal-start-date-filter" class="text-sm font-medium text-gray-700">De:</label>
                    <input type="date" id="modal-start-date-filter" class="w-full border border-gray-300 rounded-md shadow-sm py-1.5 px-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
                </div>
                <div class="flex-shrink-0">
                    <label for="modal-end-date-filter" class="text-sm font-medium text-gray-700">Até:</label>
                    <input type="date" id="modal-end-date-filter" class="w-full border border-gray-300 rounded-md shadow-sm py-1.5 px-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
                </div>
            `;
        }
        
        if (config.filters.includes('type')) {
            mainFiltersHTML += `
                <div class="flex-shrink-0">
                    <span class="text-sm font-medium text-gray-700 block mb-1">Tipo:</span>
                    <div id="modal-type-filter-buttons" class="flex rounded-md shadow-sm">
                        <button data-type="all" class="filter-type-btn active">Todos</button>
                        <button data-type="entrada" class="filter-type-btn">Entrada</button>
                        <button data-type="saida" class="filter-type-btn">Saída</button>
                        <button data-type="investimento" class="filter-type-btn">Invest.</button>
                    </div>
                </div>
            `;
        }

        if (config.filters.includes('category')) {
            const allCategories = [...new Set(modalTransactionData.map(t => t.category))].sort();
            let options = '<option value="all">Todas as Categorias</option>';
            allCategories.forEach(cat => { options += `<option value="${cat}">${cat}</option>`; });
            mainFiltersHTML += `<div class="flex-grow"><label for="modal-category-filter" class="text-sm font-medium text-gray-700">Categoria:</label><select id="modal-category-filter" class="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm">${options}</select></div>`;
        }
        
        if (config.filters.includes('subcategory')) {
            const allSubcategories = [...new Set(modalTransactionData.map(t => t.subcategory).filter(Boolean))].sort();
            let options = '<option value="all">Todas as Subcategorias</option>';
            allSubcategories.forEach(sub => { options += `<option value="${sub}">${sub}</option>`; });
             mainFiltersHTML += `<div class="flex-grow"><label for="modal-subcategory-filter" class="text-sm font-medium text-gray-700">Subcategoria:</label><select id="modal-subcategory-filter" class="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm">${options}</select></div>`;
        }

        mainFiltersHTML += '</div>';
        filtersHTML += mainFiltersHTML;

        if (config.cardType === 'balance') {
            filtersHTML += `<div id="modal-filtered-total" class="text-right text-lg mt-3 p-2 rounded-md bg-gray-100"></div>`;
        }

        filtersHTML += '</div>';
        transactionsModalFilters.innerHTML = filtersHTML;

        // Adiciona Event Listeners para os novos filtros
        const updateOnChange = () => applyFiltersAndRender(modalTransactionData);

        document.querySelectorAll('.filter-type-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.filter-type-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                activeFilters.type = btn.dataset.type;
                updateOnChange();
            });
        });

        ['modal-start-date-filter', 'modal-end-date-filter', 'modal-category-filter', 'modal-subcategory-filter'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.addEventListener('change', updateOnChange);
        });
        
        applyFiltersAndRender(modalTransactionData);
        transactionsModal.classList.remove('hidden');
    };

    const toggleValuesVisibility = () => {
        areValuesVisible = !areValuesVisible;
        valueElements.forEach(el => {
            el.classList.toggle('value-hidden', !areValuesVisible);
            el.classList.toggle('value-visible', areValuesVisible);
        });
        toggleVisibilityBtns.forEach(btn => {
            btn.innerHTML = areValuesVisible ?
                `<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>` :
                `<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7 .525-1.666 1.489-3.14 2.675-4.325m11.313 4.325a10.049 10.049 0 01-4.425 4.425m-7.233-7.233C6.63 7.423 9.17 6 12 6c1.556 0 3.041.455 4.385 1.25M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>`;
        });
    };

    const openModal = () => { transactionModal.classList.remove('hidden'); if (!dateInput.value) dateInput.value = new Date().toISOString().split('T')[0]; setDefaultTransactionType(); };
    
    const closeModal = () => {
        transactionModal.classList.add('hidden');
        transactionForm.reset();
        resetTypeButtons();
        isVariableContainer.classList.add('hidden');
        selectedTransactionType = null;
        document.querySelectorAll('.invalid-field').forEach(el => el.classList.remove('invalid-field'));
        formErrorMessage.classList.add('hidden');
        
        // Reset to create mode
        editingTransactionId = null;
        document.getElementById('modal-headline').textContent = 'Nova Transação';
        transactionForm.querySelector('button[type="submit"]').textContent = 'Adicionar Transação';
        isFixedCheckbox.disabled = false;
        document.getElementById('is-variable').disabled = false;
    };

    const openModalForEdit = (transactionId) => {
        const transaction = transactions.find(t => t.id === transactionId);
        if (!transaction || transaction.status !== 'completed') {
            if(transaction.status === 'pending') showGenericModal({type: 'alert', title: 'Aviso', message: 'Não é possível editar uma transação pendente. Aprove-a primeiro.'});
            return;
        };
         if (transaction.debtId) {
            showGenericModal({type: 'alert', title: 'Aviso', message: 'Pagamentos de dívidas não podem ser editados diretamente.'});
            return;
        }

        editingTransactionId = transactionId;

        document.getElementById('modal-headline').textContent = 'Editar Transação';
        transactionForm.querySelector('button[type="submit"]').textContent = 'Salvar Alterações';

        resetTypeButtons();
        const typeBtn = document.querySelector(`.transaction-type-btn[data-type="${transaction.type}"]`);
        if (typeBtn) {
            typeBtn.classList.add('active');
            selectedTransactionType = transaction.type;
            updateFormForType(transaction.type);
        }

        amountInput.value = transaction.amount;
        dateInput.value = transaction.date;
        description.value = transaction.description || '';

        setTimeout(() => {
            categorySelect.value = transaction.category;
            populateSubcategories();
            subcategorySelect.value = transaction.subcategory || '';
            if (transaction.type === 'saida') {
                paymentMethodSelect.value = transaction['payment-method'] || '';
            }
        }, 10);

        isFixedCheckbox.checked = transaction.isFixed;
        isFixedCheckbox.disabled = true; // Cannot change fixed status after creation
        isVariableContainer.classList.toggle('hidden', !transaction.isFixed);
        document.getElementById('is-variable').checked = transaction.isVariable;
        document.getElementById('is-variable').disabled = true;

        closeTransactionsModal();
        transactionModal.classList.remove('hidden');
    };
    
    const resetTypeButtons = () => transactionTypeBtns.forEach(btn => btn.classList.remove('active'));
    const updateFormForType = (type) => { populateCategories(type); paymentMethodContainer.classList.toggle('hidden', type !== 'saida'); };
    const setDefaultTransactionType = () => { resetTypeButtons(); const defaultType = 'saida'; const defaultBtn = document.querySelector(`.transaction-type-btn[data-type="${defaultType}"]`); if (defaultBtn) { defaultBtn.classList.add('active'); selectedTransactionType = defaultType; updateFormForType(defaultType); } };
    
    const populateCategories = (type) => {
        if(!categorySelect) return;
        const currentCategory = categorySelect.value;
        categorySelect.innerHTML = '<option value="">Selecione</option>';
        if (type && categoryData[type]) {
            Object.keys(categoryData[type]).sort((a,b) => a.localeCompare(b)).forEach(cat => {
                const option = document.createElement('option');
                option.value = cat;
                option.textContent = cat;
                categorySelect.appendChild(option);
            });
        }
        if (categoryData[type]?.[currentCategory]) {
            categorySelect.value = currentCategory;
        }
        populateSubcategories();
    };
    
    const populateSubcategories = () => {
        if(!subcategorySelect) return;
        const currentSubcategory = subcategorySelect.value;
        const selectedCategory = categorySelect.value;
        subcategorySelect.innerHTML = '<option value="">Selecione</option>';
        if (selectedCategory && selectedTransactionType && categoryData[selectedTransactionType]?.[selectedCategory]) {
            categoryData[selectedTransactionType][selectedCategory].sort((a,b) => a.localeCompare(b)).forEach(sub => {
                const option = document.createElement('option');
                option.value = sub;
                option.textContent = sub;
                subcategorySelect.appendChild(option);
            });
        }
        if(categoryData[selectedTransactionType]?.[selectedCategory]?.includes(currentSubcategory)){
            subcategorySelect.value = currentSubcategory;
        }
    };

    const closeTransactionsModal = () => transactionsModal.classList.add('hidden');

    const validateForm = () => {
        const errors = [];
        let isValid = true;
        
        document.querySelectorAll('.invalid-field').forEach(el => el.classList.remove('invalid-field'));

        if (!selectedTransactionType) {
            errors.push('Selecione um tipo de transação (Entrada, Saída ou Investimento).');
            isValid = false;
        }
        if (!amountInput.value || parseFloat(amountInput.value) <= 0) {
            errors.push('O valor deve ser maior que zero.');
            amountInput.classList.add('invalid-field');
            isValid = false;
        }
        if (!dateInput.value) {
            errors.push('Selecione uma data.');
            dateInput.classList.add('invalid-field');
            isValid = false;
        }
        if (!categorySelect.value) {
            errors.push('Selecione uma categoria.');
            categorySelect.classList.add('invalid-field');
            isValid = false;
        }
        if (selectedTransactionType === 'saida' && !paymentMethodSelect.value) {
            errors.push('Selecione uma forma de pagamento.');
            paymentMethodSelect.classList.add('invalid-field');
            isValid = false;
        }
        if (!isValid) {
            formErrorMessage.innerHTML = errors.join('<br>');
            formErrorMessage.classList.remove('hidden');
        } else {
            formErrorMessage.classList.add('hidden');
        }
        return isValid;
    }

    // --- Funções do Modal Genérico ---
    const showGenericModal = (config) => {
        return new Promise((resolve) => {
            genericModalTitle.textContent = config.title;
            genericModalMessage.textContent = config.message || '';
            genericModalMessage.classList.toggle('hidden', !config.message);
            
            genericModalInputContainer.classList.toggle('hidden', config.type !== 'prompt');
            genericModalInput.value = config.defaultValue || '';

            genericModalButtons.innerHTML = ''; 

            const createButton = (text, classes, value) => {
                const button = document.createElement('button');
                button.textContent = text;
                button.className = classes;
                button.onclick = () => {
                    genericModal.classList.add('hidden');
                    resolve(value === 'input' ? genericModalInput.value : value);
                };
                genericModalButtons.appendChild(button);
            };
            
            if (config.buttons) {
                config.buttons.forEach(btnConfig => {
                    createButton(btnConfig.text, btnConfig.classes, btnConfig.value);
                });
            } else {
                switch(config.type) {
                    case 'alert':
                        createButton('OK', 'bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 font-semibold', true);
                        break;
                    case 'confirm':
                        createButton('Cancelar', 'bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300 font-semibold', false);
                        createButton('Confirmar', 'bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 font-semibold', true);
                        break;
                    case 'prompt':
                        createButton('Cancelar', 'bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300 font-semibold', null);
                        createButton('Salvar', 'bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 font-semibold', 'input');
                        break;
                }
            }

            genericModal.classList.remove('hidden');
            if (config.type === 'prompt') {
                genericModalInput.focus();
            }
        });
    };

    // --- Funções de Configurações ---
    const openSettingsModal = () => {
        invoiceClosingDayInput.value = settings.invoiceClosingDay;
        savingsGoalInput.value = settings.savingsGoal > 0 ? settings.savingsGoal : '';
        renderCategoryManagement();
        settingsModal.classList.remove('hidden');
    };

    const closeSettingsModal = () => {
        settingsModal.classList.add('hidden');
    };

    const renderCategoryManagement = () => {
        categoryManagementContainer.innerHTML = ''; 
        const typeTitles = { 'entrada': 'Receitas', 'saida': 'Despesas', 'investimento': 'Investimentos' };

        Object.keys(categoryData).forEach(type => {
            const typeDetails = document.createElement('details');
            typeDetails.className = 'type-item bg-white rounded-lg border border-gray-200';

            const typeSummary = document.createElement('summary');
            typeSummary.className = 'p-3 cursor-pointer font-semibold text-gray-700 flex justify-between items-center';
            typeSummary.innerHTML = `<span>${typeTitles[type]}</span><svg class="w-5 h-5 transition-transform transform details-arrow" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>`;
            typeDetails.appendChild(typeSummary);

            const typeContent = document.createElement('div');
            typeContent.className = 'p-3 border-t space-y-2';

            const categories = categoryData[type];
            Object.keys(categories).sort((a,b) => a.localeCompare(b)).forEach(category => {
                const categoryItem = document.createElement('details');
                categoryItem.className = 'category-item bg-gray-50 rounded-md border';

                const summary = document.createElement('summary');
                summary.className = 'flex items-center justify-between p-2 cursor-pointer';
                
                const nameAndBudget = document.createElement('div');
                nameAndBudget.className = 'flex items-center space-x-2';
                nameAndBudget.innerHTML = `<span class="font-medium text-gray-800">${category}</span>`;

                if (type === 'saida') {
                    const budgetInput = `<input type="number" data-budget-category="${category}" step="0.01" placeholder="Orçamento" value="${settings.budgets[category] || ''}" class="w-28 border border-gray-200 rounded-md py-1 px-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500">`;
                    nameAndBudget.innerHTML += budgetInput;
                }

                const buttons = document.createElement('div');
                buttons.className = 'flex items-center space-x-1';
                buttons.innerHTML = `
                    <button title="Editar Categoria" data-action="edit-category" data-type="${type}" data-category="${category}" class="p-1 text-gray-500 hover:text-blue-600 rounded-full hover:bg-gray-200"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="pointer-events: none;"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L16.732 3.732z"></path></svg></button>
                    <button title="Excluir Categoria" data-action="delete-category" data-type="${type}" data-category="${category}" class="p-1 text-gray-500 hover:text-red-600 rounded-full hover:bg-gray-200"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="pointer-events: none;"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg></button>
                `;

                summary.appendChild(nameAndBudget);
                summary.appendChild(buttons);
                categoryItem.appendChild(summary);

                const subCategoryContainer = document.createElement('div');
                subCategoryContainer.className = 'pl-6 pr-2 pb-2';
                
                categories[category].sort((a,b) => a.localeCompare(b)).forEach(sub => {
                   subCategoryContainer.innerHTML += `
                    <div class="flex items-center justify-between py-1 border-t">
                        <span class="text-sm text-gray-700">${sub}</span>
                        <div class="flex items-center space-x-1">
                             <button title="Editar Subcategoria" data-action="edit-subcategory" data-type="${type}" data-category="${category}" data-subcategory="${sub}" class="p-1 text-gray-500 hover:text-blue-600 rounded-full hover:bg-gray-200"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="pointer-events: none;"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L16.732 3.732z"></path></svg></button>
                             <button title="Excluir Subcategoria" data-action="delete-subcategory" data-type="${type}" data-category="${category}" data-subcategory="${sub}" class="p-1 text-gray-500 hover:text-red-600 rounded-full hover:bg-gray-200"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="pointer-events: none;"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg></button>
                        </div>
                    </div>
                    `;
                });
                
                subCategoryContainer.innerHTML += `<div class="mt-2"><button data-action="add-subcategory" data-type="${type}" data-category="${category}" class="text-sm text-blue-600 hover:underline">+ Adicionar Subcategoria</button></div>`;
                categoryItem.appendChild(subCategoryContainer);
                typeContent.appendChild(categoryItem);
            });
            
            typeContent.innerHTML += `<div class="mt-4"><button data-action="add-category" data-type="${type}" class="w-full text-center text-sm bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2 rounded-md">+ Adicionar Categoria</button></div>`;
            typeDetails.appendChild(typeContent)
            categoryManagementContainer.appendChild(typeDetails);
        });
    };

    const handleCategoryManagementAction = async (e) => {
        const target = e.target;
        
        if (target.matches('input[data-budget-category]')) {
            const category = target.dataset.budgetCategory;
            const value = parseFloat(target.value);
            if (value > 0) settings.budgets[category] = value;
            else delete settings.budgets[category];
            return;
        }

        const button = target.closest('button');
        if (!button) return;

        const { action, type, category, subcategory } = button.dataset;
        if (!action) return;
        
        e.preventDefault();

        const typeTitles = { entrada: 'Receitas', saida: 'Despesas', investimento: 'Investimentos' };
        
        switch(action) {
            case 'add-category': {
                const newName = await showGenericModal({ type: 'prompt', title: `Nova Categoria em ${typeTitles[type]}`, message: 'Digite o nome da nova categoria:'});
                if (newName && !categoryData[type][newName]) {
                    categoryData[type][newName] = [];
                    if (type === 'saida') settings.budgets[newName] = 0;
                    renderCategoryManagement();
                    populateCategories(selectedTransactionType);
                    saveData();
                } else if (newName) {
                    await showGenericModal({ type: 'alert', title: 'Erro', message: 'Essa categoria já existe.'});
                }
                break;
            }
            case 'delete-category': {
                const confirmed = await showGenericModal({ type: 'confirm', title: 'Excluir Categoria', message: `Tem certeza que deseja excluir a categoria "${category}" e todas as suas subcategorias?`});
                if (confirmed) {
                    delete categoryData[type][category];
                    if (type === 'saida') delete settings.budgets[category];
                    renderCategoryManagement();
                    populateCategories(selectedTransactionType);
                    saveData();
                }
                break;
            }
            case 'edit-category': {
                const newName = await showGenericModal({ type: 'prompt', title: 'Editar Categoria', message: `Novo nome para a categoria "${category}":`, defaultValue: category });
                if (newName && newName !== category && !categoryData[type][newName]) {
                    Object.defineProperty(categoryData[type], newName,
                        Object.getOwnPropertyDescriptor(categoryData[type], category));
                    delete categoryData[type][category];
                    if (type === 'saida' && settings.budgets[category] !== undefined) {
                        settings.budgets[newName] = settings.budgets[category];
                        delete settings.budgets[category];
                    }
                    renderCategoryManagement();
                    populateCategories(selectedTransactionType);
                    saveData();
                } else if (newName && newName !== category) {
                     await showGenericModal({ type: 'alert', title: 'Erro', message: 'Essa categoria já existe.'});
                }
                break;
            }
            case 'add-subcategory': {
                const newSub = await showGenericModal({ type: 'prompt', title: 'Nova Subcategoria', message: `Nome da nova subcategoria para "${category}":`});
                if (newSub && !categoryData[type][category].includes(newSub)) {
                    categoryData[type][category].push(newSub);
                    renderCategoryManagement();
                    populateCategories(selectedTransactionType);
                    saveData();
                } else if (newSub) {
                    await showGenericModal({ type: 'alert', title: 'Erro', message: 'Essa subcategoria já existe.'});
                }
                break;
            }
            case 'delete-subcategory': {
                const confirmed = await showGenericModal({ type: 'confirm', title: 'Excluir Subcategoria', message: `Tem certeza que deseja excluir a subcategoria "${subcategory}"?`});
                if (confirmed) {
                    const index = categoryData[type][category].indexOf(subcategory);
                    if (index > -1) {
                        categoryData[type][category].splice(index, 1);
                        renderCategoryManagement();
                        populateCategories(selectedTransactionType);
                        saveData();
                    }
                }
                break;
            }
             case 'edit-subcategory': {
                const newName = await showGenericModal({ type: 'prompt', title: 'Editar Subcategoria', message: `Novo nome para a subcategoria "${subcategory}":`, defaultValue: subcategory});
                const index = categoryData[type][category].indexOf(subcategory);
                if (newName && newName !== subcategory && !categoryData[type][category].includes(newName) && index > -1) {
                    categoryData[type][category][index] = newName;
                    renderCategoryManagement();
                    populateCategories(selectedTransactionType);
                    saveData();
                } else if (newName && newName !== subcategory) {
                    await showGenericModal({ type: 'alert', title: 'Erro', message: 'Essa subcategoria já existe.'});
                }
                break;
            }
        }
    };

    const updateOverviewCard = () => {
        const currentMonth = currentPendingDate.getMonth();
        const currentYear = currentPendingDate.getFullYear();

        const transactionsThisMonth = transactions.filter(t => {
            const tDate = new Date(t.date + 'T00:00:00');
            return tDate.getMonth() === currentMonth && tDate.getFullYear() === currentYear;
        });

        const completedThisMonth = transactionsThisMonth.filter(t => t.status === 'completed');
        const pendingThisMonth = transactionsThisMonth.filter(t => t.status === 'pending');

        // Valores principais (só concluídos)
        const income = completedThisMonth.filter(t => t.type === 'entrada').reduce((sum, t) => sum + t.amount, 0);
        const expenses = completedThisMonth.filter(t => t.type === 'saida').reduce((sum, t) => sum + t.amount, 0);
        const balance = income - expenses;

        overviewIncomeEl.textContent = formatCurrency(income);
        overviewExpensesEl.textContent = formatCurrency(expenses);
        overviewBalanceEl.textContent = formatCurrency(balance);

        // Valores pendentes
        const pendingIncome = pendingThisMonth.filter(t => t.type === 'entrada').reduce((sum, t) => sum + t.amount, 0);
        const pendingExpenses = pendingThisMonth.filter(t => t.type === 'saida').reduce((sum, t) => sum + t.amount, 0);

        overviewIncomePendingEl.textContent = pendingIncome > 0 ? `(+ ${formatCurrency(pendingIncome)} pendente)` : '';
        overviewExpensesPendingEl.textContent = pendingExpenses > 0 ? `(+ ${formatCurrency(pendingExpenses)} pendente)` : '';

        // --- Gráfico de Pizza ---
        const expenseByCategory = completedThisMonth
            .filter(t => t.type === 'saida')
            .reduce((acc, t) => {
                acc[t.category] = (acc[t.category] || 0) + t.amount;
                return acc;
            }, {});

        const chartLabels = Object.keys(expenseByCategory);
        const chartData = Object.values(expenseByCategory);

        if (categoryChartInstance) { categoryChartInstance.destroy(); }
        if (chartLabels.length > 0) {
             categoryChartInstance = new Chart(categoryChartCanvas, {
                type: 'doughnut',
                data: {
                    labels: chartLabels,
                    datasets: [{
                        data: chartData,
                        backgroundColor: ['#ef4444', '#f97316', '#eab308', '#84cc16', '#22c55e', '#10b981', '#14b8a6', '#06b6d4', '#3b82f6', '#8b5cf6', '#d946ef', '#ec4899'],
                        borderWidth: 0,
                    }]
                },
                options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
            });
        } else {
             categoryChartCanvas.getContext('2d').clearRect(0, 0, categoryChartCanvas.width, categoryChartCanvas.height);
        }

        // --- Barras de Orçamento e Meta ---
        budgetBarsContainer.innerHTML = '';
        const budgetedCategories = Object.keys(settings.budgets);
        
        // 1. Renderiza barras para categorias com orçamento
        budgetedCategories.forEach(category => {
            const budgetAmount = settings.budgets[category] || 0;
            if (budgetAmount <= 0) return;

            const spentCompleted = completedThisMonth.filter(t => t.category === category && t.type === 'saida').reduce((sum, t) => sum + t.amount, 0);
            const spentPending = pendingThisMonth.filter(t => t.category === category && t.type === 'saida').reduce((sum, t) => sum + t.amount, 0);
            const totalSpent = spentCompleted + spentPending;
            
            const completedPercent = (spentCompleted / budgetAmount) * 100;
            const pendingPercent = (spentPending / budgetAmount) * 100;
            
            budgetBarsContainer.innerHTML += `
                <div class="budget-bar-container rounded-md p-2 cursor-pointer transition-colors" data-category="${category}">
                    <div class="flex justify-between items-center mb-1 text-sm"><span class="font-semibold text-gray-700">${category}</span><span class="text-gray-500"><span class="value-visible font-medium text-gray-800">${formatCurrency(totalSpent)}</span> / ${formatCurrency(budgetAmount)}</span></div>
                    <div class="w-full bg-gray-200 rounded-full h-4 overflow-hidden flex"><div class="bg-green-500 h-4" style="width: ${Math.min(completedPercent, 100)}%"></div><div class="bg-gray-400 h-4" style="width: ${Math.min(pendingPercent, 100 - completedPercent)}%"></div></div>
                </div>`;
        });

        // 2. Renderiza alertas para categorias sem orçamento
        const allExpenseCategoriesThisMonth = [...new Set(transactionsThisMonth.filter(t => t.type === 'saida').map(t => t.category))];
        const unbudgetedCategories = allExpenseCategoriesThisMonth.filter(cat => !budgetedCategories.includes(cat) || !settings.budgets[cat]);

         if (unbudgetedCategories.length > 0) {
            let unbudgetedHTML = '<h4 class="text-sm font-semibold text-gray-600 mt-4 border-t pt-3">Gastos Não Orçados</h4>';
            unbudgetedCategories.forEach(category => {
                const totalSpent = transactionsThisMonth.filter(t => t.category === category && t.type === 'saida').reduce((sum, t) => sum + t.amount, 0);
                unbudgetedHTML += `
                    <div class="flex items-center justify-between p-2 bg-yellow-50 border border-yellow-200 rounded-md">
                        <div class="flex items-center"><svg class="w-5 h-5 text-yellow-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg><span class="font-semibold text-gray-700">${category}</span></div>
                        <div class="flex items-center"><span class="text-gray-600 mr-3 font-medium value-visible">${formatCurrency(totalSpent)}</span><button data-action="regularize" data-category="${category}" class="text-sm text-blue-600 hover:underline font-semibold">Regularizar</button></div>
                    </div>`;
            });
            budgetBarsContainer.innerHTML += unbudgetedHTML;
        }

        // 3. Renderiza meta de economia
        if (settings.savingsGoal > 0) {
            const savedAmount = balance; // Saldo do mês é a economia
            const savedPercent = Math.max(0, (savedAmount / settings.savingsGoal) * 100);
            budgetBarsContainer.innerHTML += `
                     <div class="mt-6 border-t pt-4">
                         <div class="flex justify-between items-center mb-1 text-sm"><span class="font-semibold text-gray-700">Meta de Economia</span><span class="text-gray-500"><span class="value-visible font-medium text-gray-800">${formatCurrency(savedAmount)}</span> / ${formatCurrency(settings.savingsGoal)}</span></div>
                         <div class="w-full bg-gray-200 rounded-full h-4 overflow-hidden"><div class="bg-blue-500 h-4" style="width: ${Math.min(savedPercent, 100)}%"></div></div>
                </div>`;
        }
    };
    
    // --- Funções de Previsão Futura ---
    const openForecastModal = () => {
        calculateAndRenderForecast();
        forecastModal.classList.remove('hidden');
    };

    const closeForecastModal = () => {
        forecastModal.classList.add('hidden');
    };

    const calculateAndRenderForecast = () => {
        // 1. Calcular médias
        const completed = transactions.filter(t => t.status === 'completed' && !t.templateId);
        const historicalMonths = new Set();
        completed.forEach(t => {
            const [year, month] = t.date.split('-');
            historicalMonths.add(`${year}-${month}`);
        });

        const monthCount = historicalMonths.size > 0 ? historicalMonths.size : 1;

        const avgVarIncome = completed.filter(t => t.type === 'entrada').reduce((s, t) => s + t.amount, 0) / monthCount;
        const avgVarExpense = completed.filter(t => t.type === 'saida').reduce((s, t) => s + t.amount, 0) / monthCount;
        const avgVarInvestment = completed.filter(t => t.type === 'investimento').reduce((s, t) => s + t.amount, 0) / monthCount;

        const fixedIncome = fixedTransactionTemplates.filter(t => t.type === 'entrada').reduce((s, t) => s + t.amount, 0);
        const fixedExpense = fixedTransactionTemplates.filter(t => t.type === 'saida').reduce((s, t) => s + t.amount, 0);
        const fixedInvestment = fixedTransactionTemplates.filter(t => t.type === 'investimento').reduce((s, t) => s + t.amount, 0);

        const totalAvgIncome = avgVarIncome + fixedIncome;
        const totalAvgExpense = avgVarExpense + fixedExpense;
        const totalAvgInvestment = avgVarInvestment + fixedInvestment;
        const totalAvgBalance = totalAvgIncome - totalAvgExpense - totalAvgInvestment;

        document.getElementById('forecast-avg-income').textContent = formatCurrency(totalAvgIncome);
        document.getElementById('forecast-avg-expense').textContent = formatCurrency(totalAvgExpense);
        document.getElementById('forecast-avg-investment').textContent = formatCurrency(totalAvgInvestment);
        document.getElementById('forecast-avg-balance').textContent = formatCurrency(totalAvgBalance);
        
        // 2. Preparar dados para o gráfico
        const labels = [];
        const incomeData = [];
        const expenseData = [];
        const balanceData = [];

        const completedTransactions = transactions.filter(t => t.status === 'completed');
        const currentBalance = completedTransactions.filter(t => t.type === 'entrada').reduce((acc, t) => acc + t.amount, 0) - completedTransactions.filter(t => t.type === 'saida' || t.type === 'investimento').reduce((acc, t) => acc + t.amount, 0);
        
        let cumulativeBalance = currentBalance;
        forecastDataForExport = [];

        for (let i = 1; i <= 12; i++) {
            const futureDate = new Date();
            futureDate.setMonth(futureDate.getMonth() + i);
            labels.push(futureDate.toLocaleString('pt-BR', { month: 'short', year: '2-digit' }));

            cumulativeBalance += totalAvgBalance;
            incomeData.push(totalAvgIncome);
            expenseData.push(totalAvgExpense + totalAvgInvestment);
            balanceData.push(cumulativeBalance);

            forecastDataForExport.push({
                'Mês': futureDate.toLocaleString('pt-BR', { month: 'long', year: 'numeric' }),
                'Receita Projetada': totalAvgIncome,
                'Despesa Projetada': totalAvgExpense + totalAvgInvestment,
                'Saldo Projetado': cumulativeBalance
            });
        }

        // 3. Renderizar gráfico
        if(forecastChartInstance) forecastChartInstance.destroy();

        forecastChartInstance = new Chart(forecastChartCanvas, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    { label: 'Saldo', data: balanceData, borderColor: '#3b82f6', backgroundColor: '#3b82f620', fill: true, tension: 0.1 },
                    { label: 'Receitas', data: incomeData, borderColor: '#22c55e', hidden: true },
                    { label: 'Despesas', data: expenseData, borderColor: '#ef4444', hidden: true }
                ]
            },
            options: { responsive: true, maintainAspectRatio: false }
        });
    };
    
    const exportForecastDataToXLSX = () => {
         if (forecastDataForExport.length === 0) {
            showGenericModal({ type: 'alert', title: 'Aviso', message: 'Não há dados de previsão para exportar.'});
            return;
        }

        const worksheet = XLSX.utils.json_to_sheet(forecastDataForExport);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Previsao_Futura");
        XLSX.writeFile(workbook, "previsao_financeira.xlsx");
    };
    
    const exportFilteredDataToXLSX = () => {
        if (currentFilteredModalData.length === 0) {
            showGenericModal({ type: 'alert', title: 'Aviso', message: 'Não há dados filtrados para exportar.'});
            return;
        }

        const dataToExport = currentFilteredModalData.map(t => ({
            'Data': formatDate(t.date),
            'Descrição': t.description,
            'Tipo': t.type,
            'Categoria': t.category,
            'Subcategoria': t.subcategory || '',
            'Valor': t.amount
        }));

        const worksheet = XLSX.utils.json_to_sheet(dataToExport);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Transacoes");
        XLSX.writeFile(workbook, "extrato_financeiro.xlsx");
    };

    const downloadTemplateXLSX = () => {
        const transactionsData = [
            { Data: '2025-10-05', Descrição: 'Salário', Tipo: 'entrada', Categoria: 'Salário', Subcategoria: 'Salário Mensal', Valor: 5000.00, 'Forma Pagamento': '' },
            { Data: '2025-10-07', Descrição: 'Aluguel', Tipo: 'saida', Categoria: 'Moradia', Subcategoria: 'Aluguel', Valor: 1500.00, 'Forma Pagamento': 'Transferência Bancária' }
        ];
        const categoriesData = [
            { Tipo: 'saida', Categoria: 'Alimentação', Subcategoria: 'Supermercado' },
            { Tipo: 'saida', Categoria: 'Alimentação', Subcategoria: 'Restaurante' },
            { Tipo: 'entrada', Categoria: 'Salário', Subcategoria: 'Salário Mensal' }
        ];
        const wsTransactions = XLSX.utils.json_to_sheet(transactionsData);
        const wsCategories = XLSX.utils.json_to_sheet(categoriesData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, wsTransactions, 'Transacoes');
        XLSX.utils.book_append_sheet(wb, wsCategories, 'Categorias');
        XLSX.writeFile(wb, 'modelo_importacao.xlsx');
    };

    const exportAllDataToXLSX = () => {
        const transactionsToExport = transactions.map(t => ({...t}));
        const flatCategories = [];
        Object.keys(categoryData).forEach(type => {
            Object.keys(categoryData[type]).forEach(category => {
                if (categoryData[type][category].length > 0) {
                     categoryData[type][category].forEach(subcategory => {
                        flatCategories.push({ Tipo: type, Categoria: category, Subcategoria: subcategory });
                    });
                } else {
                    flatCategories.push({ Tipo: type, Categoria: category, Subcategoria: '' });
                }
            });
        });
        
        const wsTransactions = XLSX.utils.json_to_sheet(transactionsToExport);
        const wsCategories = XLSX.utils.json_to_sheet(flatCategories);
        const wsSettings = XLSX.utils.json_to_sheet([settings]);
        
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, wsTransactions, 'Transacoes');
        XLSX.utils.book_append_sheet(wb, wsCategories, 'Categorias');
        XLSX.utils.book_append_sheet(wb, wsSettings, 'Configuracoes');
        XLSX.writeFile(wb, 'backup_financeiro_completo.xlsx');
        saveData();
    };
    
    const importDataFromXLSX = (file) => {
        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const data = e.target.result;
                const workbook = XLSX.read(data, { type: 'binary' });
                
                const wsTransactions = workbook.Sheets['Transacoes'];
                const wsCategories = workbook.Sheets['Categorias'];
                const wsSettings = workbook.Sheets['Configuracoes'];
                
                if(!wsTransactions || !wsCategories) {
                     throw new Error('O arquivo deve conter as abas "Transacoes" e "Categorias".');
                }

                const confirmed = await showGenericModal({ type: 'confirm', title: 'Importar Dados', message: 'Isso substituirá TODOS os seus dados atuais. Deseja continuar?' });
                if (!confirmed) return;

                // Importar Transações
                const newTransactions = XLSX.utils.sheet_to_json(wsTransactions);
                transactions = newTransactions.map(t => ({...t, date: new Date((t.Data - (25567 + 2)) * 86400 * 1000).toISOString().split('T')[0]})); // Ajuste para data Excel
                fixedTransactionTemplates = transactions.filter(t => t.templateId && !transactions.some(t2 => t2.id === t.templateId)); // Reconstrói templates

                // Importar Categorias
                const newCategoriesData = XLSX.utils.sheet_to_json(wsCategories);
                const importedCategoryData = {'entrada': {}, 'saida': {}, 'investimento': {}};
                newCategoriesData.forEach(row => {
                    if (!importedCategoryData[row.Tipo]) return;
                    if (!importedCategoryData[row.Tipo][row.Categoria]) {
                        importedCategoryData[row.Tipo][row.Categoria] = [];
                    }
                    if (row.Subcategoria) {
                        importedCategoryData[row.Tipo][row.Categoria].push(row.Subcategoria);
                    }
                });
                categoryData = importedCategoryData;
                
                // Importar Configurações
                if(wsSettings) {
                    const newSettings = XLSX.utils.sheet_to_json(wsSettings)[0];
                    if(newSettings) settings = newSettings;
                }

                updateDashboard();
                saveData();
                await showGenericModal({type: 'alert', title: 'Sucesso', message: 'Dados importados com sucesso!'});
                
            } catch (error) {
                console.error("Erro ao importar:", error);
                await showGenericModal({type: 'alert', title: 'Erro de Importação', message: `Não foi possível ler o arquivo. Verifique se o formato está correto. Detalhe: ${error.message}`});
            } finally {
                importFileInput.value = ''; // Limpa o input
            }
        };
        reader.onerror = async () => {
             await showGenericModal({type: 'alert', title: 'Erro', message: 'Não foi possível ler o arquivo.'});
             importFileInput.value = '';
        };
        reader.readAsBinaryString(file);
    };

    // --- Funções de Análise com IA ---
    const openAiModal = () => {
        aiInitialState.classList.remove('hidden');
        aiLoadingState.classList.add('hidden');
        aiResultState.classList.add('hidden');
        aiResultState.innerHTML = '';
        aiModal.classList.remove('hidden');
    };

    const closeAiModal = () => {
        aiModal.classList.add('hidden');
    };
    
    const simpleMarkdownToHtml = (markdown) => {
        return markdown
            .replace(/^### (.*$)/gim, '<h3>$1</h3>')
            .replace(/^## (.*$)/gim, '<h3>$1</h3>')
            .replace(/^# (.*$)/gim, '<h3>$1</h3>')
            .replace(/^\* (.*$)/gim, '<ul><li>$1</li></ul>') // Handle lists
            .replace(/<\/ul>\s?<ul>/g, '') // Merge consecutive lists
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\n/g, '<br>');
    };
    
    const analyzeFinancesWithAI = async () => {
        aiInitialState.classList.add('hidden');
        aiLoadingState.classList.remove('hidden');
        
        try {
            // 1. Coletar e resumir dados
            const threeMonthsAgo = new Date();
            threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
            
            const recentTransactions = transactions.filter(t => new Date(t.date) >= threeMonthsAgo && t.status === 'completed');
            if (recentTransactions.length < 5) {
                aiResultState.innerHTML = '<p>Dados insuficientes para uma análise completa. Por favor, adicione mais transações (pelo menos 5 nos últimos 3 meses).</p>';
                aiLoadingState.classList.add('hidden');
                aiResultState.classList.remove('hidden');
                return;
            }

            const income = recentTransactions.filter(t => t.type === 'entrada').reduce((s, t) => s + t.amount, 0);
            const expenses = recentTransactions.filter(t => t.type === 'saida').reduce((s, t) => s + t.amount, 0);
            
            const expensesByCategory = recentTransactions.filter(t => t.type === 'saida').reduce((acc, t) => {
                acc[t.category] = (acc[t.category] || 0) + t.amount;
                return acc;
            }, {});

            const expenseSummary = Object.entries(expensesByCategory)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 5) // Top 5
                .map(([cat, val]) => `  - ${cat}: ${formatCurrency(val)} (Orçamento: ${settings.budgets[cat] ? formatCurrency(settings.budgets[cat]) : 'Não definido'})`)
                .join('\n');

            // 2. Construir o Prompt
            const userPrompt = `
                Analise meus dados financeiros resumidos dos últimos 3 meses:
                - Renda Total no período: ${formatCurrency(income)}
                - Despesas Totais no período: ${formatCurrency(expenses)}
                - Principais Categorias de Despesa no período:
                ${expenseSummary}
                - Minha meta de economia mensal é: ${formatCurrency(settings.savingsGoal)}
                - Meu saldo médio mensal foi de aproximadamente: ${formatCurrency((income - expenses) / 3)}

                Com base nisso, quais são os principais insights e o que posso fazer para melhorar minhas finanças?
            `;

            const systemPrompt = "Você é um analista financeiro especialista. Seu objetivo é analisar os dados financeiros de um usuário e fornecer insights acionáveis e dicas práticas em português do Brasil. Seja claro, objetivo e encorajador. Formate sua resposta usando markdown com títulos (###), listas com asteriscos (*), e negrito (**) para facilitar a leitura. Comece com um 'Resumo Geral', depois aponte os 'Pontos Positivos', em seguida os 'Pontos de Atenção/Melhora' e, por fim, ofereça de 2 a 3 'Sugestões Práticas'.";

            // 3. Chamar a API Gemini
            const apiKey = "";
            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;

            const payload = {
                contents: [{ parts: [{ text: userPrompt }] }],
                systemInstruction: { parts: [{ text: systemPrompt }] },
            };
            
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                throw new Error(`API Error: ${response.statusText}`);
            }
            
            const result = await response.json();
            const text = result.candidates?.[0]?.content?.parts?.[0]?.text;

            if (text) {
                aiResultState.innerHTML = simpleMarkdownToHtml(text);
            } else {
                throw new Error("A resposta da IA está vazia.");
            }

        } catch (error) {
            console.error("Erro na análise com IA:", error);
            aiResultState.innerHTML = `<p class="text-red-600">Ocorreu um erro ao tentar analisar suas finanças. Por favor, tente novamente mais tarde.</p><p class="text-xs text-gray-500 mt-2">${error.message}</p>`;
        } finally {
            aiLoadingState.classList.add('hidden');
            aiResultState.classList.remove('hidden');
        }
    };

    // --- NOVO: Funções de Dívidas ---
    const openDebtManagementModal = () => {
        renderDebtManagementList();
        debtManagementModal.classList.remove('hidden');
    };
    const closeDebtManagementModal = () => debtManagementModal.classList.add('hidden');

    const openAddEditDebtModal = (debtId = null) => {
        debtForm.reset();
        document.getElementById('debt-form-error-message').classList.add('hidden');
        editingDebtId = debtId;
        if(debtId){
            const debt = debts.find(d => d.id === debtId);
            if(!debt) return;
            addEditDebtModalTitle.textContent = "Editar Dívida";
            document.getElementById('debt-description').value = debt.description;
            document.getElementById('debt-total-amount').value = debt.totalAmount;
            document.getElementById('debt-down-payment').value = debt.downPayment;
            document.getElementById('debt-installments-count').value = debt.installmentsCount;
            document.getElementById('debt-interest-rate').value = debt.interestRate * (debt.interestPeriod === 'yearly' ? 12 : 1) * 100;
            document.getElementById('debt-interest-period').value = debt.interestPeriod;
            document.getElementById('debt-start-date').value = debt.startDate;
            debtForm.querySelector(`input[name="amortization-type"][value="${debt.amortizationType}"]`).checked = true;

            // Disable fields that shouldn't be changed after creation to avoid inconsistencies
            ['debt-total-amount', 'debt-down-payment', 'debt-installments-count', 'debt-interest-rate', 'debt-interest-period', 'debt-start-date'].forEach(id => {
                document.getElementById(id).disabled = true;
            });
            debtForm.querySelectorAll('input[name="amortization-type"]').forEach(radio => radio.disabled = true);
        } else {
            addEditDebtModalTitle.textContent = "Nova Dívida";
            // Enable all fields
            ['debt-total-amount', 'debt-down-payment', 'debt-installments-count', 'debt-interest-rate', 'debt-interest-period', 'debt-start-date'].forEach(id => {
                document.getElementById(id).disabled = false;
            });
             debtForm.querySelectorAll('input[name="amortization-type"]').forEach(radio => radio.disabled = false);
        }
        addEditDebtModal.classList.remove('hidden');
    };
    const closeAddEditDebtModal = () => addEditDebtModal.classList.add('hidden');

    const openDebtDetailsModal = (debtId) => {
        viewingDebtId = debtId;
        renderDebtDetailsModal();
        debtDetailsModal.classList.remove('hidden');
    };
    const closeDebtDetailsModal = () => debtDetailsModal.classList.add('hidden');

    const renderDebtManagementList = () => {
        if (debts.length === 0) {
            debtListContainer.innerHTML = '<p class="text-gray-500 text-center py-8">Nenhuma dívida cadastrada.</p>';
            return;
        }

        const tableHTML = `
            <div class="overflow-x-auto">
                <table class="w-full text-sm text-left text-gray-500">
                    <thead class="text-xs text-gray-700 uppercase bg-gray-100">
                        <tr>
                            <th class="px-4 py-3">Descrição</th>
                            <th class="px-4 py-3 text-right">Saldo Devedor</th>
                            <th class="px-4 py-3 text-right">Próxima Parcela</th>
                            <th class="px-4 py-3 text-center">Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${debts.map(debt => {
                            const remainingPrincipal = debt.installments.filter(p => p.status === 'pending').reduce((s, p) => s + p.principal, 0);
                            const nextInstallment = debt.installments.find(p => p.status === 'pending');
                            return `
                                <tr class="border-b hover:bg-gray-50" data-id="${debt.id}" title="Clique para ver detalhes">
                                    <td class="px-4 py-3 font-medium text-gray-900">${debt.description}</td>
                                    <td class="px-4 py-3 text-right font-semibold">${formatCurrency(remainingPrincipal)}</td>
                                    <td class="px-4 py-3 text-right">${nextInstallment ? `${formatCurrency(nextInstallment.value)} em ${formatDate(nextInstallment.dueDate)}` : 'Quitada'}</td>
                                    <td class="px-4 py-3 flex justify-center items-center space-x-2">
                                        <button data-action="edit-debt" data-id="${debt.id}" class="font-medium text-blue-600 hover:underline p-1" onclick="event.stopPropagation()">Editar</button>
                                        <button data-action="delete-debt" data-id="${debt.id}" class="font-medium text-red-600 hover:underline p-1" onclick="event.stopPropagation()">Excluir</button>
                                    </td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            </div>
        `;
        debtListContainer.innerHTML = tableHTML;
    };

    const renderDebtDetailsModal = () => {
        const debt = debts.find(d => d.id === viewingDebtId);
        if (!debt) return;

        debtDetailsModalTitle.textContent = debt.description;

        // 1. Render Summary
        const paidInstallments = debt.installments.filter(p => p.status === 'paid');
        const totalPaid = paidInstallments.reduce((sum, p) => sum + p.value, 0);
        const remainingPrincipal = debt.installments.filter(p => p.status === 'pending').reduce((s, p) => s + p.principal, 0);
        const totalInterest = debt.installments.reduce((sum, p) => sum + p.interest, 0);
        
        debtSummaryContainer.innerHTML = `
            <div><p class="text-sm text-gray-500">Valor Total</p><p class="text-lg font-bold">${formatCurrency(debt.totalAmount)}</p></div>
            <div><p class="text-sm text-gray-500">Total Pago</p><p class="text-lg font-bold text-green-600">${formatCurrency(totalPaid)}</p></div>
            <div><p class="text-sm text-gray-500">Saldo Devedor</p><p class="text-lg font-bold text-red-600">${formatCurrency(remainingPrincipal)}</p></div>
            <div><p class="text-sm text-gray-500">Total Juros</p><p class="text-lg font-bold">${formatCurrency(totalInterest)}</p></div>
        `;

        // 2. Render Amortization Table
        const tableHeader = `
            <thead class="text-xs text-gray-700 uppercase bg-gray-100 sticky top-0">
                <tr>
                    <th class="px-4 py-2 text-center">#</th>
                    <th class="px-4 py-2">Vencimento</th>
                    <th class="px-4 py-2 text-right">Parcela</th>
                    <th class="px-4 py-2 text-right">Juros</th>
                    <th class="px-4 py-2 text-right">Amortização</th>
                    <th class="px-4 py-2 text-right">Saldo Devedor</th>
                    <th class="px-4 py-2 text-center">Status</th>
                </tr>
            </thead>`;
        
        const tableBody = debt.installments.map(p => `
            <tr class="border-b ${p.status === 'paid' ? 'bg-green-50' : 'bg-white'}">
                <td class="px-4 py-2 text-center font-medium ${p.status === 'paid' ? 'installment-paid' : ''}">${p.number}</td>
                <td class="px-4 py-2 ${p.status === 'paid' ? 'installment-paid' : ''}">${formatDate(p.dueDate)}</td>
                <td class="px-4 py-2 text-right font-semibold ${p.status === 'paid' ? 'installment-paid' : ''}">${formatCurrency(p.value)}</td>
                <td class="px-4 py-2 text-right ${p.status === 'paid' ? 'installment-paid' : ''}">${formatCurrency(p.interest)}</td>
                <td class="px-4 py-2 text-right ${p.status === 'paid' ? 'installment-paid' : ''}">${formatCurrency(p.principal)}</td>
                <td class="px-4 py-2 text-right ${p.status === 'paid' ? 'installment-paid' : ''}">${formatCurrency(p.remainingBalance)}</td>
                <td class="px-4 py-2 text-center">
                    <span class="px-2 py-1 text-xs font-semibold rounded-full ${p.status === 'paid' ? 'bg-green-200 text-green-800' : 'bg-yellow-200 text-yellow-800'}">
                        ${p.status === 'paid' ? 'Pago' : 'Pendente'}
                    </span>
                </td>
            </tr>
        `).join('');

        debtAmortizationTableContainer.innerHTML = `<table class="w-full text-sm">${tableHeader}<tbody>${tableBody}</tbody></table>`;
        
        // 3. Reset prepayment section
        document.getElementById('prepayment-amount').value = '';
        prepaymentSimulationResult.classList.add('hidden');
        prepaymentSimulationResult.innerHTML = '';
    };

    const calculateAmortization = (principal, term, monthlyRate, type) => {
        const installments = [];
        let remainingBalance = principal;

        if (type === 'PRICE') {
            if (monthlyRate === 0) {
                const installmentValue = principal / term;
                for (let i = 1; i <= term; i++) {
                    remainingBalance -= installmentValue;
                    installments.push({ number: i, value: installmentValue, interest: 0, principal: installmentValue, remainingBalance: remainingBalance < 0.01 ? 0 : remainingBalance });
                }
            } else {
                const i = monthlyRate;
                const n = term;
                const installmentValue = principal * (i * Math.pow(1 + i, n)) / (Math.pow(1 + i, n) - 1);
                
                for (let k = 1; k <= n; k++) {
                    const interest = remainingBalance * i;
                    const principalPaid = installmentValue - interest;
                    remainingBalance -= principalPaid;
                    installments.push({ number: k, value: installmentValue, interest: interest, principal: principalPaid, remainingBalance: remainingBalance < 0.01 ? 0 : remainingBalance });
                }
            }
        } else if (type === 'SAC') {
            const principalAmortization = principal / term;
            for (let i = 1; i <= term; i++) {
                const interest = remainingBalance * monthlyRate;
                const installmentValue = principalAmortization + interest;
                remainingBalance -= principalAmortization;
                 installments.push({ number: i, value: installmentValue, interest: interest, principal: principalAmortization, remainingBalance: remainingBalance < 0.01 ? 0 : remainingBalance });
            }
        }
        return installments;
    };

    const validateDebtForm = () => {
        const errors = [];
        let isValid = true;
        const form = document.getElementById('debt-form');
        form.querySelectorAll('.invalid-field').forEach(el => el.classList.remove('invalid-field'));

        const getVal = id => document.getElementById(id).value;
        const getNum = id => parseFloat(getVal(id)) || 0;

        if (!getVal('debt-description')) {
            errors.push('A descrição é obrigatória.');
            document.getElementById('debt-description').classList.add('invalid-field');
            isValid = false;
        }
        if (getNum('debt-total-amount') <= 0) {
             errors.push('O valor total da dívida deve ser maior que zero.');
             document.getElementById('debt-total-amount').classList.add('invalid-field');
            isValid = false;
        }
         if (getNum('debt-installments-count') <= 0) {
             errors.push('O número de parcelas deve ser maior que zero.');
             document.getElementById('debt-installments-count').classList.add('invalid-field');
            isValid = false;
        }
        if (!getVal('debt-start-date')) {
            errors.push('A data da primeira parcela é obrigatória.');
            document.getElementById('debt-start-date').classList.add('invalid-field');
            isValid = false;
        }
         if (getNum('debt-total-amount') <= getNum('debt-down-payment')) {
             errors.push('O valor de entrada não pode ser maior ou igual ao valor total.');
             document.getElementById('debt-down-payment').classList.add('invalid-field');
            isValid = false;
        }
        
        if(!isValid){
            debtFormErrorMessage.innerHTML = errors.join('<br>');
            debtFormErrorMessage.classList.remove('hidden');
        } else {
            debtFormErrorMessage.classList.add('hidden');
        }
        return isValid;
    };

    const handleDebtDeletion = async (debtId) => {
        const confirmed = await showGenericModal({
            type: 'confirm',
            title: 'Excluir Dívida',
            message: 'Tem certeza que deseja excluir esta dívida? Todas as parcelas pendentes associadas a ela também serão removidas.'
        });

        if (confirmed) {
            // Remove future pending transactions associated with this debt
            transactions = transactions.filter(t => t.debtId !== debtId || t.status === 'completed');
            // Remove the debt itself
            debts = debts.filter(d => d.id !== debtId);

            saveData();
            updateDashboard();
            renderDebtManagementList(); // Re-render the list in the modal
        }
    };
    
    // --- Event Listeners ---
    addTransactionBtn.addEventListener('click', openModal);
    closeModalBtn.addEventListener('click', closeModal);
    transactionModal.addEventListener('click', (e) => { if (e.target === transactionModal) closeModal(); });
    isFixedCheckbox.addEventListener('change', () => { isVariableContainer.classList.toggle('hidden', !isFixedCheckbox.checked); });
    categorySelect.addEventListener('change', populateSubcategories);
    toggleVisibilityBtns.forEach(btn => btn.addEventListener('click', (e) => { e.stopPropagation(); toggleValuesVisibility(); }));
    closeTransactionsModalBtn.addEventListener('click', closeTransactionsModal);
    transactionsModal.addEventListener('click', (e) => { if (e.target === transactionsModal) closeTransactionsModal(); });
    exportBtn.addEventListener('click', exportFilteredDataToXLSX);
    forecastBtn.addEventListener('click', openForecastModal);
    closeForecastModalBtn.addEventListener('click', closeForecastModal);
    forecastModal.addEventListener('click', (e) => { if (e.target === forecastModal) closeForecastModal(); });
    exportForecastBtn.addEventListener('click', exportForecastDataToXLSX);
    downloadTemplateBtn.addEventListener('click', downloadTemplateXLSX);
    exportAllBtn.addEventListener('click', exportAllDataToXLSX);
    importAllBtn.addEventListener('click', () => importFileInput.click());
    importFileInput.addEventListener('change', (e) => { if (e.target.files[0]) importDataFromXLSX(e.target.files[0])});
    aiBtn.addEventListener('click', openAiModal);
    closeAiModalBtn.addEventListener('click', closeAiModal);
    aiModal.addEventListener('click', (e) => { if(e.target === aiModal) closeAiModal(); });
    analyzeFinanceBtn.addEventListener('click', analyzeFinancesWithAI);
    
    prevMonthBtn.addEventListener('click', () => {
        currentPendingDate.setMonth(currentPendingDate.getMonth() - 1);
        updateDashboard();
    });

    nextMonthBtn.addEventListener('click', () => {
        currentPendingDate.setMonth(currentPendingDate.getMonth() + 1);
        updateDashboard();
    });
    
    transactionTypeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            transactionTypeBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            selectedTransactionType = btn.dataset.type;
            updateFormForType(selectedTransactionType);
        });
    });
    cards.forEach(card => card.addEventListener('click', () => {
        const cardType = card.dataset.cardType;
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        switch (cardType) {
            case 'balance':
                openTransactionsModal({
                    cardType: 'balance',
                    title: 'Extrato Completo',
                    transactions: transactions.filter(t => t.status === 'completed'),
                    filters: ['period', 'type', 'category']
                });
                break;
            case 'investments':
                 openTransactionsModal({
                    cardType: 'investments',
                    title: 'Total Investido',
                    transactions: transactions.filter(t => t.status === 'completed' && t.type === 'investimento'),
                    filters: []
                });
                break;
            case 'invoice':
                const invoiceTransactions = transactions.filter(t => {
                    const transactionDate = new Date(t.date + 'T00:00:00');
                    return t.status === 'completed' &&
                           t['payment-method'] === 'Cartão de Crédito' &&
                           transactionDate.getMonth() === currentMonth &&
                           transactionDate.getFullYear() === currentYear;
                });
                openTransactionsModal({
                    cardType: 'invoice',
                    title: 'Fatura Atual',
                    transactions: invoiceTransactions,
                    filters: []
                });
                break;
            case 'debts':
                openDebtManagementModal();
                break;
        }
    }));
    transactionForm.addEventListener('submit', (e) => {
        e.preventDefault();
        if (!validateForm()) return;
        
        const formData = new FormData(transactionForm);
        const transactionData = { type: selectedTransactionType };
        for (const [key, value] of formData.entries()) { transactionData[key] = value; }
        transactionData.amount = parseFloat(transactionData.amount);

        if (editingTransactionId) {
            const transactionIndex = transactions.findIndex(t => t.id === editingTransactionId);
            if (transactionIndex > -1) {
                const originalTransaction = transactions[transactionIndex];
                transactions[transactionIndex] = {
                    ...originalTransaction,
                    ...transactionData
                };
            }
        } else {
            const isFixed = isFixedCheckbox.checked;
            transactionData.isFixed = isFixed;
            transactionData.isVariable = isFixed ? document.getElementById('is-variable').checked : false;

            if (isFixed) {
                const templateBase = { ...transactionData };
                delete templateBase.date; 
                templateBase.id = `template-${Date.now()}`;
                fixedTransactionTemplates.push(templateBase);

                const firstInstance = { 
                    ...transactionData, 
                    id: Date.now(), 
                    templateId: templateBase.id, 
                    status: 'pending'
                };
                transactions.push(firstInstance);
            } else {
                const transaction = { ...transactionData, id: Date.now(), status: 'completed' };
                transactions.push(transaction);
            }
        }
        
        updateDashboard();
        closeModal();
        saveData();
    });

    settingsBtn.addEventListener('click', openSettingsModal);
    closeSettingsModalBtn.addEventListener('click', closeSettingsModal);
    settingsModal.addEventListener('click', (e) => { if (e.target === settingsModal) closeSettingsModal(); });

    settingsForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        settings.invoiceClosingDay = parseInt(invoiceClosingDayInput.value) || 1;
        settings.savingsGoal = parseFloat(savingsGoalInput.value) || 0;
        
        document.querySelectorAll('input[data-budget-category]').forEach(input => {
            const category = input.dataset.budgetCategory;
            const value = parseFloat(input.value);
            if (value > 0) {
                settings.budgets[category] = value;
            } else {
                delete settings.budgets[category];
            }
        });
        
        updateDashboard();
        saveData();
        await showGenericModal({ type: 'alert', title: 'Sucesso', message: 'Configurações salvas!'});
        closeSettingsModal();
    });
    
    budgetBarsContainer.addEventListener('click', (e) => {
        const regularizeButton = e.target.closest('button[data-action="regularize"]');
        if(regularizeButton) {
            e.stopPropagation();
            openSettingsModal();
            return;
        }

        const bar = e.target.closest('.budget-bar-container');
        if (!bar || !bar.dataset.category) return;

        const category = bar.dataset.category;
        const currentMonth = currentPendingDate.getMonth();
        const currentYear = currentPendingDate.getFullYear();

        const transactionsForCategory = transactions.filter(t => {
            const tDate = new Date(t.date + 'T00:00:00');
            return t.category === category &&
                   tDate.getMonth() === currentMonth &&
                   tDate.getFullYear() === currentYear;
        });
        
        openTransactionsModal({
            title: `Lançamentos de ${category}`,
            transactions: transactionsForCategory,
            filters: ['subcategory']
        });
    });

    transactionsModalList.addEventListener('click', (e) => {
        const row = e.target.closest('tr[data-id]');
        if(row) {
            const transactionId = parseInt(row.dataset.id);
            openModalForEdit(transactionId);
        }
    });

    categoryManagementContainer.addEventListener('click', handleCategoryManagementAction);
    categoryManagementContainer.addEventListener('change', handleCategoryManagementAction);
    pendingListDashboard.addEventListener('click', handlePendingAction);

    // --- NOVO: Event Listeners de Dívidas ---
    closeDebtManagementModalBtn.addEventListener('click', closeDebtManagementModal);
    debtManagementModal.addEventListener('click', (e) => { if(e.target === debtManagementModal) closeDebtManagementModal() });
    addNewDebtBtn.addEventListener('click', () => openAddEditDebtModal());

    closeAddEditDebtModalBtn.addEventListener('click', closeAddEditDebtModal);
    addEditDebtModal.addEventListener('click', (e) => { if(e.target === addEditDebtModal) closeAddEditDebtModal() });
    
    closeDebtDetailsModalBtn.addEventListener('click', closeDebtDetailsModal);
    debtDetailsModal.addEventListener('click', (e) => { if(e.target === debtDetailsModal) closeDebtDetailsModal() });

    debtListContainer.addEventListener('click', (e) => {
         const row = e.target.closest('tr[data-id]');
         if(row) {
              const debtId = parseInt(row.dataset.id);
              openDebtDetailsModal(debtId);
         }
         const deleteBtn = e.target.closest('button[data-action="delete-debt"]');
         if(deleteBtn) {
              const debtId = parseInt(deleteBtn.dataset.id);
              handleDebtDeletion(debtId);
         }
         const editBtn = e.target.closest('button[data-action="edit-debt"]');
         if(editBtn) {
              const debtId = parseInt(editBtn.dataset.id);
              openAddEditDebtModal(debtId);
         }
    });
    
    debtForm.addEventListener('submit', (e) => {
        e.preventDefault();
        if (!validateDebtForm()) return;
        
        // Get values
        const totalAmount = parseFloat(document.getElementById('debt-total-amount').value);
        const downPayment = parseFloat(document.getElementById('debt-down-payment').value) || 0;
        const principal = totalAmount - downPayment;
        const term = parseInt(document.getElementById('debt-installments-count').value);
        const rate = parseFloat(document.getElementById('debt-interest-rate').value) / 100;
        const ratePeriod = document.getElementById('debt-interest-period').value;
        const startDate = document.getElementById('debt-start-date').value;
        const amortizationType = debtForm.querySelector('input[name="amortization-type"]:checked').value;
        const description = document.getElementById('debt-description').value;

        // Convert rate to monthly if yearly
        const monthlyRate = ratePeriod === 'yearly' ? Math.pow(1 + rate, 1 / 12) - 1 : rate;

        // Calculate amortization schedule
        const installments = calculateAmortization(principal, term, monthlyRate, amortizationType);

        const newDebtId = Date.now();
        const newDebt = {
            id: newDebtId,
            description: description,
            totalAmount: totalAmount,
            downPayment: downPayment,
            financedAmount: principal,
            installmentsCount: term,
            interestRate: monthlyRate,
            interestPeriod: 'monthly', // Always store as monthly
            startDate: startDate,
            amortizationType: amortizationType,
            installments: []
        };

        const firstInstallmentDate = new Date(startDate + 'T12:00:00Z');

        installments.forEach((inst, index) => {
            const installmentDate = new Date(firstInstallmentDate.getTime());
            installmentDate.setUTCMonth(installmentDate.getUTCMonth() + index);

            newDebt.installments.push({
                ...inst,
                dueDate: installmentDate.toISOString().split('T')[0],
                status: 'pending'
            });

            // Create pending transaction
            const transaction = {
                id: Date.now() + index,
                debtId: newDebtId,
                description: `${description} - Parcela ${inst.number}/${term}`,
                amount: inst.value,
                date: installmentDate.toISOString().split('T')[0],
                type: 'saida',
                category: 'Dívidas',
                subcategory: 'Parcela Financiamento',
                status: 'pending',
                installmentNumber: inst.number,
                installmentsTotal: term,
            };
            transactions.push(transaction);
        });
        
        // If there's a down payment, add it as a completed transaction
        if (downPayment > 0) {
            const downPaymentTransaction = {
                id: Date.now() - 1,
                debtId: newDebtId,
                description: `Entrada: ${description}`,
                amount: downPayment,
                date: startDate, // Assuming down payment is on the start date
                type: 'saida',
                category: 'Dívidas',
                subcategory: 'Entrada Financiamento',
                status: 'completed'
            };
            transactions.push(downPaymentTransaction);
        }

        debts.push(newDebt);
        saveData();
        updateDashboard();
        closeAddEditDebtModal();
        renderDebtManagementList();
    });
   
    // --- Inicialização ---
    loadData();
    updateDashboard();
});
