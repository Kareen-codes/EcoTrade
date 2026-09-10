// Admin orders list: stats, filters, grouped by user, actions (complete/cancel/delete)
import React, { useState, useMemo } from 'react';
import {
    ClipboardListIcon,
    CheckCircleIcon,
    ClockIcon,
    XCircleIcon,
    SearchIcon,
    FilterIcon,
    ChevronDownIcon,
    ChevronUpIcon,
    TrashIcon,
    UserCircleIcon,
} from '@heroicons/react/outline';
import { CheckCircleIcon as CheckCircleSolid, XCircleIcon as XCircleSolid } from '@heroicons/react/solid';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const STATUS_ALL = 'all';
const STATUS_PENDING = 'pending';
const STATUS_COMPLETED = 'completed';
const STATUS_CANCELED = 'canceled';

const statusFilters = [
    { value: STATUS_ALL, label: 'All' },
    { value: STATUS_PENDING, label: 'Pending' },
    { value: STATUS_COMPLETED, label: 'Completed' },
    { value: STATUS_CANCELED, label: 'Canceled' },
];

// Get request id (API uses id for user requests, _id for grouped)
const getRequestId = (request) => request.id || request._id;

// Format date (Gregorian)
const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

const GroupedRequestsList = ({ groupedRequests, onUpdateStatus, onDeleteRequest, onCancelRequest }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState(STATUS_ALL);
    const [chartVisible, setChartVisible] = useState(true);
    const [expandedUsers, setExpandedUsers] = useState(new Set());
    const [visibleGroups, setVisibleGroups] = useState(8);

    // Flatten for counts and filtering
    const allRequests = useMemo(() => {
        return groupedRequests.flatMap((g) => (g.requests || []).map((r) => ({ ...r, user: g.user })));
    }, [groupedRequests]);

    const totalRequests = allRequests.length;
    const completedRequests = allRequests.filter((r) => r.status === 'completed').length;
    const pendingRequests = allRequests.filter((r) => r.status === 'pending').length;
    const canceledRequests = allRequests.filter((r) => r.status === 'canceled').length;

    // Pie chart data
    const pieData = useMemo(
        () => ({
            labels: ['Completed', 'Pending', 'Canceled'],
            datasets: [
                {
                    data: [completedRequests, pendingRequests, canceledRequests],
                    backgroundColor: ['#10b981', '#f59e0b', '#ef4444'].map((c) => c + '99'),
                    borderColor: ['#10b981', '#f59e0b', '#ef4444'],
                    borderWidth: 1,
                },
            ],
        }),
        [completedRequests, pendingRequests, canceledRequests]
    );

    const pieOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { position: 'bottom' },
            tooltip: {
                callbacks: {
                    label: (ctx) => {
                        const n = ctx.raw;
                        const pct = totalRequests ? ((n / totalRequests) * 100).toFixed(1) : 0;
                        return `${ctx.label}: ${n} (${pct}%)`;
                    },
                },
            },
        },
    };

    // Filter groups: by search (user name/email, address) and status
    const filteredGroups = useMemo(() => {
        const q = searchQuery.trim().toLowerCase();
        const byStatus = (req) =>
            statusFilter === STATUS_ALL || req.status === statusFilter;

        return groupedRequests
            .map((group) => {
                const user = group.user || {};
                const matchUser = !q || (user.name && user.name.toLowerCase().includes(q)) || (user.email && user.email.toLowerCase().includes(q));
                const requests = (group.requests || []).filter((req) => {
                    const matchAddr = !q || (req.address && req.address.toLowerCase().includes(q));
                    const matchReq = (matchUser || matchAddr) && byStatus(req);
                    return matchReq;
                });
                return { ...group, requests };
            })
            .filter((g) => g.requests.length > 0);
    }, [groupedRequests, searchQuery, statusFilter]);

    const visibleFiltered = filteredGroups.slice(0, visibleGroups);
    const hasMore = visibleFiltered.length < filteredGroups.length;

    const toggleUser = (id) => {
        setExpandedUsers((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const expandAll = () => setExpandedUsers(new Set(filteredGroups.map((g) => g.user?.id ?? g.user?.email ?? '')));
    const collapseAll = () => setExpandedUsers(new Set());

    // Empty state
    if (groupedRequests.length === 0) {
        return (
            <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center shadow-sm">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gray-100">
                    <ClipboardListIcon className="h-10 w-10 text-gray-400" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-gray-800">No requests</h3>
                <p className="mt-2 text-sm text-gray-500">No requests have been submitted by users yet.</p>
            </div>
        );
    }

    const statCards = [
        { label: 'Total Requests', value: totalRequests, icon: ClipboardListIcon, bg: 'bg-slate-100', text: 'text-slate-700', iconColor: 'text-slate-600' },
        { label: 'Completed', value: completedRequests, icon: CheckCircleIcon, bg: 'bg-emerald-100', text: 'text-emerald-700', iconColor: 'text-emerald-600' },
        { label: 'Pending', value: pendingRequests, icon: ClockIcon, bg: 'bg-amber-100', text: 'text-amber-700', iconColor: 'text-amber-600' },
        { label: 'Canceled', value: canceledRequests, icon: XCircleIcon, bg: 'bg-red-100', text: 'text-red-700', iconColor: 'text-red-600' },
    ];

    return (
        <div className="space-y-6">
            {/* Stats row */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {statCards.map(({ label, value, icon: Icon, bg, text, iconColor }) => (
                    <div
                        key={label}
                        className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
                    >
                        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${bg}`}>
                            <Icon className={`h-6 w-6 ${iconColor}`} />
                        </div>
                        <div className="min-w-0">
                            <p className={`text-xl font-bold ${text}`}>{value}</p>
                            <p className="text-xs font-medium text-gray-500">{label}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Chart (collapsible) */}
            {totalRequests > 0 && (
                <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                    <button
                        type="button"
                        onClick={() => setChartVisible((v) => !v)}
                        className="flex w-full items-center justify-between rounded-lg py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                        <span>Request Status Distribution</span>
                        {chartVisible ? <ChevronUpIcon className="h-5 w-5" /> : <ChevronDownIcon className="h-5 w-5" />}
                    </button>
                    {chartVisible && (
                        <div className="mx-auto mt-2 h-56 w-56">
                            <Pie data={pieData} options={pieOptions} />
                        </div>
                    )}
                </div>
            )}

            {/* Filters */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-wrap items-center gap-2">
                    <div className="relative flex-1 min-w-[200px] sm:max-w-xs">
                        <SearchIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search (name, email, address)..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full rounded-xl border border-gray-300 py-2.5 pl-10 pr-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        />
                    </div>
                    <div className="flex items-center gap-1 rounded-xl border border-gray-300 bg-white p-1">
                        <FilterIcon className="h-4 w-4 text-gray-500 mr-1" />
                        {statusFilters.map(({ value, label }) => (
                            <button
                                key={value}
                                type="button"
                                onClick={() => setStatusFilter(value)}
                                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                                    statusFilter === value
                                        ? 'bg-blue-600 text-white'
                                        : 'text-gray-600 hover:bg-gray-100'
                                }`}
                            >
                                {label}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="flex gap-2">
                    <button
                        type="button"
                        onClick={expandAll}
                        className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
                    >
                        Expand All
                    </button>
                    <button
                        type="button"
                        onClick={collapseAll}
                        className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
                    >
                        Collapse All
                    </button>
                </div>
            </div>

            {/* Grouped list */}
            <div className="space-y-4">
                {visibleFiltered.map((group, index) => {
                    const user = group.user || {};
                    const userId = user.id || user.email || `group-${index}`;
                    const isExpanded = expandedUsers.has(userId);
                    const requests = group.requests || [];

                    return (
                        <div
                            key={userId}
                            className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md"
                        >
                            {/* User header - click to expand/collapse */}
                            <button
                                type="button"
                                onClick={() => toggleUser(userId)}
                                className="flex w-full items-center gap-4 p-4 text-left hover:bg-gray-50/80"
                            >
                                <div className="h-12 w-12 shrink-0 overflow-hidden rounded-full border-2 border-gray-200 bg-gray-100">
                                    {user.profileImage ? (
                                        <img src={user.profileImage} alt="" className="h-full w-full object-cover" />
                                    ) : (
                                        <div className="flex h-full w-full items-center justify-center">
                                            <UserCircleIcon className="h-8 w-8 text-gray-400" />
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-gray-800">{user.name || '—'}</p>
                                    <p className="text-sm text-gray-500">{user.email || '—'}</p>
                                </div>
                                <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                                    {requests.length} request{requests.length !== 1 ? 's' : ''}
                                </span>
                                {isExpanded ? <ChevronUpIcon className="h-5 w-5 text-gray-400" /> : <ChevronDownIcon className="h-5 w-5 text-gray-400" />}
                            </button>

                            {isExpanded && (
                                <div className="border-t border-gray-100 bg-gray-50/50 p-4">
                                    <ul className="space-y-3">
                                        {requests.map((request) => {
                                            const reqId = getRequestId(request);
                                            const isCompleted = request.status === 'completed';
                                            const isCanceled = request.status === 'canceled';
                                            const statusLabel = isCompleted ? 'Completed' : isCanceled ? 'Canceled' : 'Pending';

                                            return (
                                                <li
                                                    key={reqId}
                                                    className="flex flex-wrap items-center gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
                                                >
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-medium text-gray-800 line-clamp-2">{request.address}</p>
                                                        <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500">
                                                            <span>Scrap Type: {request.scrapType}</span>
                                                            <span>{formatDate(request.createdAt)}</span>
                                                        </div>
                                                        {request.images && request.images.length > 0 && (
                                                            <div className="mt-2 flex flex-wrap gap-2">
                                                                {request.images.slice(0, 4).map((img, i) => (
                                                                    <img
                                                                        key={i}
                                                                        src={img}
                                                                        alt=""
                                                                        className="h-14 w-14 rounded-lg object-cover border border-gray-200"
                                                                    />
                                                                ))}
                                                                {request.images.length > 4 && (
                                                                    <span className="flex h-14 items-center text-xs text-gray-500">+{request.images.length - 4}</span>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <span
                                                        className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${
                                                            isCompleted ? 'bg-emerald-100 text-emerald-800' : isCanceled ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                                                        }`}
                                                    >
                                                        {statusLabel}
                                                    </span>
                                                    <div className="flex shrink-0 flex-wrap gap-2">
                                                        <button
                                                            type="button"
                                                            onClick={() => onUpdateStatus(reqId, 'completed')}
                                                            disabled={isCompleted}
                                                            title="Confirm Completion"
                                                            className={`inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                                                                isCompleted
                                                                    ? 'cursor-not-allowed bg-gray-200 text-gray-500'
                                                                    : 'bg-emerald-600 text-white hover:bg-emerald-700'
                                                            }`}
                                                        >
                                                            {isCompleted ? <CheckCircleSolid className="h-4 w-4" /> : <CheckCircleIcon className="h-4 w-4" />}
                                                            {isCompleted ? 'Completed' : 'Complete'}
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => onCancelRequest(reqId)}
                                                            disabled={isCanceled}
                                                            title="Cancel Request"
                                                            className={`inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                                                                isCanceled
                                                                    ? 'cursor-not-allowed bg-gray-200 text-gray-500'
                                                                    : 'bg-amber-500 text-white hover:bg-amber-600'
                                                            }`}
                                                        >
                                                            {isCanceled ? <XCircleSolid className="h-4 w-4" /> : <XCircleIcon className="h-4 w-4" />}
                                                            {isCanceled ? 'Canceled' : 'Cancel'}
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => onDeleteRequest(reqId)}
                                                            title="Delete Request"
                                                            className="inline-flex items-center gap-1 rounded-lg bg-red-600 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-red-700"
                                                        >
                                                            <TrashIcon className="h-4 w-4" />
                                                            Delete
                                                        </button>
                                                    </div>
                                                </li>
                                            );
                                        })}
                                    </ul>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {hasMore && (
                <div className="text-center">
                    <button
                        type="button"
                        onClick={() => setVisibleGroups((v) => v + 6)}
                        className="rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700"
                    >
                        Show More Users
                    </button>
                </div>
            )}

            {filteredGroups.length === 0 && (
                <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center">
                    <p className="text-gray-500">No results match the search or filters.</p>
                </div>
            )}
        </div>
    );
};

export default GroupedRequestsList;
