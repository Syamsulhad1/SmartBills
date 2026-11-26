const toAmount = (value, period, type) => {
    const amount = Number(value);
    if (!Number.isFinite(amount)) {
        throw new Error(`Respons ringkasan ${period} ${type} tidak valid.`);
    }
    return amount;
};

export const getCurrentPeriodSummaries = (periods) => {
    if (!periods?.weekly || !periods?.monthly) {
        throw new Error("Server tidak mengirim ringkasan minggu dan bulan berjalan.");
    }

    return {
        weekly: {
            income: toAmount(periods.weekly.income, "minggu", "pemasukan"),
            expense: toAmount(periods.weekly.expense, "minggu", "pengeluaran")
        },
        monthly: {
            income: toAmount(periods.monthly.income, "bulan", "pemasukan"),
            expense: toAmount(periods.monthly.expense, "bulan", "pengeluaran")
        }
    };
};
