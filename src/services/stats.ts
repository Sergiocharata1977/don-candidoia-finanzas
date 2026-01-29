import { db } from '@/firebase/config';
import { collection, query, where, getDocs, Timestamp, orderBy } from 'firebase/firestore';
import { startOfMonth, endOfMonth, subMonths, format } from 'date-fns';
import { es } from 'date-fns/locale';

export interface DashboardStats {
    monthlyIncome: number;
    monthlyExpenses: number;
    accountsReceivable: number;
    accountsPayable: number;
    incomeTrend: { name: string; value: number }[];
    expenseByCategory: { name: string; value: number; color: string }[];
}

const COLORS = [
    'var(--color-chart-1)',
    'var(--chart-2)',
    'var(--chart-3)',
    'var(--chart-4)',
    'var(--chart-5)',
];

export async function getDashboardStats(orgId: string): Promise<DashboardStats> {
    const now = new Date();
    const start = startOfMonth(now);
    const end = endOfMonth(now);

    // 1. Get Monthly Income (Account starting with 4)
    // Ideally, we sum Journal Entries lines. For MVP, we query journal entries of type 'ingreso' or check lines.
    // A robust way: Query all journal entries in date range, filter lines by account prefix '4'.

    const entriesRef = collection(db, `organizations/${orgId}/journal_entries`);

    // Get last 6 months for trend
    const sixMonthsAgo = subMonths(now, 5);
    const qTrend = query(
        entriesRef,
        where('fecha', '>=', Timestamp.fromDate(startOfMonth(sixMonthsAgo))),
        orderBy('fecha', 'asc')
    );

    const querySnapshot = await getDocs(qTrend);
    const entries = querySnapshot.docs.map(doc => doc.data());

    let monthlyIncome = 0;
    let monthlyExpenses = 0;

    // Trend Data Maps
    const incomeTrendMap = new Map<string, number>();
    const expenseMap = new Map<string, number>();

    entries.forEach((entry: any) => {
        const entryDate = entry.fecha.toDate();
        const monthKey = format(entryDate, 'MMM', { locale: es });
        const isCurrentMonth = entryDate >= start && entryDate <= end;

        entry.lineas.forEach((line: any) => {
            // Ingresos (4...) - Credit (Haber) increases income
            // We assume 4.0.0... is income.
            // Also check if account code (not just Name) is available. 
            // If not, we rely on accountId which we'd need to lookup or naming convention.
            // For now, let's assume 'Ventas' or 'Ingresos' in name or type.

            // Better: We need account info. But for speed, let's assume specific Account IDs or fetch accounts cache.
            // Let's rely on accountType/prefix logic if we can or just use "haber" for checking result roughly.
            // Wait, standard accounting: 4=Income, 5=Expense.
            // We need to know the account code for the line.
            // If we don't have it in line, we might need to fetch accounts or store code in line.
            // Looking at seed-db, we store cuentaId and cuentaNombre.
            // Let's fetch all accounts to map ID -> Code.
        });
    });

    // Fetch Accounts to Map IDs
    const accountsRef = collection(db, `organizations/${orgId}/accounts`);
    const accountsSnap = await getDocs(accountsRef);
    const accountMap = new Map<string, string>(); // ID -> Code
    accountsSnap.docs.forEach(doc => {
        const data = doc.data();
        accountMap.set(doc.id, data.codigo);
    });

    entries.forEach((entry: any) => {
        const entryDate = entry.fecha.toDate();
        const monthKey = format(entryDate, 'MMM', { locale: es }); // E.g., "ene"
        // Initialize trend if not exists
        if (!incomeTrendMap.has(monthKey)) incomeTrendMap.set(monthKey, 0);

        const isCurrentMonth = entryDate >= start && entryDate <= end;

        entry.lineas.forEach((line: any) => {
            const code = accountMap.get(line.cuentaId);
            if (!code) return;

            if (code.startsWith('4')) { // Income
                const val = line.haber - line.debe; // Income is Credit balance usually
                if (val > 0) {
                    const current = incomeTrendMap.get(monthKey) || 0;
                    incomeTrendMap.set(monthKey, current + val);
                    if (isCurrentMonth) monthlyIncome += val;
                }
            } else if (code.startsWith('5')) { // Expense
                const val = line.debe - line.haber; // Expense is Debit balance
                if (val > 0) {
                    if (isCurrentMonth) {
                        monthlyExpenses += val;
                        // Category breakdown (use 3 digits e.g. 5.1.01)
                        // Let's use the account name for the category
                        const currentCat = expenseMap.get(line.cuentaNombre) || 0;
                        expenseMap.set(line.cuentaNombre, currentCat + val);
                    }
                }
            }
        });
    });

    // Calculate Payables/Receivables (Balance of 2.1... and 1.1.02...)
    // This requires summing ALL history or checking current balance of specific accounts.
    // Simplified for now: Sum of all time 'Deudas Comerciales' (2.1.01) and 'Deudores por Ventas' (1.1.02)
    // We can just calculate balances of all accounts starting with 2 and 1.1...
    // For MVP, set to 0 or implement comprehensive calculation.
    // Re-reading seed: 2.1.01 is 'Proveedores Varios'. 
    // Let's iterate accounts and sum their balances if we stored them? No, we compute from journal.
    // Computing from journal for ALL history might be slow.
    // Let's just use the cached 'saldo' field if we updated it?
    // We do NOT update account saldo on journal entry creation in seed (basic implementation).
    // So we must calculate.

    // For 'accountsReceivable' and 'Payables', let's mock or calculate just from fetched entries (6 months) which is imperfect but fast.
    const accountsReceivable = 0; // TODO: Implement full balance calculation
    const accountsPayable = 0;

    const incomeTrend = Array.from(incomeTrendMap.entries()).map(([name, value]) => ({ name, value }));

    const expenseByCategory = Array.from(expenseMap.entries())
        .map(([name, value], index) => ({
            name,
            value,
            color: `hsl(var(--chart-${(index % 5) + 1}))` // Use CSS variables mapping
        }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 5); // Top 5

    return {
        monthlyIncome,
        monthlyExpenses,
        accountsReceivable,
        accountsPayable,
        incomeTrend,
        expenseByCategory
    };
}
