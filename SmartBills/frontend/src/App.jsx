import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { api } from "./api.js";
import { EmptyState, PageTransition, Skeleton, StatCard, Toast as ToastNotification } from "./components/ui/index.jsx";
import { Modal } from "./components/ui/index.jsx";
import { useDebouncedValue } from "./hooks/useDebouncedValue.js";

const today = () => {
    const date = new Date();
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
};

const pagePaths = {
    dashboard: "/dashboard",
    summary: "/ringkasan",
    income: "/pemasukan",
    expense: "/pengeluaran",
    scanner: "/parsing-bukti",
    account: "/akun"
};
const pathPages = Object.fromEntries(
    Object.entries(pagePaths).map(([page, path]) => [path, page])
);

const money = (value) => new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0
}).format(Number(value || 0));

const dateLabel = (value) => value
    ? new Intl.DateTimeFormat("id-ID", { dateStyle: "medium" }).format(new Date(value))
    : "-";

const emptyForm = () => ({
    type: "EXPENSE",
    amount: "",
    categoryId: "",
    merchantName: "",
    notes: "",
    transactionDate: today()
});

let itemKeySequence = 0;
const createItem = (item = {}) => ({
    ...item,
    _uiKey: `transaction-item-${Date.now()}-${itemKeySequence++}`
});

const formatAmountInput = (value) => {
    if (!value) return "";
    const [integerPart, decimalPart] = String(value).split(".");
    const grouped = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    return decimalPart === undefined ? grouped : `${grouped},${decimalPart}`;
};

function AuthPage({ onLogin }) {
    const [registering, setRegistering] = useState(false);
    const [form, setForm] = useState({ name: "", email: "", password: "" });
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [busy, setBusy] = useState(false);
    const submit = async (event) => {
        event.preventDefault();
        if (registering && form.password !== confirmPassword) {
            setError("Konfirmasi kata sandi belum sama.");
            return;
        }
        setBusy(true);
        setError("");
        try {
            if (registering) {
                await api.register(form);
            }
            const result = await api.login({
                email: form.email,
                password: form.password
            });
            onLogin(result);
        } catch (requestError) {
            setError(requestError.message);
        } finally {
            setBusy(false);
        }
    };

    return (
        <main className="auth-shell">
            <section className={`auth-layout${registering ? " is-registering" : ""}`}>
                <aside className="auth-visual" aria-hidden="true">
                    <a className="auth-brand" href="/">
                        <span className="auth-brand-mark"><i className="bi bi-graph-up-arrow" /></span>
                        SmartBills
                    </a>
                    {!registering ? (
                        <div className="auth-visual-content">
                            <div>
                                <p className="auth-kicker">KEUANGAN LEBIH TERARAH</p>
                                <h2>Semua keuanganmu, dalam satu pandangan.</h2>
                                <p className="auth-visual-copy">
                                    Pantau arus kas, anggaran, dan transaksi dengan lebih tenang.
                                </p>
                            </div>
                            <div className="auth-chart-card">
                                <div className="auth-chart-heading">
                                    <span>Arus keuangan</span>
                                    <i className="bi bi-three-dots" />
                                </div>
                                <div className="auth-chart-caption">Pemasukan dan pengeluaran</div>
                                <svg className="auth-chart" viewBox="0 0 440 150" preserveAspectRatio="none">
                                    <defs>
                                        <linearGradient id="auth-chart-fill" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#35e2a0" stopOpacity=".3" />
                                            <stop offset="100%" stopColor="#35e2a0" stopOpacity="0" />
                                        </linearGradient>
                                    </defs>
                                    <path className="auth-chart-area" d="M0 118 C42 105 55 113 91 88 S145 100 183 71 235 81 272 52 330 66 365 34 407 44 440 16 V150 H0Z" />
                                    <path className="auth-chart-line" d="M0 118 C42 105 55 113 91 88 S145 100 183 71 235 81 272 52 330 66 365 34 407 44 440 16" />
                                </svg>
                                <div className="auth-chart-labels"><span>JAN</span><span>MAR</span><span>MEI</span><span>JUL</span><span>SEP</span><span>NOV</span></div>
                            </div>
                            <div className="auth-float-card auth-float-summary">
                                <span className="auth-float-icon"><i className="bi bi-wallet2" /></span>
                                <span><small>Catatan keuangan</small><b>Semua tercatat rapi</b></span>
                                <i className="bi bi-check-circle-fill" />
                            </div>
                            <div className="auth-float-card auth-float-growth">
                                <span className="auth-float-icon"><i className="bi bi-pie-chart" /></span>
                                <span><small>Ringkasan</small><b>Kenali pola belanjamu</b></span>
                            </div>
                            <p className="auth-visual-foot"><i className="bi bi-shield-check" /> Data keuanganmu tetap privat</p>
                        </div>
                    ) : (
                        <div className="auth-visual-content auth-register-visual">
                            <div>
                                <p className="auth-kicker">MULAI LANGKAH BARU</p>
                                <h2>Kenali ke mana uangmu pergi, sejak hari pertama.</h2>
                                <p className="auth-visual-copy">
                                    Catat transaksi dan lihat ringkasan keuanganmu dalam satu tempat.
                                </p>
                            </div>
                            <div className="auth-onboarding-card">
                                <div className="auth-onboarding-top">
                                    <span className="auth-float-icon"><i className="bi bi-stars" /></span>
                                    <span><small>SmartBills</small><b>Siap menemani perjalananmu</b></span>
                                </div>
                                <div className="auth-onboarding-step"><span><i className="bi bi-check2" /></span><div><b>Buat akunmu</b><small>Mulai dengan aman</small></div></div>
                                <div className="auth-onboarding-step"><span><i className="bi bi-arrow-left-right" /></span><div><b>Catat transaksi</b><small>Pemasukan dan pengeluaran</small></div></div>
                                <div className="auth-onboarding-step"><span><i className="bi bi-bar-chart-line" /></span><div><b>Pantau ringkasan</b><small>Lihat gambaran keuanganmu</small></div></div>
                            </div>
                            <div className="auth-register-orbit auth-register-orbit-one" />
                            <div className="auth-register-orbit auth-register-orbit-two" />
                            <p className="auth-visual-foot"><i className="bi bi-lightning-charge" /> Rapi, praktis, dan mudah digunakan</p>
                        </div>
                    )}
                </aside>
                <div className="auth-form-panel">
                    <div className="auth-form-inner" key={registering ? "register" : "login"}>
                        <p className="auth-form-eyebrow">{registering ? "GABUNG BERSAMA SMARTBILLS" : "SELAMAT DATANG KEMBALI"}</p>
                        <h1>{registering ? "Buat akun baru" : "Masuk ke akunmu"}</h1>
                        <p className="auth-form-subtitle">
                            {registering
                                ? "Mulai mengelola keuanganmu sekarang."
                                : "Masuk untuk melanjutkan ke ringkasan keuanganmu."}
                        </p>
                        {error && <div className="auth-error" role="alert"><i className="bi bi-exclamation-circle-fill" />{error}</div>}
                        <form onSubmit={submit} className="auth-form">
                            {registering && (
                                <label className="auth-field">
                                    <input
                                        type="text"
                                        placeholder=" "
                                        autoComplete="name"
                                        required
                                        minLength={2}
                                        value={form.name}
                                        onChange={(event) => setForm({ ...form, name: event.target.value })}
                                    />
                                    <span>Nama lengkap</span>
                                    <i className="bi bi-person" />
                                </label>
                            )}
                            <label className="auth-field">
                                <input
                                    type="email"
                                    placeholder=" "
                                    autoComplete="username"
                                    required
                                    value={form.email}
                                    onChange={(event) => setForm({ ...form, email: event.target.value })}
                                />
                                <span>Email</span>
                                <i className="bi bi-envelope" />
                            </label>
                            <label className="auth-field">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder=" "
                                    autoComplete={registering ? "new-password" : "current-password"}
                                    required
                                    minLength={registering ? 8 : undefined}
                                    value={form.password}
                                    onChange={(event) => setForm({ ...form, password: event.target.value })}
                                />
                                <span>Kata sandi</span>
                                <button
                                    className="auth-password-toggle"
                                    type="button"
                                    aria-label={showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    <i className={`bi ${showPassword ? "bi-eye-slash" : "bi-eye"}`} />
                                </button>
                            </label>
                            {registering && (
                                <label className="auth-field">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        placeholder=" "
                                        autoComplete="new-password"
                                        required
                                        minLength={8}
                                        value={confirmPassword}
                                        onChange={(event) => setConfirmPassword(event.target.value)}
                                    />
                                    <span>Konfirmasi kata sandi</span>
                                    <i className="bi bi-lock" />
                                </label>
                            )}
                            <button className="auth-submit" type="submit" disabled={busy}>
                                {busy && <span className="button-spinner" aria-hidden="true" />}
                                {busy ? "Memproses..." : registering ? "Buat akun dan masuk" : "Masuk"}
                                {!busy && <i className="bi bi-arrow-right" />}
                            </button>
                        </form>
                        <p className="auth-switch">
                            {registering ? "Sudah punya akun?" : "Belum punya akun?"}
                            <button
                                type="button"
                                disabled={busy}
                                onClick={() => {
                                    setRegistering(!registering);
                                    setError("");
                                }}
                            >
                                {registering ? "Masuk" : "Daftar gratis"}
                            </button>
                        </p>
                        <p className="auth-security-note"><i className="bi bi-shield-lock" /> Informasi akunmu dijaga dengan aman</p>
                    </div>
                </div>
            </section>
        </main>
    );
}

function CategoryBreakdown({ categories }) {
    const colors = ["#0f6b57", "#e0762f", "#2f6fa8", "#8b6bb1", "#8c9b92"];
    const total = categories.reduce((sum, item) => sum + Number(item.amount || 0), 0);
    const circumference = 2 * Math.PI * 40;
    let offset = 0;

    return (
        <div className="category-breakdown">
            {total > 0 ? (
                <>
                    <div className="category-donut">
                        <svg viewBox="0 0 100 100" role="img" aria-label="Diagram pengeluaran per kategori">
                            <circle className="donut-track" cx="50" cy="50" r="40" />
                            {categories.map((item, index) => {
                                const amount = Number(item.amount || 0);
                                const length = (amount / total) * circumference;
                                const segment = (
                                    <circle
                                        key={`${item.category_name}-${index}`}
                                        className="donut-segment"
                                        cx="50"
                                        cy="50"
                                        r="40"
                                        stroke={colors[index % colors.length]}
                                        strokeDasharray={`${length} ${circumference - length}`}
                                        strokeDashoffset={-offset}
                                    />
                                );
                                offset += length;
                                return segment;
                            })}
                        </svg>
                        <div className="donut-center">
                            <small>Total keluar</small>
                            <strong>{money(total)}</strong>
                        </div>
                    </div>
                    <div className="category-legend">
                        {categories.map((item, index) => (
                            <div className="category-legend-item" key={`${item.category_name}-${index}`}>
                                <span className="category-swatch" style={{ background: colors[index % colors.length] }} />
                                <span className="category-name">{item.category_name}</span>
                                <strong>{Math.round(Number(item.amount || 0) / total * 100)}%</strong>
                            </div>
                        ))}
                    </div>
                </>
            ) : (
                <EmptyState description="Belum ada pengeluaran berkategori bulan ini." />
            )}
        </div>
    );
}

function CashFlowChart({ trend, maximum }) {
    const chart = useMemo(() => {
        const bounds = { left: 74, right: 706, top: 22, bottom: 190 };
        const plotWidth = bounds.right - bounds.left;
        const plotHeight = bounds.bottom - bounds.top;
        const maxValue = Math.max(1, maximum);
        const points = trend.map((row, index) => ({
            x: trend.length === 1
                ? (bounds.left + bounds.right) / 2
                : bounds.left + (plotWidth * index) / (trend.length - 1),
            month: new Intl.DateTimeFormat("id-ID", { month: "short" })
                .format(new Date(`${row.bucket_start}T00:00:00`)),
            income: Number(row.income || 0),
            expense: Number(row.expense || 0)
        }));
        const y = (value) => bounds.bottom - (value / maxValue) * plotHeight;
        const createLine = (key) => points.reduce((path, point, index) => {
            const command = index === 0
                ? `M ${point.x} ${y(point[key])}`
                : (() => {
                    const previous = points[index - 1];
                    const midpoint = (previous.x + point.x) / 2;
                    return `C ${midpoint} ${y(previous[key])}, ${midpoint} ${y(point[key])}, ${point.x} ${y(point[key])}`;
                })();
            return `${path} ${command}`;
        }, "").trim();
        const createArea = (key) => {
            if (points.length < 2) return "";
            const last = points[points.length - 1];
            const first = points[0];
            return `${createLine(key)} L ${last.x} ${bounds.bottom} L ${first.x} ${bounds.bottom} Z`;
        };

        return {
            bounds,
            points,
            y,
            incomeLine: createLine("income"),
            expenseLine: createLine("expense"),
            incomeArea: createArea("income"),
            ticks: [maxValue, maxValue / 2, 0]
        };
    }, [trend, maximum]);
    const compactRupiah = (value) => `Rp${new Intl.NumberFormat("id-ID", {
        notation: "compact",
        maximumFractionDigits: 1
    }).format(value)}`;

    return (
        <div className="trend-chart">
            <svg
                className="cash-flow-svg"
                viewBox="0 0 720 236"
                preserveAspectRatio="none"
                role="img"
                aria-label="Grafik garis pemasukan dan pengeluaran per bulan"
            >
                <defs>
                    <linearGradient id="cash-flow-area" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#2ee6a6" stopOpacity=".2" />
                        <stop offset="100%" stopColor="#2ee6a6" stopOpacity="0" />
                    </linearGradient>
                </defs>
                {chart.ticks.map((tick) => {
                    const tickY = chart.y(tick);
                    return (
                        <g key={tick}>
                            <line
                                className="cash-flow-gridline"
                                x1={chart.bounds.left}
                                x2={chart.bounds.right}
                                y1={tickY}
                                y2={tickY}
                            />
                            <text className="cash-flow-axis-label" x="0" y={tickY + 4}>
                                {compactRupiah(tick)}
                            </text>
                        </g>
                    );
                })}
                {chart.incomeArea && <path className="cash-flow-area" d={chart.incomeArea} />}
                <path className="cash-flow-line income-line" d={chart.incomeLine} pathLength="1" />
                <path className="cash-flow-line expense-line" d={chart.expenseLine} pathLength="1" />
                {chart.points.map((point) => (
                    <g key={point.month + point.x}>
                        <circle className="cash-flow-point income-point" cx={point.x} cy={chart.y(point.income)} r="4">
                            <title>{`Pemasukan ${point.month}: ${money(point.income)}`}</title>
                        </circle>
                        <circle className="cash-flow-point expense-point" cx={point.x} cy={chart.y(point.expense)} r="4">
                            <title>{`Pengeluaran ${point.month}: ${money(point.expense)}`}</title>
                        </circle>
                        <text className="cash-flow-month-label" x={point.x} y="224" textAnchor="middle">
                            {point.month}
                        </text>
                    </g>
                ))}
            </svg>
        </div>
    );
}

function NewsSection({ title, description, icon, articles, loading, failed, emptyMessage }) {
    return (
        <section className="news-section">
            <div className="news-section-heading">
                <span className="news-section-icon"><i className={`bi ${icon}`} /></span>
                <div><h3>{title}</h3><p>{description}</p></div>
            </div>
            {loading ? (
                <div className="news-skeleton-list" aria-label="Memuat berita">
                    {[0, 1].map((item) => <Skeleton className="news-skeleton" key={item} />)}
                </div>
            ) : failed ? (
                <div className="news-empty"><i className="bi bi-wifi-off" />Berita kategori ini sedang tidak tersedia.</div>
            ) : articles.length ? (
                <div className="news-list">
                    {articles.map((article) => (
                        <a
                            className="news-card"
                            href={article.url}
                            key={article.url}
                            target="_blank"
                            rel="noreferrer"
                        >
                            {article.imageUrl ? (
                                <img className="news-image" src={article.imageUrl} alt="" loading="lazy" />
                            ) : (
                                <div className="news-image news-image-fallback" aria-hidden="true">
                                    <i className={`bi ${icon}`} />
                                    <span>SMARTBILLS BRIEF</span>
                                </div>
                            )}
                            <div className="news-card-body">
                                <span className="news-source">{article.source}</span>
                                <h4>{article.title}</h4>
                                {article.description && <p>{article.description}</p>}
                                <span className="news-date">
                                    {dateLabel(article.publishedAt)}
                                    <i className="bi bi-arrow-up-right" />
                                </span>
                            </div>
                        </a>
                    ))}
                </div>
            ) : (
                <div className="news-empty"><i className="bi bi-newspaper" />{emptyMessage}</div>
            )}
        </section>
    );
}

function TransactionTable({
    transactions,
    onDelete,
    onEdit,
    onReceipt,
    loading = false
}) {
    if (loading) {
        return (
            <div className="transaction-skeleton-list" role="status" aria-label="Memuat transaksi">
                {[0, 1, 2].map((row) => (
                    <div className="transaction-skeleton-row" key={row}>
                        <Skeleton /><Skeleton /><Skeleton />
                    </div>
                ))}
            </div>
        );
    }
    if (!transactions.length) {
        return <EmptyState description="Belum ada transaksi. Tambahkan transaksi pertama Anda." />;
    }
    return (
        <div className="table-responsive">
            <table className="table align-middle">
                <thead>
                    <tr>
                        <th>Transaksi</th>
                        <th>Tanggal</th>
                        <th>Kategori</th>
                        <th className="text-end">Nominal</th>
                        <th />
                    </tr>
                </thead>
                <tbody>
                    {transactions.map((item) => (
                        <tr key={item.transaction_id}>
                            <td data-label="Transaksi">
                                <div className="fw-semibold">{item.merchant_name || item.notes || "Transaksi"}</div>
                                <small className="text-secondary">{item.type === "INCOME" ? "Pemasukan" : "Pengeluaran"}</small>
                            </td>
                            <td data-label="Tanggal">{dateLabel(item.transaction_date)}</td>
                            <td data-label="Kategori">{item.category_name || "Tanpa kategori"}</td>
                            <td data-label="Nominal" className={`text-end fw-semibold ${item.type === "INCOME" ? "text-success" : ""}`}>
                                {item.type === "INCOME" ? "+" : "-"}{money(item.amount)}
                            </td>
                            <td data-label="Aksi" className="text-end text-nowrap transaction-actions">
                                {onEdit && (
                                    <button
                                        type="button"
                                        className="btn btn-sm btn-light me-1"
                                        aria-label={`Edit transaksi ${item.merchant_name || "transaksi"}`}
                                        title="Edit transaksi"
                                        onClick={() => onEdit(item.transaction_id)}
                                    >
                                        <i className="bi bi-pencil-square" />
                                    </button>
                                )}
                                {item.receipt_url && (
                                    <button type="button" className="btn btn-sm btn-light me-1" aria-label={`Buka bukti ${item.merchant_name || "transaksi"}`} title="Buka bukti" onClick={() => onReceipt(item.transaction_id)}>
                                        <i className="bi bi-image" />
                                    </button>
                                )}
                                <button type="button" className="btn btn-sm btn-light text-danger" aria-label={`Hapus transaksi ${item.merchant_name || "transaksi"}`} title="Hapus transaksi" onClick={() => onDelete(item.transaction_id)}>
                                    <i className="bi bi-trash3" />
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

function SummaryLoading() {
    return (
        <div className="summary-loading" role="status" aria-label="Memuat ringkasan keuangan">
            <div className="stats-grid">
                {["Saldo saat ini", "Pemasukan · 6 bulan", "Pengeluaran · 6 bulan", "Transaksi · 6 bulan"].map((label) => (
                    <StatCard key={label} icon="graph-up" label={label} loading />
                ))}
            </div>
            <div className="summary-loading-panels">
                {[0, 1].map((item) => (
                    <div className="content-card summary-loading-card" key={item}>
                        <Skeleton className="summary-loading-heading" />
                        <Skeleton className="summary-loading-chart" />
                    </div>
                ))}
            </div>
        </div>
    );
}

function TransactionForm({
    categories,
    form,
    setForm,
    items,
    setItems,
    receiptFile,
    setReceiptFile,
    onSubmit,
    busy,
    isEditing
}) {
    const [amountFocused, setAmountFocused] = useState(false);
    const [receiptError, setReceiptError] = useState("");
    const [receiptPreview, setReceiptPreview] = useState("");
    const fileInputRef = useRef(null);
    const eligibleCategories = categories.filter((category) => category.type === form.type);
    const updateItem = (itemKey, key, value) => setItems((currentItems) => currentItems.map((item) =>
        item._uiKey === itemKey ? { ...item, [key]: value } : item
    ));

    useEffect(() => {
        if (!receiptFile) {
            setReceiptPreview("");
            return undefined;
        }
        const previewUrl = URL.createObjectURL(receiptFile);
        setReceiptPreview(previewUrl);
        return () => URL.revokeObjectURL(previewUrl);
    }, [receiptFile]);

    const selectReceipt = (file) => {
        setReceiptError("");
        if (!file) {
            setReceiptFile(null);
            return;
        }
        const acceptedTypes = ["image/jpeg", "image/png", "image/webp"];
        if (!acceptedTypes.includes(file.type)) {
            setReceiptFile(null);
            setReceiptError("Format bukti harus JPEG, PNG, atau WebP.");
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            setReceiptFile(null);
            setReceiptError("Ukuran bukti maksimal 5 MB.");
            return;
        }
        setReceiptFile(file);
    };

    return (
        <form onSubmit={onSubmit} className="form-grid">
            <div className="form-label">
                Jenis transaksi
                <div className="form-control transaction-type-fixed" aria-label={`Jenis transaksi: ${form.type === "INCOME" ? "Pemasukan" : "Pengeluaran"}`}>
                    <i className={`bi ${form.type === "INCOME" ? "bi-graph-up-arrow" : "bi-graph-down-arrow"}`} />
                    {form.type === "INCOME" ? "Pemasukan" : "Pengeluaran"}
                </div>
            </div>
            <label className="form-label">
                Nominal (Rp)
                <input
                    className="form-control"
                    required
                    type="text"
                    inputMode="decimal"
                    aria-describedby="transaction-amount-hint"
                    value={amountFocused ? form.amount : formatAmountInput(form.amount)}
                    onFocus={() => setAmountFocused(true)}
                    onBlur={() => setAmountFocused(false)}
                    onChange={(event) => setForm({ ...form, amount: event.target.value.replace(/[^\d.]/g, "").replace(/^(\d*\.?\d{0,2}).*$/, "$1") })}
                />
                <small id="transaction-amount-hint" className="form-hint">Gunakan angka; pemisah ribuan ditampilkan otomatis.</small>
            </label>
            <label className="form-label">
                Kategori
                <select className="form-select" value={form.categoryId} onChange={(event) => setForm({ ...form, categoryId: event.target.value })}>
                    <option value="">Pilih kategori</option>
                    {eligibleCategories.map((category) => <option key={category.category_id} value={category.category_id}>{category.name}</option>)}
                </select>
            </label>
            <label className="form-label">
                Merchant / sumber
                <input className="form-control" maxLength="100" value={form.merchantName} onChange={(event) => setForm({ ...form, merchantName: event.target.value })} />
            </label>
            <label className="form-label">
                Tanggal
                <input className="form-control" type="date" required value={form.transactionDate} onChange={(event) => setForm({ ...form, transactionDate: event.target.value })} />
            </label>
            <label className="form-label">
                Catatan
                <input className="form-control" value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} />
            </label>
            {isEditing ? (
                <p className="form-wide small text-secondary mb-0">
                    Bukti transaksi yang sudah tersimpan tidak berubah saat mengedit.
                </p>
            ) : (
            <div className="form-wide">
                <span className="form-label">Bukti transaksi (JPEG, PNG, WebP; maks. 5 MB)</span>
                <span
                    className={`receipt-dropzone${receiptFile ? " has-file" : ""}`}
                    onDragOver={(event) => event.preventDefault()}
                    onDrop={(event) => {
                        event.preventDefault();
                        selectReceipt(event.dataTransfer.files[0]);
                    }}
                >
                    <input
                        ref={fileInputRef}
                        className="visually-hidden"
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        aria-label="Pilih bukti transaksi"
                        onChange={(event) => {
                            selectReceipt(event.target.files[0]);
                            event.currentTarget.value = "";
                        }}
                    />
                    {receiptPreview ? (
                        <img src={receiptPreview} alt="Pratinjau bukti transaksi" className="receipt-preview" />
                    ) : (
                        <i className="bi bi-cloud-arrow-up" aria-hidden="true" />
                    )}
                    <span>{receiptFile ? receiptFile.name : "Seret bukti ke sini atau pilih file"}</span>
                    <small>JPEG, PNG, WebP · Maks. 5 MB</small>
                    <span className="receipt-dropzone-actions">
                        <button type="button" className="btn btn-sm btn-outline-primary" onClick={() => fileInputRef.current?.click()}>
                            {receiptFile ? "Ganti file" : "Pilih file"}
                        </button>
                        {receiptFile && (
                            <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => {
                                selectReceipt(null);
                                if (fileInputRef.current) fileInputRef.current.value = "";
                            }}>
                                Hapus
                            </button>
                        )}
                    </span>
                </span>
                {receiptError && <span className="form-error" role="alert">{receiptError}</span>}
            </div>
            )}
            <div className="form-wide">
                <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="form-label mb-0">Rincian item (opsional)</span>
                    <button type="button" className="btn btn-sm btn-outline-primary" onClick={() => setItems((currentItems) => [...currentItems, createItem({ itemName: "", quantity: 1, unitPrice: "", totalPrice: "" })])}>
                        <i className="bi bi-plus-lg me-1" />Tambah item
                    </button>
                </div>
                {items.map((item) => (
                    <div className="item-row" key={item._uiKey}>
                        <input className="form-control" aria-label="Nama item" placeholder="Nama item" value={item.itemName} onChange={(event) => updateItem(item._uiKey, "itemName", event.target.value)} />
                        <input className="form-control" aria-label="Kuantitas" type="number" min="1" placeholder="Qty" value={item.quantity} onChange={(event) => updateItem(item._uiKey, "quantity", event.target.value)} />
                        <input className="form-control" aria-label="Harga satuan" type="number" min="0" step="0.01" placeholder="Harga satuan" value={item.unitPrice} onChange={(event) => updateItem(item._uiKey, "unitPrice", event.target.value)} />
                        <input className="form-control" aria-label="Total item" type="number" min="0" step="0.01" placeholder="Total item" value={item.totalPrice} onChange={(event) => updateItem(item._uiKey, "totalPrice", event.target.value)} />
                        <button type="button" className="btn btn-light text-danger" aria-label="Hapus item" onClick={() => setItems((currentItems) => currentItems.filter((entry) => entry._uiKey !== item._uiKey))}><i className="bi bi-x-lg" /></button>
                    </div>
                ))}
            </div>
            <div className="form-wide">
                <button className="btn btn-primary" disabled={busy}>
                    {busy && <span className="button-spinner" aria-hidden="true" />}
                    {busy
                        ? (isEditing ? "Memperbarui transaksi..." : receiptFile ? "Mengunggah bukti dan menyimpan..." : "Menyimpan...")
                        : isEditing ? "Simpan perubahan" : "Tinjau dan simpan transaksi"}
                </button>
                {!isEditing && busy && receiptFile && (
                    <div className="receipt-upload-status" role="status">
                        <span className="receipt-upload-track"><span /></span>
                        <span>Mengunggah bukti transaksi...</span>
                    </div>
                )}
            </div>
        </form>
    );
}

export default function App() {
    const navigate = useNavigate();
    const location = useLocation();
    const [token, setToken] = useState(() => sessionStorage.getItem("smartbills_token"));
    const [user, setUser] = useState(null);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const mobileMenuButtonRef = useRef(null);
    const sidebarRef = useRef(null);
    const cameraVideoRef = useRef(null);
    const cameraStreamRef = useRef(null);
    const scanFileInputRef = useRef(null);
    const transactionSubmitLockRef = useRef(false);
    const deleteTimersRef = useRef(new Map());
    const [selectedDeleteId, setSelectedDeleteId] = useState(null);
    const [pendingDeleteIds, setPendingDeleteIds] = useState(() => new Set());
    const [receiptFile, setReceiptFile] = useState(null);
    const [transactionSearch, setTransactionSearch] = useState("");
    const [transactionCategoryFilter, setTransactionCategoryFilter] = useState("");
    const [transactionMonth, setTransactionMonth] = useState("");
    const [transactionSort, setTransactionSort] = useState("date-desc");
    const debouncedTransactionSearch = useDebouncedValue(transactionSearch);
    const [transactions, setTransactions] = useState([]);
    const [categories, setCategories] = useState([]);
    const [analytics, setAnalytics] = useState(null);
    const [dashboardNews, setDashboardNews] = useState(null);
    const [newsStatus, setNewsStatus] = useState("loading");
    const [form, setForm] = useState(emptyForm);
    const [items, setItems] = useState([]);
    const [editingTransactionId, setEditingTransactionId] = useState(null);
    const [ocrFile, setOcrFile] = useState(null);
    const [ocrFileError, setOcrFileError] = useState("");
    const [scanStatus, setScanStatus] = useState("");
    const [cameraStatus, setCameraStatus] = useState("idle");
    const [cameraError, setCameraError] = useState("");
    const [cameraRetry, setCameraRetry] = useState(0);
    const [draft, setDraft] = useState(null);
    const [initialBalance, setInitialBalance] = useState("");
    const [error, setError] = useState("");
    const [notice, setNotice] = useState("");
    const [busy, setBusy] = useState(false);
    const [dataStatus, setDataStatus] = useState(() => token ? "loading" : "idle");
    const currentPath = location.pathname.replace(/\/+$/, "") || "/";
    const page = pathPages[currentPath];
    const setPage = (nextPage) => {
        const nextPath = pagePaths[nextPage];
        if (nextPage === "income" || nextPage === "expense") {
            const type = nextPage === "income" ? "INCOME" : "EXPENSE";
            setForm((current) => current.type === type
                ? current
                : { ...current, type, categoryId: "" });
            setTransactionCategoryFilter("");
        }
        if (nextPath && nextPath !== currentPath) navigate(nextPath);
    };
    const closeDeleteModal = useCallback(() => setSelectedDeleteId(null), []);

    useEffect(() => () => {
        deleteTimersRef.current.forEach((timer) => window.clearTimeout(timer));
        deleteTimersRef.current.clear();
    }, []);

    useEffect(() => {
        if (!mobileMenuOpen) return undefined;

        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        sidebarRef.current?.querySelector(".app-nav button")?.focus();

        const handleKeyDown = (event) => {
            if (event.key === "Escape") {
                setMobileMenuOpen(false);
                mobileMenuButtonRef.current?.focus();
                return;
            }
            if (event.key !== "Tab" || !sidebarRef.current) return;
            const focusable = sidebarRef.current.querySelectorAll("a[href], button:not(:disabled)");
            if (!focusable.length) return;
            const first = focusable[0];
            const last = focusable[focusable.length - 1];
            if (event.shiftKey && document.activeElement === first) {
                event.preventDefault();
                last.focus();
            } else if (!event.shiftKey && document.activeElement === last) {
                event.preventDefault();
                first.focus();
            }
        };
        document.addEventListener("keydown", handleKeyDown);

        return () => {
            document.body.style.overflow = previousOverflow;
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [mobileMenuOpen]);

    useEffect(() => {
        if (page !== "scanner" || !token) {
            setCameraStatus("idle");
            return undefined;
        }

        let active = true;
        setCameraStatus("loading");
        setCameraError("");
        if (!navigator.mediaDevices?.getUserMedia) {
            setCameraStatus("error");
            setCameraError("Kamera tidak tersedia di browser ini. Silakan unggah foto struk.");
            return undefined;
        }

        navigator.mediaDevices.getUserMedia({
            audio: false,
            video: { facingMode: { ideal: "environment" } }
        }).then((stream) => {
            if (!active) {
                stream.getTracks().forEach((track) => track.stop());
                return;
            }
            cameraStreamRef.current = stream;
            if (cameraVideoRef.current) cameraVideoRef.current.srcObject = stream;
            setCameraStatus("ready");
        }).catch((cameraErrorValue) => {
            if (!active) return;
            cameraStreamRef.current?.getTracks().forEach((track) => track.stop());
            cameraStreamRef.current = null;
            setCameraStatus("error");
            setCameraError(cameraErrorValue.name === "NotAllowedError"
                ? "Izin kamera ditolak. Izinkan akses kamera atau unggah foto struk."
                : "Kamera tidak dapat dibuka. Silakan unggah foto struk.");
        });

        return () => {
            active = false;
            cameraStreamRef.current?.getTracks().forEach((track) => track.stop());
            cameraStreamRef.current = null;
        };
    }, [page, token, cameraRetry]);

    const refresh = useCallback(async (activeToken) => {
        setDataStatus("loading");
        try {
            const [profile, categoryResult, transactionResult, overview] = await Promise.all([
                api.profile(activeToken),
                api.categories(activeToken),
                api.transactions(activeToken),
                api.analytics(activeToken)
            ]);
            setUser(profile.user);
            setCategories(categoryResult.categories);
            setTransactions(transactionResult);
            setAnalytics(overview);
            setDataStatus("ready");
        } catch (loadError) {
            setDataStatus("error");
            throw loadError;
        }
    }, []);

    useEffect(() => {
        if (!token) return;
        let active = true;
        refresh(token).catch((loadError) => {
            if (!active) return;
            if (loadError.status === 401) {
                sessionStorage.removeItem("smartbills_token");
                setToken(null);
                setUser(null);
            } else {
                setError(loadError.message);
            }
        });
        return () => { active = false; };
    }, [token, refresh]);

    useEffect(() => {
        if (page === "income" || page === "expense") {
            const type = page === "income" ? "INCOME" : "EXPENSE";
            setForm((current) => current.type === type
                ? current
                : { ...current, type, categoryId: "" });
            setTransactionCategoryFilter("");
        }
    }, [page]);

    useEffect(() => {
        if (!token) return;
        let active = true;
        setNewsStatus("loading");
        api.news(token).then((result) => {
            if (!active) return;
            setDashboardNews(result);
            setNewsStatus("ready");
        }).catch(() => {
            if (!active) return;
            setDashboardNews(null);
            setNewsStatus("error");
        });
        return () => { active = false; };
    }, [token]);

    const handleLogin = (result) => {
        sessionStorage.setItem("smartbills_token", result.token);
        setUser(result.user);
        setToken(result.token);
        setError("");
        navigate(pagePaths.dashboard, { replace: true });
    };

    const logout = () => {
        deleteTimersRef.current.forEach((timer) => window.clearTimeout(timer));
        deleteTimersRef.current.clear();
        setPendingDeleteIds(new Set());
        sessionStorage.removeItem("smartbills_token");
        setToken(null);
        setUser(null);
        setTransactions([]);
        setAnalytics(null);
        navigate("/login", { replace: true });
    };

    const saveTransaction = async (event) => {
        event.preventDefault();
        if (transactionSubmitLockRef.current) return;
        const validItems = items
            .filter((item) => item.itemName.trim())
            .map((item) => ({
                itemName: item.itemName.trim(),
                quantity: Number(item.quantity || 1),
                unitPrice: item.unitPrice || "",
                totalPrice: item.totalPrice || ""
            }));
        if (validItems.some((item) => !item.unitPrice && !item.totalPrice)) {
            setError("Isi harga satuan atau total untuk setiap item.");
            return;
        }
        transactionSubmitLockRef.current = true;
        setBusy(true);
        setError("");
        setNotice("");
        try {
            if (editingTransactionId) {
                const updateTransaction = form.type === "INCOME"
                    ? api.updateIncomeTransaction
                    : api.updateExpenseTransaction;
                await updateTransaction(token, editingTransactionId, {
                    ...form,
                    amount: form.amount,
                    categoryId: form.categoryId || null,
                    items: validItems
                });
            } else {
                const body = new FormData();
                Object.entries(form).forEach(([key, value]) => {
                    if (value !== "") body.append(key, value);
                });
                if (validItems.length) body.append("items", JSON.stringify(validItems));
                if (receiptFile) body.append("receipt", receiptFile);
                const createTransaction = form.type === "INCOME"
                    ? api.createIncomeTransaction
                    : api.createExpenseTransaction;
                await createTransaction(token, body);
            }
            setForm(emptyForm());
            setItems([]);
            setReceiptFile(null);
            setDraft(null);
            setOcrFile(null);
            setEditingTransactionId(null);
            setPage(form.type === "INCOME" ? "income" : "expense");
            try {
                await refresh(token);
                setNotice(editingTransactionId
                    ? "Perubahan transaksi tersimpan dan saldo diperbarui."
                    : "Transaksi tersimpan dan saldo diperbarui.");
            } catch (refreshError) {
                setError(`Transaksi tersimpan, tetapi ringkasan gagal diperbarui: ${refreshError.message}`);
            }
        } catch (saveError) {
            setError(saveError.message);
        } finally {
            transactionSubmitLockRef.current = false;
            setBusy(false);
        }
    };

    const editTransaction = async (transactionId) => {
        setBusy(true);
        setError("");
        setNotice("");
        try {
            const transaction = await api.transaction(token, transactionId);
            setEditingTransactionId(transaction.transaction_id);
            setForm({
                type: transaction.type,
                amount: String(transaction.amount),
                categoryId: transaction.category_id
                    ? String(transaction.category_id)
                    : "",
                merchantName: transaction.merchant_name || "",
                notes: transaction.notes || "",
                transactionDate: String(transaction.transaction_date).slice(0, 10)
            });
            setItems((transaction.items || []).map((item) => createItem({
                itemName: item.item_name,
                quantity: item.quantity,
                unitPrice: item.unit_price ?? "",
                totalPrice: item.total_price ?? ""
            })));
            setReceiptFile(null);
            setDraft(null);
            setPage(transaction.type === "INCOME" ? "income" : "expense");
        } catch (editError) {
            setError(editError.message);
        } finally {
            setBusy(false);
        }
    };

    const cancelTransactionEdit = () => {
        setEditingTransactionId(null);
        setForm(emptyForm());
        setItems([]);
        setReceiptFile(null);
        setDraft(null);
    };

    const applyDraftValues = (parsedDraft, attachedReceipt) => {
        const value = parsedDraft.transaction;
        setDraft(parsedDraft);
        setForm({
            type: value.type || "EXPENSE",
            amount: value.amount || "",
            categoryId: value.categoryId ? String(value.categoryId) : "",
            merchantName: value.merchantName || "",
            notes: "Draft dari parsing AI; mohon verifikasi sebelum menyimpan.",
            transactionDate: value.transactionDate || today()
        });
        setItems(value.items.map((item) => ({
            _uiKey: `transaction-item-${Date.now()}-${itemKeySequence++}`,
            itemName: item.itemName,
            quantity: item.quantity,
            unitPrice: item.unitPrice || "",
            totalPrice: item.totalPrice || ""
        })));
        setReceiptFile(attachedReceipt || null);
        setNotice(parsedDraft.status === "ready_for_review"
            ? "Struk berhasil dibaca. Periksa transaksi dan bukti sebelum menyimpan."
            : "Struk berhasil diproses. Lengkapi data yang perlu diperiksa sebelum menyimpan.");
        setPage(value.type === "INCOME" ? "income" : "expense");
    };

    const processReceipt = async (file) => {
        if (!file) return;
        setOcrFile(file);
        setBusy(true);
        setError("");
        setNotice("");
        setDraft(null);
        setScanStatus("Membaca struk dengan OCR...");
        try {
            const ocrResult = await api.recognizeReceipt(token, file);
            if (!ocrResult.text?.trim()) {
                throw new Error("Teks pada struk tidak terbaca. Coba foto yang lebih jelas.");
            }
            setScanStatus("Menyusun data transaksi...");
            const parsedDraft = await api.parseTransaction(token, ocrResult.text);
            applyDraftValues(parsedDraft, file);
        } catch (scanError) {
            setError(scanError.message);
        } finally {
            setScanStatus("");
            setBusy(false);
        }
    };

    const selectOcrFile = (file) => {
        setOcrFileError("");
        if (!file) {
            setOcrFile(null);
            return true;
        }
        if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
            setOcrFile(null);
            setOcrFileError("Format gambar harus JPEG, PNG, atau WebP.");
            return false;
        }
        if (file.size > 4 * 1024 * 1024) {
            setOcrFile(null);
            setOcrFileError("Ukuran gambar maksimal 4 MB.");
            return false;
        }
        setOcrFile(file);
        processReceipt(file);
        return true;
    };

    const captureReceipt = async () => {
        try {
            const video = cameraVideoRef.current;
            if (!video?.videoWidth || !video.videoHeight) {
                throw new Error("Kamera belum siap. Tunggu sebentar lalu coba lagi.");
            }
            const maxDimension = 1600;
            const scale = Math.min(1, maxDimension / Math.max(video.videoWidth, video.videoHeight));
            const canvas = document.createElement("canvas");
            canvas.width = Math.round(video.videoWidth * scale);
            canvas.height = Math.round(video.videoHeight * scale);
            const context = canvas.getContext("2d");
            if (!context) throw new Error("Foto tidak dapat dibuat di browser ini.");
            context.drawImage(video, 0, 0, canvas.width, canvas.height);
            const imageBlob = await new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.85));
            if (!imageBlob) {
                throw new Error("Foto tidak berhasil dibuat. Silakan coba lagi atau unggah gambar.");
            }
            const capturedFile = new File([imageBlob], `smartbills-struk-${Date.now()}.jpg`, {
                type: "image/jpeg",
                lastModified: Date.now()
            });
            selectOcrFile(capturedFile);
        } catch (captureError) {
            setError(captureError.message);
        }
    };

    const queueTransactionDelete = (id) => {
        if (id === null || id === undefined) return;
        setSelectedDeleteId(null);
        setPendingDeleteIds((current) => new Set(current).add(id));
        setNotice("Transaksi akan dihapus dalam 5 detik.");
        const timer = window.setTimeout(async () => {
            deleteTimersRef.current.delete(id);
            setPendingDeleteIds((current) => {
                const next = new Set(current);
                next.delete(id);
                return next;
            });
            setNotice("");
            try {
                await api.deleteTransaction(token, id);
                setTransactions((current) => current.filter((item) => item.transaction_id !== id));
                setNotice("Transaksi dihapus.");
                try {
                    await refresh(token);
                } catch (refreshError) {
                    setError(`Transaksi dihapus, tetapi data terbaru gagal dimuat: ${refreshError.message}`);
                }
            } catch (deleteError) {
                setNotice("");
                setError(deleteError.message);
            }
        }, 5000);
        deleteTimersRef.current.set(id, timer);
    };

    const undoPendingTransactionDeletes = useCallback(() => {
        deleteTimersRef.current.forEach((timer) => window.clearTimeout(timer));
        deleteTimersRef.current.clear();
        setPendingDeleteIds(new Set());
        setNotice("Penghapusan transaksi dibatalkan.");
    }, []);

    const openReceipt = async (id) => {
        const receiptWindow = window.open("about:blank", "_blank");
        if (!receiptWindow) {
            setError("Izinkan pop-up untuk membuka bukti transaksi.");
            return;
        }
        try {
            const blob = await api.receipt(token, id);
            const url = URL.createObjectURL(blob);
            receiptWindow.location.href = url;
            window.setTimeout(() => URL.revokeObjectURL(url), 60000);
        } catch (receiptError) {
            receiptWindow.close();
            setError(receiptError.message);
        }
    };

    const setBalance = async (event) => {
        event.preventDefault();
        setBusy(true);
        setError("");
        try {
            await api.setInitialBalance(token, initialBalance);
            setInitialBalance("");
            try {
                await refresh(token);
                setNotice("Saldo awal berhasil diatur.");
            } catch (refreshError) {
                setError(`Saldo awal tersimpan, tetapi informasi akun gagal diperbarui: ${refreshError.message}`);
            }
        } catch (balanceError) {
            setError(balanceError.message);
        } finally {
            setBusy(false);
        }
    };

    const chartMaximum = useMemo(() => Math.max(
        1,
        ...(analytics?.trend || []).map((row) => Number(row.income || 0)),
        ...(analytics?.trend || []).map((row) => Number(row.expense || 0))
    ), [analytics]);
    const visibleTransactions = useMemo(
        () => transactions.filter((item) => !pendingDeleteIds.has(item.transaction_id)),
        [transactions, pendingDeleteIds]
    );
    const filteredTransactions = useMemo(() => {
        const search = debouncedTransactionSearch.trim().toLocaleLowerCase("id-ID");
        return visibleTransactions
            .filter((item) => {
                if (search) {
                    const searchable = [
                        item.merchant_name,
                        item.notes,
                        item.category_name,
                        item.type === "INCOME" ? "pemasukan" : "pengeluaran"
                    ].filter(Boolean).join(" ").toLocaleLowerCase("id-ID");
                    if (!searchable.includes(search)) return false;
                }
                if (transactionCategoryFilter === "uncategorized" && item.category_id) return false;
                if (
                    transactionCategoryFilter
                    && transactionCategoryFilter !== "uncategorized"
                    && String(item.category_id || "") !== transactionCategoryFilter
                ) return false;
                const transactionMonthValue = String(item.transaction_date || "").slice(0, 7);
                if (transactionMonth && transactionMonthValue !== transactionMonth) return false;
                return true;
            })
            .sort((first, second) => {
                if (transactionSort === "amount-desc") return Number(second.amount) - Number(first.amount);
                if (transactionSort === "amount-asc") return Number(first.amount) - Number(second.amount);
                const dateOrder = new Date(first.transaction_date) - new Date(second.transaction_date);
                return transactionSort === "date-asc"
                    ? dateOrder || Number(first.transaction_id) - Number(second.transaction_id)
                    : -dateOrder || Number(second.transaction_id) - Number(first.transaction_id);
            });
    }, [
        visibleTransactions,
        debouncedTransactionSearch,
        transactionCategoryFilter,
        transactionMonth,
        transactionSort
    ]);
    const transactionType = page === "income" ? "INCOME" : "EXPENSE";
    const pageTransactions = filteredTransactions.filter(
        (item) => item.type === transactionType
    );
    const pageCategories = categories.filter(
        (category) => category.type === transactionType
    );

    if (!token) {
        return currentPath === "/login"
            ? <AuthPage onLogin={handleLogin} />
            : <Navigate to="/login" replace />;
    }
    if (currentPath === "/" || currentPath === "/login") {
        return <Navigate to={pagePaths.dashboard} replace />;
    }
    if (currentPath === "/transaksi") {
        return <Navigate to={pagePaths.expense} replace />;
    }
    if (!page) return <Navigate to={pagePaths.dashboard} replace />;

    return (
        <div className="app-shell">
            <button
                type="button"
                className={`mobile-nav-backdrop${mobileMenuOpen ? " is-visible" : ""}`}
                aria-label="Tutup menu navigasi"
                tabIndex={mobileMenuOpen ? 0 : -1}
                onClick={() => {
                    setMobileMenuOpen(false);
                    mobileMenuButtonRef.current?.focus();
                }}
            />
            <aside
                className={`sidebar${mobileMenuOpen ? " is-open" : ""}`}
                id="primary-navigation"
                aria-label="Navigasi utama"
                ref={sidebarRef}
            >
                <a className="brand" href="#" onClick={(event) => { event.preventDefault(); setPage("dashboard"); }}>
                    <span className="brand-mark"><i className="bi bi-wallet2" /></span>
                    <span>SmartBills<small>Personal finance</small></span>
                </a>
                <div className="nav-label">MENU</div>
                <nav className="app-nav">
                    {[
                        ["dashboard", "grid-1x2", "Dashboard"],
                        ["summary", "bar-chart-line", "Ringkasan"],
                        ["income", "graph-up-arrow", "Pemasukan"],
                        ["expense", "graph-down-arrow", "Pengeluaran"],
                        ["scanner", "scan", "Parsing bukti"],
                        ["account", "person", "Akun"]
                    ].map(([id, icon, label]) => (
                        <button
                            key={id}
                            className={page === id ? "active" : ""}
                            aria-current={page === id ? "page" : undefined}
                            onClick={() => {
                                setPage(id);
                                setError("");
                                setMobileMenuOpen(false);
                                mobileMenuButtonRef.current?.focus();
                            }}
                        >
                            <i className={`bi bi-${icon}`} />{label}
                        </button>
                    ))}
                </nav>
                <div className="sidebar-bottom">
                    <div className="user-mini"><span className="avatar">{user?.name?.[0]?.toUpperCase() || "S"}</span><span>{user?.name || "SmartBills"}<small>{user?.email}</small></span></div>
                    <button className="logout-button" onClick={logout}><i className="bi bi-box-arrow-right" />Keluar</button>
                </div>
            </aside>

            <main className="main-area">
                <header className="topbar">
                    <div className="topbar-heading">
                        <button
                            ref={mobileMenuButtonRef}
                            type="button"
                            className="mobile-menu-toggle"
                            aria-label={mobileMenuOpen ? "Tutup menu" : "Buka menu"}
                            aria-expanded={mobileMenuOpen}
                            aria-controls="primary-navigation"
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        >
                            <i className={`bi ${mobileMenuOpen ? "bi-x-lg" : "bi-list"}`} />
                        </button>
                        <div><span className="eyebrow">KEUANGAN PRIBADI</span><h1>{({ dashboard: "Dashboard", summary: "Ringkasan", income: "Pemasukan", expense: "Pengeluaran", scanner: "Parsing bukti", account: "Akun saya" })[page]}</h1></div>
                    </div>
                    <div className="topbar-user"><span className="avatar">{user?.name?.[0]?.toUpperCase() || "S"}</span><span>{user?.name}</span></div>
                </header>
                <section className="page-content">
                    {error && <ToastNotification message={error} type="error" onDismiss={() => setError("")} />}
                    {notice && (
                        <ToastNotification
                            message={notice}
                            type="success"
                            actionLabel={pendingDeleteIds.size ? "Urungkan" : undefined}
                            onAction={pendingDeleteIds.size ? undoPendingTransactionDeletes : undefined}
                            duration={pendingDeleteIds.size ? 0 : 5000}
                            onDismiss={pendingDeleteIds.size ? undoPendingTransactionDeletes : () => setNotice("")}
                        />
                    )}

                    <PageTransition key={page}>
                    {page === "dashboard" && (
                        <>
                            <section className="dashboard-hero">
                                <div className="dashboard-hero-copy">
                                    <span className="dashboard-hero-kicker"><i className="bi bi-stars" /> SMARTBILLS PERSONAL FINANCE</span>
                                    <h2>Keuangan lebih rapi. Hidup terasa lebih pasti.</h2>
                                    <p>
                                        Catat transaksi dengan mudah, pahami ke mana uang Anda pergi, dan
                                        ubah struk menjadi draft dengan bantuan AI. Anda tetap meninjau
                                        setiap detail sebelum transaksi disimpan.
                                    </p>
                                    <div className="dashboard-hero-actions">
                                        <button className="btn btn-accent" onClick={() => setPage("scanner")}>
                                            <i className="bi bi-upc-scan" /> Scan struk sekarang
                                        </button>
                                        <button className="btn btn-outline-light" onClick={() => setPage("summary")}>
                                            Lihat ringkasan
                                        </button>
                                    </div>
                                </div>
                                <div className="dashboard-hero-points" aria-label="Keunggulan SmartBills">
                                    <div><i className="bi bi-receipt-cutoff" /><span><strong>Catat lebih praktis</strong><small>Scan struk jadi draft transaksi</small></span></div>
                                    <div><i className="bi bi-bar-chart-line" /><span><strong>Pahami arus kas</strong><small>Pemasukan dan pengeluaran dalam satu ringkasan</small></span></div>
                                    <div><i className="bi bi-shield-check" /><span><strong>Tetap dalam kendali</strong><small>Periksa dulu sebelum menyimpan</small></span></div>
                                </div>
                            </section>
                            <section className="dashboard-news">
                                <div className="news-intro">
                                    <div>
                                        <span className="news-live"><span /> MARKET BRIEF</span>
                                        <h2>Update yang dekat dengan dompet Anda</h2>
                                        <p>Ikuti kabar harga bahan pokok dan pergerakan pasar Indonesia.</p>
                                    </div>
                                    <span className="news-attribution"><i className="bi bi-rss" /> CNBC Indonesia</span>
                                </div>
                                {newsStatus === "error" && (
                                    <div className="news-global-error" role="status">
                                        Berita belum dapat dimuat saat ini. Ringkasan saldo dan transaksi tetap tersedia.
                                    </div>
                                )}
                                <div className="news-sections">
                                    <NewsSection
                                        title="Harga bahan pangan"
                                        description="Kabar harga dan pasokan kebutuhan pokok"
                                        icon="bi-basket2"
                                        articles={dashboardNews?.food || []}
                                        loading={newsStatus === "loading"}
                                        failed={dashboardNews?.unavailable?.includes("food")}
                                        emptyMessage="Belum ada berita pangan terbaru di feed."
                                    />
                                    <NewsSection
                                        title="IHSG & pasar saham"
                                        description="Berita indeks dan pasar modal Indonesia"
                                        icon="bi-graph-up-arrow"
                                        articles={dashboardNews?.ihsg || []}
                                        loading={newsStatus === "loading"}
                                        failed={dashboardNews?.unavailable?.includes("ihsg")}
                                        emptyMessage="Belum ada berita IHSG terbaru di feed."
                                    />
                                </div>
                                <p className="news-disclaimer">Berita ditautkan ke sumber aslinya dan bukan merupakan rekomendasi investasi.</p>
                            </section>
                        </>
                    )}

                    {page === "summary" && (
                        <>
                            {dataStatus === "loading" ? (
                                <SummaryLoading />
                            ) : dataStatus === "error" ? (
                                <div className="summary-load-error" role="alert">
                                    <EmptyState
                                        icon="bi-cloud-slash"
                                        title="Ringkasan belum tersedia"
                                        description="Data keuangan gagal dimuat. Coba muat ulang untuk melihat informasi terbaru."
                                    >
                                        <button
                                            type="button"
                                            className="btn btn-primary"
                                            onClick={() => refresh(token).catch((loadError) => setError(loadError.message))}
                                        >
                                            Coba lagi
                                        </button>
                                    </EmptyState>
                                </div>
                            ) : (
                                <>
                            <div className="welcome-row">
                                <div><h2>Halo, {user?.name?.split(" ")[0] || "teman"} 👋</h2><p className="muted">Berikut ringkasan aktivitas keuangan Anda.</p></div>
                                <div className="d-flex flex-wrap gap-2">
                                    <button className="btn btn-outline-primary" onClick={() => { setForm({ ...emptyForm(), type: "INCOME" }); setItems([]); setPage("income"); }}><i className="bi bi-plus-lg me-2" />Tambah pemasukan</button>
                                    <button className="btn btn-primary" onClick={() => { setForm(emptyForm()); setItems([]); setPage("expense"); }}><i className="bi bi-plus-lg me-2" />Tambah pengeluaran</button>
                                </div>
                            </div>
                            {!user?.has_initial_balance && (
                                <div className="setup-banner"><i className="bi bi-info-circle" /><span>Atur saldo awal di halaman Akun untuk mulai memantau saldo.</span><button className="btn btn-sm btn-outline-primary ms-auto" onClick={() => setPage("account")}>Atur saldo</button></div>
                            )}
                            <div className="stats-grid">
                                <StatCard
                                    icon="wallet2"
                                    label="Saldo saat ini"
                                    countValue={Number(analytics?.current_balance ?? user?.current_balance ?? 0)}
                                    formatCount={money}
                                    tone="blue"
                                />
                                <StatCard
                                    icon="graph-up-arrow"
                                    label="Pemasukan · 6 bulan"
                                    countValue={Number(analytics?.summary?.income || 0)}
                                    formatCount={money}
                                    tone="green"
                                />
                                <StatCard
                                    icon="graph-down-arrow"
                                    label="Pengeluaran · 6 bulan"
                                    countValue={Number(analytics?.summary?.expense || 0)}
                                    formatCount={money}
                                    tone="orange"
                                />
                                <StatCard
                                    icon="receipt"
                                    label="Transaksi · 6 bulan"
                                    countValue={Number(analytics?.summary?.transaction_count || 0)}
                                    formatCount={(value) => new Intl.NumberFormat("id-ID", { maximumFractionDigits: 0 }).format(Math.round(value))}
                                    tone="violet"
                                />
                            </div>
                            <div className="dashboard-insights">
                                <div className="content-card">
                                    <div className="card-heading"><div><h3>Arus kas</h3><p>Perbandingan pemasukan dan pengeluaran</p></div><span className="badge rounded-pill text-bg-light">6 bulan terakhir</span></div>
                                    <CashFlowChart trend={analytics?.trend || []} maximum={chartMaximum} />
                                    <div className="chart-legend"><span><i className="legend-dot income-dot" />Pemasukan</span><span><i className="legend-dot expense-dot" />Pengeluaran</span></div>
                                </div>
                                <div className="content-card category-card">
                                    <div className="card-heading"><div><h3>Pengeluaran per kategori</h3><p>6 bulan terakhir</p></div></div>
                                    <CategoryBreakdown categories={analytics?.categories || []} />
                                </div>
                            </div>
                            <div className="dashboard-lower">
                                <div className="dashboard-transaction-lists">
                                    <div className="content-card">
                                        <div className="card-heading"><div><h3>Pemasukan terbaru</h3><p>Riwayat uang masuk</p></div><button className="btn btn-sm btn-outline-secondary" onClick={() => setPage("income")}>Lihat semua</button></div>
                                        <TransactionTable transactions={visibleTransactions.filter((item) => item.type === "INCOME").slice(0, 5)} onDelete={setSelectedDeleteId} onEdit={editTransaction} onReceipt={openReceipt} />
                                    </div>
                                    <div className="content-card">
                                        <div className="card-heading"><div><h3>Pengeluaran terbaru</h3><p>Riwayat uang keluar</p></div><button className="btn btn-sm btn-outline-secondary" onClick={() => setPage("expense")}>Lihat semua</button></div>
                                        <TransactionTable transactions={visibleTransactions.filter((item) => item.type === "EXPENSE").slice(0, 5)} onDelete={setSelectedDeleteId} onEdit={editTransaction} onReceipt={openReceipt} />
                                    </div>
                                </div>
                                <div className="dashboard-tools">
                                    <div className="privacy-card">
                                        <i className="bi bi-shield-check" />
                                        <div><strong>Anda tetap memegang kendali</strong><p>Draft AI tidak mengubah saldo sampai Anda meninjau dan menyimpannya.</p></div>
                                    </div>
                                </div>
                            </div>
                                </>
                            )}
                        </>
                    )}

                    {(page === "income" || page === "expense") && (
                        <div className="transactions-layout">
                            <div className="content-card transaction-list-card">
                                <div className="card-heading">
                                    <div><h3>Riwayat {page === "income" ? "pemasukan" : "pengeluaran"}</h3><p>{pageTransactions.length} transaksi ditemukan</p></div>
                                </div>
                                <div className="transaction-filters">
                                    <label className="transaction-search">
                                        <span className="visually-hidden">Cari transaksi</span>
                                        <i className="bi bi-search" aria-hidden="true" />
                                        <input
                                            type="search"
                                            value={transactionSearch}
                                            onChange={(event) => setTransactionSearch(event.target.value)}
                                            placeholder="Cari merchant, kategori, catatan..."
                                            aria-label="Cari transaksi"
                                        />
                                    </label>
                                    <label>
                                        <span className="visually-hidden">Filter kategori</span>
                                        <select
                                            className="form-select"
                                            value={transactionCategoryFilter}
                                            onChange={(event) => setTransactionCategoryFilter(event.target.value)}
                                            aria-label="Filter kategori"
                                        >
                                            <option value="">Semua kategori</option>
                                            <option value="uncategorized">Tanpa kategori</option>
                                            {pageCategories.map((category) => (
                                                <option key={category.category_id} value={String(category.category_id)}>{category.name}</option>
                                            ))}
                                        </select>
                                    </label>
                                    <label>
                                        <span className="visually-hidden">Filter bulan dan tahun</span>
                                        <input className="form-control" type="month" aria-label="Filter bulan dan tahun" value={transactionMonth} onChange={(event) => setTransactionMonth(event.target.value)} />
                                    </label>
                                    <label>
                                        <span className="visually-hidden">Urutkan transaksi</span>
                                        <select className="form-select" aria-label="Urutkan transaksi" value={transactionSort} onChange={(event) => setTransactionSort(event.target.value)}>
                                            <option value="date-desc">Tanggal terbaru</option>
                                            <option value="date-asc">Tanggal terlama</option>
                                            <option value="amount-desc">Nominal terbesar</option>
                                            <option value="amount-asc">Nominal terkecil</option>
                                        </select>
                                    </label>
                                    {(transactionSearch || transactionCategoryFilter || transactionMonth || transactionSort !== "date-desc") && (
                                        <button
                                            type="button"
                                            className="btn btn-sm btn-outline-secondary transaction-clear-filters"
                                            onClick={() => {
                                                setTransactionSearch("");
                                                setTransactionCategoryFilter("");
                                                setTransactionMonth("");
                                                setTransactionSort("date-desc");
                                            }}
                                        >
                                            Hapus filter
                                        </button>
                                    )}
                                </div>
                                {dataStatus === "loading" ? (
                                    <TransactionTable transactions={[]} loading />
                                ) : dataStatus === "error" ? (
                                    <EmptyState
                                        icon="bi-cloud-slash"
                                        title="Transaksi gagal dimuat"
                                        description="Periksa koneksi lalu muat ulang data transaksi."
                                    >
                                        <button
                                            type="button"
                                            className="btn btn-outline-primary"
                                            onClick={() => refresh(token).catch((loadError) => setError(loadError.message))}
                                        >
                                            Coba lagi
                                        </button>
                                    </EmptyState>
                                ) : pageTransactions.length ? (
                                    <TransactionTable transactions={pageTransactions} onDelete={setSelectedDeleteId} onEdit={editTransaction} onReceipt={openReceipt} />
                                ) : (
                                    <EmptyState
                                        icon="bi-search"
                                        title="Transaksi tidak ditemukan"
                                        description="Ubah kata kunci atau filter untuk melihat transaksi lainnya."
                                    />
                                )}
                            </div>
                            <div className="content-card transaction-form-card">
                                <div className="card-heading"><div><h3>{editingTransactionId ? "Edit" : "Catat"} {page === "income" ? "pemasukan" : "pengeluaran"}</h3><p>Data akan memperbarui saldo setelah disimpan.</p></div></div>
                                {draft && (
                                    <div className="alert alert-warning py-2 small" role="status">
                                        <strong>Draft AI berhasil diproses.</strong>{" "}
                                        Periksa data sebelum menyimpan.
                                        {draft.warnings?.length > 0 && (
                                            <ul className="mb-0 mt-2 ps-3">
                                                {draft.warnings.map((warning, index) => (
                                                    <li key={`${warning.code}-${index}`}>{warning.message}</li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                )}
                                <TransactionForm
                                    categories={categories}
                                    form={form}
                                    setForm={setForm}
                                    items={items}
                                    setItems={setItems}
                                    receiptFile={receiptFile}
                                    setReceiptFile={setReceiptFile}
                                    onSubmit={saveTransaction}
                                    busy={busy}
                                    isEditing={Boolean(editingTransactionId)}
                                />
                                {editingTransactionId && (
                                    <button
                                        type="button"
                                        className="btn btn-outline-secondary mt-2"
                                        onClick={cancelTransactionEdit}
                                        disabled={busy}
                                    >
                                        Batal edit
                                    </button>
                                )}
                            </div>
                        </div>
                    )}

                    {page === "scanner" && (
                        <div className="scanner-layout">
                            <div className="content-card scanner-camera-card">
                                <div className="card-heading">
                                    <div><h3>Scan bukti transaksi</h3><p>Arahkan kamera ke struk. Data akan diisikan ke form agar bisa Anda periksa.</p></div>
                                    <span className="scanner-icon"><i className="bi bi-upc-scan" /></span>
                                </div>
                                <div className="privacy-note">
                                    <i className="bi bi-shield-check" />
                                    <span>Foto dikirim ke layanan OCR dan teksnya diteruskan ke Google Gemini. Hindari data sensitif yang tidak diperlukan. Draft tidak disimpan atau mengubah saldo sebelum Anda meninjau transaksi.</span>
                                </div>
                                <div className={`scanner-camera${cameraStatus === "ready" ? " is-ready" : ""}`}>
                                    <video ref={cameraVideoRef} autoPlay playsInline muted aria-label="Pratinjau kamera untuk memindai struk" />
                                    {cameraStatus !== "ready" && (
                                        <div className="scanner-camera-message" role="status">
                                            {cameraStatus === "loading" ? (
                                                <><span className="button-spinner" aria-hidden="true" />Mengaktifkan kamera...</>
                                            ) : (
                                                <><i className="bi bi-camera-video-off" />{cameraError || "Kamera belum aktif."}</>
                                            )}
                                        </div>
                                    )}
                                    <span className="scanner-frame scanner-frame-tl" />
                                    <span className="scanner-frame scanner-frame-tr" />
                                    <span className="scanner-frame scanner-frame-bl" />
                                    <span className="scanner-frame scanner-frame-br" />
                                </div>
                                {cameraStatus === "error" && (
                                    <button type="button" className="btn btn-outline-light scanner-camera-retry" onClick={() => setCameraRetry((current) => current + 1)}>
                                        <i className="bi bi-arrow-clockwise me-2" />Coba aktifkan kamera
                                    </button>
                                )}
                                <div className="scanner-actions">
                                    <button type="button" className="btn btn-accent scanner-capture-button" disabled={busy || cameraStatus !== "ready"} onClick={captureReceipt}>
                                        {busy ? <span className="button-spinner" aria-hidden="true" /> : <i className="bi bi-camera-fill me-2" />}
                                        {busy ? "Memproses struk..." : "Ambil foto struk"}
                                    </button>
                                    <span className="scanner-or">atau</span>
                                    <input
                                        ref={scanFileInputRef}
                                        className="visually-hidden"
                                        type="file"
                                        accept="image/jpeg,image/png,image/webp"
                                        aria-hidden="true"
                                        tabIndex={-1}
                                        onChange={(event) => {
                                            const file = event.currentTarget.files?.[0] || null;
                                            event.currentTarget.value = "";
                                            if (!selectOcrFile(file)) return;
                                        }}
                                    />
                                    <button type="button" className="btn btn-outline-light" disabled={busy} onClick={() => scanFileInputRef.current?.click()}>
                                        <i className="bi bi-image me-2" />Upload foto struk
                                    </button>
                                </div>
                                {ocrFileError && <span className="form-error" role="alert">{ocrFileError}</span>}
                                {scanStatus && <div className="scanner-processing" role="status"><span className="button-spinner" aria-hidden="true" />{scanStatus}</div>}
                                {ocrFile && !busy && error && (
                                    <div className="scanner-retry-row">
                                        <span>Foto siap diproses ulang: {ocrFile.name}</span>
                                        <button type="button" className="btn btn-sm btn-outline-light" onClick={() => processReceipt(ocrFile)}>Coba lagi</button>
                                    </div>
                                )}
                            </div>
                            <aside className="content-card scanner-steps-card">
                                <div className="card-heading"><div><h3>Dari struk ke transaksi</h3><p>Anda tetap memegang kendali atas setiap data.</p></div></div>
                                <ol className="scanner-steps">
                                    <li><span>1</span><div><strong>Foto atau upload struk</strong><small>Pastikan tulisan terlihat jelas dan tidak terpotong.</small></div></li>
                                    <li><span>2</span><div><strong>AI membaca transaksi</strong><small>OCR dan AI menyiapkan draft secara otomatis.</small></div></li>
                                    <li><span>3</span><div><strong>Periksa lalu simpan</strong><small>Koreksi nominal atau kategori di form transaksi.</small></div></li>
                                </ol>
                            </aside>
                        </div>
                    )}

                    {page === "account" && (
                        dataStatus === "loading" ? (
                            <div className="account-grid" role="status" aria-label="Memuat informasi akun">
                                <div className="content-card account-loading-card">
                                    <Skeleton className="account-loading-heading" />
                                    <Skeleton className="account-loading-profile" />
                                    <Skeleton className="account-loading-fact" />
                                    <Skeleton className="account-loading-fact" />
                                </div>
                                <div className="content-card account-loading-card">
                                    <Skeleton className="account-loading-heading" />
                                    <Skeleton className="account-loading-fact" />
                                    <Skeleton className="account-loading-button" />
                                </div>
                            </div>
                        ) : dataStatus === "error" ? (
                            <div className="summary-load-error" role="alert">
                                <EmptyState
                                    icon="bi-cloud-slash"
                                    title="Informasi akun belum tersedia"
                                    description="Data akun gagal dimuat. Coba muat ulang untuk melihat informasi terbaru."
                                >
                                    <button
                                        type="button"
                                        className="btn btn-primary"
                                        onClick={() => refresh(token).catch((loadError) => setError(loadError.message))}
                                    >
                                        Coba lagi
                                    </button>
                                </EmptyState>
                            </div>
                        ) : (
                            <div className="account-grid">
                                <div className="content-card">
                                    <div className="card-heading"><div><h3>Profil pengguna</h3><p>Informasi akun SmartBills Anda</p></div></div>
                                    <div className="profile-row"><span className="avatar avatar-large">{user?.name?.[0]?.toUpperCase() || "S"}</span><div><strong>{user?.name}</strong><div className="muted">{user?.email}</div></div></div>
                                    <div className="profile-facts"><span>Saldo saat ini</span><strong>{money(user?.current_balance)}</strong><span>Status saldo awal</span><strong>{user?.has_initial_balance ? "Sudah diatur" : "Belum diatur"}</strong></div>
                                </div>
                                {!user?.has_initial_balance && (
                                    <div className="content-card">
                                        <div className="card-heading"><div><h3>Saldo awal</h3><p>Hanya dapat ditetapkan satu kali untuk akun ini.</p></div></div>
                                        <form onSubmit={setBalance}>
                                            <label className="form-label w-100">Saldo awal (Rp)
                                                <input className="form-control mt-1" required type="number" min="0" step="0.01" value={initialBalance} onChange={(event) => setInitialBalance(event.target.value)} />
                                            </label>
                                            <button className="btn btn-primary mt-2" disabled={busy}>Simpan saldo awal</button>
                                        </form>
                                        <p className="small text-secondary mt-3 mb-0">Penetapan saldo awal akan memperhitungkan transaksi yang telah tercatat.</p>
                                    </div>
                                )}
                            </div>
                        )
                    )}
                    </PageTransition>
                </section>
            </main>
            <Modal
                open={selectedDeleteId !== null}
                onClose={closeDeleteModal}
                titleId="confirm-delete-title"
                className="confirm-delete-modal"
            >
                <span className="delete-modal-icon"><i className="bi bi-trash3" /></span>
                <h2 id="confirm-delete-title">Hapus transaksi?</h2>
                <p>Transaksi akan dihapus dan saldo dihitung ulang. Anda masih dapat mengurungkan tindakan ini selama 5 detik.</p>
                <div className="delete-modal-actions">
                    <button type="button" className="btn btn-outline-secondary" onClick={() => setSelectedDeleteId(null)}>Batal</button>
                    <button type="button" className="btn btn-danger" onClick={() => queueTransactionDelete(selectedDeleteId)}>Hapus transaksi</button>
                </div>
            </Modal>
        </div>
    );
}
