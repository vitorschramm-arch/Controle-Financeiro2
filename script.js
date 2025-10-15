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
    } catch (e) { console.error("Firebase initialization error:", e); return; }
    
    const auth = firebase.auth();
    const db = firebase.firestore();

    // =================================================================
    // ===== 2. SELETORES DE ELEMENTOS DO DOM =====
    // =================================================================
    const appContainer = document.getElementById('app');
    const authOverlay = document.getElementById('auth-overlay');
    const authForm = document.getElementById('auth-form');
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
    const settingsBtn = document.getElementById('settings-btn');
    const settingsModal = document.getElementById('settings-modal');
    const closeSettingsModalBtn = document.getElementById('close-settings-modal-btn');
    const settingsForm = document.getElementById('settings-form');
    const categoryManagementContainer = document.getElementById('category-management-container');
    const addNewCategoryBtn = document.getElementById('add-new-category-btn');
    
    // =================================================================
    // ===== 3. ESTADO DA APLICAÇÃO =====
    // =================================================================
    let currentUser = null;
    let transactions = [];
    let settings = {};
    let categoryData = {};
    let selectedTransactionType = null;
    
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
        document.getElementById('savings-goal').value = settings.savingsGoal || 0;
    };
    
    // =================================================================
    // ===== 5. FUNÇÕES DE DADOS (FIREBASE) =====
    // =================================================================
    const saveData = async () => {
        if (!currentUser) return;
        try {
            await db.collection('users').doc(currentUser.uid).set({ transactions, categoryData, settings });
            console.log("Dados salvos com sucesso!");
        } catch (error) { console.error("Erro ao salvar dados:", error); }
    };

    const loadData = async () => {
        if (!currentUser) return;
        const userDocRef = db.collection('users').doc(currentUser.uid);
        try {
            const doc = await userDocRef.get();
            if (doc.exists) {
                const data = doc.data();
                transactions = data.transactions || [];
                settings = data.settings || { savingsGoal: 0 };
                categoryData = data.categoryData || { 'entrada': { 'Salário': ['Salário Mensal'] }, 'saida': {'Alimentação': ['Supermercado']} };
            } else {
                await saveData(); // Salva os dados padrão para um novo usuário
            }
        } catch (error) { console.error("Erro ao carregar dados:", error); }
    };
    
    // =================================================================
    // ===== 6. LÓGICA DO DASHBOARD E MODAIS =====
    // =================================================================
    const formatCurrency = (value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

    const updateDashboard = () => {
        const totalEntradas = transactions.filter(t => t.type === 'entrada').reduce((acc, t) => acc + parseFloat(t.amount), 0);
        const totalSaidas = transactions.filter(t => t.type === 'saida').reduce((acc, t) => acc + parseFloat(t.amount), 0);
        if(balanceValueEl) balanceValueEl.textContent = formatCurrency(totalEntradas - totalSaidas);
    };

    const openModal = (modalElement) => { if (modalElement) modalElement.classList.remove('hidden'); };
    const closeModal = (modalElement) => { if (modalElement) modalElement.classList.add('hidden'); };

    // =================================================================
    // ===== 7. LÓGICA DE TRANSAÇÕES E CATEGORIAS =====
    // =================================================================
    
    const saveTransaction = async (e) => {
        e.preventDefault(); // Impede o recarregamento da página
        const newTransaction = {
            id: Date.now().toString(),
            type: selectedTransactionType,
            amount: parseFloat(document.getElementById('amount').value),
            date: document.getElementById('date').value,
            category: document.getElementById('category').value,
            subcategory: document.getElementById('subcategory').value,
            description: document.getElementById('description').value,
            recurrent: document.getElementById('is-recurrent').checked
        };
        
        transactions.push(newTransaction);
        await saveData();
        updateDashboard();
        closeModal(transactionModal);
        transactionForm.reset();
    };

    const updateCategoryDropdown = () => {
        if (!categorySelect || !selectedTransactionType) return;
        categorySelect.innerHTML = '<option value="">Selecione...</option>';
        if (categoryData[selectedTransactionType]) {
            Object.keys(categoryData[selectedTransactionType]).forEach(cat => {
                categorySelect.innerHTML += `<option value="${cat}">${cat}</option>`;
            });
        }
    };
    
    const updateSubcategoryDropdown = () => {
        if (!subcategorySelect || !selectedTransactionType) return;
        const selectedCategory = categorySelect.value;
        subcategorySelect.innerHTML = '<option value="">(Nenhuma)</option>';
        if (selectedCategory && categoryData[selectedTransactionType][selectedCategory]) {
             categoryData[selectedTransactionType][selectedCategory].forEach(sub => {
                subcategorySelect.innerHTML += `<option value="${sub}">${sub}</option>`;
            });
        }
    };
    
    const renderCategoryManagement = () => {
        if (!categoryManagementContainer) return;
        categoryManagementContainer.innerHTML = '';
        for (const type in categoryData) {
            for (const category in categoryData[type]) {
                const subcategories = categoryData[type][category];
                let subcategoriesHtml = subcategories.map(sub => `
                    <div class="subcategory-item" data-type="${type}" data-category="${category}" data-subcategory="${sub}">
                        <span>${sub}</span>
                        <div class="subcategory-actions">
                            <button data-action="edit-sub">✏️</button>
                            <button data-action="delete-sub">🗑️</button>
                        </div>
                    </div>`).join('');

                const categoryHtml = `
                    <div class="category-item border-t pt-2">
                        <div class="category-item-header">
                            <span>${category} (${type})</span>
                            <div class="category-actions">
                                <button data-action="add-sub" data-type="${type}" data-category="${category}">➕</button>
                                <button data-action="edit-cat" data-type="${type}" data-category="${category}">✏️</button>
                                <button data-action="delete-cat" data-type="${type}" data-category="${category}">🗑️</button>
                            </div>
                        </div>
                        <div class="subcategories-list ml-4 mt-2">${subcategoriesHtml}</div>
                    </div>`;
                categoryManagementContainer.innerHTML += categoryHtml;
            }
        }
    };

    const handleCategoryManagementClick = async (e) => {
        const button = e.target.closest('button');
        if (!button) return;

        const action = button.dataset.action;
        const type = button.dataset.type;
        const category = button.dataset.category;
        const subcategory = e.target.closest('.subcategory-item')?.dataset.subcategory;
        
        if (action === 'delete-cat') {
            if (confirm(`Tem certeza que deseja excluir a categoria "${category}" e todas as suas subcategorias?`)) {
                delete categoryData[type][category];
            }
        }
        if (action === 'add-sub') {
            const newSub = prompt(`Nova subcategoria para "${category}":`);
            if (newSub) categoryData[type][category].push(newSub);
        }
        if (action === 'delete-sub') {
            categoryData[type][category] = categoryData[type][category].filter(s => s !== subcategory);
        }
        
        await saveData();
        renderCategoryManagement();
    };

    const saveSettings = async (e) => {
        e.preventDefault();
        settings.savingsGoal = parseFloat(document.getElementById('savings-goal').value) || 0;
        await saveData();
        closeModal(settingsModal);
        alert("Configurações salvas!");
    };

    // =================================================================
    // ===== 8. EVENT LISTENERS =====
    // =================================================================
    if(authForm) authForm.addEventListener('submit', (e) => {/* Auth Logic Here */});
    if(logoutBtn) logoutBtn.addEventListener('click', () => auth.signOut());
    if(addTransactionBtn) addTransactionBtn.addEventListener('click', () => openModal(transactionModal));
    if(closeModalBtn) closeModalBtn.addEventListener('click', () => closeModal(transactionModal));
    if(transactionModal) transactionModal.addEventListener('click', (e) => { if (e.target === transactionModal) closeModal(transactionModal); });
    if(transactionForm) transactionForm.addEventListener('submit', saveTransaction);

    if(settingsBtn) settingsBtn.addEventListener('click', () => openModal(settingsModal));
    if(closeSettingsModalBtn) closeSettingsModalBtn.addEventListener('click', () => closeModal(settingsModal));
    if(settingsModal) settingsModal.addEventListener('click', (e) => { if (e.target === settingsModal) closeModal(settingsModal); });
    if(settingsForm) settingsForm.addEventListener('submit', saveSettings);
    
    transactionTypeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            transactionTypeBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            selectedTransactionType = btn.dataset.type;
            updateCategoryDropdown();
            updateSubcategoryDropdown();
            if(isRecurrentContainer) isRecurrentContainer.classList.remove('hidden');
        });
    });

    if(categorySelect) categorySelect.addEventListener('change', updateSubcategoryDropdown);
    if(categoryManagementContainer) categoryManagementContainer.addEventListener('click', handleCategoryManagementClick);
    
    if (addNewCategoryBtn) {
        addNewCategoryBtn.addEventListener('click', async () => {
            const name = document.getElementById('new-category-name').value;
            const type = document.getElementById('new-category-type').value;
            if (name && type) {
                if (!categoryData[type]) categoryData[type] = {};
                categoryData[type][name] = [];
                await saveData();
                renderCategoryManagement();
                document.getElementById('new-category-name').value = '';
            }
        });
    }
});
