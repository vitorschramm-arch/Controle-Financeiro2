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
        document.body.innerHTML = '<div style="color:red; text-align:center; padding-top: 50px;">Erro na inicialização do Firebase.</div>';
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
    const isRecurrentContainer = document.getElementById('is-recurrent-container');
    const categorySelect = document.getElementById('category');
    const subcategorySelect = document.getElementById('subcategory');
    const paymentMethodContainer = document.getElementById('payment-method-container');
    const balanceValueEl = document.getElementById('balance-value');
    const debtsValueEl = document.getElementById('debts-value');
    const investmentsValueEl = document.getElementById('investments-value');
    const invoiceValueEl = document.getElementById('invoice-value');
    const cards = document.querySelectorAll('[data-card-type]');
    const settingsBtn = document.getElementById('settings-btn');
    const settingsModal = document.getElementById('settings-modal');
    const closeSettingsModalBtn = document.getElementById('close-settings-modal-btn');
    const categoryManagementContainer = document.getElementById('category-management-container');
    const detailsModal = document.getElementById('details-modal');
    const detailsModalTitle = document.getElementById('details-modal-title');
    const detailsModalContent = document.getElementById('details-modal-content');
    const closeDetailsModalBtn = document.getElementById('close-details-modal-btn');
    
    // =================================================================
    // ===== 3. ESTADO DA APLICAÇÃO =====
    // =================================================================
    let currentUser = null;
    let transactions = [];
    let selectedTransactionType = null;
    let categoryData = {};
    
    // =================================================================
    // ===== 4. LÓGICA DE AUTENTICAÇÃO E INICIALIZAÇÃO =====
    // =================================================================
    auth.onAuthStateChanged(user => {
        if (user) {
            currentUser = user;
            if(authOverlay) authOverlay.classList.add('hidden');
            if(appContainer) appContainer.classList.remove('hidden', 'opacity-0');
            initializeApp();
        } else {
            currentUser = null;
            if(authOverlay) authOverlay.classList.remove('hidden');
            if(appContainer) appContainer.classList.add('hidden', 'opacity-0');
        }
    });

    const initializeApp = async () => {
        await loadData();
        updateDashboard();
        renderCategoryManagement();
    };
    
    // =================================================================
    // ===== 5. FUNÇÕES DE DADOS (FIREBASE) =====
    // =================================================================
    const loadData = async () => {
        if (!currentUser) return;
        const userDocRef = db.collection('users').doc(currentUser.uid);
        try {
            const doc = await userDocRef.get();
            if (doc.exists) {
                const data = doc.data();
                transactions = data.transactions || [];
                categoryData = data.categoryData || { 'entrada': { 'Salário': []}, 'saida': {'Alimentação': []}, 'investimento': {'Renda Fixa': []} };
            } else {
                // First time user, create default data
                await userDocRef.set({ transactions: [], categoryData: { 'entrada': { 'Salário': []}, 'saida': {'Alimentação': []}, 'investimento': {'Renda Fixa': []} } });
            }
        } catch (error) { console.error("Erro ao carregar dados:", error); }
    };
    
    // =================================================================
    // ===== 6. LÓGICA DO DASHBOARD E MODAIS =====
    // =================================================================
    const formatCurrency = (value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

    const updateDashboard = () => {
        const totalEntradas = transactions.filter(t => t.type === 'entrada').reduce((acc, t) => acc + t.amount, 0);
        const totalSaidas = transactions.filter(t => t.type === 'saida').reduce((acc, t) => acc + t.amount, 0);
        
        if(balanceValueEl) balanceValueEl.textContent = formatCurrency(totalEntradas - totalSaidas);
        if(debtsValueEl) debtsValueEl.textContent = formatCurrency(0); // Placeholder
        if(investmentsValueEl) investmentsValueEl.textContent = formatCurrency(0); // Placeholder
        if(invoiceValueEl) invoiceValueEl.textContent = formatCurrency(0); // Placeholder
    };

    const openModal = (modalElement) => {
        if (modalElement) modalElement.classList.remove('hidden');
    };

    const closeModal = (modalElement) => {
        if (modalElement) modalElement.classList.add('hidden');
    };

    // =================================================================
    // ===== 7. LÓGICA DE TRANSAÇÕES E CATEGORIAS =====
    // =================================================================

    const updateCategoryDropdown = () => {
        if (!categorySelect || !selectedTransactionType) return;
        categorySelect.innerHTML = '<option value="">Selecione...</option>';
        if (categoryData[selectedTransactionType]) {
            for (const category in categoryData[selectedTransactionType]) {
                categorySelect.innerHTML += `<option value="${category}">${category}</option>`;
            }
        }
    };
    
    const updateSubcategoryDropdown = () => {
        if (!subcategorySelect || !selectedTransactionType) return;
        const selectedCategory = categorySelect.value;
        subcategorySelect.innerHTML = '<option value="">Selecione...</option>';
        if (selectedCategory && categoryData[selectedTransactionType][selectedCategory]) {
             categoryData[selectedTransactionType][selectedCategory].forEach(sub => {
                subcategorySelect.innerHTML += `<option value="${sub}">${sub}</option>`;
            });
        }
    };
    
    const renderCategoryManagement = () => {
        if (!categoryManagementContainer) return;
        categoryManagementContainer.innerHTML = '';
        Object.keys(categoryData).forEach(type => {
            const typeName = type.charAt(0).toUpperCase() + type.slice(1);
            let categoriesHtml = '';
            Object.keys(categoryData[type]).forEach(cat => {
                categoriesHtml += `<li class="ml-4">${cat}</li>`;
            });
            categoryManagementContainer.innerHTML += `
                <details class="mb-2">
                    <summary class="font-semibold cursor-pointer">${typeName}</summary>
                    <ul class="list-disc pl-5 mt-1">${categoriesHtml}</ul>
                </details>
            `;
        });
    };

    // =================================================================
    // ===== 8. EVENT LISTENERS =====
    // =================================================================
    if(addTransactionBtn) addTransactionBtn.addEventListener('click', () => openModal(transactionModal));
    if(closeModalBtn) closeModalBtn.addEventListener('click', () => closeModal(transactionModal));
    if(transactionModal) transactionModal.addEventListener('click', (e) => { if (e.target === transactionModal) closeModal(transactionModal); });

    if(settingsBtn) settingsBtn.addEventListener('click', () => openModal(settingsModal));
    if(closeSettingsModalBtn) closeSettingsModalBtn.addEventListener('click', () => closeModal(settingsModal));
    if(settingsModal) settingsModal.addEventListener('click', (e) => { if (e.target === settingsModal) closeModal(settingsModal); });

    if(closeDetailsModalBtn) closeDetailsModalBtn.addEventListener('click', () => closeModal(detailsModal));
    if(detailsModal) detailsModal.addEventListener('click', (e) => { if (e.target === detailsModal) closeModal(detailsModal); });

    transactionTypeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            transactionTypeBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            selectedTransactionType = btn.dataset.type;
            
            updateCategoryDropdown();
            updateSubcategoryDropdown();
            
            if (selectedTransactionType === 'saida') {
                if(paymentMethodContainer) paymentMethodContainer.classList.remove('hidden');
            } else {
                if(paymentMethodContainer) paymentMethodContainer.classList.add('hidden');
            }

            if (selectedTransactionType === 'entrada' || selectedTransactionType === 'saida') {
                if(isRecurrentContainer) isRecurrentContainer.classList.remove('hidden');
            } else {
                if(isRecurrentContainer) isRecurrentContainer.classList.add('hidden');
            }
        });
    });

    if(categorySelect) categorySelect.addEventListener('change', updateSubcategoryDropdown);

    cards.forEach(card => {
        card.addEventListener('click', () => {
            const type = card.dataset.cardType;
            if (detailsModalTitle) detailsModalTitle.textContent = `Detalhes de ${type.charAt(0).toUpperCase() + type.slice(1)}`;
            if (detailsModalContent) detailsModalContent.innerHTML = `<p>Lista de transações para ${type} aparecerá aqui.</p>`;
            openModal(detailsModal);
        });
    });

    if (authForm) {
        authForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = authForm['auth-email'].value;
            const password = authForm['auth-password'].value;
            // Auth logic here
        });
    }
});
