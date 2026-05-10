export const SettingsView = (userRole) => {
    const isAdmin = userRole === 'Administrador';
    const isTech = userRole === 'Técnico';
    const isClient = userRole === 'Cliente';

    return `
    <div class="max-w-6xl mx-auto animate-fadeIn pb-xl">
        <div class="mb-lg flex flex-col md:flex-row md:items-end justify-between gap-md">
            <div>
                <h2 class="font-display-lg text-display-lg text-on-surface">Configurações</h2>
                <p class="text-on-surface-variant font-body-md text-body-md">Gerencie suas preferências e os parâmetros do sistema.</p>
            </div>
            
            <!-- Tabs Menu -->
            <div class="flex bg-surface-container-low p-1 rounded-xl border border-outline-variant/30 overflow-x-auto no-scrollbar gap-[2px]">
                <button data-tab="profile" class="tab-btn px-sm py-xs rounded-lg text-[11px] font-bold transition-all bg-secondary text-on-secondary shadow-sm whitespace-nowrap">Meu Perfil</button>
                <button data-tab="security" class="tab-btn px-sm py-xs rounded-lg text-[11px] font-bold transition-all text-on-surface-variant hover:bg-surface-container whitespace-nowrap">Segurança</button>
                
                ${isAdmin ? `
                    <button data-tab="system" class="tab-btn px-sm py-xs rounded-lg text-[11px] font-bold transition-all text-on-surface-variant hover:bg-surface-container whitespace-nowrap">Sistema</button>
                    <button data-tab="users" class="tab-btn px-sm py-xs rounded-lg text-[11px] font-bold transition-all text-on-surface-variant hover:bg-surface-container whitespace-nowrap">Usuários</button>
                    <button data-tab="params" class="tab-btn px-sm py-xs rounded-lg text-[11px] font-bold transition-all text-on-surface-variant hover:bg-surface-container whitespace-nowrap">Categorias & Status</button>
                    <button data-tab="help" class="tab-btn px-sm py-xs rounded-lg text-[11px] font-bold transition-all text-on-surface-variant hover:bg-surface-container whitespace-nowrap">Ajuda</button>
                    <button data-tab="tickets-mgmt" class="tab-btn px-sm py-xs rounded-lg text-[11px] font-bold transition-all text-on-surface-variant hover:bg-surface-container whitespace-nowrap">Chamados</button>
                ` : ''}
            </div>
        </div>

        <div id="tab-content" class="mt-md">
            <!-- TAB: PROFILE -->
            <div id="content-profile" class="tab-pane">
                <div class="bg-surface rounded-xl p-lg shadow-sm border border-outline-variant/30">
                    <h3 class="font-title-sm text-on-surface mb-lg flex items-center gap-sm">
                        <span class="material-symbols-outlined text-secondary">person_edit</span>
                        Informações do Perfil
                    </h3>
                    
                    <form id="form-profile" class="grid grid-cols-1 md:grid-cols-3 gap-lg">
                        <div class="flex flex-col items-center gap-md">
                            <div class="relative group">
                                <img id="profile-preview" src="/assets/images/avatar1.jpg" class="w-32 h-32 rounded-full object-cover border-4 border-outline-variant group-hover:border-secondary transition-all">
                                <label for="avatar-upload" class="absolute inset-0 flex items-center justify-center bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                                    <span class="material-symbols-outlined">photo_camera</span>
                                </label>
                                <input type="file" id="avatar-upload" class="hidden" accept="image/*">
                            </div>
                            <p class="text-[10px] text-on-surface-variant text-center">Clique para alterar sua foto.<br>Formatos: JPG, PNG (Max 2MB)</p>
                        </div>
                        
                        <div class="md:col-span-2 space-y-md">
                            <div class="grid grid-cols-1 sm:grid-cols-2 gap-md">
                                <div>
                                    <label class="block font-label-caps text-[11px] text-on-surface-variant mb-xs">Nome Completo</label>
                                    <input type="text" id="prof-name" class="w-full bg-surface-container-low border border-outline-variant rounded-lg py-sm px-md text-body-md focus:border-secondary outline-none transition-all">
                                </div>
                                <div>
                                    <label class="block font-label-caps text-[11px] text-on-surface-variant mb-xs">Cargo / Função</label>
                                    <input type="text" id="prof-job" ${!isAdmin ? 'disabled' : ''} class="w-full bg-surface-container-low border border-outline-variant rounded-lg py-sm px-md text-body-md focus:border-secondary outline-none transition-all disabled:opacity-50">
                                </div>
                            </div>
                            <div class="grid grid-cols-1 sm:grid-cols-2 gap-md">
                                <div>
                                    <label class="block font-label-caps text-[11px] text-on-surface-variant mb-xs">E-mail</label>
                                    <input type="email" id="prof-email" class="w-full bg-surface-container-low border border-outline-variant rounded-lg py-sm px-md text-body-md focus:border-secondary outline-none transition-all">
                                </div>
                                <div>
                                    <label class="block font-label-caps text-[11px] text-on-surface-variant mb-xs">Telefone</label>
                                    <input type="text" id="prof-phone" placeholder="(00) 00000-0000" class="w-full bg-surface-container-low border border-outline-variant rounded-lg py-sm px-md text-body-md focus:border-secondary outline-none transition-all">
                                </div>
                            </div>
                            <div class="flex justify-end pt-md">
                                <button type="submit" class="bg-secondary text-on-secondary px-lg py-sm rounded-lg font-bold hover:bg-secondary-container transition-all">Salvar Alterações</button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>

            <!-- TAB: SECURITY -->
            <div id="content-security" class="tab-pane hidden">
                <div class="bg-surface rounded-xl p-lg shadow-sm border border-outline-variant/30 max-w-2xl">
                    <h3 class="font-title-sm text-on-surface mb-lg flex items-center gap-sm">
                        <span class="material-symbols-outlined text-secondary">security</span>
                        Segurança e Acesso
                    </h3>
                    <form id="form-security" class="space-y-md">
                        <div>
                            <label class="block font-label-caps text-[11px] text-on-surface-variant mb-xs">Senha Atual</label>
                            <input type="password" id="pass-current" class="w-full bg-surface-container-low border border-outline-variant rounded-lg py-sm px-md text-body-md focus:border-secondary outline-none transition-all">
                        </div>
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-md">
                            <div>
                                <label class="block font-label-caps text-[11px] text-on-surface-variant mb-xs">Nova Senha</label>
                                <input type="password" id="pass-new" class="w-full bg-surface-container-low border border-outline-variant rounded-lg py-sm px-md text-body-md focus:border-secondary outline-none transition-all">
                            </div>
                            <div>
                                <label class="block font-label-caps text-[11px] text-on-surface-variant mb-xs">Confirmar Nova Senha</label>
                                <input type="password" id="pass-confirm" class="w-full bg-surface-container-low border border-outline-variant rounded-lg py-sm px-md text-body-md focus:border-secondary outline-none transition-all">
                            </div>
                        </div>
                        <div class="flex justify-end pt-md">
                            <button type="submit" class="bg-primary text-on-primary px-lg py-sm rounded-lg font-bold hover:opacity-90 transition-all">Trocar Senha</button>
                        </div>
                    </form>
                </div>
            </div>

            ${isAdmin ? `
            <!-- TAB: SYSTEM -->
            <div id="content-system" class="tab-pane hidden">
                <div class="bg-surface rounded-xl p-lg shadow-sm border border-outline-variant/30">
                    <h3 class="font-title-sm text-on-surface mb-lg flex items-center gap-sm">
                        <span class="material-symbols-outlined text-secondary">settings_suggest</span>
                        Personalização do Sistema
                    </h3>
                    <form id="form-system" class="space-y-lg">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-lg">
                            <div class="space-y-md">
                                <div>
                                    <label class="block font-label-caps text-[11px] text-on-surface-variant mb-xs">Título do Sistema</label>
                                    <input type="text" id="sys-title" class="w-full bg-surface-container-low border border-outline-variant rounded-lg py-sm px-md text-body-md focus:border-secondary outline-none transition-all">
                                </div>
                                <div>
                                    <label class="block font-label-caps text-[11px] text-on-surface-variant mb-xs">Subtítulo</label>
                                    <input type="text" id="sys-subtitle" class="w-full bg-surface-container-low border border-outline-variant rounded-lg py-sm px-md text-body-md focus:border-secondary outline-none transition-all">
                                </div>
                            </div>
                            <div class="flex flex-col items-center justify-center p-md border-2 border-dashed border-outline-variant/30 rounded-xl bg-surface-container-lowest">
                                <label class="block font-label-caps text-[11px] text-on-surface-variant mb-md">Logotipo do Sistema</label>
                                <div id="sys-logo-preview" class="w-16 h-16 bg-secondary rounded-lg flex items-center justify-center mb-md">
                                    <span class="material-symbols-outlined text-on-secondary text-[32px]">support_agent</span>
                                </div>
                                <label for="sys-logo-upload" class="bg-surface-container text-primary px-md py-sm rounded-lg font-bold text-body-sm cursor-pointer hover:bg-outline-variant/30 transition-all">Alterar Imagem</label>
                                <input type="file" id="sys-logo-upload" class="hidden" accept="image/*">
                            </div>
                        </div>
                        <div class="flex justify-end">
                            <button type="submit" class="bg-secondary text-on-secondary px-lg py-sm rounded-lg font-bold hover:bg-secondary-container transition-all">Salvar Configurações</button>
                        </div>
                    </form>
                </div>
            </div>

            <!-- TAB: USERS -->
            <div id="content-users" class="tab-pane hidden">
                <div class="bg-surface rounded-xl shadow-sm border border-outline-variant/30 overflow-hidden">
                    <div class="p-lg border-b border-outline-variant/30 flex justify-between items-center">
                        <h3 class="font-title-sm text-on-surface">Gestão de Usuários</h3>
                        <button id="btn-add-user" class="bg-secondary text-on-secondary px-md py-sm rounded-lg font-bold text-body-sm flex items-center gap-sm">
                            <span class="material-symbols-outlined text-[18px]">person_add</span> Novo Usuário
                        </button>
                    </div>
                    <div class="overflow-x-auto">
                        <table class="w-full text-left">
                            <thead class="bg-surface-container-low">
                                <tr class="text-label-caps font-bold text-on-surface-variant">
                                    <th class="p-md">Usuário</th>
                                    <th class="p-md">Cargo</th>
                                    <th class="p-md">Nível</th>
                                    <th class="p-md text-right">Ações</th>
                                </tr>
                            </thead>
                            <tbody id="users-list-tbody" class="divide-y divide-outline-variant/20">
                                <!-- Rendered via JS -->
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <!-- TAB: PARAMS (CATEGORIES & STATUS) -->
            <div id="content-params" class="tab-pane hidden">
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-lg">
                    <!-- Categorias -->
                    <div class="bg-surface rounded-xl p-lg border border-outline-variant/30 shadow-sm">
                        <h4 class="font-title-sm mb-md">Categorias</h4>
                        <form id="form-category" class="flex gap-sm mb-md">
                            <input type="text" id="cat-name" placeholder="Nova Categoria" class="flex-1 bg-surface-container-low border border-outline-variant rounded-lg px-md py-sm text-body-sm outline-none focus:border-secondary">
                            <button type="submit" class="bg-secondary text-on-secondary p-sm rounded-lg hover:bg-secondary-container transition-all">
                                <span class="material-symbols-outlined">add</span>
                            </button>
                        </form>
                        <div id="list-categories" class="flex flex-wrap gap-xs"></div>
                    </div>
                    <!-- Status -->
                    <div class="bg-surface rounded-xl p-lg border border-outline-variant/30 shadow-sm">
                        <h4 class="font-title-sm mb-md">Status de Chamados</h4>
                        <form id="form-status" class="flex gap-sm mb-md">
                            <input type="text" id="status-name" placeholder="Novo Status" class="flex-1 bg-surface-container-low border border-outline-variant rounded-lg px-md py-sm text-body-sm outline-none focus:border-secondary">
                            <button type="submit" class="bg-secondary text-on-secondary p-sm rounded-lg hover:bg-secondary-container transition-all">
                                <span class="material-symbols-outlined">add</span>
                            </button>
                        </form>
                        <div id="list-status" class="space-y-xs"></div>
                    </div>
                </div>
            </div>

            <!-- TAB: HELP -->
            <div id="content-help" class="tab-pane hidden">
                <div class="bg-surface rounded-xl p-lg shadow-sm border border-outline-variant/30 max-w-3xl">
                    <h3 class="font-title-sm text-on-surface mb-lg">Informações de Ajuda</h3>
                    <form id="form-help" class="space-y-md">
                        <div>
                            <label class="block font-label-caps text-[11px] text-on-surface-variant mb-xs">Texto Curto (Máx 20 carac.)</label>
                            <input type="text" id="help-display" maxlength="20" class="w-full bg-surface-container-low border border-outline-variant rounded-lg py-sm px-md text-body-md focus:border-secondary outline-none">
                        </div>
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-md">
                            <div>
                                <label class="block font-label-caps text-[11px] text-on-surface-variant mb-xs">E-mail de Suporte</label>
                                <input type="email" id="help-email-val" class="w-full bg-surface-container-low border border-outline-variant rounded-lg py-sm px-md text-body-md focus:border-secondary outline-none">
                            </div>
                            <div>
                                <label class="block font-label-caps text-[11px] text-on-surface-variant mb-xs">Telefone</label>
                                <input type="text" id="help-phone-val" class="w-full bg-surface-container-low border border-outline-variant rounded-lg py-sm px-md text-body-md focus:border-secondary outline-none">
                            </div>
                        </div>
                        <div>
                            <label class="block font-label-caps text-[11px] text-on-surface-variant mb-xs">Site / Base de Conhecimento</label>
                            <input type="url" id="help-site-val" class="w-full bg-surface-container-low border border-outline-variant rounded-lg py-sm px-md text-body-md focus:border-secondary outline-none">
                        </div>
                        <div class="flex justify-end">
                            <button type="submit" class="bg-secondary text-on-secondary px-lg py-sm rounded-lg font-bold hover:bg-secondary-container transition-all">Salvar Ajuda</button>
                        </div>
                    </form>
                </div>
            </div>

            <!-- TAB: TICKETS MANAGEMENT -->
            <div id="content-tickets-mgmt" class="tab-pane hidden">
                <div class="bg-surface rounded-xl p-lg shadow-sm border border-outline-variant/30 max-w-2xl border-l-4 border-l-error">
                    <h3 class="font-title-sm text-error mb-md flex items-center gap-sm">
                        <span class="material-symbols-outlined">warning</span>
                        Zona de Perigo: Chamados
                    </h3>
                    <p class="text-body-sm text-on-surface-variant mb-lg">Atenção: A exclusão de todos os chamados é permanente e não pode ser desfeita.</p>
                    
                    <button id="btn-purge-tickets" class="bg-error text-on-error px-lg py-md rounded-lg font-bold flex items-center gap-sm hover:opacity-90 transition-all">
                        <span class="material-symbols-outlined">delete_forever</span> Excluir Todos os Chamados
                    </button>
                </div>
            </div>
            ` : ''}
        </div>
    </div>
    `;
};
