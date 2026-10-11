const dateEl = document.getElementById('date');
if (dateEl) dateEl.valueAsDate = new Date();

function toggleForm() {
    const card = document.getElementById('addCard');
    if (!card) return;
    card.classList.toggle('collapsed');
    const isCollapsed = card.classList.contains('collapsed');
    localStorage.setItem('todo-form-collapsed', isCollapsed);
}

function toggleFilterDrawer() {
    const drawer = document.getElementById('filterDrawer');
    const backdrop = document.getElementById('filterBackdrop');
    if (drawer && backdrop) {
        const isOpen = drawer.classList.contains('open');
        if (isOpen) {
            closeFilterDrawer();
        } else {
            drawer.classList.add('open');
            backdrop.classList.add('open');
        }
    }
}

function closeFilterDrawer() {
    const drawer = document.getElementById('filterDrawer');
    const backdrop = document.getElementById('filterBackdrop');
    if (drawer) drawer.classList.remove('open');
    if (backdrop) backdrop.classList.remove('open');
}

function resetFilters() {
    const deptEl = document.getElementById('filterDepartment');
    const statusEl = document.getElementById('filterStatus');
    if (deptEl) deptEl.value = 'all';
    if (statusEl) statusEl.value = 'all';
    applyFilters();
}

function applyFilters() {
    const deptVal = document.getElementById('filterDepartment')?.value || 'all';
    const statusVal = document.getElementById('filterStatus')?.value || 'all';

    const items = document.querySelectorAll('.todo-item');
    let visibleCount = 0;

    items.forEach(item => {
        const itemDept = item.getAttribute('data-department-id');
        const itemStatus = item.getAttribute('data-status');

        const matchDept = (deptVal === 'all') ||
                            (deptVal === 'personal' && itemDept === 'personal') ||
                            (deptVal === itemDept);

        const matchStatus = (statusVal === 'all') || (itemStatus === statusVal);

        if (matchDept && matchStatus) {
            item.style.display = 'flex';
            visibleCount++;
        } else {
            item.style.display = 'none';
        }
    });

    // 件数カウント更新
    const countEl = document.getElementById('filterCount');
    if (countEl) {
        countEl.textContent = `${visibleCount} / ${items.length} 件`;
    }

    // アクティブ状態バッジの切替
    const isFiltered = deptVal !== 'all' || statusVal !== 'all';
    const activeDot = document.getElementById('activeFilterDot');
    const filterBtn = document.getElementById('filterToggleBtn');
    if (activeDot) activeDot.style.display = isFiltered ? 'inline-block' : 'none';
    if (filterBtn) filterBtn.classList.toggle('active', isFiltered);
}

function openEditModal(id, title, date, time, period, departmentId) {
    const modal = document.getElementById('editModal');
    const backdrop = document.getElementById('editModalBackdrop');
    const form = document.getElementById('editForm');
    if (!modal || !backdrop || !form) return;

    form.action = `/todo/${id}`;
    document.getElementById('editTitle').value = title;
    document.getElementById('editDate').value = date;
    document.getElementById('editTime').value = time;
    
    const deptEl = document.getElementById('editDepartmentId');
    if (deptEl) deptEl.value = departmentId || '';

    const periodEl = document.getElementById('editPeriod');
    if (periodEl) periodEl.value = period || 'none';

    modal.style.display = 'block';
    backdrop.classList.add('open');
}

function closeEditModal() {
    const modal = document.getElementById('editModal');
    const backdrop = document.getElementById('editModalBackdrop');
    if (modal) modal.style.display = 'none';
    if (backdrop) backdrop.classList.remove('open');
}

// キーボードEscキーでドロワー/モーダル閉じる
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeFilterDrawer();
        closeEditModal();
    }
});

// 初期状態の復元
window.addEventListener('DOMContentLoaded', () => {
    const isCollapsed = localStorage.getItem('todo-form-collapsed') === 'true';
    const addCard = document.getElementById('addCard');
    if (isCollapsed && addCard) {
        addCard.classList.add('collapsed');
    }
    applyFilters();
});