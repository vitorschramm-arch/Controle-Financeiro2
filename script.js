import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, signInAnonymously } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getFirestore, collection, addDoc, onSnapshot, serverTimestamp, getDoc, doc, setDoc, updateDoc, deleteDoc, writeBatch } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAlvRBErv2pG8BObnX8Ew0CqOQKypTM39c",
  authDomain: "controle-612f2.firebaseapp.com",
  projectId: "controle-612f2",
  storageBucket: "controle-612f2.firebasestorage.app",
  messagingSenderId: "39791655795",
  appId: "1:39791655795:web:1b6ad76afa568af3b86306",
  measurementId: "G-7X9S01NMWX"
};

// --- GLOBAL VARIABLES & STATE ---
let db, auth, userId;
const appId = firebaseConfig.appId;
let expenseChart, reportsChart, forecastChart;

const state = {
    transactions: [],
    recurringTemplates: [],
    goals: [],
    categories: { income: ['Salário', 'Freelance'], expense: ['Alimentação', 'Transporte', 'Moradia', 'Lazer'], investment: ['Ações', 'Fundos Imobiliários'] },
    settings: { faturaDay: 20, budgets: {} },
    overviewSelectedDate: new Date(),
    historySelectedDate: new Date(),
    pendingSelectedDate: new Date(),
    isMainBalanceHidden: true,
    isOverviewBalanceHidden: true,
    isEditing: false,
    isEditingRecurring: false,
    editingRecurringId: null,
    selectedType: 'expense',
    filters: { category: 'all' }
};

const elements = {
    app: document.getElementById('app'),
    userId: document.getElementById('user-id'),
    totalBalance: document.getElementById('total-balance'),
    totalInvestment: document.getElementById('total-investment'),
    totalCreditCard: document.getElementById('total-credit-card'),
    monthlyBalance: document.getElementById('monthly-balance'),
    totalIncome: document.getElementById('total-income'),
    totalExpense: document.getElementById('total-expense'),
    transactionForm: document.getElementById('transaction-form'),
    transactionIdInput: document.getElementById('transaction-id'),
    hiddenTypeInput: document.getElementById('type'),
    categorySelect: document.getElementById('category'),
    valueInput: document.getElementById('value'),
    dateInput: document.getElementById('date'),
    descriptionInput: document.getElementById('description'),
    expenseFields: document.getElementById('expense-fields'),
    paymentMethodSelect: document.getElementById('payment-method'),
    installmentsField: document.getElementById('installments-field'),
    installmentsSelect: document.getElementById('installments'),
    submitBtn: document.getElementById('submit-btn'),
    cancelEditBtn: document.getElementById('cancel-edit-btn'),
    transactionAlertMessage: document.getElementById('transaction-alert-message'),
    transactionListEl: document.getElementById('transaction-list'),
    currentOverviewMonthDisplay: document.getElementById('current-overview-month-display'),
    currentHistoryMonthDisplay: document.getElementById('current-history-month-display'),
    currentPendingMonthDisplay: document.getElementById('current-pending-month-display'),
    expenseChartCanvas: document.getElementById('expense-chart'),
    budgetsList: document.getElementById('budgets-list'),
    goalsList: document.getElementById('goals-list'),
    toggleMainBalancesBtn: document.getElementById('toggle-main-balances-btn'),
    toggleOverviewBalancesBtn: document.getElementById('toggle-overview-balances-btn'),
    categoryFilter: document.getElementById('category-filter'),
    filteredSum: document.getElementById('filtered-sum'),
    pendingTransactionsCard: document.getElementById('pending-transactions-card'),
    pendingTransactionsList: document.getElementById('pending-transactions-list'),
    settingsModal: document.getElementById('settings-modal'),
    recurringModal: document.getElementById('recurring-modal'),
    reportsModal: document.getElementById('reports-modal'),
    detailsModal: document.getElementById('details-modal'),
    forecastModal: document.getElementById('forecast-modal'),
    inputModal: document.getElementById('input-modal'),
    showTransactionFormBtn: document.getElementById('show-transaction-form'),
    showRecurringFormBtn: document.getElementById('show-recurring-form'),
    transactionFormContainer: document.getElementById('transaction-form-container'),
    recurringFormContainer: document.getElementById('recurring-form-container'),
    recurringForm: document.getElementById('recurring-form'),
};

const icons = {
    eye: `<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7S3.732 16.057 2.458 12z" /></svg>`,
    eyeSlash: `<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7 .946-3.11 3.522-5.584 6.643-6.522M6.54 6.54L21 21m-4.56-4.56l-1.39-1.39a3 3 0 00-4.242-4.242L6.54 6.54z" /></svg>`,
};

// --- UTILITY FUNCTIONS ---
const formatCurrency = (value) => `R$ ${Number(value).toFixed(2).replace('.', ',')}`;
const showAlert = (message, type, element) => { element.textContent = message; element.className = `alert-message alert-${type}`; element.classList.remove('hidden'); setTimeout(() => element.classList.add('hidden'), 4000); };
const generateInstallmentOptions = (selectEl) => { selectEl.innerHTML = ''; for (let i = 1; i <= 24; i++) { const option = document.createElement('option'); option.value = i; option.textContent = `${i}x`; selectEl.appendChild(option); } };
const setCurrentDate = () => { elements.dateInput.value = new Date().toISOString().slice(0, 10); };
const openModal = (modalEl) => modalEl.classList.remove('hidden');
const closeModal = (modalEl) => { modalEl.classList.add('hidden'); modalEl.innerHTML = ''; };

// --- FIREBASE & DATA INITIALIZATION ---
const initializeAppAndListeners = async () => {
    try {
        const app = initializeApp(firebaseConfig);
        db = getFirestore(app);
        auth = getAuth(app);

        await signInAnonymously(auth);
        userId = auth.currentUser.uid;
        elements.userId.textContent = `ID do Utilizador: ${userId}`;

        onSnapshot(collection(db, `/artifacts/${appId}/users/${userId}/transactions`), s => { state.transactions = s.docs.map(d => ({ id: d.id, ...d.data() })); updateUI(); });
        onSnapshot(collection(db, `/artifacts/${appId}/users/${userId}/recurring_templates`), s => { state.recurringTemplates = s.docs.map(d => ({ id: d.id, ...d.data() })); updateUI(); });
        onSnapshot(collection(db, `/artifacts/${appId}/users/${userId}/goals`), s => { state.goals = s.docs.map(d => ({ id: d.id, ...d.data() })); updateUI(); });
        onSnapshot(doc(db, `/artifacts/${appId}/users/${userId}/settings`, 'user_settings'), async d => { if (d.exists()) Object.assign(state.settings, d.data()); else await setDoc(doc(db, `/artifacts/${appId}/users/${userId}/settings`, 'user_settings'), state.settings); updateUI(); });
        onSnapshot(doc(db, `/artifacts/${appId}/users/${userId}/categories`, 'user_categories'), async d => { if (d.exists()) Object.assign(state.categories, d.data()); else await setDoc(doc(db, `/artifacts/${appId}/users/${userId}/categories`, 'user_categories'), state.categories); updateUI(); });

    } catch (error) { console.error("Erro na inicialização:", error); }
};

// --- UI RENDERING ---
const updateUI = () => { if (!userId) return; renderCategoryDropdown(); renderCategoryFilter(); renderTransactions(); updateAllBalances(); renderDashboard(); renderPendingTransactions(); };
const renderDashboard = () => { elements.currentOverviewMonthDisplay.textContent = state.overviewSelectedDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }); const monthlyTransactions = state.transactions.filter(t => t.date && t.date.startsWith(state.overviewSelectedDate.toISOString().slice(0, 7))); updateExpenseChart(monthlyTransactions); renderBudgets(monthlyTransactions); renderGoals(); };
const updateAllBalances = () => { let tI=0, tE=0, tInv=0, tCC=0; const today=new Date(); const cD=state.settings.faturaDay; const sD=new Date(today.getFullYear(),today.getMonth()-(today.getDate()>cD?0:1),cD+1); const eD=new Date(today.getFullYear(),today.getMonth()+(today.getDate()>cD?1:0),cD); state.transactions.forEach(t=>{const tD=t.date ? new Date(t.date+'T12:00:00') : new Date(); if(t.type==='income')tI+=t.value;else if(t.type==='expense'){tE+=t.value;if(t.paymentMethod==='Cartão de Crédito'&&tD>=sD&&tD<=eD)tCC+=t.value;}else if(t.type==='investment')tInv+=t.value;}); const tB=tI-tE-tInv; const overviewMonthStr = state.overviewSelectedDate.toISOString().slice(0, 7); let mI=0, mE=0, mInv=0; state.transactions.filter(t=>t.date && t.date.startsWith(overviewMonthStr)).forEach(t=>{if(t.type==='income')mI+=t.value;else if(t.type==='expense')mE+=t.value;else if(t.type==='investment')mInv+=t.value;}); elements.totalBalance.textContent=state.isMainBalanceHidden?'***':formatCurrency(tB); elements.totalInvestment.textContent=state.isMainBalanceHidden?'***':formatCurrency(tInv); elements.totalCreditCard.textContent=state.isMainBalanceHidden?'***':formatCurrency(tCC); elements.totalIncome.textContent=state.isOverviewBalanceHidden?'***':formatCurrency(mI); elements.totalExpense.textContent=state.isOverviewBalanceHidden?'***':formatCurrency(mE); elements.monthlyBalance.textContent=state.isOverviewBalanceHidden?'***':formatCurrency(mI-mE-mInv);};
const updateExpenseChart = (transactions) => { const eD = transactions.filter(t => t.type === 'expense').reduce((a, t) => { a[t.category] = (a[t.category] || 0) + t.value; return a; }, {}); const l = Object.keys(eD); const d = Object.values(eD); const cD = { labels: l.length ? l : ['Sem Saídas'], datasets: [{ data: d.length ? d : [1], backgroundColor: ['#ef4444', '#f97316', '#eab308', '#84cc16', '#22c55e', '#10b981'], borderColor: '#fff', borderWidth: 2 }] }; if (expenseChart) { expenseChart.data = cD; expenseChart.update(); } else if (elements.expenseChartCanvas) { expenseChart = new Chart(elements.expenseChartCanvas, { type: 'doughnut', data: cD, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: true, position: 'bottom', labels: { boxWidth: 12 } } } } }); } };
const renderCategoryDropdown = (selectEl = elements.categorySelect, type = state.selectedType) => { const cats = state.categories[type] || []; selectEl.innerHTML = cats.map(cat => `<option value="${cat}">${cat}</option>`).join(''); };
const renderCategoryFilter = () => { const allCategories = [...(state.categories.income || []), ...(state.categories.expense || []), ...(state.categories.investment || [])]; const uniqueCategories = [...new Set(allCategories)].sort((a,b) => a.localeCompare(b)); elements.categoryFilter.innerHTML = `<option value="all">Todas as Categorias</option>`; uniqueCategories.forEach(cat => { elements.categoryFilter.innerHTML += `<option value="${cat}">${cat}</option>`; }); };
const renderBudgets = (monthlyTransactions) => { elements.budgetsList.innerHTML = ''; const budgets = state.settings.budgets || {}; if (Object.keys(budgets).length === 0) { elements.budgetsList.innerHTML = '<p class="text-center text-gray-500 text-sm">Crie orçamentos nas Configurações.</p>'; return; } const expensesByCategory = monthlyTransactions.filter(t => t.type === 'expense').reduce((acc, t) => { acc[t.category] = (acc[t.category] || 0) + t.value; return acc; }, {}); Object.entries(budgets).forEach(([category, budgetValue]) => { const spentAmount = expensesByCategory[category] || 0; const percentage = budgetValue > 0 ? (spentAmount / budgetValue) * 100 : 0; const progressBarColor = percentage > 100 ? 'bg-red-500' : percentage > 80 ? 'bg-yellow-500' : 'bg-green-500'; const el = document.createElement('div'); el.innerHTML = `<div class="flex justify-between items-center text-sm mb-1"><span class="font-semibold text-gray-700">${category}</span><span class="text-xs ${percentage > 100 ? 'expense-text' : 'text-gray-600'}">${formatCurrency(spentAmount)} / ${formatCurrency(budgetValue)}</span></div><div class="progress-bar"><div class="progress ${progressBarColor}" style="width: ${Math.min(percentage, 100)}%;"></div></div>`; elements.budgetsList.appendChild(el); }); };
const renderGoals = () => { elements.goalsList.innerHTML = ''; if (!state.goals.length) { elements.goalsList.innerHTML = '<p class="text-center text-gray-500 text-sm">Crie metas de economia nas Configurações.</p>'; return; } const totalInvested = state.transactions.filter(t => t.type === 'investment').reduce((sum, t) => sum + t.value, 0); state.goals.forEach(goal => { const savedAmount = Math.min(totalInvested, goal.targetValue); const percentage = goal.targetValue > 0 ? (savedAmount / goal.targetValue) * 100 : 0; const el = document.createElement('div'); el.innerHTML = `<div class="flex justify-between items-center text-sm mb-1"><span class="font-semibold text-gray-700">${goal.name}</span><span class="text-xs goal-text">${formatCurrency(savedAmount)} / ${formatCurrency(goal.targetValue)}</span></div><div class="progress-bar"><div class="progress bg-amber-500" style="width: ${percentage}%;"></div></div>`; elements.goalsList.appendChild(el); }); };
const getFilteredTransactions = () => state.transactions.filter(t => (t.date && t.date.startsWith(state.historySelectedDate.toISOString().slice(0, 7))) && (state.filters.category === 'all' || t.category === state.filters.category)).sort((a, b) => new Date(b.date) - new Date(a.date));
const renderTransactions = () => { elements.currentHistoryMonthDisplay.textContent = state.historySelectedDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }); const filtered = getFilteredTransactions(); const filteredTotal = filtered.reduce((sum, t) => (t.type === 'income' ? sum + t.value : sum - t.value), 0); elements.filteredSum.textContent = formatCurrency(filteredTotal); elements.filteredSum.classList.toggle('income-text', filteredTotal >= 0); elements.filteredSum.classList.toggle('expense-text', filteredTotal < 0); elements.transactionListEl.innerHTML = ''; if (!filtered.length) { elements.transactionListEl.innerHTML = '<p class="text-center text-gray-500 text-sm py-8">Nenhuma transação encontrada.</p>'; return; } filtered.forEach(t => { const vC = t.type === 'income' ? 'income-text' : t.type === 'expense' ? 'expense-text' : 'investment-text'; const bC = t.type === 'income' ? 'income-bg' : t.type === 'expense' ? 'expense-bg' : 'investment-bg'; const i = t.type === 'income' ? '↑' : t.type === 'expense' ? '↓' : '📈'; const fV = (t.type !== 'income' ? `- ` : `+ `) + formatCurrency(t.value); const tE = document.createElement('div'); tE.className = `flex justify-between items-center p-3 rounded-lg ${bC} group`; tE.dataset.id = t.id; tE.innerHTML = `<div class="flex items-center space-x-3 flex-1"><span class="text-xl ${vC}">${i}</span><div><p class="font-semibold text-gray-900 text-sm">${t.description||'N/A'}</p><p class="text-xs text-gray-500">${t.category||'N/A'} - ${t.date ? new Date(t.date+'T12:00:00').toLocaleDateString('pt-BR') : 'Data Inválida'}</p></div></div><div class="flex items-center space-x-2"><div class="text-sm font-bold ${vC} mr-2">${fV}</div><div class="flex opacity-0 group-hover:opacity-100 transition-opacity"><button class="edit-btn p-1 rounded-full hover:bg-gray-300" data-id="${t.id}"><svg class="h-4 w-4 text-gray-600" fill="currentColor" viewBox="0 0 20 20"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" /></svg></button><button class="delete-btn p-1 rounded-full hover:bg-gray-300" data-id="${t.id}"><svg class="h-4 w-4 text-red-600" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" /></svg></button></div></div>`; elements.transactionListEl.appendChild(tE); }); };
const resetTransactionForm = () => { elements.transactionForm.reset(); elements.transactionIdInput.value=''; state.isEditing=false; elements.submitBtn.textContent='Adicionar'; elements.cancelEditBtn.classList.add('hidden'); elements.submitBtn.classList.remove('w-2/3'); elements.submitBtn.classList.add('w-full'); setCurrentDate(); updateFormColor('expense'); };
const updateFormColor = (type) => { state.selectedType=type; elements.hiddenTypeInput.value=type; document.querySelectorAll('#type-selector > div').forEach(el=>{el.classList.remove('bg-green-500','bg-red-500','bg-blue-500','text-white','font-semibold'); el.classList.add('bg-gray-200','text-gray-800');}); const sE=document.querySelector(`#type-selector [data-type="${type}"]`); sE.classList.add(type==='income'?'bg-green-500':type==='expense'?'bg-red-500':'bg-blue-500','text-white','font-semibold'); elements.expenseFields.classList.toggle('hidden',type!=='expense'); renderCategoryDropdown(); };
const renderPendingTransactions = () => {
    const selectedDate = state.pendingSelectedDate;
    elements.currentPendingMonthDisplay.textContent = selectedDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
    const selectedMonthStr = selectedDate.toISOString().slice(0, 7);
    const postedRecurringIds = new Set(state.transactions.filter(t => t.recurringTemplateId).map(t => `${t.recurringTemplateId}-${t.date.slice(0, 7)}`));
    
    const pending = state.recurringTemplates.filter(t => {
        if (postedRecurringIds.has(`${t.id}-${selectedMonthStr}`)) return false;
        if (t.durationMonths && t.createdAt && t.createdAt.toDate) {
            const startDate = t.createdAt.toDate();
            const endDate = new Date(startDate.getFullYear(), startDate.getMonth() + t.durationMonths, startDate.getDate());
            if (selectedDate > endDate) return false;
        }
        if (t.createdAt && t.createdAt.toDate) {
            const templateCreationDate = t.createdAt.toDate();
            if (templateCreationDate.getFullYear() > selectedDate.getFullYear() || (templateCreationDate.getFullYear() === selectedDate.getFullYear() && templateCreationDate.getMonth() > selectedDate.getMonth())) return false;
        }
        return true;
    });
    
    if (pending.length === 0) {
        elements.pendingTransactionsList.innerHTML = '<p class="text-center text-gray-500 text-sm py-4">Nenhum lançamento pendente encontrado para este mês.</p>';
        elements.pendingTransactionsCard.classList.remove('hidden');
        return;
    }

    elements.pendingTransactionsCard.classList.remove('hidden');
    elements.pendingTransactionsList.innerHTML = pending.map(t => {
        let valueDisplay = t.isVariable ? `<span class="text-xs text-blue-600">Valor Variável${t.value > 0 ? ` (Est. ${formatCurrency(t.value)})` : ''}</span>` : formatCurrency(t.value);
        const bgClass = t.type === 'income' ? 'income-bg' : t.type === 'expense' ? 'expense-bg' : 'investment-bg';
        return `<div class="p-3 rounded-lg ${bgClass} flex justify-between items-center" data-template-id="${t.id}"><div><p class="font-semibold text-sm">${t.description}</p><p class="text-xs text-gray-600">${valueDisplay}</p></div><button class="post-pending-btn text-sm bg-indigo-500 text-white py-1 px-3 rounded-lg hover:bg-indigo-600">Lançar</button></div>`;
    }).join('');
};

// --- MODAL RENDERING FUNCTIONS ---
const renderRecurringModalContent = (isEditing = false) => {
    const itemToEdit = isEditing ? state.recurringTemplates.find(t => t.id === state.editingRecurringId) : null;
    let contentHTML = '';

    if (isEditing) {
        contentHTML = `
        <h2 class="text-2xl font-bold mb-4">Editar Recorrente</h2>
        <form id="recurring-form-modal" class="space-y-3 mb-6 p-4 border rounded-lg bg-gray-50">
            <input type="hidden" id="recurring-id-modal" value="${itemToEdit?.id || ''}">
             <div>
                <label class="block text-xs font-medium text-gray-700">Tipo</label>
                <div id="recurring-type-selector-modal" class="flex space-x-2 mt-1">
                    <div class="flex-1 py-2 px-4 text-center rounded-lg shadow-sm cursor-pointer" data-type="income">Entrada</div>
                    <div class="flex-1 py-2 px-4 text-center rounded-lg shadow-sm cursor-pointer" data-type="expense">Saída</div>
                    <div class="flex-1 py-2 px-4 text-center rounded-lg shadow-sm cursor-pointer" data-type="investment">Invest.</div>
                </div>
                <input type="hidden" id="recurring-type-modal" value="${itemToEdit?.type || 'expense'}" required>
            </div>
            <div class="grid grid-cols-2 gap-3">
                <div><label for="recurring-description-modal" class="block text-xs font-medium text-gray-700">Descrição</label><input type="text" id="recurring-description-modal" value="${itemToEdit?.description || ''}" required class="mt-1 block w-full rounded-lg p-2 shadow-sm"></div>
                <div><label for="recurring-category-modal" class="block text-xs font-medium text-gray-700">Categoria</label><select id="recurring-category-modal" required class="mt-1 block w-full rounded-lg p-2 shadow-sm"></select></div>
            </div>
            <div class="grid grid-cols-2 gap-3 items-end">
                 <div><label for="recurring-value-modal" class="block text-xs font-medium text-gray-700">Valor Fixo / Estimativa</label><input type="number" id="recurring-value-modal" value="${itemToEdit?.value || ''}" class="mt-1 block w-full rounded-lg p-2 shadow-sm" step="0.01"></div>
                 <div class="flex items-center pb-2"><input type="checkbox" id="recurring-is-variable-modal" ${itemToEdit?.isVariable ? 'checked' : ''} class="h-4 w-4 text-indigo-600 border-gray-300 rounded"><label for="recurring-is-variable-modal" class="ml-2 block text-sm text-gray-900">Valor Variável</label></div>
            </div>
            <div class="grid grid-cols-2 gap-3">
                <div><label for="recurring-day-of-month-modal" class="block text-xs font-medium text-gray-700">Dia do Lançamento</label><input type="number" id="recurring-day-of-month-modal" value="${itemToEdit?.dayOfMonth || ''}" required class="mt-1 block w-full rounded-lg p-2 shadow-sm" min="1" max="31"></div>
                <div><label for="recurring-duration-modal" class="block text-xs font-medium text-gray-700">Duração (meses)</label><input type="number" id="recurring-duration-modal" value="${itemToEdit?.durationMonths || ''}" class="mt-1 block w-full rounded-lg p-2 shadow-sm" min="1"></div>
            </div>
            <div id="recurring-payment-field-modal" class="${(itemToEdit?.type || 'expense') !== 'expense' ? 'hidden' : ''}">
                <label for="recurring-payment-method-modal" class="block text-xs font-medium text-gray-700">Forma de Pagamento</label>
                <select id="recurring-payment-method-modal" class="mt-1 block w-full rounded-lg p-2 shadow-sm">
                    <option value="Débito em Conta">Débito em Conta</option> <option value="Boleto">Boleto</option> <option value="Cartão de Crédito">Cartão de Crédito</option> <option value="Pix Programado">Pix Programado</option>
                </select>
            </div>
            <div id="recurring-alert-message-modal" class="alert-message hidden"></div>
            <div class="flex gap-2 pt-2">
                <button type="button" id="cancel-recurring-edit-btn" class="w-1/3 py-2 px-4 border rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-gray-200 hover:bg-gray-300">Cancelar</button>
                <button type="submit" class="w-full py-2 px-4 border rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700">Salvar Alterações</button>
            </div>
        </form>`;
    } else {
        contentHTML = `
        <h2 class="text-2xl font-bold mb-4">Gerenciar Recorrentes</h2>
        <div id="recurring-list-modal" class="space-y-2 max-h-[70vh] overflow-y-auto pr-2">
            ${state.recurringTemplates.length ? state.recurringTemplates.map(t => {
                const durationText = t.durationMonths ? `${t.durationMonths} meses` : 'Contínuo';
                const dayText = `Dia ${t.dayOfMonth}`;
                const valueText = t.isVariable ? `Variável (Est. ${formatCurrency(t.value)})` : formatCurrency(t.value);
                const bgClass = t.type === 'income' ? 'income-bg' : t.type === 'expense' ? 'expense-bg' : 'investment-bg';
                return `
                <div class="flex justify-between items-center p-3 rounded-lg ${bgClass}">
                    <div>
                        <p class="font-semibold text-sm">${t.description}</p>
                        <p class="text-xs text-gray-600">${t.category} | ${valueText}</p>
                        <p class="text-xs text-gray-500 mt-1">${dayText} | ${durationText}</p>
                    </div>
                    <div class="flex">
                        <button class="edit-recurring-btn p-1 rounded-full hover:bg-gray-300" data-id="${t.id}"><svg class="h-4 w-4 text-gray-600" fill="currentColor" viewBox="0 0 20 20"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"></path></svg></button>
                        <button class="delete-recurring-btn p-1 rounded-full hover:bg-gray-300" data-id="${t.id}"><svg class="h-4 w-4 text-red-600" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd"></path></svg></button>
                    </div>
                </div>`;
            }).join('') : '<p class="text-center text-gray-500 text-sm py-8">Nenhum lançamento recorrente salvo.</p>'}
        </div>`;
    }

    elements.recurringModal.innerHTML = `<div class="modal-content relative"><span class="close-btn">&times;</span>${contentHTML}</div>`;
    
    if (isEditing) {
        const type = itemToEdit?.type || 'expense';
        const typeSelector = document.querySelector(`#recurring-type-selector-modal [data-type="${type}"]`);
        document.querySelectorAll('#recurring-type-selector-modal > div').forEach(el => { el.classList.remove('bg-green-500', 'bg-red-500', 'bg-blue-500', 'text-white', 'font-semibold'); el.classList.add('bg-gray-200', 'text-gray-800'); });
        typeSelector.classList.add(type === 'income' ? 'bg-green-500' : type === 'expense' ? 'bg-red-500' : 'bg-blue-500', 'text-white', 'font-semibold');
        const categorySelect = document.getElementById('recurring-category-modal');
        renderCategoryDropdown(categorySelect, type);
        categorySelect.value = itemToEdit.category;
        if (itemToEdit.paymentMethod) { document.getElementById('recurring-payment-method-modal').value = itemToEdit.paymentMethod; }
    }
};

const openDetailsModal = (type) => {
    const modalContent = document.createElement('div');
    modalContent.className = 'modal-content relative';
    let title = ''; let transactionsToShow = [];
    switch(type) {
        case 'balance': title = 'Detalhes do Saldo'; transactionsToShow = state.transactions; break;
        case 'investment': title = 'Detalhes de Investimentos'; transactionsToShow = state.transactions.filter(t => t.type === 'investment'); break;
        case 'credit-card': title = 'Fatura Atual do Cartão'; 
            const today=new Date(); const cD=state.settings.faturaDay; 
            const sD=new Date(today.getFullYear(),today.getMonth()-(today.getDate()>cD?0:1),cD+1); 
            const eD=new Date(today.getFullYear(),today.getMonth()+(today.getDate()>cD?1:0),cD);
            transactionsToShow = state.transactions.filter(t => { const tD = t.date ? new Date(t.date+'T12:00:00') : null; return t.paymentMethod === 'Cartão de Crédito' && tD && tD >= sD && tD <= eD; });
            break;
        case 'income': title = 'Entradas do Mês'; transactionsToShow = state.transactions.filter(t => t.date && t.date.startsWith(state.overviewSelectedDate.toISOString().slice(0, 7)) && t.type === 'income'); break;
        case 'expense': title = 'Saídas do Mês'; transactionsToShow = state.transactions.filter(t => t.date && t.date.startsWith(state.overviewSelectedDate.toISOString().slice(0, 7)) && t.type === 'expense'); break;
        default: title = 'Detalhes'; transactionsToShow = [];
    }
    modalContent.innerHTML = `<span class="close-btn">&times;</span><h2 class="text-2xl font-bold mb-4">${title}</h2><div class="space-y-2 max-h-[60vh] overflow-y-auto pr-2">${transactionsToShow.map(t => `<div class="flex justify-between p-2 rounded ${t.type === 'income' ? 'income-bg' : t.type === 'expense' ? 'expense-bg' : 'investment-bg'}"><p>${t.description}</p><p class="font-semibold">${formatCurrency(t.value)}</p></div>`).join('') || '<p>Nenhuma transação para exibir.</p>'}</div>`;
    elements.detailsModal.innerHTML = '';
    elements.detailsModal.appendChild(modalContent);
    openModal(elements.detailsModal);
};

const renderReportsModal = () => {
     const modalContent = document.createElement('div');
     modalContent.className = 'modal-content relative';
     modalContent.innerHTML = `<span class="close-btn">&times;</span><h2 class="text-2xl font-bold mb-4">Relatórios</h2><div class="h-96"><canvas id="reports-chart"></canvas></div>`;
     elements.reportsModal.innerHTML = '';
     elements.reportsModal.appendChild(modalContent);
     const ctx = document.getElementById('reports-chart').getContext('2d');
     const data = { labels: [], datasets: [{ label: 'Entradas', data: [], backgroundColor: '#16a34a' }, { label: 'Saídas', data: [], backgroundColor: '#dc2626' }] };
     for(let i=5; i>=0; i--) {
        const d = new Date(); d.setMonth(d.getMonth()-i);
        const monthStr = d.toISOString().slice(0, 7);
        data.labels.push(d.toLocaleDateString('pt-BR', {month: 'short'}));
        const monthTransactions = state.transactions.filter(t => t.date && t.date.startsWith(monthStr));
        data.datasets[0].data.push(monthTransactions.filter(t=>t.type==='income').reduce((s,t)=>s+t.value,0));
        data.datasets[1].data.push(monthTransactions.filter(t=>t.type==='expense').reduce((s,t)=>s+t.value,0));
     }
     if(reportsChart) reportsChart.destroy();
     reportsChart = new Chart(ctx, { type: 'bar', data, options: { responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true } } } });
};

const renderSettingsModal = () => {
    const modalContent = document.createElement('div');
    modalContent.className = 'modal-content relative';
    modalContent.innerHTML = `<span class="close-btn">&times;</span><h2 class="text-2xl font-bold mb-4">Configurações</h2>
    <div class="space-y-4">
        <div><label for="fatura-day" class="block text-sm font-medium text-gray-700">Dia de Fechamento da Fatura</label><input type="number" id="fatura-day" value="${state.settings.faturaDay}" class="mt-1 block w-full rounded-lg p-2 shadow-sm" min="1" max="31"></div>
        <div class="border-t pt-4"><h3 class="text-lg font-semibold mb-2">Orçamentos Mensais</h3><div id="budgets-settings-list" class="space-y-2">${(state.categories.expense || []).map(cat => `<div class="grid grid-cols-2 gap-2 items-center"><label class="text-sm">${cat}</label><input type="number" data-category="${cat}" value="${state.settings.budgets[cat] || ''}" class="block w-full rounded-lg p-2 shadow-sm" placeholder="R$ 0,00"></div>`).join('')}</div></div>
        <div class="border-t pt-4"><h3 class="text-lg font-semibold mb-2">Metas de Economia</h3><form id="goal-form" class="flex gap-2 mb-2"><input id="goal-name" class="flex-grow rounded-lg p-2" placeholder="Nome da Meta"><input type="number" id="goal-value" class="w-32 rounded-lg p-2" placeholder="Valor"><button type="submit" class="bg-indigo-600 text-white px-3 rounded-lg">Criar</button></form><div id="goals-settings-list" class="space-y-2">${state.goals.map(g => `<div class="flex justify-between items-center p-2 bg-gray-100 rounded"><span>${g.name} - ${formatCurrency(g.targetValue)}</span><button class="delete-goal-btn text-red-500" data-id="${g.id}">Excluir</button></div>`).join('')}</div></div>
        
        <div class="border-t pt-4">
            <h3 class="text-lg font-semibold mb-2">Importar Dados (CSV)</h3>
            <p class="text-xs text-gray-600 mb-2">Selecione um arquivo .csv para importar transações pontuais ou recorrentes. <a href="#" id="download-template-link" class="text-indigo-600 hover:underline">Baixar modelo.</a></p>
            <input type="file" id="csv-import-file" accept=".csv" class="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"/>
            <button id="import-csv-btn" class="mt-2 w-full py-2 px-4 border rounded-lg shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700">Importar Arquivo</button>
        </div>

        <div id="settings-alert" class="alert-message hidden"></div>
        <button id="save-settings-btn" class="w-full py-2 px-4 border rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700">Salvar Configurações</button>
    </div>`;
    elements.settingsModal.innerHTML = '';
    elements.settingsModal.appendChild(modalContent);

    // Adiciona o listener para o botão de importação
    document.getElementById('import-csv-btn').addEventListener('click', handleFileImport);
    document.getElementById('download-template-link').addEventListener('click', downloadCSVTemplate);

};

const renderForecastModal = () => {
    const modalContent = document.createElement('div');
    modalContent.className = 'modal-content relative';
    modalContent.innerHTML = `<span class="close-btn">&times;</span><h2 class="text-2xl font-bold mb-4">Previsão Financeira Futura</h2><div id="forecast-summary" class="text-center p-4 bg-gray-50 rounded-lg mb-4"></div><div class="relative h-80"><canvas id="forecast-chart"></canvas></div>`;
    elements.forecastModal.innerHTML = '';
    elements.forecastModal.appendChild(modalContent);
    const today = new Date();
    const historicalData = {};
    let monthsWithData = 0;
    for (let i = 1; i <= 6; i++) {
        const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
        const monthStr = d.toISOString().slice(0, 7);
        const monthTransactions = state.transactions.filter(t => t.date && t.date.startsWith(monthStr));
        if (monthTransactions.length > 0) {
            monthsWithData++;
            historicalData[monthStr] = { income: monthTransactions.filter(t => t.type === 'income').reduce((s, t) => s + t.value, 0), expense: monthTransactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.value, 0), };
        }
    }
    const forecastSummaryEl = document.getElementById('forecast-summary');
    if (monthsWithData < 1) { forecastSummaryEl.innerHTML = '<p class="text-gray-600">Dados insuficientes para gerar uma previsão.</p>'; document.getElementById('forecast-chart').style.display = 'none'; return; }
    const avgMonthlyIncome = Object.values(historicalData).reduce((s, d) => s + d.income, 0) / monthsWithData;
    const avgMonthlyExpense = Object.values(historicalData).reduce((s, d) => s + d.expense, 0) / monthsWithData;
    const avgMonthlyNet = avgMonthlyIncome - avgMonthlyExpense;
    const currentBalance = state.transactions.reduce((acc, t) => (t.type === 'income' ? acc + t.value : acc - t.value), 0);
    const labels = [];
    const dataPoints = [];
    let projectedBalance = currentBalance;
    for (let i = 1; i <= 6; i++) { const futureDate = new Date(today.getFullYear(), today.getMonth() + i, 1); labels.push(futureDate.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' })); projectedBalance += avgMonthlyNet; dataPoints.push(projectedBalance); }
    forecastSummaryEl.innerHTML = `<p>Com base na sua média, seu saldo líquido mensal é de <strong class="${avgMonthlyNet >= 0 ? 'income-text' : 'expense-text'}">${formatCurrency(avgMonthlyNet)}</strong>. Sua previsão é:</p>`;
    const ctx = document.getElementById('forecast-chart').getContext('2d');
    if (forecastChart) forecastChart.destroy();
    forecastChart = new Chart(ctx, { type: 'line', data: { labels, datasets: [{ label: 'Saldo Projetado', data: dataPoints, borderColor: '#4f46e5', backgroundColor: 'rgba(79, 70, 229, 0.1)', fill: true, tension: 0.3 }] }, options: { responsive: true, maintainAspectRatio: false, scales: { y: { ticks: { callback: value => formatCurrency(value) } } }, plugins: { tooltip: { callbacks: { label: context => ` Saldo: ${formatCurrency(context.raw)}` } } } } });
};

const renderValueInputModal = (template, callback) => {
    const modalContent = document.createElement('div');
    modalContent.className = 'modal-content relative';
    modalContent.innerHTML = `<h2 class="text-2xl font-bold mb-4">Lançar ${template.description}</h2><form id="value-input-form"><label for="pending-value" class="block text-sm font-medium text-gray-700">Valor deste mês</label><input type="number" id="pending-value" value="${template.value || ''}" class="mt-1 block w-full rounded-lg p-2 shadow-sm" placeholder="0,00" step="0.01" required><div id="input-modal-alert" class="alert-message hidden"></div><div class="flex gap-4 mt-6"><button type="button" id="cancel-input-btn" class="w-full py-2 px-4 border rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-gray-200 hover:bg-gray-300">Cancelar</button><button type="submit" class="w-full py-2 px-4 border rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700">Confirmar</button></div></form>`;
    elements.inputModal.innerHTML = '';
    elements.inputModal.appendChild(modalContent);
    openModal(elements.inputModal);
    const form = document.getElementById('value-input-form');
    const cancelBtn = document.getElementById('cancel-input-btn');
    const inputField = document.getElementById('pending-value');
    inputField.focus();
    inputField.select();
    const submitHandler = (e) => { e.preventDefault(); const value = parseFloat(inputField.value); if (isNaN(value) || value <= 0) { showAlert('Por favor, insira um valor válido.', 'error', document.getElementById('input-modal-alert')); return; } callback(value); closeModal(elements.inputModal); };
    form.addEventListener('submit', submitHandler);
    cancelBtn.addEventListener('click', () => closeModal(elements.inputModal));
};

const updateRecurringFormType = (type, selectorPrefix) => {
    document.getElementById(`recurring-type-${selectorPrefix}`).value = type;
    document.querySelectorAll(`#recurring-type-selector-${selectorPrefix} > div`).forEach(el => {
        el.classList.remove('bg-green-500', 'bg-red-500', 'bg-blue-500', 'text-white', 'font-semibold');
        el.classList.add('bg-gray-200', 'text-gray-800');
    });
    const selectedEl = document.querySelector(`#recurring-type-selector-${selectorPrefix} [data-type="${type}"]`);
    selectedEl.classList.add(type === 'income' ? 'bg-green-500' : type === 'expense' ? 'bg-red-500' : 'bg-blue-500', 'text-white', 'font-semibold');
    renderCategoryDropdown(document.getElementById(`recurring-category-${selectorPrefix}`), type);
    document.getElementById(`recurring-payment-field-${selectorPrefix}`).classList.toggle('hidden', type !== 'expense');
};

// --- IMPORT/EXPORT LOGIC ---
const downloadCSVTemplate = (e) => {
    e.preventDefault();
    const header = "import_type,type,value,date,category,description,payment_method,day_of_month,is_variable,duration_months\n";
    const pontualExample = "pontual,expense,55.90,2024-05-20,Alimentação,Jantar com amigos,Cartão de Crédito,,,\n";
    const recorrenteExample = "recorrente,income,5000,N/A,Salário,Salário Mensal,N/A,5,false,\n";
    const content = header + pontualExample + recorrenteExample;
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "modelo_importacao.csv");
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

const handleFileImport = () => {
    const fileInput = document.getElementById('csv-import-file');
    const file = fileInput.files[0];
    const alertEl = document.getElementById('settings-alert');
    if (!file) {
        showAlert('Por favor, selecione um arquivo.', 'error', alertEl);
        return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
        const text = event.target.result;
        const lines = text.split('\n').filter(line => line.trim() !== '');
        if (lines.length < 2) {
            showAlert('Arquivo vazio ou inválido.', 'error', alertEl);
            return;
        }

        const header = lines[0].split(',').map(h => h.trim());
        const rows = lines.slice(1);
        
        const batch = writeBatch(db);
        let successCount = 0;
        let errorCount = 0;

        rows.forEach((row, index) => {
            const data = row.split(',').map(d => d.trim());
            const rowData = header.reduce((obj, key, i) => {
                obj[key] = data[i];
                return obj;
            }, {});

            try {
                if (rowData.import_type === 'pontual') {
                    const newDocRef = doc(collection(db, `/artifacts/${appId}/users/${userId}/transactions`));
                    const transaction = {
                        type: rowData.type,
                        value: parseFloat(rowData.value),
                        date: rowData.date, // YYYY-MM-DD
                        category: rowData.category,
                        description: rowData.description,
                        paymentMethod: rowData.payment_method || null,
                        timestamp: serverTimestamp()
                    };
                    if (!transaction.type || isNaN(transaction.value) || !transaction.date || !transaction.category) {
                        throw new Error(`Dados inválidos na linha ${index + 2}`);
                    }
                    batch.set(newDocRef, transaction);
                    successCount++;

                } else if (rowData.import_type === 'recorrente') {
                     const newDocRef = doc(collection(db, `/artifacts/${appId}/users/${userId}/recurring_templates`));
                     const template = {
                        type: rowData.type,
                        value: parseFloat(rowData.value) || 0,
                        category: rowData.category,
                        description: rowData.description,
                        paymentMethod: rowData.payment_method || null,
                        dayOfMonth: parseInt(rowData.day_of_month),
                        isVariable: rowData.is_variable === 'true',
                        durationMonths: rowData.duration_months ? parseInt(rowData.duration_months) : null,
                        createdAt: serverTimestamp()
                     };
                     if (!template.type || !template.dayOfMonth || !template.category || !template.description) {
                        throw new Error(`Dados inválidos na linha ${index + 2}`);
                     }
                     batch.set(newDocRef, template);
                     successCount++;
                }
            } catch (e) {
                console.error(`Erro na linha ${index + 2}:`, e.message, rowData);
                errorCount++;
            }
        });

        if (errorCount > 0) {
            showAlert(`${errorCount} linha(s) continha(m) erros e não foram importadas. Verifique o console.`, 'error', alertEl);
        } else if (successCount > 0) {
            await batch.commit();
            showAlert(`${successCount} item(ns) importado(s) com sucesso!`, 'success', alertEl);
        } else {
            showAlert('Nenhum item válido para importar.', 'error', alertEl);
        }
         fileInput.value = ''; // Reset file input
    };
    reader.readAsText(file);
};

// --- APP INITIALIZATION & EVENT LISTENERS ---
document.addEventListener('DOMContentLoaded', () => {
    initializeAppAndListeners();
    setCurrentDate();
    generateInstallmentOptions(elements.installmentsSelect);
    updateFormColor('expense');
    elements.toggleMainBalancesBtn.innerHTML = icons.eyeSlash;
    elements.toggleOverviewBalancesBtn.innerHTML = icons.eyeSlash;
    updateRecurringFormType('expense', 'main');

    elements.app.addEventListener('click', async (e) => {
        const target = e.target;
        if (target.closest('#manage-recurring-btn')) { renderRecurringModalContent(); openModal(elements.recurringModal); }
        if (target.closest('#forecast-btn')) { renderForecastModal(); openModal(elements.forecastModal); }
        if (target.closest('#reports-btn')) { renderReportsModal(); openModal(elements.reportsModal); }
        if (target.closest('#settings-btn')) { renderSettingsModal(); openModal(elements.settingsModal); }
        if (target.closest('#balance-card')) { openDetailsModal('balance'); }
        if (target.closest('#investment-card')) { openDetailsModal('investment'); }
        if (target.closest('#credit-card-card')) { openDetailsModal('credit-card'); }
        if (target.closest('#income-summary-card')) { openDetailsModal('income'); }
        if (target.closest('#expense-summary-card')) { openDetailsModal('expense'); }
        if (target.closest('#monthly-balance-card')) { openDetailsModal('monthly-balance'); }
        if (target.closest('#prev-pending-month-btn')) { state.pendingSelectedDate.setMonth(state.pendingSelectedDate.getMonth() - 1); renderPendingTransactions(); }
        if (target.closest('#next-pending-month-btn')) { state.pendingSelectedDate.setMonth(state.pendingSelectedDate.getMonth() + 1); renderPendingTransactions(); }
        
        const typeSelector = target.closest('#type-selector .cursor-pointer');
        if (typeSelector) { updateFormColor(typeSelector.dataset.type); }
        if (target.closest('#prev-overview-month-btn')) { state.overviewSelectedDate.setMonth(state.overviewSelectedDate.getMonth() - 1); updateUI(); }
        if (target.closest('#next-overview-month-btn')) { state.overviewSelectedDate.setMonth(state.overviewSelectedDate.getMonth() + 1); updateUI(); }
        if (target.closest('#prev-history-month-btn')) { state.historySelectedDate.setMonth(state.historySelectedDate.getMonth() - 1); renderTransactions(); }
        if (target.closest('#next-history-month-btn')) { state.historySelectedDate.setMonth(state.historySelectedDate.getMonth() + 1); renderTransactions(); }
        if (target.closest('#toggle-main-balances-btn')) { state.isMainBalanceHidden = !state.isMainBalanceHidden; elements.toggleMainBalancesBtn.innerHTML = state.isMainBalanceHidden ? icons.eyeSlash : icons.eye; updateAllBalances(); }
        if (target.closest('#toggle-overview-balances-btn')) { state.isOverviewBalanceHidden = !state.isOverviewBalanceHidden; elements.toggleOverviewBalancesBtn.innerHTML = state.isOverviewBalanceHidden ? icons.eyeSlash : icons.eye; updateAllBalances(); }

        const postPendingBtn = target.closest('.post-pending-btn');
        if (postPendingBtn) {
            const templateId = postPendingBtn.closest('[data-template-id]').dataset.templateId;
            const template = state.recurringTemplates.find(t => t.id === templateId);
            if (!template) return;
            
            const launchDate = new Date(state.pendingSelectedDate.getFullYear(), state.pendingSelectedDate.getMonth(), template.dayOfMonth);
            const dateString = launchDate.toISOString().slice(0, 10);

            const postTransaction = async (value, date) => {
                 try {
                    const { createdAt, ...dataToPost } = template;
                    await addDoc(collection(db, `/artifacts/${appId}/users/${userId}/transactions`), { ...dataToPost, value, date: date, recurringTemplateId: template.id, timestamp: serverTimestamp() });
                    showAlert('Transação recorrente lançada!', 'success', elements.transactionAlertMessage);
                } catch (err) { console.error("Erro ao lançar recorrente:", err); showAlert('Erro ao lançar transação.', 'error', elements.transactionAlertMessage); }
            }

            if (template.isVariable) { renderValueInputModal(template, (newValue) => postTransaction(newValue, dateString)); } else { postTransaction(template.value, dateString); }
        }

        const editBtn = target.closest('.edit-btn');
        if (editBtn) {
            const id = editBtn.dataset.id;
            const t = state.transactions.find(tr => tr.id === id); if (!t) return;
            state.isEditing = true; elements.transactionIdInput.value = t.id; updateFormColor(t.type);
            elements.valueInput.value = t.value; elements.dateInput.value = t.date; elements.descriptionInput.value = t.description;
            setTimeout(() => { elements.categorySelect.value = t.category; if (t.type === 'expense') { elements.paymentMethodSelect.value = t.paymentMethod; elements.installmentsField.classList.toggle('hidden', t.paymentMethod !== 'Cartão de Crédito'); } }, 100);
            elements.submitBtn.textContent = 'Salvar Alterações'; 
            elements.cancelEditBtn.classList.remove('hidden');
            elements.submitBtn.classList.add('w-2/3');
            elements.submitBtn.classList.remove('w-full');
            elements.transactionForm.scrollIntoView({ behavior: 'smooth' });
        }
        if (target.closest('.delete-btn')) { const id = target.closest('.delete-btn').dataset.id; try { await deleteDoc(doc(db, `/artifacts/${appId}/users/${userId}/transactions`, id)); } catch (err) { console.error(err); } }
        if(target.closest('#cancel-edit-btn')){ resetTransactionForm(); }

        const recurringTypeSelectorMain = target.closest('#recurring-type-selector-main .cursor-pointer');
        if (recurringTypeSelectorMain) {
            updateRecurringFormType(recurringTypeSelectorMain.dataset.type, 'main');
        }
    });

    elements.showTransactionFormBtn.addEventListener('click', () => { elements.transactionFormContainer.classList.remove('hidden'); elements.recurringFormContainer.classList.add('hidden'); elements.showTransactionFormBtn.classList.add('active'); elements.showRecurringFormBtn.classList.remove('active'); });
    elements.showRecurringFormBtn.addEventListener('click', () => { elements.transactionFormContainer.classList.add('hidden'); elements.recurringFormContainer.classList.remove('hidden'); elements.showTransactionFormBtn.classList.remove('active'); elements.showRecurringFormBtn.classList.add('active'); updateRecurringFormType('expense', 'main'); });
    
    [elements.settingsModal, elements.recurringModal, elements.reportsModal, elements.detailsModal, elements.forecastModal, elements.inputModal].forEach(modal => {
        modal.addEventListener('click', async e => {
            const target = e.target;
            if (target === modal || target.closest('.close-btn')) { state.isEditingRecurring = false; state.editingRecurringId = null; closeModal(modal); }
            if (target.closest('#save-settings-btn')) { const faturaDay = parseInt(document.getElementById('fatura-day').value); const budgets = {}; document.querySelectorAll('#budgets-settings-list input').forEach(input => { if(input.value) budgets[input.dataset.category] = parseFloat(input.value); }); try { await setDoc(doc(db, `/artifacts/${appId}/users/${userId}/settings`, 'user_settings'), { faturaDay, budgets }); showAlert('Configurações salvas!', 'success', document.getElementById('settings-alert')); } catch (error) { showAlert('Erro ao salvar!', 'error', document.getElementById('settings-alert')); console.error(error); } }
            if (target.closest('.delete-goal-btn')) { const id = target.closest('.delete-goal-btn').dataset.id; await deleteDoc(doc(db, `/artifacts/${appId}/users/${userId}/goals`, id)); renderSettingsModal(); }
            
            const recurringTypeSelectorModal = target.closest('#recurring-type-selector-modal .cursor-pointer');
            if (recurringTypeSelectorModal) {
                updateRecurringFormType(recurringTypeSelectorModal.dataset.type, 'modal');
            }
            if(target.closest('.delete-recurring-btn')){ const id = target.closest('.delete-recurring-btn').dataset.id; await deleteDoc(doc(db, `/artifacts/${appId}/users/${userId}/recurring_templates`, id)); if (state.editingRecurringId === id) { state.isEditingRecurring = false; state.editingRecurringId = null; } renderRecurringModalContent(); }
            if(target.closest('.edit-recurring-btn')){ const id = target.closest('.edit-recurring-btn').dataset.id; state.isEditingRecurring = true; state.editingRecurringId = id; renderRecurringModalContent(true); }
            if(target.closest('#cancel-recurring-edit-btn')){ state.isEditingRecurring = false; state.editingRecurringId = null; renderRecurringModalContent(); }
        });
        
        modal.addEventListener('submit', async e => {
            e.preventDefault();
            if(e.target.id === 'goal-form') { const name = document.getElementById('goal-name').value; const targetValue = parseFloat(document.getElementById('goal-value').value); if(name && targetValue > 0) { await addDoc(collection(db, `/artifacts/${appId}/users/${userId}/goals`), { name, targetValue }); renderSettingsModal(); } }
            if(e.target.id === 'recurring-form-modal') {
                const id = document.getElementById('recurring-id-modal').value;
                const data = { description: document.getElementById('recurring-description-modal').value, category: document.getElementById('recurring-category-modal').value, type: document.getElementById('recurring-type-modal').value, isVariable: document.getElementById('recurring-is-variable-modal').checked, value: parseFloat(document.getElementById('recurring-value-modal').value) || 0, dayOfMonth: parseInt(document.getElementById('recurring-day-of-month-modal').value), durationMonths: parseInt(document.getElementById('recurring-duration-modal').value) || null, paymentMethod: document.getElementById('recurring-type-modal').value === 'expense' ? document.getElementById('recurring-payment-method-modal').value : null };
                if (!data.description || !data.category || !data.dayOfMonth) { showAlert('Descrição, Categoria e Dia são obrigatórios!', 'error', document.getElementById('recurring-alert-message-modal')); return; }
                try { await updateDoc(doc(db, `/artifacts/${appId}/users/${userId}/recurring_templates`, id), data); state.isEditingRecurring = false; state.editingRecurringId = null; renderRecurringModalContent(); } catch (err) { console.error(err); showAlert('Erro ao salvar!', 'error', document.getElementById('recurring-alert-message-modal')); }
            }
        });
    });

    elements.paymentMethodSelect.addEventListener('change', (e) => { elements.installmentsField.classList.toggle('hidden', e.target.value !== 'Cartão de Crédito'); });
    elements.categoryFilter.addEventListener('change', () => { state.filters.category = elements.categoryFilter.value; renderTransactions(); });
    elements.transactionForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = elements.transactionIdInput.value;
        const data = { type: elements.hiddenTypeInput.value, value: parseFloat(elements.valueInput.value), category: elements.categorySelect.value, date: elements.dateInput.value, description: elements.descriptionInput.value, paymentMethod: state.selectedType === 'expense' ? elements.paymentMethodSelect.value : null, timestamp: serverTimestamp() };
        try {
            if (state.isEditing) {
                await updateDoc(doc(db, `/artifacts/${appId}/users/${userId}/transactions`, id), data);
                showAlert('Transação atualizada!', 'success', elements.transactionAlertMessage);
            } else {
                const isInstallment = state.selectedType === 'expense' && data.paymentMethod === 'Cartão de Crédito' && parseInt(elements.installmentsSelect.value) > 1;
                if (isInstallment) {
                    const totalValue = data.value; const installments = parseInt(elements.installmentsSelect.value); const installmentValue = parseFloat((totalValue / installments).toFixed(2)); const originalDesc = data.description; const startDate = new Date(data.date + 'T12:00:00Z'); const batch = writeBatch(db);
                    for (let i = 0; i < installments; i++) { const installmentDate = new Date(startDate.getFullYear(), startDate.getMonth() + i, startDate.getDate()); const newDocRef = doc(collection(db, `/artifacts/${appId}/users/${userId}/transactions`)); batch.set(newDocRef, { ...data, value: installmentValue, date: installmentDate.toISOString().slice(0, 10), description: `${originalDesc} (${i + 1}/${installments})` }); }
                    await batch.commit();
                    showAlert(`${installments} parcelas adicionadas!`, 'success', elements.transactionAlertMessage);
                } else {
                    await addDoc(collection(db, `/artifacts/${appId}/users/${userId}/transactions`), data);
                    showAlert('Transação adicionada!', 'success', elements.transactionAlertMessage);
                }
            }
        } catch (err) { console.error(err); showAlert('Ocorreu um erro', 'error', elements.transactionAlertMessage); }
        finally { resetTransactionForm(); }
    });

    elements.recurringForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const data = { description: document.getElementById('recurring-description-main').value, category: document.getElementById('recurring-category-main').value, type: document.getElementById('recurring-type-main').value, isVariable: document.getElementById('recurring-is-variable-main').checked, value: parseFloat(document.getElementById('recurring-value-main').value) || 0, dayOfMonth: parseInt(document.getElementById('recurring-day-of-month-main').value), durationMonths: parseInt(document.getElementById('recurring-duration-main').value) || null, paymentMethod: document.getElementById('recurring-type-main').value === 'expense' ? document.getElementById('recurring-payment-method-main').value : null, createdAt: serverTimestamp() };
        if (!data.description || !data.category || !data.dayOfMonth) { showAlert('Descrição, Categoria e Dia são obrigatórios!', 'error', document.getElementById('recurring-alert-message-main')); return; }
        try {
            await addDoc(collection(db, `/artifacts/${appId}/users/${userId}/recurring_templates`), data);
            showAlert('Recorrente salvo com sucesso!', 'success', document.getElementById('recurring-alert-message-main'));
            e.target.reset();
            updateRecurringFormType('expense', 'main');
        } catch (err) { console.error(err); showAlert('Erro ao salvar recorrente.', 'error', document.getElementById('recurring-alert-message-main')); }
    });
});
