
import React, { useState, useEffect } from 'react';
import { Screen, Transaction, Investment, Category, Goal, CreditCard, RecurringItem, RecurringTransaction } from './types';
import DashboardScreen from './components/DashboardScreen';
import AddTransactionScreen from './components/AddTransactionScreen';
import BalanceDetailsScreen from './components/BalanceDetailsScreen';
import CategoryDetailsScreen from './components/CategoryDetailsScreen';
import PlanningScreen from './components/PlanningScreen';
import TransactionsScreen from './components/TransactionsScreen';
import ReportsScreen from './components/ReportsScreen';
import InvestmentsScreen from './components/InvestmentsScreen';
import CardManagementScreen from './components/CardManagementScreen';
import BottomNav from './components/BottomNav';
import { AppProvider, useAppContext } from './context/DataContext';
import ProfileScreen from './components/ProfileScreen';
import AddInvestmentScreen from './components/AddInvestmentScreen';
import AddCategoryScreen from './components/AddCategoryScreen';
import AddGoalScreen from './components/AddGoalScreen';
import AddCardScreen from './components/AddCardScreen';
import RecurringItemsScreen from './components/RecurringItemsScreen';
import AddRecurringItemScreen from './components/AddRecurringItemScreen';
import AiAnalysisModal from './components/AiAnalysisModal';
import RecurringTransactionsScreen from './components/RecurringTransactionsScreen';
import AddRecurringTransactionScreen from './components/AddRecurringTransactionScreen';
import RecurringItemHistoryModal from './components/RecurringItemHistoryModal';
import { auth } from './firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import LoginScreen from './components/LoginScreen';

const AppContent: React.FC = () => {
    const [currentScreen, setCurrentScreen] = useState<Screen>(Screen.Dashboard);
    const [context, setContext] = useState<any>(null);

    // Modal States
    const [isAddTransactionModalOpen, setAddTransactionModalOpen] = useState(false);
    const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
    const [transactionTemplate, setTransactionTemplate] = useState<Partial<Transaction> | null>(null);

    const [isAddInvestmentModalOpen, setAddInvestmentModalOpen] = useState(false);
    const [editingInvestment, setEditingInvestment] = useState<Investment | null>(null);

    const [isAddCategoryModalOpen, setAddCategoryModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [addCategoryContext, setAddCategoryContext] = useState<{ parentId: string | null; type: 'income' | 'expense' | 'investment' }>({ parentId: null, type: 'expense' });
    
    const [isAddGoalModalOpen, setAddGoalModalOpen] = useState(false);
    const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
    
    const [isAddCardModalOpen, setAddCardModalOpen] = useState(false);
    const [editingCard, setEditingCard] = useState<CreditCard | null>(null);
    
    const [isAddRecurringItemModalOpen, setAddRecurringItemModalOpen] = useState(false);
    const [editingRecurringItem, setEditingRecurringItem] = useState<RecurringItem | null>(null);
    const [recurringItemHistory, setRecurringItemHistory] = useState<RecurringItem | null>(null);
    
    const [isAiAnalysisModalOpen, setAiAnalysisModalOpen] = useState(false);
    
    const [isAddRecurringTransactionModalOpen, setAddRecurringTransactionModalOpen] = useState(false);
    const [editingRecurringTransaction, setEditingRecurringTransaction] = useState<RecurringTransaction | null>(null);

    const { 
        addTransaction, updateTransaction, 
        addInvestment, updateInvestment, 
        addCategory, updateCategory, 
        addGoal, updateGoal, deleteGoal,
        addCard, updateCard,
        addRecurringItem, updateRecurringItem,
        addRecurringTransaction, updateRecurringTransaction,
    } = useAppContext();

    const navigateTo = (screen: Screen, newContext: any = null) => {
        setCurrentScreen(screen);
        setContext(newContext);
    };

    // Transaction Handlers
    const handleOpenAddTransaction = (template: Partial<Omit<Transaction, 'id'>> | null = null) => {
        setEditingTransaction(null);
        setTransactionTemplate(template);
        setAddTransactionModalOpen(true);
    };
    const handleOpenEditTransaction = (transaction: Transaction) => {
        setEditingTransaction(transaction);
        setTransactionTemplate(null);
        setAddTransactionModalOpen(true);
    };
    const handleCloseTransactionModal = () => {
        setAddTransactionModalOpen(false);
        setEditingTransaction(null);
        setTransactionTemplate(null);
    };
    const handleSaveTransaction = (transactionData: Omit<Transaction, 'id'>, id?: string) => {
        if (id) {
            updateTransaction({ ...transactionData, id });
        } else {
            addTransaction(transactionData);
        }
        handleCloseTransactionModal();
    };
    
    // Investment Handlers
    const handleOpenAddInvestment = () => { setEditingInvestment(null); setAddInvestmentModalOpen(true); };
    const handleOpenEditInvestment = (investment: Investment) => { setEditingInvestment(investment); setAddInvestmentModalOpen(true); };
    const handleCloseInvestmentModal = () => { setAddInvestmentModalOpen(false); setEditingInvestment(null); };
    const handleSaveInvestment = (investmentData: Omit<Investment, 'id'>, id?: string) => {
        if (id) { updateInvestment({ ...investmentData, id }); } else { addInvestment(investmentData); }
        handleCloseInvestmentModal();
    };

    // Category Handlers
    const handleOpenAddCategory = (context: { parentId?: string | null, type: 'income' | 'expense' | 'investment' }) => {
        setEditingCategory(null);
        setAddCategoryContext({ parentId: context.parentId || null, type: context.type });
        setAddCategoryModalOpen(true);
    };
    const handleOpenEditCategory = (category: Category) => {
        setEditingCategory(category);
        setAddCategoryContext({ parentId: category.parentId || null, type: category.type });
        setAddCategoryModalOpen(true);
    };
    const handleCloseCategoryModal = () => { setAddCategoryModalOpen(false); setEditingCategory(null); setAddCategoryContext({ parentId: null, type: 'expense' }); };
    const handleSaveCategory = (categoryData: Omit<Category, 'id'>, id?: string) => {
        if (id) { updateCategory({ ...categoryData, id }); } else { addCategory(categoryData); }
        handleCloseCategoryModal();
    };

    // Goal Handlers
    const handleOpenAddGoal = () => { setEditingGoal(null); setAddGoalModalOpen(true); };
    const handleOpenEditGoal = (goal: Goal) => { setEditingGoal(goal); setAddGoalModalOpen(true); };
    const handleCloseGoalModal = () => { setAddGoalModalOpen(false); setEditingGoal(null); };
    const handleSaveGoal = (goalData: Omit<Goal, 'id'>, id?: string) => {
        if (id) { updateGoal({ ...goalData, id }); } else { addGoal(goalData); }
        handleCloseGoalModal();
    };

    // Card Handlers
    const handleOpenAddCard = () => { setEditingCard(null); setAddCardModalOpen(true); };
    const handleOpenEditCard = (card: CreditCard) => { setEditingCard(card); setAddCardModalOpen(true); };
    const handleCloseCardModal = () => { setAddCardModalOpen(false); setEditingCard(null); };
    const handleSaveCard = (cardData: Omit<CreditCard, 'id'>, id?: string) => {
        if (id) { updateCard({ ...cardData, id }); } else { addCard(cardData); }
        handleCloseCardModal();
    };
    
    // Recurring Item Handlers
    const handleOpenAddRecurringItem = () => { setEditingRecurringItem(null); setAddRecurringItemModalOpen(true); };
    const handleOpenEditRecurringItem = (item: RecurringItem) => { setEditingRecurringItem(item); setAddRecurringItemModalOpen(true); };
    const handleCloseRecurringItemModal = () => { setAddRecurringItemModalOpen(false); setEditingRecurringItem(null); };
    const handleSaveRecurringItem = (itemData: Omit<RecurringItem, 'id'>, id?: string) => {
        if (id) { updateRecurringItem({ ...itemData, id }); } else { addRecurringItem(itemData); }
        handleCloseRecurringItemModal();
    };
    
    // Recurring Transaction Handlers
    const handleOpenAddRecurringTransaction = () => { setEditingRecurringTransaction(null); setAddRecurringTransactionModalOpen(true); };
    const handleOpenEditRecurringTransaction = (item: RecurringTransaction) => { setEditingRecurringTransaction(item); setAddRecurringTransactionModalOpen(true); };
    const handleCloseRecurringTransactionModal = () => { setAddRecurringTransactionModalOpen(false); setEditingRecurringTransaction(null); };
    const handleSaveRecurringTransaction = (itemData: Omit<RecurringTransaction, 'id'>, id?: string) => {
        if (id) { updateRecurringTransaction({ ...itemData, id }); } else { addRecurringTransaction(itemData); }
        handleCloseRecurringTransactionModal();
    };

    const renderScreen = () => {
        switch (currentScreen) {
            case Screen.Dashboard:
                return <DashboardScreen navigateTo={navigateTo} onOpenAiAnalysis={() => setAiAnalysisModalOpen(true)} onApproveTransaction={handleOpenAddTransaction} />;
            case Screen.BalanceDetails:
                return <BalanceDetailsScreen navigateTo={navigateTo} context={context} />;
            case Screen.CategoryDetails:
                return <CategoryDetailsScreen navigateTo={navigateTo} context={context} onApproveItem={handleOpenAddTransaction}/>;
            case Screen.Planning:
                return <PlanningScreen navigateTo={navigateTo} onAddCategory={handleOpenAddCategory} onEditCategory={handleOpenEditCategory} />;
            case Screen.Transactions:
                return <TransactionsScreen navigateTo={navigateTo} onEdit={handleOpenEditTransaction} />;
            case Screen.Reports:
                return <ReportsScreen navigateTo={navigateTo} onAddGoal={handleOpenAddGoal} onEditGoal={handleOpenEditGoal} onDeleteGoal={deleteGoal}/>;
            case Screen.Investments:
                return <InvestmentsScreen navigateTo={navigateTo} onAdd={handleOpenAddInvestment} onEdit={handleOpenEditInvestment} />;
            case Screen.CardManagement:
                return <CardManagementScreen navigateTo={navigateTo} onAdd={handleOpenAddCard} onEdit={handleOpenEditCard} />;
            case Screen.Profile:
                return <ProfileScreen navigateTo={navigateTo} />;
            case Screen.RecurringItems:
                return <RecurringItemsScreen navigateTo={navigateTo} onAddItem={handleOpenAddRecurringItem} onEditItem={handleOpenEditRecurringItem} onViewHistory={setRecurringItemHistory} />;
            case Screen.RecurringTransactions:
                return <RecurringTransactionsScreen navigateTo={navigateTo} onAddItem={handleOpenAddRecurringTransaction} onEditItem={handleOpenEditRecurringTransaction} />;
            default:
                return <DashboardScreen navigateTo={navigateTo} onOpenAiAnalysis={() => setAiAnalysisModalOpen(true)} onApproveTransaction={handleOpenAddTransaction} />;
        }
    };
    
    return (
        <div className="relative flex min-h-screen w-full flex-col font-display">
            {renderScreen()}
            {isAddTransactionModalOpen && <AddTransactionScreen onSave={handleSaveTransaction} onClose={handleCloseTransactionModal} transactionToEdit={editingTransaction} transactionTemplate={transactionTemplate} />}
            {isAddInvestmentModalOpen && <AddInvestmentScreen onSave={handleSaveInvestment} onClose={handleCloseInvestmentModal} investmentToEdit={editingInvestment} />}
            {isAddCategoryModalOpen && <AddCategoryScreen onSave={handleSaveCategory} onClose={handleCloseCategoryModal} categoryToEdit={editingCategory} context={addCategoryContext} />}
            {isAddGoalModalOpen && <AddGoalScreen onSave={handleSaveGoal} onClose={handleCloseGoalModal} goalToEdit={editingGoal} />}
            {isAddCardModalOpen && <AddCardScreen onSave={handleSaveCard} onClose={handleCloseCardModal} cardToEdit={editingCard} />}
            {isAddRecurringItemModalOpen && <AddRecurringItemScreen onSave={handleSaveRecurringItem} onClose={handleCloseRecurringItemModal} itemToEdit={editingRecurringItem} />}
            {isAiAnalysisModalOpen && <AiAnalysisModal onClose={() => setAiAnalysisModalOpen(false)} />}
            {isAddRecurringTransactionModalOpen && <AddRecurringTransactionScreen onSave={handleSaveRecurringTransaction} onClose={handleCloseRecurringTransactionModal} itemToEdit={editingRecurringTransaction} />}
            {recurringItemHistory && <RecurringItemHistoryModal item={recurringItemHistory} onClose={() => setRecurringItemHistory(null)} />}
            
            <BottomNav activeScreen={currentScreen} navigateTo={navigateTo} onAddTransaction={() => handleOpenAddTransaction()} />
        </div>
    );
};


const App: React.FC = () => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    useEffect(() => {
        const applyTheme = () => {
            const theme = localStorage.getItem('theme');
            if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                document.documentElement.classList.add('dark');
            } else {
                document.documentElement.classList.remove('dark');
            }
        };

        applyTheme();
        window.addEventListener('storage', applyTheme);
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        mediaQuery.addEventListener('change', applyTheme);

        return () => {
            window.removeEventListener('storage', applyTheme);
            mediaQuery.removeEventListener('change', applyTheme);
        };
    }, []);

    if (loading) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-background-light dark:bg-background-dark">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary"></div>
            </div>
        );
    }
    
    return user ? (
        <AppProvider user={user}>
            <AppContent />
        </AppProvider>
    ) : (
        <LoginScreen />
    );
}

export default App;