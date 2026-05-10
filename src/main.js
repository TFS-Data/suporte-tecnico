import './style.css';
import { supabase } from './lib/supabase.js';
import { LoginView } from './views/login.js';
import { SettingsView } from './views/settings.js';
import { TicketModal } from './components/TicketModal.js';

/**
 * ESTADO GLOBAL DA APLICAÇÃO
 */
const AppState = {
    user: null,
    session: null,
    system: {
        title: 'Suporte Técnico',
        subtitle: 'Gestão Operacional',
        logo_url: null
    },
    help: {
        display_text: 'Central de Ajuda',
        email: 'suporte@empresa.com',
        website: 'https://suporte.empresa.com',
        phone: '(11) 4004-0000'
    },
    categories: [
        { id: '1', name: 'Informática/TI', color: 'secondary', icon: 'computer' },
        { id: '2', name: 'Elétrica', color: 'surface-tint', icon: 'electrical_services' },
        { id: '3', name: 'Predial/Civil', color: 'primary-container', icon: 'domain' },
        { id: '4', name: 'Segurança Eletrônica', color: 'error', icon: 'security' },
        { id: '5', name: 'Telecomunicações', color: 'secondary', icon: 'router' }
    ],
    statusTypes: [
        { id: '1', name: 'Aberto', type: 'error' },
        { id: '2', name: 'Em Atendimento', type: 'secondary' },
        { id: '3', name: 'Aguardando Peças', type: '[#f59e0b]' },
        { id: '4', name: 'Concluído', type: '[#10b981]' }
    ],
    users: [
        { id: '1', full_name: 'Admin User', email: 'admin@suporte.com', role: 'Administrador', job_title: 'TI Support', avatar_url: '' },
    ],
    tickets: [
        { id: 'TK-8492', title: 'Falha de conexão na sala de reuniões A', category_id: '1', status_id: '1', priority: 'Alta', created_at: new Date() },
        { id: 'TK-8491', title: 'Troca de lâmpadas corredor principal', category_id: '2', status_id: '2', priority: 'Média', created_at: new Date() },
        { id: 'TK-8488', title: 'Câmera portaria 2 sem sinal', category_id: '4', status_id: '3', priority: 'Alta', created_at: new Date() },
        { id: 'TK-8485', title: 'Vazamento ar condicionado sala diretoria', category_id: '3', status_id: '4', priority: 'Baixa', created_at: new Date() }
    ],
    currentView: 'dashboard'
};

document.addEventListener('DOMContentLoaded', () => {
    initApp();
});

async function initApp() {
    console.log("Iniciando aplicação...");

    // 1. Carregar dados do DB PRIMEIRO (categorias, status, configurações, usuários)
    //    para que os selects do modal sempre tenham os UUIDs reais.
    try {
        const [cats, stats, settings, users] = await Promise.all([
            supabase.from('categories').select('*'),
            supabase.from('status_types').select('*'),
            supabase.from('system_settings').select('*').limit(1).maybeSingle(),
            supabase.from('profiles').select('*').order('full_name')
        ]);
        if (cats.data && cats.data.length > 0)   AppState.categories = cats.data;
        if (stats.data && stats.data.length > 0)  AppState.statusTypes = stats.data;
        if (users.data && users.data.length > 0)  AppState.users = users.data;
        if (settings.data) {
            AppState.system.title    = settings.data.title    || AppState.system.title;
            AppState.system.subtitle = settings.data.subtitle || AppState.system.subtitle;
            if (settings.data.logo_url) AppState.system.logo_url = settings.data.logo_url;
        }
    } catch (err) {
        console.warn("Usando dados locais (Mock). Erro DB:", err.message);
    }

    // 2. Agora verificar sessão e mostrar layout/login
    try {
        const storedSession = localStorage.getItem('sb-session');
        if (storedSession) {
            console.log("Sessão encontrada.");
            AppState.session = JSON.parse(storedSession);
            AppState.user = AppState.session.user;
            // Recarregar dados do usuário logado do banco (caso tenham mudado)
            const { data: freshUser } = await supabase
                .from('profiles').select('*').eq('id', AppState.user.id).maybeSingle();
            if (freshUser) AppState.user = freshUser;
            showLayout();
            // Carregar chamados após mostrar layout
            loadTickets().catch(err => console.warn("Tickets offline:", err.message));
        } else {
            console.log("Nenhuma sessão. Exibindo login.");
            showLogin();
        }
    } catch (err) {
        console.error("Erro na inicialização:", err);
        localStorage.removeItem('sb-session');
        showLogin();
    }
}

// loadSystemSettings não é mais necessário como função separada pois
// as configurações já são carregadas em initApp() na primeira chamada ao DB.
// Mantida aqui apenas para recarregar manualmente se necessário.
async function loadSystemSettings() {
    try {
        const { data, error } = await supabase.from('system_settings').select('*').limit(1).maybeSingle();
        if (error) throw error;
        if (data) {
            AppState.system.title    = data.title    || AppState.system.title;
            AppState.system.subtitle = data.subtitle || AppState.system.subtitle;
            if (data.logo_url) AppState.system.logo_url = data.logo_url;
            updateUI();
        }
    } catch (err) {
        console.error("Erro ao recarregar configurações:", err);
    }
}

async function loadTickets() {
    try {
        const { data, error } = await supabase.from('tickets').select('*').order('created_at', { ascending: false });
        if (error) throw error;
        if (data) AppState.tickets = data;
        renderTicketsTable();
    } catch (err) {
        console.error("Erro ao carregar chamados:", err);
    }
}

/**
 * RENDERIZAÇÃO DE INTERFACE
 */

function showLogin() {
    const root = document.getElementById('app-root');
    if (root) root.classList.add('hidden');

    let loginContainer = document.getElementById('login-container');
    if (!loginContainer) {
        loginContainer = document.createElement('div');
        loginContainer.id = 'login-container';
        loginContainer.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;z-index:100;background:#fbf8fa;';
        document.body.appendChild(loginContainer);
    }
    
    loginContainer.innerHTML = LoginView(AppState.system);
    loginContainer.style.display = 'block';

    const form = document.getElementById('login-form');
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            console.log("Formulário enviado!");
            handleLogin(e);
        });
    } else {
        console.error("Formulário de login não encontrado no DOM!");
    }
}

function showLayout() {
    const root = document.getElementById('app-root');
    if (!root) return;
    
    // Remover container de login se existir
    const loginContainer = document.getElementById('login-container');
    if (loginContainer) {
        loginContainer.style.display = 'none';
        loginContainer.remove();
    }
    
    root.classList.remove('hidden');
    root.style.display = 'flex';
    
    updateUI();
    setupEventListeners();
    navigateTo('dashboard');
}

function updateUI() {
    if (!AppState.user) return;
    
    const setText = (id, val) => { 
        const el = document.getElementById(id); 
        if (el) el.textContent = val || ''; 
    };
    const setImg = (id, val) => { 
        const el = document.getElementById(id); 
        if (el && val) el.src = val; 
    };

    // Sistema
    setText('app-title', AppState.system.title);
    setText('app-subtitle', AppState.system.subtitle);
    
    const logoIcon = document.getElementById('app-logo-icon');
    const logoImg  = document.getElementById('app-logo-img');
    if (logoIcon && logoImg) {
        if (AppState.system.logo_url) {
            logoIcon.classList.add('hidden');
            logoImg.src = AppState.system.logo_url;
            logoImg.classList.remove('hidden');
        } else {
            logoIcon.classList.remove('hidden');
            logoImg.classList.add('hidden');
        }
    }

    // Info Usuário
    setText('user-name-sidebar', AppState.user.full_name);
    setText('header-user-name', AppState.user.full_name);
    setText('dropdown-user-name', AppState.user.full_name);
    setText('user-role-sidebar', AppState.user.job_title || AppState.user.role);
    setText('dropdown-user-email', AppState.user.email);
    
    if (AppState.user.avatar_url) {
        setImg('user-avatar-sidebar', AppState.user.avatar_url);
        setImg('user-avatar-header', AppState.user.avatar_url);
    }

    // RBAC
    if (AppState.user.role === 'Cliente') {
        document.getElementById('menu-dashboard')?.classList.add('hidden');
        document.getElementById('menu-reports')?.classList.add('hidden');
    }
}

/**
 * NAVEGAÇÃO E EVENTOS GLOBAIS
 */

function setupEventListeners() {
    // Navigation
    document.querySelectorAll('.nav-item').forEach(item => {
        item.onclick = (e) => { e.preventDefault(); navigateTo(item.getAttribute('data-page')); };
    });

    // Sidebar Toggle
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    const toggle = () => {
        sidebar.classList.toggle('-translate-x-full');
        overlay.classList.toggle('hidden');
    };
    document.getElementById('open-sidebar').onclick = toggle;
    document.getElementById('close-sidebar').onclick = toggle;
    overlay.onclick = toggle;

    // Dropdowns
    const userTrigger = document.getElementById('user-menu-trigger');
    const userDropdown = document.getElementById('user-dropdown');
    if (userTrigger && userDropdown) {
        userTrigger.onclick = (e) => { e.stopPropagation(); userDropdown.classList.toggle('hidden'); };
    }

    const helpBtn = document.getElementById('btn-help');
    const helpDropdown = document.getElementById('help-dropdown');
    if (helpBtn && helpDropdown) {
        helpBtn.onclick = (e) => { 
            e.stopPropagation(); 
            helpDropdown.classList.toggle('hidden'); 
            renderHelpInfo();
        };
    }

    window.onclick = () => { 
        userDropdown.classList.add('hidden'); 
        helpDropdown.classList.add('hidden'); 
    };

    // Logout
    document.getElementById('btn-logout').onclick = handleLogout;

    // Search
    const searchInput = document.getElementById('search-input');
    const handleSearch = () => filterTickets(searchInput.value.toLowerCase());
    searchInput.onkeypress = (e) => { if (e.key === 'Enter') handleSearch(); };
    document.getElementById('btn-search').onclick = handleSearch;

    // New Ticket
    document.getElementById('btn-new-ticket').onclick = () => openTicketModal();
}

function navigateTo(pageId) {
    AppState.currentView = pageId;
    const appContent = document.getElementById('app-content');
    const searchContainer = document.getElementById('search-container');

    document.querySelectorAll('.nav-item').forEach(item => {
        const isActive = item.getAttribute('data-page') === pageId;
        item.classList.toggle('bg-secondary-container', isActive);
        item.classList.toggle('text-on-secondary-container', isActive);
        item.classList.toggle('font-bold', isActive);
        item.classList.toggle('text-primary-fixed-dim', !isActive);
    });

    const showSearch = ['dashboard', 'tickets'].includes(pageId);
    searchContainer.style.opacity = showSearch ? '1' : '0';
    searchContainer.style.pointerEvents = showSearch ? 'auto' : 'none';

    if (pageId === 'settings') {
        appContent.innerHTML = SettingsView(AppState.user.role);
        initSettings();
    } else {
        renderDashboard(pageId);
    }
}

/**
 * LÓGICA DE CHAMADOS
 */

function renderDashboard(view) {
    const appContent = document.getElementById('app-content');

    const titles = {
        dashboard: 'Painel Geral',
        tickets:   'Meus Chamados',
        reports:   'Relatórios'
    };

    if (view === 'reports') {
        const total     = AppState.tickets.length;
        const abertos   = AppState.tickets.filter(t => getStatus(t.status_id).name === 'Aberto').length;
        const atend     = AppState.tickets.filter(t => getStatus(t.status_id).name === 'Em Atendimento').length;
        const concl     = AppState.tickets.filter(t => getStatus(t.status_id).name === 'Concluído').length;
        const alta      = AppState.tickets.filter(t => t.priority === 'Alta').length;

        appContent.innerHTML = `
        <div class="animate-fadeIn">
            <div class="flex items-center justify-between mb-lg">
                <h2 class="text-3xl font-bold">Relatórios & Chamados</h2>
            </div>

            <!-- Cards de resumo -->
            <div class="grid grid-cols-2 lg:grid-cols-4 gap-md mb-lg">
                <div class="bg-surface rounded-xl p-md border border-outline-variant/30 shadow-sm text-center relative overflow-hidden">
                    <div class="absolute top-0 left-0 w-full h-[3px] bg-secondary"></div>
                    <p class="text-on-surface-variant text-[12px] mb-xs">Total</p>
                    <h3 class="text-[32px] font-black text-secondary">${total}</h3>
                </div>
                <div class="bg-surface rounded-xl p-md border border-outline-variant/30 shadow-sm text-center relative overflow-hidden">
                    <div class="absolute top-0 left-0 w-full h-[3px] bg-error"></div>
                    <p class="text-on-surface-variant text-[12px] mb-xs">Abertos</p>
                    <h3 class="text-[32px] font-black text-error">${abertos}</h3>
                </div>
                <div class="bg-surface rounded-xl p-md border border-outline-variant/30 shadow-sm text-center relative overflow-hidden">
                    <div class="absolute top-0 left-0 w-full h-[3px] bg-[#f59e0b]"></div>
                    <p class="text-on-surface-variant text-[12px] mb-xs">Em Atendimento</p>
                    <h3 class="text-[32px] font-black text-[#f59e0b]">${atend}</h3>
                </div>
                <div class="bg-surface rounded-xl p-md border border-outline-variant/30 shadow-sm text-center relative overflow-hidden">
                    <div class="absolute top-0 left-0 w-full h-[3px] bg-[#10b981]"></div>
                    <p class="text-on-surface-variant text-[12px] mb-xs">Concluídos</p>
                    <h3 class="text-[32px] font-black text-[#10b981]">${concl}</h3>
                </div>
            </div>

            <!-- Tabela completa com filtros -->
            <div class="bg-surface rounded-xl shadow-sm border border-outline-variant/30 overflow-hidden">
                <div class="p-md bg-surface-container-low border-b border-outline-variant/30 flex flex-wrap gap-sm justify-between items-center">
                    <span class="text-body-sm font-bold">Todos os Chamados</span>
                    <div class="flex gap-sm flex-wrap">
                        <select id="rpt-filter-status" class="bg-surface border border-outline-variant rounded-lg px-md py-xs text-[12px] outline-none">
                            <option value="">Todos os Status</option>
                            ${AppState.statusTypes.map(s => `<option value="${s.id}">${s.name}</option>`).join('')}
                        </select>
                        <select id="rpt-filter-priority" class="bg-surface border border-outline-variant rounded-lg px-md py-xs text-[12px] outline-none">
                            <option value="">Todas as Prioridades</option>
                            <option value="Alta">Alta</option>
                            <option value="Média">Média</option>
                            <option value="Baixa">Baixa</option>
                        </select>
                    </div>
                </div>
                <div class="overflow-x-auto">
                    <table class="w-full text-left min-w-[700px]">
                        <thead class="text-label-caps text-on-surface-variant bg-surface-container-lowest">
                            <tr>
                                <th class="p-md">ID</th>
                                <th class="p-md">Assunto</th>
                                <th class="p-md">Categoria</th>
                                <th class="p-md">Prioridade</th>
                                <th class="p-md">Status</th>
                                <th class="p-md">Aberto em</th>
                                <th class="p-md text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody id="rpt-table-body" class="divide-y divide-outline-variant/20">
                        </tbody>
                    </table>
                </div>
            </div>
        </div>`;

        renderReportsTable(AppState.tickets);

        document.getElementById('rpt-filter-status').onchange = applyReportsFilter;
        document.getElementById('rpt-filter-priority').onchange = applyReportsFilter;
        return;
    }

    // Painel Geral / Meus Chamados
    const ticketsToShow = view === 'tickets' && AppState.user.role === 'Cliente'
        ? AppState.tickets.filter(t => t.client_id === AppState.user.id)
        : AppState.tickets;

    const abertos   = AppState.tickets.filter(t => getStatus(t.status_id).name === 'Aberto').length;
    const atend     = AppState.tickets.filter(t => getStatus(t.status_id).name === 'Em Atendimento').length;
    const aguard    = AppState.tickets.filter(t => getStatus(t.status_id).name === 'Aguardando Peças').length;
    const concl     = AppState.tickets.filter(t => getStatus(t.status_id).name === 'Concluído').length;

    appContent.innerHTML = `
    <div class="animate-fadeIn">
        <!-- Resumo Cards -->
        <section class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-md mb-lg">
            <article class="bg-surface rounded-xl p-md shadow-sm border border-outline-variant/30 flex flex-col relative overflow-hidden">
                <div class="absolute top-0 left-0 w-full h-[3px] bg-error"></div>
                <div class="flex justify-between items-start mb-sm">
                    <p class="text-sm font-bold text-on-surface-variant uppercase tracking-wider">Chamados Abertos</p>
                    <span class="material-symbols-outlined text-error bg-error/10 p-1 rounded-lg">assignment_late</span>
                </div>
                <div class="flex items-end gap-sm">
                    <h2 class="text-3xl font-black text-on-surface">${abertos}</h2>
                    <span class="text-xs font-bold text-error flex items-center mb-1"><span class="material-symbols-outlined text-[14px]">arrow_upward</span> 12%</span>
                </div>
            </article>

            <article class="bg-surface rounded-xl p-md shadow-sm border border-outline-variant/30 flex flex-col relative overflow-hidden">
                <div class="absolute top-0 left-0 w-full h-[3px] bg-secondary"></div>
                <div class="flex justify-between items-start mb-sm">
                    <p class="text-sm font-bold text-on-surface-variant uppercase tracking-wider">Em Atendimento</p>
                    <span class="material-symbols-outlined text-secondary bg-secondary/10 p-1 rounded-lg">support_agent</span>
                </div>
                <div class="flex items-end gap-sm">
                    <h2 class="text-3xl font-black text-on-surface">${atend}</h2>
                </div>
            </article>

            <article class="bg-surface rounded-xl p-md shadow-sm border border-outline-variant/30 flex flex-col relative overflow-hidden">
                <div class="absolute top-0 left-0 w-full h-[3px] bg-[#f59e0b]"></div>
                <div class="flex justify-between items-start mb-sm">
                    <p class="text-sm font-bold text-on-surface-variant uppercase tracking-wider">Aguardando Peças</p>
                    <span class="material-symbols-outlined text-[#f59e0b] bg-[#f59e0b]/10 p-1 rounded-lg">inventory_2</span>
                </div>
                <div class="flex items-end gap-sm">
                    <h2 class="text-3xl font-black text-on-surface">${aguard}</h2>
                </div>
            </article>

            <article class="bg-surface rounded-xl p-md shadow-sm border border-outline-variant/30 flex flex-col relative overflow-hidden">
                <div class="absolute top-0 left-0 w-full h-[3px] bg-[#10b981]"></div>
                <div class="flex justify-between items-start mb-sm">
                    <p class="text-sm font-bold text-on-surface-variant uppercase tracking-wider">Concluídos Hoje</p>
                    <span class="material-symbols-outlined text-[#10b981] bg-[#10b981]/10 p-1 rounded-lg">task_alt</span>
                </div>
                <div class="flex items-end gap-sm">
                    <h2 class="text-3xl font-black text-on-surface">${concl}</h2>
                    <span class="text-xs font-bold text-[#10b981] flex items-center mb-1"><span class="material-symbols-outlined text-[14px]">arrow_upward</span> 5%</span>
                </div>
            </article>
        </section>

        <!-- Filtros -->
        <section class="mb-lg">
            <div class="flex items-center justify-between mb-md">
                <h3 class="text-base font-bold text-on-surface">Filtros por Categoria</h3>
                <button class="text-sm font-bold text-secondary flex items-center gap-xs hover:underline">
                    <span class="material-symbols-outlined text-[18px]">filter_list</span> Filtrar Avançado
                </button>
            </div>
            <div class="flex flex-wrap gap-sm">
                ${AppState.categories.map((cat, idx) => `
                    <button class="${idx === 0 ? 'bg-secondary text-on-secondary shadow-md' : 'bg-surface text-on-surface-variant border border-outline-variant hover:bg-surface-container-low'} text-sm font-bold px-md py-sm rounded-full flex items-center gap-sm transition-all active:scale-95">
                        <span class="material-symbols-outlined text-[18px]">${cat.icon || 'label'}</span>
                        ${cat.name}
                    </button>
                `).join('')}
            </div>
        </section>

        <!-- Tabela -->
        <div class="bg-surface rounded-xl shadow-md border border-outline-variant/30 overflow-hidden">
            <div class="p-md bg-surface-container-lowest border-b border-outline-variant/30 flex justify-between items-center">
                <span class="text-base font-bold text-on-surface">Gerenciamento de Chamados</span>
            </div>
            <div class="overflow-x-auto">
                <table class="w-full text-left min-w-[800px]">
                    <thead class="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant bg-surface-container-low border-b border-outline-variant/30">
                        <tr>
                            <th class="p-md">ID/Ticket</th>
                            <th class="p-md">Assunto</th>
                            <th class="p-md">Categoria</th>
                            <th class="p-md">Prioridade</th>
                            <th class="p-md">Status</th>
                            <th class="p-md text-right">Ações</th>
                        </tr>
                    </thead>
                    <tbody id="tickets-table-body" class="divide-y divide-outline-variant/20">
                    </tbody>
                </table>
            </div>
        </div>
    </div>`;
    renderTicketsTable(ticketsToShow);
}

function renderTicketsTable(filtered = null) {
    const tbody = document.getElementById('tickets-table-body');
    if (!tbody) return;
    
    const tickets = filtered || AppState.tickets;
    tbody.innerHTML = tickets.length ? tickets.map(t => {
        const cat = getCategory(t.category_id);
        const status = getStatus(t.status_id);
        const priorityIcon = t.priority === 'Alta' ? 'priority_high' : t.priority === 'Média' ? 'remove' : 'arrow_downward';
        const priorityColor = getPriorityColor(t.priority);
        
        return `
        <tr class="hover:bg-surface-container-lowest transition-colors cursor-pointer group">
            <td class="p-md font-bold text-secondary" onclick="window.openTicketModal('${t.id}')">#${t.id.includes('-') ? t.id.split('-')[0].toUpperCase() : t.id}</td>
            <td class="p-md font-medium text-on-surface group-hover:text-secondary transition-colors" onclick="window.openTicketModal('${t.id}')">${t.title}</td>
            <td class="p-md" onclick="window.openTicketModal('${t.id}')">
                <span class="bg-surface-container border border-outline-variant/30 text-on-surface-variant px-sm py-xs rounded text-[11px] font-bold">
                    ${cat.name}
                </span>
            </td>
            <td class="p-md" onclick="window.openTicketModal('${t.id}')">
                <span class="text-${priorityColor} font-bold flex items-center gap-xs text-[12px]">
                    <span class="material-symbols-outlined text-[16px]" style="font-variation-settings: 'FILL' 1;">${priorityIcon}</span>
                    ${t.priority}
                </span>
            </td>
            <td class="p-md" onclick="window.openTicketModal('${t.id}')">
                <span class="bg-${status.type}/10 text-${status.type} px-sm py-xs rounded-full text-[11px] font-bold flex items-center gap-xs w-max">
                    <span class="w-2 h-2 rounded-full bg-${status.type}"></span>
                    ${status.name}
                </span>
            </td>
            <td class="p-md text-right whitespace-nowrap">
                <button onclick="window.openTicketModal('${t.id}')" title="Ver/Editar" class="text-on-surface-variant hover:text-secondary p-xs transition-colors">
                    <span class="material-symbols-outlined text-[20px]">visibility</span>
                </button>
                <button onclick="window.openTicketModal('${t.id}')" title="Atribuir" class="text-secondary hover:text-secondary-container p-xs ml-xs transition-colors">
                    <span class="material-symbols-outlined text-[20px]">person_add</span>
                </button>
            </td>
        </tr>
    `}).join('') : '<tr><td colspan="6" class="p-xl text-center text-outline-variant italic">Nenhum chamado encontrado.</td></tr>';
}

function openTicketModal(id = null) {
    // Evitar abrir múltiplos modais
    const existing = document.getElementById('modal-container');
    if (existing) existing.remove();

    const ticket = id ? AppState.tickets.find(t => t.id === id) : { title: '', description: '', priority: 'Baixa', created_at: new Date() };
    if (!ticket) return;
    const supportUsers = AppState.users.filter(u => ['Administrador', 'Técnico'].includes(u.role));
    
    const div = document.createElement('div');
    div.id = 'modal-container';
    div.innerHTML = TicketModal(ticket, AppState.categories, AppState.statusTypes, supportUsers, AppState.user.role);
    document.body.appendChild(div);

    document.getElementById('close-modal').onclick = () => div.remove();
    document.getElementById('btn-cancel').onclick = () => div.remove();
    // Fechar ao clicar fora
    div.querySelector('#ticket-modal-overlay').onclick = (e) => { if (e.target.id === 'ticket-modal-overlay') div.remove(); };
    document.getElementById('form-ticket').onsubmit = (e) => {
        e.preventDefault();
        saveTicket(ticket.id, div);
    };
}
// Expor globalmente para uso em onclick inline no HTML gerado dinamicamente
window.openTicketModal = openTicketModal;

function saveTicket(id, modalEl) {
    const isNew = !id;

    // Pega o UUID direto do valor do select (já são UUIDs reais vindos do AppState.categories/statusTypes)
    const catId  = document.getElementById('tk-category').value  || null;
    const statId = document.getElementById('tk-status').value    || null;
    const assignedId = document.getElementById('tk-assigned').value || null;

    // client_id: só inclui se for um UUID real (evita enviar id mock de sessão local)
    const rawClientId = isNew ? AppState.user.id : (AppState.tickets.find(t => t.id === id)?.client_id || null);
    const isUUID = (val) => val && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val);
    const validClientId   = isUUID(rawClientId)  ? rawClientId  : null;
    const validAssignedId = isUUID(assignedId)   ? assignedId   : null;

    const statusText = document.getElementById('tk-status').options[
        document.getElementById('tk-status').selectedIndex
    ].text;

    const data = {
        title:          document.getElementById('tk-title').value.trim(),
        description:    document.getElementById('tk-desc').value.trim(),
        category_id:    catId,
        status_id:      statId,
        priority:       document.getElementById('tk-priority').value,
        assigned_to_id: validAssignedId,
        client_id:      validClientId,
        closed_at:      statusText === 'Concluído' ? new Date().toISOString() : null
    };

    // Não inclui created_at no insert — o banco usa DEFAULT now()
    if (!isNew) {
        data.created_at = AppState.tickets.find(t => t.id === id)?.created_at || undefined;
    }

    const saveBtn = modalEl.querySelector('button[type="submit"]');
    if (saveBtn) { saveBtn.disabled = true; saveBtn.textContent = 'Salvando...'; }

    const action = isNew 
        ? supabase.from('tickets').insert([data])
        : supabase.from('tickets').update(data).eq('id', id);

    action.then(({ error }) => {
        if (saveBtn) { saveBtn.disabled = false; saveBtn.textContent = isNew ? 'Abrir Chamado' : 'Salvar Alterações'; }
        if (error) {
            console.error('Erro ao salvar chamado:', error);
            return alert('Erro ao salvar chamado: ' + error.message);
        }
        loadTickets().then(() => {
            modalEl.remove();
            showToast(isNew ? 'Chamado aberto com sucesso!' : 'Chamado atualizado!');
            if (AppState.currentView === 'reports') renderReportsTable(AppState.tickets);
        });
    });
}

/**
 * AUXILIARES
 */

function getCategory(id) { return AppState.categories.find(c => c.id === id) || { name: 'Geral' }; }
function getStatus(id)   { return AppState.statusTypes.find(s => s.id === id) || { name: 'Indefinido', type: 'secondary' }; }
function getPriorityColor(p) { return p === 'Alta' ? 'error' : p === 'Média' ? '[#f59e0b]' : '[#10b981]'; }

function renderReportsTable(tickets) {
    const tbody = document.getElementById('rpt-table-body');
    if (!tbody) return;

    tbody.innerHTML = tickets.length ? tickets.map(t => {
        const cat    = getCategory(t.category_id);
        const status = getStatus(t.status_id);
        const pColor = getPriorityColor(t.priority);
        const dateStr = t.created_at ? new Date(t.created_at).toLocaleDateString('pt-BR') : '-';

        return `
        <tr class="hover:bg-surface-container-lowest transition-colors cursor-pointer" onclick="window.openTicketModal('${t.id}')">
            <td class="p-md text-[12px] text-secondary font-bold">#${t.id.includes('-') ? t.id.split('-')[0].toUpperCase() : t.id}</td>
            <td class="p-md text-body-sm text-on-surface font-medium">${t.title}</td>
            <td class="p-md text-[12px]"><span class="bg-secondary/10 text-secondary px-sm py-xs rounded">${cat.name}</span></td>
            <td class="p-md"><span class="text-${pColor} font-bold text-[12px]">${t.priority}</span></td>
            <td class="p-md"><span class="bg-surface-container-low border border-outline-variant/30 text-on-surface px-sm py-xs rounded-full text-[11px] font-bold">${status.name}</span></td>
            <td class="p-md text-[12px] text-on-surface-variant">${dateStr}</td>
            <td class="p-md text-right">
                <span class="material-symbols-outlined text-secondary text-[18px]">edit</span>
            </td>
        </tr>`;
    }).join('') : '<tr><td colspan="7" class="p-xl text-center text-outline-variant italic">Nenhum chamado encontrado.</td></tr>';
}

function applyReportsFilter() {
    const statusVal   = document.getElementById('rpt-filter-status')?.value   || '';
    const priorityVal = document.getElementById('rpt-filter-priority')?.value || '';

    const filtered = AppState.tickets.filter(t => {
        const matchStatus   = !statusVal   || t.status_id === statusVal;
        const matchPriority = !priorityVal || t.priority  === priorityVal;
        return matchStatus && matchPriority;
    });

    renderReportsTable(filtered);
}



function initSettings() {
    const tabs = document.querySelectorAll('.tab-btn');
    const panes = document.querySelectorAll('.tab-pane');

    tabs.forEach(tab => {
        tab.onclick = () => {
            const target = tab.getAttribute('data-tab');
            tabs.forEach(t => t.classList.remove('bg-secondary', 'text-on-secondary'));
            tab.classList.add('bg-secondary', 'text-on-secondary');
            panes.forEach(p => p.classList.add('hidden'));
            document.getElementById(`content-${target}`).classList.remove('hidden');
            if (target === 'users') renderUsersTable();
        };
    });

    // --- TAB: PERFIL ---
    const fProf = document.getElementById('form-profile');
    if (fProf) {
        document.getElementById('prof-name').value = AppState.user.full_name;
        document.getElementById('prof-email').value = AppState.user.email;
        document.getElementById('prof-job').value = AppState.user.job_title;
        document.getElementById('prof-phone').value = AppState.user.phone || '';
        document.getElementById('profile-preview').src = AppState.user.avatar_url || '/assets/images/avatar1.jpg';

        fProf.onsubmit = async (e) => {
            e.preventDefault();
            const updates = {
                full_name: document.getElementById('prof-name').value.trim(),
                email:     document.getElementById('prof-email').value.trim(),
                phone:     document.getElementById('prof-phone').value.trim(),
                job_title: document.getElementById('prof-job').value.trim(),
                updated_at: new Date().toISOString()
            };

            const isUUID = (val) => val && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val);

            if (isUUID(AppState.user.id)) {
                // Usuário real do banco: salvar na tabela profiles
                const { error } = await supabase
                    .from('profiles')
                    .update(updates)
                    .eq('id', AppState.user.id);
                if (error) {
                    console.error('Erro ao salvar perfil:', error);
                    return alert('Erro ao salvar perfil: ' + error.message);
                }
            }

            // Atualizar memória e sessão salva no localStorage
            Object.assign(AppState.user, updates);
            AppState.session.user = AppState.user;
            localStorage.setItem('sb-session', JSON.stringify(AppState.session));
            updateUI();
            showToast('Perfil atualizado com sucesso!');
        };
        
        document.getElementById('avatar-upload').onchange = async (e) => {
            const file = e.target.files[0];
            if (!file) return;
            try {
                showToast('Enviando foto...');
                const fileName = `avatar-${AppState.user.id}-${Date.now()}`;
                const { data, error } = await supabase.storage.from('avatars').upload(fileName, file);
                if (error) throw error;
                const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(data.path);
                AppState.user.avatar_url = publicUrl;
                document.getElementById('profile-preview').src = publicUrl;
                updateUI();
                showToast('Foto atualizada!');
            } catch (err) { alert("Erro avatar: " + err.message); }
        };
    }

    // --- TAB: SISTEMA ---
    const fSys = document.getElementById('form-system');
    if (fSys) {
        document.getElementById('sys-title').value = AppState.system.title;
        document.getElementById('sys-subtitle').value = AppState.system.subtitle;
        
        const logoUpload = document.getElementById('sys-logo-upload');
        if (logoUpload) {
            logoUpload.onchange = async (e) => {
                const file = e.target.files[0];
                if (!file) return;

                // Validação básica de tipo e tamanho (max 2MB)
                if (!file.type.startsWith('image/')) {
                    return alert('Por favor, selecione um arquivo de imagem (JPG, PNG, GIF, WebP).');
                }
                if (file.size > 2 * 1024 * 1024) {
                    return alert('A imagem deve ter no máximo 2MB.');
                }

                try {
                    showToast('Enviando logo...');
                    const ext = file.name.split('.').pop();
                    const fileName = `logo-${Date.now()}.${ext}`;

                    // Tenta fazer upload no bucket 'logos' (criado via SQL abaixo)
                    const { data: uploadData, error: uploadError } = await supabase.storage
                        .from('logos')
                        .upload(fileName, file, { upsert: true, contentType: file.type });

                    if (uploadError) throw uploadError;

                    const { data: urlData } = supabase.storage.from('logos').getPublicUrl(uploadData.path);
                    const publicUrl = urlData.publicUrl;

                    // Salvar a URL no banco
                    const { error: dbError } = await supabase
                        .from('system_settings')
                        .upsert({ id: 1, logo_url: publicUrl }, { onConflict: 'id' });

                    if (dbError) throw dbError;

                    // Atualizar estado e preview
                    AppState.system.logo_url = publicUrl;
                    const preview = document.getElementById('sys-logo-preview');
                    if (preview) {
                        preview.innerHTML = `<img src="${publicUrl}" class="w-16 h-16 object-contain rounded-lg" alt="Logo">`;
                    }
                    updateUI();
                    showToast('Logo atualizado com sucesso!');
                } catch (err) {
                    console.error('Erro no upload do logo:', err);
                    alert('Erro ao enviar logo: ' + err.message);
                }
            };
        }

        fSys.onsubmit = async (e) => {
            e.preventDefault();
            showToast('Salvando...');
            
            const updates = {
                id: 1, // Garantir ID 1 para ser o registro único do sistema
                title: document.getElementById('sys-title').value,
                subtitle: document.getElementById('sys-subtitle').value,
                updated_at: new Date()
            };
            
            const { error } = await supabase.from('system_settings').upsert(updates, { onConflict: 'id' });
            
            if (error) {
                console.error("Erro no upsert:", error);
                return alert("Erro ao salvar: " + error.message);
            }
            
            AppState.system = { ...AppState.system, ...updates };
            updateUI();
            // Sincronizar título no header e sidebar imediatamente
            const appTitleEl = document.getElementById('app-title');
            const appSubtitleEl = document.getElementById('app-subtitle');
            if (appTitleEl) appTitleEl.textContent = AppState.system.title;
            if (appSubtitleEl) appSubtitleEl.textContent = AppState.system.subtitle;
            showToast('Configurações salvas com sucesso!');
        };
    }

    // --- TAB: AJUDA ---
    const fHelp = document.getElementById('form-help');
    if (fHelp) {
        document.getElementById('help-display').value = AppState.help.display_text;
        document.getElementById('help-email-val').value = AppState.help.email;
        document.getElementById('help-phone-val').value = AppState.help.phone;
        document.getElementById('help-site-val').value = AppState.help.website;
        fHelp.onsubmit = async (e) => {
            e.preventDefault();
            const updates = {
                display_text: document.getElementById('help-display').value,
                email: document.getElementById('help-email-val').value,
                phone: document.getElementById('help-phone-val').value,
                website: document.getElementById('help-site-val').value,
                updated_at: new Date()
            };
            const { data: existing } = await supabase.from('help_info').select('id').maybeSingle();
            let error;
            if (existing) ({ error } = await supabase.from('help_info').update(updates).eq('id', existing.id));
            else ({ error } = await supabase.from('help_info').insert([updates]));
            if (error) return alert("Erro ajuda: " + error.message);
            AppState.help = { ...AppState.help, ...updates };
            showToast('Ajuda atualizada!');
        };
    }

    // --- TAB: USUÁRIOS & CATEGORIAS ---
    const btnAddUser = document.getElementById('btn-add-user');
    if (btnAddUser) btnAddUser.onclick = () => openUserModal();

    const fCat = document.getElementById('form-category');
    if (fCat) {
        renderCategoryList();
        fCat.onsubmit = (e) => {
            e.preventDefault();
            const name = document.getElementById('cat-name').value.trim();
            if (!name) return;
            AppState.categories.push({ id: Date.now().toString(), name, color: 'secondary' });
            document.getElementById('cat-name').value = '';
            renderCategoryList();
            showToast('Categoria adicionada!');
        };
    }

    const fStatus = document.getElementById('form-status');
    if (fStatus) {
        renderStatusList();
        fStatus.onsubmit = (e) => {
            e.preventDefault();
            const name = document.getElementById('status-name').value.trim();
            if (!name) return;
            AppState.statusTypes.push({ id: Date.now().toString(), name, type: 'secondary' });
            document.getElementById('status-name').value = '';
            renderStatusList();
            showToast('Status adicionado!');
        };
    }

    const btnPurge = document.getElementById('btn-purge-tickets');
    if (btnPurge) {
        btnPurge.onclick = () => {
            if (!confirm('Deseja realmente apagar TODOS os chamados?')) return;
            AppState.tickets = [];
            showToast('Todos os chamados excluídos!', 'error');
            if (AppState.currentView === 'dashboard') navigateTo('dashboard');
        };
    }
}


function renderUsersTable() {
    const tbody = document.getElementById('users-list-tbody');
    if (!tbody) return;
    tbody.innerHTML = AppState.users.map(u => `
        <tr class="text-body-sm text-on-surface hover:bg-surface-container-lowest transition-colors">
            <td class="p-md">
                <div class="flex items-center gap-sm">
                    <img src="${u.avatar_url || '/assets/images/avatar1.jpg'}" class="w-8 h-8 rounded-full object-cover border border-outline-variant">
                    <div>
                        <p class="font-bold">${u.full_name}</p>
                        <p class="text-[11px] text-on-surface-variant">${u.email}</p>
                    </div>
                </div>
            </td>
            <td class="p-md">${u.job_title || '-'}</td>
            <td class="p-md">
                <span class="px-2 py-1 rounded-full text-[10px] font-bold ${
                    u.role === 'Administrador' ? 'bg-secondary/10 text-secondary' :
                    u.role === 'T\u00e9cnico' ? 'bg-[#f59e0b]/10 text-[#f59e0b]' : 'bg-surface-variant text-on-surface-variant'
                }">${u.role}</span>
            </td>
            <td class="p-md text-right">
                <button class="text-secondary hover:underline mr-sm text-[12px]" onclick="window._editUser('${u.id}')">Editar</button>
                <button class="text-error hover:underline text-[12px]" onclick="window._deleteUser('${u.id}')">Excluir</button>
            </td>
        </tr>
    `).join('');
}

function renderCategoryList() {
    const container = document.getElementById('list-categories');
    if (!container) return;
    container.innerHTML = AppState.categories.map(c => `
        <span class="flex items-center gap-xs bg-secondary/10 text-secondary text-[12px] px-sm py-xs rounded-full">
            ${c.name}
            <button onclick="window._deleteCategory('${c.id}')" class="material-symbols-outlined text-[14px] hover:text-error">close</button>
        </span>
    `).join('');
}

function renderStatusList() {
    const container = document.getElementById('list-status');
    if (!container) return;
    container.innerHTML = AppState.statusTypes.map(s => `
        <div class="flex items-center justify-between bg-surface-container-low rounded-lg px-md py-sm">
            <span class="text-body-sm">${s.name}</span>
            <button onclick="window._deleteStatus('${s.id}')" class="material-symbols-outlined text-[18px] text-error hover:opacity-70">delete</button>
        </div>
    `).join('');
}

// Expor funções globalmente para acesso via onclick inline
window._editUser = function(id) { openUserModal(id); };
window._deleteUser = async function(id) {
    if (!confirm('Excluir este usuário?')) return;
    const isUUID = (val) => val && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val);
    if (isUUID(id)) {
        const { error } = await supabase.from('profiles').delete().eq('id', id);
        if (error) return alert('Erro ao excluir usuário: ' + error.message);
    }
    AppState.users = AppState.users.filter(u => u.id !== id);
    renderUsersTable();
    showToast('Usuário excluído!', 'error');
};
window._deleteCategory = async function(id) {
    const isUUID = (val) => val && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val);
    if (isUUID(id)) await supabase.from('categories').delete().eq('id', id);
    AppState.categories = AppState.categories.filter(c => c.id !== id);
    renderCategoryList();
    showToast('Categoria removida!');
};
window._deleteStatus = async function(id) {
    const isUUID = (val) => val && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val);
    if (isUUID(id)) await supabase.from('status_types').delete().eq('id', id);
    AppState.statusTypes = AppState.statusTypes.filter(s => s.id !== id);
    renderStatusList();
    showToast('Status removido!');
};

function openUserModal(id = null) {
    const user = id ? AppState.users.find(u => u.id === id) : null;
    const isEdit = !!user;

    const div = document.createElement('div');
    div.id = 'user-modal-container';
    div.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;background:rgba(0,0,0,0.5);z-index:200;display:flex;align-items:center;justify-content:center;';
    div.innerHTML = `
        <div style="background:var(--color-surface,#fff);border-radius:12px;box-shadow:0 20px 60px rgba(0,0,0,0.3);border:1px solid rgba(0,0,0,0.1);width:100%;max-width:560px;margin:16px;animation:fadeIn 0.2s ease-out forwards;">
            <div class="p-lg border-b border-outline-variant/30 flex justify-between items-center">
                <h3 class="text-lg font-semibold text-on-surface">${isEdit ? 'Editar Usuário' : 'Novo Usuário'}</h3>
                <button id="close-user-modal" class="material-symbols-outlined text-on-surface-variant hover:text-on-surface">close</button>
            </div>
            <form id="form-user" class="p-lg space-y-md">
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-md">
                    <div>
                        <label class="block text-xs uppercase tracking-wider font-bold text-[11px] text-on-surface-variant mb-xs">Nome Completo *</label>
                        <input type="text" id="u-name" required value="${user?.full_name || ''}" class="w-full bg-surface-container-low border border-outline-variant rounded-lg py-sm px-md text-body-md focus:border-secondary outline-none">
                    </div>
                    <div>
                        <label class="block text-xs uppercase tracking-wider font-bold text-[11px] text-on-surface-variant mb-xs">E-mail *</label>
                        <input type="email" id="u-email" required value="${user?.email || ''}" class="w-full bg-surface-container-low border border-outline-variant rounded-lg py-sm px-md text-body-md focus:border-secondary outline-none">
                    </div>
                    <div>
                        <label class="block text-xs uppercase tracking-wider font-bold text-[11px] text-on-surface-variant mb-xs">Cargo / Função</label>
                        <input type="text" id="u-job" value="${user?.job_title || ''}" class="w-full bg-surface-container-low border border-outline-variant rounded-lg py-sm px-md text-body-md focus:border-secondary outline-none">
                    </div>
                    <div>
                        <label class="block text-xs uppercase tracking-wider font-bold text-[11px] text-on-surface-variant mb-xs">Nível de Acesso</label>
                        <select id="u-role" class="w-full bg-surface-container-low border border-outline-variant rounded-lg py-sm px-md text-body-md focus:border-secondary outline-none">
                            <option value="Cliente" ${user?.role === 'Cliente' ? 'selected' : ''}>Cliente</option>
                            <option value="Técnico" ${user?.role === 'Técnico' ? 'selected' : ''}>Técnico</option>
                            <option value="Administrador" ${user?.role === 'Administrador' ? 'selected' : ''}>Administrador</option>
                        </select>
                    </div>
                    ${!isEdit ? `
                    <div class="sm:col-span-2">
                        <label class="block text-xs uppercase tracking-wider font-bold text-[11px] text-on-surface-variant mb-xs">Senha Inicial *</label>
                        <input type="password" id="u-password" required placeholder="Mínimo 6 caracteres" class="w-full bg-surface-container-low border border-outline-variant rounded-lg py-sm px-md text-body-md focus:border-secondary outline-none">
                    </div>` : ''}
                </div>
                <div class="flex justify-end gap-sm pt-md">
                    <button type="button" id="cancel-user-modal" class="px-lg py-sm rounded-lg border border-outline-variant text-on-surface-variant hover:bg-surface-container-low font-bold">Cancelar</button>
                    <button type="submit" class="bg-secondary text-on-secondary px-lg py-sm rounded-lg font-bold hover:bg-secondary-container transition-all">${isEdit ? 'Salvar Alterações' : 'Cadastrar Usuário'}</button>
                </div>
            </form>
        </div>
    `;
    document.body.appendChild(div);

    const close = () => div.remove();
    document.getElementById('close-user-modal').onclick = close;
    document.getElementById('cancel-user-modal').onclick = close;
    div.onclick = (e) => { if (e.target === div) close(); };

    document.getElementById('form-user').onsubmit = async (e) => {
        e.preventDefault();
        const submitBtn = e.target.querySelector('button[type="submit"]');
        if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Salvando...'; }

        const name     = document.getElementById('u-name').value.trim();
        const email    = document.getElementById('u-email').value.trim();
        const job      = document.getElementById('u-job').value.trim();
        const role     = document.getElementById('u-role').value;
        const password = document.getElementById('u-password')?.value || '';

        const isUUID = (val) => val && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val);

        try {
            if (isEdit) {
                // Editar usuário existente
                const updates = { full_name: name, email, job_title: job, role, updated_at: new Date().toISOString() };
                if (isUUID(id)) {
                    const { error } = await supabase.from('profiles').update(updates).eq('id', id);
                    if (error) throw error;
                }
                const idx = AppState.users.findIndex(u => u.id === id);
                if (idx >= 0) AppState.users[idx] = { ...AppState.users[idx], ...updates };
                showToast('Usuário atualizado!');
            } else {
                // Criar novo usuário na tabela profiles (sem criar auth)
                // Gerar UUID no cliente para garantir consistência
                const newId = crypto.randomUUID ? crypto.randomUUID() : Date.now().toString();
                const newUser = {
                    id: newId,
                    full_name: name,
                    email,
                    job_title: job,
                    role,
                    avatar_url: '',
                    updated_at: new Date().toISOString()
                };
                if (isUUID(newId)) {
                    const { error } = await supabase.from('profiles').insert([newUser]);
                    if (error) throw error;
                }
                AppState.users.push(newUser);
                showToast('Usuário cadastrado!');
            }

            close();
            renderUsersTable();
        } catch (err) {
            console.error('Erro ao salvar usuário:', err);
            alert('Erro ao salvar usuário: ' + err.message);
        } finally {
            if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = isEdit ? 'Salvar Alterações' : 'Cadastrar Usuário'; }
        }
    };
}


function renderHelpInfo() {
    document.getElementById('help-text').textContent = AppState.help.display_text;
    const update = (id, val, linkId) => {
        const el = document.getElementById(id);
        if (val) { el.classList.remove('hidden'); el.querySelector(linkId || 'span').textContent = val; if(linkId === 'a') el.querySelector('a').href = (id.includes('email') ? 'mailto:' : '') + val; }
        else el.classList.add('hidden');
    };
    update('help-email', AppState.help.email, 'a');
    update('help-site', AppState.help.website, 'a');
    update('help-phone', AppState.help.phone);
}

function filterTickets(term) {
    const filtered = AppState.tickets.filter(t => t.title.toLowerCase().includes(term));
    renderTicketsTable(filtered);
}

function showToast(msg, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `fixed bottom-md right-md ${type === 'error' ? 'bg-error' : 'bg-secondary'} text-white px-lg py-sm rounded-lg shadow-xl animate-fadeIn z-[200] font-bold`;
    toast.textContent = msg;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

async function handleLogin(e) {
    e.preventDefault();
    const emailVal = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const errorEl  = document.getElementById('login-error');
    const btnLogin = document.getElementById('login-form')?.querySelector('button[type="submit"]');

    if (btnLogin) { btnLogin.disabled = true; btnLogin.textContent = 'Entrando...'; }

    // Aceita login 'admin' ou email real; senha deve ser 'admin'
    if (password !== 'admin') {
        errorEl.classList.remove('hidden');
        if (btnLogin) { btnLogin.disabled = false; btnLogin.textContent = 'Entrar'; }
        return;
    }

    // Buscar usuário na tabela profiles do banco
    let user = null;
    try {
        let query = supabase.from('profiles').select('*');
        if (emailVal === 'admin') {
            // Login pelo alias 'admin' → pega o primeiro Administrador
            query = query.eq('role', 'Administrador').limit(1);
        } else {
            query = query.eq('email', emailVal).limit(1);
        }
        const { data } = await query.maybeSingle();
        user = data;
    } catch (err) {
        console.warn('Erro ao buscar usuário no banco, usando mock:', err.message);
    }

    // Fallback: tentar no AppState.users (lista carregada do banco)
    if (!user) {
        user = AppState.users.find(u => (u.email === emailVal || emailVal === 'admin') );
    }

    if (btnLogin) { btnLogin.disabled = false; btnLogin.textContent = 'Entrar'; }

    if (user) {
        AppState.session = { user, token: 'mock-token' };
        localStorage.setItem('sb-session', JSON.stringify(AppState.session));
        AppState.user = user;
        showLayout();
        // Carregar chamados após login
        loadTickets().catch(err => console.warn('Tickets offline:', err.message));
    } else {
        errorEl.classList.remove('hidden');
    }
}

function handleLogout() {
    localStorage.removeItem('sb-session');
    window.location.reload();
}
