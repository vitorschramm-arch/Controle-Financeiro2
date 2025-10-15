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

    try {
        firebase.initializeApp(firebaseConfig);
    } catch (e) {
        console.error("Firebase initialization error:", e);
        document.body.innerHTML = '<div style="color:red; text-align:center; padding-top: 50px;">Erro crítico na inicialização do Firebase. Verifique a configuração e a conexão.</div>';
        return;
    }
    
    const auth = firebase.auth();
    const db = firebase.firestore();

    // =================================================================
    // ===== 2. SELETORES DE ELEMENTOS DO DOM =====
    // =================================================================
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
    const descriptionInput = document.getElementById('description');
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
    let editingTransactionId = null;
    let settings = {};
    let categoryData = {};
    
    // =================================================================
    // ===== 4. LÓGICA DE AUTENTICAÇÃO =====
    // =================================================================
    let isLoginMode = true;
    
    if(toggleAuthModeBtn) {
        toggleAuthModeBtn.addEventListener('click', () => {
            isLoginMode = !isLoginMode;
            if(authTitle) authTitle.textContent = isLoginMode ? 'Login' : 'Cadastre-se';
            if(authSubmitBtn) authSubmitBtn.textContent = isLoginMode ? 'Entrar' : 'Criar Conta';
            if(authPromptText) authPromptText.textContent = isLoginMode ? 'Não tem uma conta?' : 'Já tem uma conta?';
            toggleAuthModeBtn.textContent = isLoginMode ? 'Cadastre-se' : 'Entrar';
            if(authError) authError.textContent = '';
            if(authForm) authForm.reset();
        });
    }

    if(authForm) {
        authForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = authEmailInput.value;
            const password = authPasswordInput.value;
            if(authError) authError.textContent = '';
            if(authSubmitBtn) authSubmitBtn.disabled = true;

            if (isLoginMode) {
                auth.signInWithEmailAndPassword(email, password)
                    .catch(error => { if(authError) authError.textContent = "Email ou senha inválidos."; })
                    .finally(() => { if(authSubmitBtn) authSubmitBtn.disabled = false; });
            } else {
                auth.createUserWithEmailAndPassword(email, password)
                    .catch(error => {
                        if(authError) authError.textContent = error.code === 'auth/email-already-in-use' ? "Este email já está em uso." : "Erro ao criar conta. Verifique os dados.";
                    })
                    .finally(() => { if(authSubmitBtn) authSubmitBtn.disabled = false; });
            }
        });
    }

    if(logoutBtn) {
        logoutBtn.addEventListener('click', () => auth.signOut());
    }

    // =================================================================
    // ===== 5. OBSERVADOR DE ESTADO DE AUTENTICAÇÃO =====
    // =================================================================
    auth.onAuthStateChanged(user => {
        if (user) {
            currentUser = user;
            if(authOverlay) authOverlay.classList.add('hidden');
            if(appContainer) appContainer.classList.remove('opacity-0');
            initializeApp();
        } else {
            currentUser = null;
            if(authOverlay) authOverlay.classList.remove('hidden');
            if(appContainer) appContainer.classList.add('opacity-0');
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
            await userDocRef.set({ transactions, fixedTransactionTemplates, categoryData, settings, debts });
        } catch (error) { 
            console.error("Erro ao salvar dados no Firebase:", error);
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
                categoryData = data.categoryData || { 'entrada': { 'Salário': ['Adiantamento', 'Salário Mensal', 'Bônus', 'Férias'],'Investimentos': ['Dividendos', 'Venda de Ativos', 'Juros'],'Outras Receitas': ['Freelance', 'Vendas', 'Presente', 'Reembolso']}, 'saida': {'Alimentação': ['Supermercado', 'Restaurante', 'Delivery', 'Lanche'],'Moradia': ['Aluguel', 'Condomínio', 'Luz', 'Água', 'Internet', 'Gás', 'Manutenção'],'Transporte': ['Combustível', 'App de Transporte', 'Transporte Público', 'Manutenção Veículo'],'Lazer': ['Cinema', 'Shows', 'Viagens', 'Hobbies', 'Streaming'],'Saúde': ['Farmácia', 'Consulta', 'Plano de Saúde', 'Academia'],'Educação': ['Cursos', 'Livros', 'Mensalidade'],'Compras': ['Roupas', 'Eletrônicos', 'Casa', 'Pets'],'Dívidas': ['Parcela Empréstimo', 'Parcela Financiamento'],'Outras Despesas': ['Impostos', 'Presentes', 'Doações', 'Serviços']}, 'investimento': {'Renda Fixa': ['CDB', 'Tesouro Direto', 'LCI/LCA'],'Renda Variável': ['Ações', 'Fundos Imobiliários', 'ETFs'],'Outros': ['Criptomoedas', 'Previdência Privada']} };
                settings = data.settings || { invoiceClosingDay: 1, savingsGoal: 0, budgets: {} };
            } else {
                await resetAppState(true); // Pass true to save after reset
            }
        } catch (error) { 
            console.error("Erro ao carregar dados do Firebase:", error);
        }
    };
    
    // =================================================================
    // ===== 7. INICIALIZAÇÃO E RESET DO APP =====
    // =================================================================
    const resetAppState = async (shouldSave = false) => {
        transactions = [];
        fixedTransactionTemplates = [];
        debts = [];
        settings = { invoiceClosingDay: 1, savingsGoal: 0, budgets: {} };
        categoryData = { 'entrada': { 'Salário': ['Adiantamento', 'Salário Mensal', 'Bônus', 'Férias'],'Investimentos': ['Dividendos', 'Venda de Ativos', 'Juros'],'Outras Receitas': ['Freelance', 'Vendas', 'Presente', 'Reembolso']}, 'saida': {'Alimentação': ['Supermercado', 'Restaurante', 'Delivery', 'Lanche'],'Moradia': ['Aluguel', 'Condomínio', 'Luz', 'Água', 'Internet', 'Gás', 'Manutenção'],'Transporte': ['Combustível', 'App de Transporte', 'Transporte Público', 'Manutenção Veículo'],'Lazer': ['Cinema', 'Shows', 'Viagens', 'Hobbies', 'Streaming'],'Saúde': ['Farmácia', 'Consulta', 'Plano de Saúde', 'Academia'],'Educação': ['Cursos', 'Livros', 'Mensalidade'],'Compras': ['Roupas', 'Eletrônicos', 'Casa', 'Pets'],'Dívidas': ['Parcela Empréstimo', 'Parcela Financiamento'],'Outras Despesas': ['Impostos', 'Presentes', 'Doações', 'Serviços']}, 'investimento': {'Renda Fixa': ['CDB', 'Tesouro Direto', 'LCI/LCA'],'Renda Variável': ['Ações', 'Fundos Imobiliários', 'ETFs'],'Outros': ['Criptomoedas', 'Previdência Privada']} };
        if (shouldSave) await saveData();
        updateDashboard();
    };

    const initializeApp = async () => {
        await loadData();
        updateDashboard();
    };

    // =================================================================
    // ===== 8. LÓGICA DA APLICAÇÃO (FUNÇÕES PRINCIPAIS) =====
    // =================================================================
    
    const formatCurrency = (value) => typeof value === 'number' ?
        value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : 'R$ 0,00';
    
    const updateDashboard = () => {
        if (!currentUser || !appContainer) return; // Don't update if not logged in or app not present
        
        const completedTransactions = transactions.filter(t => t.status === 'completed');
        
        const totalEntradas = completedTransactions.filter(t => t.type === 'entrada').reduce((acc, t) => acc + t.amount, 0);
        const totalSaidas = completedTransactions.filter(t => t.type === 'saida' || t.type === 'investimento').reduce((acc, t) => acc + t.amount, 0);
        const totalInvestido = completedTransactions.filter(t => t.type === 'investimento').reduce((acc, t) => acc + t.amount, 0);
        
        const totalDebtBalance = debts.reduce((sum, debt) => {
            const remainingPrincipal = debt.installments.filter(p => p.status === 'pending').reduce((s, p) => s + p.principal, 0);
            return sum + remainingPrincipal;
        }, 0);
        
        const now = new Date();
        const faturaAtual = completedTransactions.filter(t => {
            const transactionDate = new Date(t.date + 'T00:00:00');
            return t['payment-method'] === 'Cartão de Crédito' &&
                   transactionDate.getMonth() === now.getMonth() &&
                   transactionDate.getFullYear() === now.getFullYear();
        }).reduce((acc, t) => acc + t.amount, 0);
        
        if(balanceValueEl) balanceValueEl.textContent = formatCurrency(totalEntradas - totalSaidas);
        if(investmentsValueEl) investmentsValueEl.textContent = formatCurrency(totalInvestido);
        if(invoiceValueEl) invoiceValueEl.textContent = formatCurrency(faturaAtual);
        if(debtsValueEl) debtsValueEl.textContent = formatCurrency(totalDebtBalance); 
    };
    
    const openModal = () => { 
        if(transactionModal) {
            transactionModal.classList.remove('hidden');
            if (dateInput && !dateInput.value) dateInput.value = new Date().toISOString().split('T')[0]; 
        }
    };

    const closeModal = () => {
        if(transactionModal) {
            transactionModal.classList.add('hidden');
            if(transactionForm) transactionForm.reset();
            if(transactionTypeBtns) transactionTypeBtns.forEach(b => b.classList.remove('active'));
            if(isVariableContainer) isVariableContainer.classList.add('hidden');
            if(paymentMethodContainer) paymentMethodContainer.classList.add('hidden');
            selectedTransactionType = null;
            document.querySelectorAll('.invalid-field').forEach(el => el.classList.remove('invalid-field'));
            if(formErrorMessage) formErrorMessage.classList.add('hidden');
            editingTransactionId = null;
            const headline = document.getElementById('modal-headline');
            if(headline) headline.textContent = 'Nova Transação';
            const submitButton = transactionForm ? transactionForm.querySelector('button[type="submit"]') : null;
            if(submitButton) submitButton.textContent = 'Adicionar Transação';
            if(isFixedCheckbox) isFixedCheckbox.disabled = false;
        }
    };

    const openGenericModal = (modalElement) => {
        if (modalElement) modalElement.classList.remove('hidden');
    };

    const closeGenericModal = (modalElement) => {
        if (modalElement) modalElement.classList.add('hidden');
    };
    
    // =================================================================
    // ===== 9. EVENT LISTENERS =====
    // =================================================================
    
    if(addTransactionBtn) addTransactionBtn.addEventListener('click', openModal);
    if(closeModalBtn) closeModalBtn.addEventListener('click', closeModal);
    if(transactionModal) transactionModal.addEventListener('click', (e) => { if (e.target === transactionModal) closeModal(); });

    if(settingsBtn) settingsBtn.addEventListener('click', () => openGenericModal(settingsModal));
    if(closeSettingsModalBtn) closeSettingsModalBtn.addEventListener('click', () => closeGenericModal(settingsModal));
    if(settingsModal) settingsModal.addEventListener('click', (e) => { if (e.target === settingsModal) closeGenericModal(settingsModal); });

    if(aiBtn) aiBtn.addEventListener('click', () => openGenericModal(aiModal));
    if(closeAiModalBtn) closeAiModalBtn.addEventListener('click', () => closeGenericModal(aiModal));
    if(aiModal) aiModal.addEventListener('click', (e) => { if (e.target === aiModal) closeGenericModal(aiModal); });

    if(forecastBtn) forecastBtn.addEventListener('click', () => openGenericModal(forecastModal));
    if(closeForecastModalBtn) closeForecastModalBtn.addEventListener('click', () => closeGenericModal(forecastModal));
    if(forecastModal) forecastModal.addEventListener('click', (e) => { if (e.target === forecastModal) closeGenericModal(forecastModal); });
    
    if(transactionTypeBtns) {
        transactionTypeBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                transactionTypeBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                selectedTransactionType = btn.dataset.type;

                if (paymentMethodContainer) {
                     if (selectedTransactionType === 'saida') {
                        paymentMethodContainer.classList.remove('hidden');
                     } else {
                        paymentMethodContainer.classList.add('hidden');
                     }
                }
                if(isVariableContainer) {
                     if (selectedTransactionType === 'entrada') {
                         isVariableContainer.classList.remove('hidden');
                     } else {
                         isVariableContainer.classList.add('hidden');
                         if(isFixedCheckbox) isFixedCheckbox.checked = false;
                     }
                }
            });
        });
    }

}); // Fim do 'DOMContentLoaded'
