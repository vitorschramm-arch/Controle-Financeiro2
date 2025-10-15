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

    // (O resto dos seus seletores de elementos permanece o mesmo)
    const addTransactionBtn = document.getElementById('add-transaction-btn');
    // ... (cole todos os seus outros seletores aqui)

    // =================================================================
    // ===== 3. ESTADO DA APLICAÇÃO =====
    // =================================================================
    let currentUser = null;
    let transactions = [];
    let fixedTransactionTemplates = [];
    let debts = [];
    // ... (o resto das suas variáveis de estado)
    
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
                .catch(error => {
                    authError.textContent = "Email ou senha inválidos.";
                })
                .finally(() => {
                    authSubmitBtn.disabled = false;
                });
        } else {
            auth.createUserWithEmailAndPassword(email, password)
                .catch(error => {
                    if (error.code === 'auth/email-already-in-use') {
                        authError.textContent = "Este email já está em uso.";
                    } else {
                        authError.textContent = "Erro ao criar conta. Verifique os dados.";
                    }
                })
                .finally(() => {
                    authSubmitBtn.disabled = false;
                });
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
            // Usamos merge: true para não sobrescrever o documento inteiro se uma parte estiver faltando
            await userDocRef.set({
                transactions,
                fixedTransactionTemplates,
                categoryData,
                settings,
                debts
            }, { merge: true });
        } catch (error) {
            console.error("Erro ao salvar dados no Firebase:", error);
            showGenericModal({ type: 'alert', title: 'Erro de Salvamento', message: 'Não foi possível salvar seus dados na nuvem.' });
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
                categoryData = data.categoryData || { 'entrada': { 'Salário': []}, 'saida': {'Moradia':[]}, 'investimento': {'Renda Fixa':[]} };
                settings = data.settings || { invoiceClosingDay: 1, savingsGoal: 0, budgets: {} };
            } else {
                console.log("Nenhum dado encontrado. Criando novo documento para o usuário.");
                // Se é o primeiro login, salva o estado inicial vazio para criar o documento.
                await saveData();
            }
        } catch (error) {
            console.error("Erro ao carregar dados do Firebase:", error);
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
        categoryData = { 'entrada': { 'Salário': []}, 'saida': {'Moradia':[]}, 'investimento': {'Renda Fixa':[]} };
        updateDashboard(); // Limpa a UI
    };

    const initializeApp = async () => {
        await loadData();
        updateDashboard();
    };

    // =================================================================
    // ===== 8. TODO O SEU CÓDIGO DE LÓGICA DO APP (COPIADO E COLADO) =====
    // =================================================================
    
    // (Cole aqui o restante do seu arquivo JS original, desde a primeira
    // função `formatCurrency` até o final, sem o `loadData()` e `updateDashboard()`
    // que estavam soltos no final do arquivo original).
    // Vou colar uma parte para exemplificar:

    const formatCurrency = (value) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    const formatDate = (dateString) => new Date(dateString + 'T00:00:00').toLocaleDateString('pt-BR');

    const renderPendingTransactionsOnDashboard = () => {
        // ... seu código original ...
    };
    
    const updateDashboard = () => {
        // ... seu código original ...
    };

    // ... e assim por diante para TODAS as suas outras funções ...
    // handlePendingAction, applyFiltersAndRender, openTransactionsModal,
    // toggleValuesVisibility, openModal, closeModal, etc.
    // O final do seu arquivo deve ser a última função ou o último addEventListener.

}); // Fim do 'DOMContentLoaded'
