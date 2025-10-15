document.addEventListener('DOMContentLoaded', () => {
    // =================================================================
    // ===== 1. CONFIGURAÇÃO E INICIALIZAÇÃO DO FIREBASE =====
    // =================================================================
    const firebaseConfig = {
      apiKey: "AIzaSyAlvRBErv2pG8BObnX8Ew0CqOQKypTM39c",
      authDomain: "controle-612f2.firebaseapp.com",
      projectId: "controle-612f2",
      storageBucket: "controle-612f2.appspot.com",
      messagingSenderId: "39791655795",
      appId: "1:39791655795:web:1b6ad76afa568af3b86306",
      measurementId: "G-7X9S01NMWX"
    };

    firebase.initializeApp(firebaseConfig);
    const auth = firebase.auth();
    const db = firebase.firestore();

    // =================================================================
    // ===== 2. SELETORES DE ELEMENTOS DO DOM =====
    // =================================================================
    // --- Elementos de Autenticação ---
    const appContainer = document.getElementById('app');
    const authOverlay = document.getElementById('auth-overlay');
    const authForm = document.getElementById('auth-form');
    const authTitle = document.getElementById('auth-title');
    const authEmailInput = document.getElementById('auth-email');
    const authPasswordInput = document.getElementById('auth-password');
    const authSubmitBtn = document.getElementById('auth-submit-btn');
    const toggleAuthModeBtn = document.getElementById('toggle-auth-mode-btn');
    const authPromptText = document.getElementById('auth-prompt-text');
    const authError = document.getElementById('auth-error');
    const logoutBtn = document.getElementById('logout-btn');

    // --- Elementos da Aplicação (do código original) ---
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
    const overviewIncomeEl = document.getElementById('overview-income');
    const overviewExpensesEl = document.getElementById('overview-expenses');
    const overviewBalanceEl = document.getElementById('overview-balance');
    const overviewIncomePendingEl = document.getElementById('overview-income-pending');
    const overviewExpensesPendingEl = document.getElementById('overview-expenses-pending');
    const categoryChartCanvas = document.getElementById('category-chart');
    const budgetBarsContainer = document.getElementById('budget-bars-container');

    // =================================================================
    // ===== 3. ESTADO DA APLICAÇÃO =====
    // =================================================================
    let currentUser = null;
    let transactions = [];
    let fixedTransactionTemplates = [];
    let debts = [];
    let currentPendingDate = new Date();
    let selectedTransactionType = null;
    let areValuesVisible = true;
    let currentSort = { key: 'date', direction: 'desc' };
    let modalTransactionData = [];
    let currentFilteredModalData = [];
    let activeFilters = { type: 'all', category: 'all', startDate: '', endDate: '' };
    let categoryChartInstance = null;
    let forecastChartInstance = null;
    let forecastDataForExport = [];
    let editingTransactionId = null;
    let editingDebtId = null;
    let viewingDebtId = null;
    let settings = {};
    let categoryData = {};
    
    // =================================================================
    // ===== 4. LÓGICA DE AUTENTICAÇÃO =====
    // =================================================================
    let isLoginMode = true;

    toggleAuthModeBtn.addEventListener('click', () => {
        isLoginMode = !isLoginMode;
        authTitle.textContent = isLoginMode ? 'Login' : 'Cadastre-se';
        authSubmitBtn.textContent = isLoginMode ? 'Entrar' : 'Criar Conta';
        authPromptText.textContent = isLoginMode ? 'Não tem uma conta?' : 'Já tem uma conta?';
        toggleAuthModeBtn.textContent = isLoginMode ? 'Cadastre-se' : 'Entrar';
        authError.textContent = '';
        authForm.reset();
    });

    authForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = authEmailInput.value;
        const password = authPasswordInput.value;
        authError.textContent = '';
        authSubmitBtn.disabled = true;

        if (isLoginMode) {
            auth.signInWithEmailAndPassword(email, password)
                .catch(error => { authError.textContent = "Email ou senha inválidos."; })
                .finally(() => { authSubmitBtn.disabled = false; });
        } else {
            auth.createUserWithEmailAndPassword(email, password)
                .catch(error => {
                    authError.textContent = error.code === 'auth/email-already-in-use' ? "Este email já está em uso." : "Erro ao criar conta. Verifique os dados.";
                })
                .finally(() => { authSubmitBtn.disabled = false; });
        }
    });

    logoutBtn.addEventListener('click', () => {
        auth.signOut();
    });

    // =================================================================
    // ===== 5. OBSERVADOR DE ESTADO DE AUTENTICAÇÃO =====
    // =================================================================
    auth.onAuthStateChanged(user => {
        if (user) {
            currentUser = user;
            authOverlay.classList.add('hidden');
            appContainer.classList.remove('opacity-0');
            initializeApp();
        } else {
            currentUser = null;
            authOverlay.classList.remove('hidden');
            appContainer.classList.add('opacity-0');
            resetAppState();
        }
    });

    // =================================================================
    // ===== 6. FUNÇÕES DE DADOS COM FIREBASE =====
    // =================================================================
    const saveData = async () => {
        if (!currentUser) return;
        const userDocRef = db.collection('users').doc(currentUser.uid);
        try {
            // Usamos merge: true para não sobrescrever o documento se ele já existir,
            // apenas atualiza os campos. É mais seguro.
            await userDocRef.set({ transactions, fixedTransactionTemplates, categoryData, settings, debts }, { merge: true });
        } catch (error) { 
            console.error("Erro ao salvar dados no Firebase:", error);
            showGenericModal({type: 'alert', title: 'Erro de Salvamento', message: 'Não foi possível salvar seus dados na nuvem.'});
        }
    };

    const loadData = async () => {
        if (!currentUser) return;
        const userDocRef = db.collection('users').doc(currentUser.uid);
        try {
            const doc = await userDocRef.get();
            if (doc.exists) {
                const data = doc.data();
                transactions = data.transactions || [];
                fixedTransactionTemplates = data.fixedTransactionTemplates || [];
                debts = data.debts || [];
                // Para categorias e configurações, definimos um padrão caso não existam no Firestore
                categoryData = data.categoryData || { 'entrada': { 'Salário': ['Adiantamento', 'Salário Mensal', 'Bônus', 'Férias'],'Investimentos': ['Dividendos', 'Venda de Ativos', 'Juros'],'Outras Receitas': ['Freelance', 'Vendas', 'Presente', 'Reembolso']}, 'saida': {'Alimentação': ['Supermercado', 'Restaurante', 'Delivery', 'Lanche'],'Moradia': ['Aluguel', 'Condomínio', 'Luz', 'Água', 'Internet', 'Gás', 'Manutenção'],'Transporte': ['Combustível', 'App de Transporte', 'Transporte Público', 'Manutenção Veículo'],'Lazer': ['Cinema', 'Shows', 'Viagens', 'Hobbies', 'Streaming'],'Saúde': ['Farmácia', 'Consulta', 'Plano de Saúde', 'Academia'],'Educação': ['Cursos', 'Livros', 'Mensalidade'],'Compras': ['Roupas', 'Eletrônicos', 'Casa', 'Pets'],'Dívidas': ['Parcela Empréstimo', 'Parcela Financiamento'],'Outras Despesas': ['Impostos', 'Presentes', 'Doações', 'Serviços']}, 'investimento': {'Renda Fixa': ['CDB', 'Tesouro Direto', 'LCI/LCA'],'Renda Variável': ['Ações', 'Fundos Imobiliários', 'ETFs'],'Outros': ['Criptomoedas', 'Previdência Privada']} };
                settings = data.settings || { invoiceClosingDay: 1, savingsGoal: 0, budgets: {} };
            } else {
                // Se o documento não existe (primeiro login), usamos o estado padrão e salvamos para criar o documento
                resetAppState();
                await saveData(); 
            }
        } catch (error) { 
            console.error("Erro ao carregar dados do Firebase:", error);
            showGenericModal({type: 'alert', title: 'Erro ao Carregar', message: 'Não foi possível carregar seus dados da nuvem.'});
        }
    };
    
    // =================================================================
    // ===== 7. INICIALIZAÇÃO E RESET DO APP =====
    // =================================================================
    const resetAppState = () => {
        transactions = [];
        fixedTransactionTemplates = [];
        debts = [];
        settings = { invoiceClosingDay: 1, savingsGoal: 0, budgets: {} };
        categoryData = { 'entrada': { 'Salário': ['Adiantamento', 'Salário Mensal', 'Bônus', 'Férias'],'Investimentos': ['Dividendos', 'Venda de Ativos', 'Juros'],'Outras Receitas': ['Freelance', 'Vendas', 'Presente', 'Reembolso']}, 'saida': {'Alimentação': ['Supermercado', 'Restaurante', 'Delivery', 'Lanche'],'Moradia': ['Aluguel', 'Condomínio', 'Luz', 'Água', 'Internet', 'Gás', 'Manutenção'],'Transporte': ['Combustível', 'App de Transporte', 'Transporte Público', 'Manutenção Veículo'],'Lazer': ['Cinema', 'Shows', 'Viagens', 'Hobbies', 'Streaming'],'Saúde': ['Farmácia', 'Consulta', 'Plano de Saúde', 'Academia'],'Educação': ['Cursos', 'Livros', 'Mensalidade'],'Compras': ['Roupas', 'Eletrônicos', 'Casa', 'Pets'],'Dívidas': ['Parcela Empréstimo', 'Parcela Financiamento'],'Outras Despesas': ['Impostos', 'Presentes', 'Doações', 'Serviços']}, 'investimento': {'Renda Fixa': ['CDB', 'Tesouro Direto', 'LCI/LCA'],'Renda Variável': ['Ações', 'Fundos Imobiliários', 'ETFs'],'Outros': ['Criptomoedas', 'Previdência Privada']} };
        updateDashboard(); // Limpa a UI
    };

    const initializeApp = async () => {
        await loadData();
        updateDashboard();
    };

    // =================================================================
    // ===== 8. LÓGICA DA APLICAÇÃO (CÓDIGO ORIGINAL) =====
    // =================================================================
    
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
                <div class="flex-shrink-0">${amountField}</div>
                <div class="flex-shrink-0 flex items-center space-x-2">
                    <button data-action="approve" data-id="${t.id}" title="Aprovar" class="p-2 text-green-600 hover:bg-green-100 rounded-full transition-colors">
                        <svg class="w-5 h-5 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                    </button>
                    <button data-action="delete" data-id="${t.id}" title="Excluir" class="p-2 text-red-600 hover:bg-red-100 rounded-full transition-colors">
                        <svg class="w-5 h-5 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                </div>
            </div>`;
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
    
    // (O resto do seu código JS, que é bastante extenso, continua aqui, exatamente como era antes)
    // ...
    
    addTransactionBtn.addEventListener('click', openModal);
    // ... e todos os outros event listeners ...

}); // Fim do 'DOMContentLoaded'

