import { useCallback, useRef, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import {
    ActivityIndicator,
    Pressable,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    View
} from "react-native";
import Svg, { Circle, Line as SvgLine, Path, Text as SvgText } from "react-native-svg";
import { api } from "../api/client";
import { useAuth } from "../auth/AuthContext";
import { InitialBalanceForm } from "../components/InitialBalanceForm";
import { Screen } from "../components/Screen";
import { buildCategoryDistribution } from "../utils/categoryDistribution";
import { getCurrentPeriodSummaries } from "../utils/currentPeriodSummary";

const periods = [
    { key: "daily", label: "7 hari" },
    { key: "weekly", label: "12 minggu" },
    { key: "monthly", label: "6 bulan" }
];

const categoryColors = [
    "#0D6B50",
    "#3789C8",
    "#F0A44B",
    "#8B6CC1",
    "#D76868",
    "#829087"
];

const formatCurrency = (value) => (
    `Rp ${Number(value || 0).toLocaleString("id-ID", {
        maximumFractionDigits: 0
    })}`
);

const formatBucket = (value, period) => {
    const [year, month, day] = value.split("-").map(Number);
    if (period === "monthly") {
        return new Date(Date.UTC(year, month - 1, 1))
            .toLocaleDateString("id-ID", { month: "short", timeZone: "UTC" });
    }
    return `${String(day).padStart(2, "0")}/${String(month).padStart(2, "0")}`;
};

const buildCurvePath = (points) => {
    if (points.length === 0) return "";
    if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;

    return points.reduce((path, point, index) => {
        if (index === 0) return `M ${point.x} ${point.y}`;

        const previous = points[index - 1];
        const next = points[index + 1] || point;
        const controlOne = {
            x: previous.x + (point.x - previous.x) / 3,
            y: previous.y + (point.y - previous.y) / 3
        };
        const controlTwo = {
            x: point.x - (next.x - previous.x) / 6,
            y: point.y - (next.y - previous.y) / 6
        };

        return `${path} C ${controlOne.x} ${controlOne.y}, ${controlTwo.x} ${controlTwo.y}, ${point.x} ${point.y}`;
    }, "");
};

const SummaryCard = ({ label, amount, tone }) => (
    <View style={styles.summaryCard}>
        <Text style={styles.summaryLabel}>{label}</Text>
        <Text style={[styles.summaryAmount, tone === "green" && styles.income]}>
            {formatCurrency(amount)}
        </Text>
    </View>
);

const CurrentPeriodSummary = ({ title, summary }) => (
    <View style={styles.currentPeriodSummary}>
        <Text style={styles.currentPeriodTitle}>{title}</Text>
        <View style={styles.currentPeriodValues}>
            <View style={styles.currentPeriodValue}>
                <Text style={styles.summaryLabel}>Pemasukan</Text>
                <Text
                    numberOfLines={1}
                    adjustsFontSizeToFit
                    style={[styles.currentPeriodAmount, styles.income]}
                >
                    {formatCurrency(summary.income)}
                </Text>
            </View>
            <View style={styles.currentPeriodValue}>
                <Text style={styles.summaryLabel}>Pengeluaran</Text>
                <Text
                    numberOfLines={1}
                    adjustsFontSizeToFit
                    style={styles.currentPeriodAmount}
                >
                    {formatCurrency(summary.expense)}
                </Text>
            </View>
        </View>
    </View>
);

const TrendChart = ({ trend, period }) => {
    const maxAmount = Math.max(
        1,
        ...trend.flatMap((item) => [Number(item.income), Number(item.expense)])
    );
    const chartWidth = 320;
    const chartHeight = 190;
    const padding = { top: 12, right: 10, bottom: 27, left: 10 };
    const plotWidth = chartWidth - padding.left - padding.right;
    const plotHeight = chartHeight - padding.top - padding.bottom;
    const toPoints = (field) => trend.map((item, index) => ({
        x: trend.length === 1
            ? chartWidth / 2
            : padding.left + index * plotWidth / (trend.length - 1),
        y: padding.top
            + (1 - Number(item[field]) / maxAmount) * plotHeight
    }));
    const incomePoints = toPoints("income");
    const expensePoints = toPoints("expense");

    return (
        <View style={styles.card}>
            <Text style={styles.sectionTitle}>Grafik arus kas</Text>
            {trend.length === 0
                ? <Text style={styles.emptyText}>Belum ada data pada periode ini.</Text>
                : (
                    <Svg
                        accessibilityLabel="Grafik kurva pemasukan dan pengeluaran berdasarkan periode"
                        height={chartHeight}
                        viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                        width="100%"
                    >
                        {[0, 0.5, 1].map((fraction) => {
                            const y = padding.top + fraction * plotHeight;
                            return (
                                <SvgLine
                                    key={fraction}
                                    x1={padding.left}
                                    x2={chartWidth - padding.right}
                                    y1={y}
                                    y2={y}
                                    stroke="#E8EEE9"
                                    strokeWidth="1"
                                />
                            );
                        })}
                        {trend.map((item, index) => (
                            <SvgText
                                key={item.bucket_start}
                                fill="#68776F"
                                fontSize="9"
                                textAnchor="middle"
                                x={incomePoints[index].x}
                                y={chartHeight - 5}
                            >
                                {formatBucket(item.bucket_start, period)}
                            </SvgText>
                        ))}
                        <Path
                            d={buildCurvePath(incomePoints)}
                            fill="none"
                            stroke="#19A875"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="3"
                        />
                        <Path
                            d={buildCurvePath(expensePoints)}
                            fill="none"
                            stroke="#F08B72"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="3"
                        />
                        {incomePoints.map((point, index) => (
                            <Circle
                                key={`income-${trend[index].bucket_start}`}
                                cx={point.x}
                                cy={point.y}
                                fill="#19A875"
                                r="3.5"
                            />
                        ))}
                        {expensePoints.map((point, index) => (
                            <Circle
                                key={`expense-${trend[index].bucket_start}`}
                                cx={point.x}
                                cy={point.y}
                                fill="#F08B72"
                                r="3.5"
                            />
                        ))}
                    </Svg>
                )}
            <View style={styles.legend}>
                <Text style={styles.legendIncome}>● Pemasukan</Text>
                <Text style={styles.legendExpense}>● Pengeluaran</Text>
            </View>
        </View>
    );
};

export const DashboardScreen = () => {
    const { session, updateSessionUser } = useAuth();
    const [period, setPeriod] = useState("monthly");
    const [overview, setOverview] = useState(null);
    const [currentPeriodSummaries, setCurrentPeriodSummaries] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState("");
    const requestSequence = useRef(0);
    const user = session?.user;

    const loadOverview = useCallback(async ({ showLoading = true } = {}) => {
        const sequence = ++requestSequence.current;
        if (showLoading) setLoading(true);
        setError("");

        try {
            const result = await api.analytics(session.token, period);

            if (sequence === requestSequence.current) {
                setOverview(result);
                setCurrentPeriodSummaries(
                    getCurrentPeriodSummaries(result.current_periods)
                );
            }
        } catch (loadError) {
            if (sequence === requestSequence.current) {
                setError(loadError.message || "Dashboard gagal dimuat.");
            }
        } finally {
            if (sequence === requestSequence.current) {
                setLoading(false);
                setRefreshing(false);
            }
        }
    }, [period, session?.token]);

    useFocusEffect(useCallback(() => {
        loadOverview({ showLoading: false });
        return () => {
            requestSequence.current += 1;
        };
    }, [loadOverview]));

    const refresh = async () => {
        setRefreshing(true);
        await loadOverview({ showLoading: false });
    };

    const handleInitialBalanceSubmit = async (amount) => {
        const result = await api.setInitialBalance(session.token, amount);
        updateSessionUser(result.user);
        setOverview((current) => current
            ? { ...current, current_balance: result.user.current_balance }
            : current);
    };

    const categoryDistribution = buildCategoryDistribution(overview?.categories);
    const balance = overview?.current_balance ?? user?.current_balance;

    return (
        <Screen edges={["top", "left", "right"]} style={styles.screen}>
            <ScrollView
                contentContainerStyle={styles.content}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={refresh} />
                }
            >
                <View style={styles.header}>
                    <View style={styles.logo}>
                        <Text style={styles.logoText}>S</Text>
                    </View>
                    <Text style={styles.brand}>SmartBills</Text>
                </View>

                <View>
                    <Text style={styles.greeting}>Halo, {user?.name || "Pengguna"}!</Text>
                    <Text style={styles.subtitle}>Ringkasan keuangan Anda</Text>
                </View>

                {user?.has_initial_balance
                    ? (
                        <View style={styles.balanceCard}>
                            <Text style={styles.balanceLabel}>Saldo saat ini</Text>
                            <Text style={styles.balance}>{formatCurrency(balance)}</Text>
                        </View>
                    )
                    : <InitialBalanceForm onSubmit={handleInitialBalanceSubmit} />}

                <View style={styles.periodSelector}>
                    {periods.map((option) => (
                        <Pressable
                            key={option.key}
                            accessibilityRole="button"
                            accessibilityState={{ selected: period === option.key }}
                            onPress={() => setPeriod(option.key)}
                            style={[
                                styles.periodButton,
                                period === option.key && styles.periodButtonSelected
                            ]}
                        >
                            <Text
                                style={[
                                    styles.periodText,
                                    period === option.key && styles.periodTextSelected
                                ]}
                            >
                                {option.label}
                            </Text>
                        </Pressable>
                    ))}
                </View>

                {loading
                    ? (
                        <View style={styles.loading}>
                            <ActivityIndicator size="large" color="#0D6B50" />
                            <Text style={styles.emptyText}>Memuat ringkasan...</Text>
                        </View>
                    )
                    : error
                        ? (
                            <View style={styles.errorCard}>
                                <Text accessibilityRole="alert" style={styles.errorText}>
                                    {error}
                                </Text>
                                <Pressable
                                    accessibilityRole="button"
                                    onPress={loadOverview}
                                    style={styles.retryButton}
                                >
                                    <Text style={styles.retryText}>Coba lagi</Text>
                                </Pressable>
                            </View>
                        )
                        : overview && (
                            <>
                                <View style={styles.summaryGrid}>
                                    <SummaryCard
                                        label="Pemasukan"
                                        amount={overview.summary.income}
                                        tone="green"
                                    />
                                    <SummaryCard
                                        label="Pengeluaran"
                                        amount={overview.summary.expense}
                                    />
                                </View>
                                <View style={styles.netCard}>
                                    <View>
                                        <Text style={styles.summaryLabel}>Selisih bersih</Text>
                                        <Text style={styles.netAmount}>
                                            {formatCurrency(overview.summary.net)}
                                        </Text>
                                    </View>
                                    <View style={styles.transactionCount}>
                                        <Text style={styles.countNumber}>
                                            {overview.summary.transaction_count}
                                        </Text>
                                        <Text style={styles.countLabel}>transaksi</Text>
                                    </View>
                                </View>

                                {currentPeriodSummaries && (
                                    <View style={styles.card}>
                                        <Text style={styles.sectionTitle}>
                                            Ringkasan periode berjalan
                                        </Text>
                                        <CurrentPeriodSummary
                                            title="Minggu ini"
                                            summary={currentPeriodSummaries.weekly}
                                        />
                                        <View style={styles.currentPeriodDivider} />
                                        <CurrentPeriodSummary
                                            title="Bulan ini"
                                            summary={currentPeriodSummaries.monthly}
                                        />
                                    </View>
                                )}

                                <TrendChart trend={overview.trend} period={period} />

                                <View style={styles.card}>
                                    <View style={styles.distributionHeading}>
                                        <Text style={styles.sectionTitle}>
                                            Distribusi pengeluaran
                                        </Text>
                                        <Text style={styles.distributionTotal}>
                                            Total {formatCurrency(overview.summary.expense)}
                                        </Text>
                                    </View>
                                    {categoryDistribution.categories.length === 0
                                        ? (
                                            <Text style={styles.emptyText}>
                                                Belum ada pengeluaran pada periode ini.
                                            </Text>
                                        )
                                        : categoryDistribution.categories.map((category, index) => (
                                            <View
                                                key={category.category_name}
                                                style={styles.distributionRow}
                                            >
                                                <View style={styles.distributionLabels}>
                                                    <Text
                                                        numberOfLines={1}
                                                        style={styles.categoryName}
                                                    >
                                                        {category.category_name}
                                                    </Text>
                                                    <Text style={styles.categoryShare}>
                                                        {category.percentage.toFixed(1)}%
                                                    </Text>
                                                </View>
                                                <View
                                                    accessibilityRole="progressbar"
                                                    accessibilityLabel={`${category.category_name}: ${category.percentage.toFixed(1)} persen`}
                                                    accessibilityValue={{
                                                        min: 0,
                                                        max: 100,
                                                        now: category.percentage
                                                    }}
                                                    style={styles.distributionTrack}
                                                >
                                                    <View
                                                        style={[
                                                            styles.distributionBar,
                                                            {
                                                                width: `${category.percentage}%`,
                                                                backgroundColor: categoryColors[index]
                                                            }
                                                        ]}
                                                    />
                                                </View>
                                                <View style={styles.distributionDetails}>
                                                    <Text style={styles.categoryCount}>
                                                        {category.transaction_count} transaksi
                                                    </Text>
                                                    <Text style={styles.categoryAmount}>
                                                        {formatCurrency(category.amount)}
                                                    </Text>
                                                </View>
                                            </View>
                                        ))}
                                </View>
                            </>
                        )}

            </ScrollView>
        </Screen>
    );
};

const styles = StyleSheet.create({
    screen: { padding: 0 },
    content: { padding: 20, paddingBottom: 32, gap: 16 },
    header: { flexDirection: "row", alignItems: "center", gap: 10 },
    logo: {
        width: 38,
        height: 38,
        borderRadius: 13,
        backgroundColor: "#DDF2E8",
        alignItems: "center",
        justifyContent: "center"
    },
    logoText: { color: "#0D6B50", fontWeight: "800", fontSize: 20 },
    brand: { color: "#0D6B50", fontSize: 17, fontWeight: "800" },
    greeting: { color: "#14251D", fontWeight: "800", fontSize: 25, marginTop: 16 },
    subtitle: { color: "#68776F", fontSize: 14, marginTop: 4 },
    balanceCard: { backgroundColor: "#0D6B50", padding: 20, borderRadius: 17 },
    balanceLabel: { color: "#DDF2E8", fontSize: 13 },
    balance: { color: "#FFFFFF", fontWeight: "800", fontSize: 27, marginTop: 7 },
    balanceHint: { color: "#DDF2E8", fontSize: 12, marginTop: 6 },
    periodSelector: {
        flexDirection: "row",
        backgroundColor: "#E8EEE9",
        borderRadius: 12,
        padding: 4
    },
    periodButton: {
        flex: 1,
        alignItems: "center",
        paddingVertical: 10,
        borderRadius: 9
    },
    periodButtonSelected: { backgroundColor: "#FFFFFF" },
    periodText: { color: "#68776F", fontSize: 12, fontWeight: "600" },
    periodTextSelected: { color: "#0D6B50" },
    loading: { alignItems: "center", paddingVertical: 35, gap: 10 },
    summaryGrid: { flexDirection: "row", gap: 12 },
    summaryCard: {
        flex: 1,
        backgroundColor: "#FFFFFF",
        borderRadius: 14,
        padding: 15,
        minHeight: 86,
        justifyContent: "center"
    },
    summaryLabel: { color: "#68776F", fontSize: 12 },
    summaryAmount: { color: "#B42318", fontSize: 16, fontWeight: "800", marginTop: 7 },
    income: { color: "#0D6B50" },
    netCard: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: "#FFFFFF",
        borderRadius: 14,
        padding: 16
    },
    netAmount: { color: "#14251D", fontSize: 19, fontWeight: "800", marginTop: 5 },
    transactionCount: { alignItems: "flex-end" },
    countNumber: { color: "#14251D", fontWeight: "800", fontSize: 18 },
    countLabel: { color: "#68776F", fontSize: 11 },
    card: { backgroundColor: "#FFFFFF", borderRadius: 14, padding: 16 },
    sectionTitle: { color: "#14251D", fontWeight: "700", fontSize: 15, marginBottom: 14 },
    currentPeriodSummary: { gap: 8 },
    currentPeriodTitle: { color: "#14251D", fontWeight: "700", fontSize: 13 },
    currentPeriodValues: { flexDirection: "row", gap: 12 },
    currentPeriodValue: { flex: 1 },
    currentPeriodAmount: {
        color: "#B42318",
        fontWeight: "700",
        fontSize: 14,
        marginTop: 4
    },
    currentPeriodDivider: {
        height: 1,
        backgroundColor: "#EEF1EF",
        marginVertical: 13
    },
    legend: { flexDirection: "row", gap: 16, marginTop: 5 },
    legendIncome: { color: "#0D6B50", fontSize: 11 },
    legendExpense: { color: "#B85B45", fontSize: 11 },
    emptyText: { color: "#68776F", fontSize: 13, lineHeight: 19 },
    distributionHeading: { marginBottom: 4 },
    distributionTotal: { color: "#68776F", fontSize: 12, marginTop: -7, marginBottom: 10 },
    distributionRow: {
        paddingVertical: 12,
        borderTopWidth: 1,
        borderTopColor: "#EEF1EF"
    },
    distributionLabels: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 7
    },
    distributionTrack: {
        height: 9,
        backgroundColor: "#EEF2EF",
        borderRadius: 6,
        overflow: "hidden"
    },
    distributionBar: { height: "100%", borderRadius: 6 },
    distributionDetails: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: 6
    },
    categoryName: { color: "#14251D", fontWeight: "600", fontSize: 13 },
    categoryShare: { color: "#68776F", fontWeight: "700", fontSize: 12, marginLeft: 8 },
    categoryCount: { color: "#68776F", fontSize: 11 },
    categoryAmount: { color: "#14251D", fontWeight: "700", fontSize: 13 },
    errorCard: { backgroundColor: "#FEF3F2", padding: 16, borderRadius: 14 },
    errorText: { color: "#B42318", fontSize: 13, lineHeight: 19 },
    retryButton: {
        alignSelf: "flex-start",
        backgroundColor: "#0D6B50",
        borderRadius: 9,
        paddingHorizontal: 14,
        paddingVertical: 9,
        marginTop: 12
    },
    retryText: { color: "#FFFFFF", fontWeight: "700", fontSize: 13 }
});
