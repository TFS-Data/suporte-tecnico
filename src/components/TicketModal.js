export const TicketModal = (ticket, categories, statusTypes, supportUsers, userRole) => {
    const isNew = !ticket.id;
    const isAdmin = userRole === 'Administrador';
    const isTech = userRole === 'Técnico';
    const canEditPriority = isAdmin; // Suporte não pode alterar prioridade
    
    return `
    <div id="ticket-modal-overlay" style="position:fixed;top:0;left:0;width:100vw;height:100vh;z-index:100;" class="bg-primary/60 backdrop-blur-sm flex items-center justify-center p-md animate-fadeIn">
        <div class="bg-surface w-full max-w-2xl rounded-xl shadow-2xl overflow-hidden border border-outline-variant/30">
            <header class="bg-surface-container-low p-lg border-b border-outline-variant/30 flex justify-between items-center">
                <div>
                    <h3 class="text-3xl font-bold text-[20px] text-primary">${isNew ? 'Abrir Novo Chamado' : `Editar Chamado ${ticket.id}`}</h3>
                    ${!isNew ? `<p class="text-[11px] text-on-surface-variant mt-1">Aberto em: ${new Date(ticket.created_at).toLocaleString()}</p>` : ''}
                </div>
                <button id="close-modal" class="p-sm hover:bg-surface-variant rounded-full transition-colors">
                    <span class="material-symbols-outlined">close</span>
                </button>
            </header>

            <form id="form-ticket" class="p-lg space-y-lg">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-lg">
                    <div class="md:col-span-2">
                        <label class="block text-xs uppercase tracking-wider font-bold text-[11px] text-on-surface-variant mb-xs">Título do Chamado</label>
                        <input type="text" id="tk-title" required value="${ticket.title || ''}" class="w-full bg-surface-container-low border border-outline-variant rounded-lg py-sm px-md text-base focus:border-secondary outline-none">
                    </div>
                    
                    <div>
                        <label class="block text-xs uppercase tracking-wider font-bold text-[11px] text-on-surface-variant mb-xs">Categoria</label>
                        <select id="tk-category" class="w-full bg-surface-container-low border border-outline-variant rounded-lg py-sm px-md text-base focus:border-secondary outline-none">
                            ${categories.map(c => `<option value="${c.id}" ${ticket.category_id === c.id ? 'selected' : ''}>${c.name}</option>`).join('')}
                        </select>
                    </div>

                    <div>
                        <label class="block text-xs uppercase tracking-wider font-bold text-[11px] text-on-surface-variant mb-xs">Prioridade</label>
                        <select id="tk-priority" ${!canEditPriority ? 'disabled' : ''} class="w-full bg-surface-container-low border border-outline-variant rounded-lg py-sm px-md text-base focus:border-secondary outline-none disabled:opacity-50">
                            <option value="Baixa" ${ticket.priority === 'Baixa' ? 'selected' : ''}>Baixa</option>
                            <option value="Média" ${ticket.priority === 'Média' ? 'selected' : ''}>Média</option>
                            <option value="Alta" ${ticket.priority === 'Alta' ? 'selected' : ''}>Alta</option>
                        </select>
                    </div>

                    <div>
                        <label class="block text-xs uppercase tracking-wider font-bold text-[11px] text-on-surface-variant mb-xs">Status</label>
                        <select id="tk-status" class="w-full bg-surface-container-low border border-outline-variant rounded-lg py-sm px-md text-base focus:border-secondary outline-none">
                            ${statusTypes.map(s => `<option value="${s.id}" ${ticket.status_id === s.id ? 'selected' : ''}>${s.name}</option>`).join('')}
                        </select>
                    </div>

                    <div>
                        <label class="block text-xs uppercase tracking-wider font-bold text-[11px] text-on-surface-variant mb-xs">Atribuído a</label>
                        <select id="tk-assigned" class="w-full bg-surface-container-low border border-outline-variant rounded-lg py-sm px-md text-base focus:border-secondary outline-none">
                            <option value="">Não atribuído</option>
                            ${supportUsers.map(u => `<option value="${u.id}" ${ticket.assigned_to_id === u.id ? 'selected' : ''}>${u.full_name}</option>`).join('')}
                        </select>
                    </div>
                </div>

                <div>
                    <label class="block text-xs uppercase tracking-wider font-bold text-[11px] text-on-surface-variant mb-xs">Descrição do Problema / Ações Realizadas</label>
                    <textarea id="tk-desc" rows="4" class="w-full bg-surface-container-low border border-outline-variant rounded-lg py-sm px-md text-base focus:border-secondary outline-none resize-none">${ticket.description || ''}</textarea>
                </div>

                <div class="flex justify-between items-center pt-md border-t border-outline-variant/30">
                    <div class="text-[11px] text-on-surface-variant">
                        ${ticket.closed_at ? `<span class="text-success font-bold">Concluído em: ${new Date(ticket.closed_at).toLocaleString()}</span>` : 'Chamado em aberto'}
                    </div>
                    <div class="flex gap-sm">
                        <button type="button" id="btn-cancel" class="px-lg py-sm rounded-lg font-bold text-on-surface-variant hover:bg-surface-container-low transition-all">Cancelar</button>
                        <button type="submit" class="bg-secondary text-on-secondary px-xl py-sm rounded-lg font-bold hover:bg-secondary-container shadow-md transition-all">
                            ${isNew ? 'Abrir Chamado' : 'Salvar Alterações'}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    </div>
    `;
};
