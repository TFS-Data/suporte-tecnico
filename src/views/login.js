export const LoginView = (system = {}) => {
    const title = system.title || 'Suporte Integrado';
    const logoUrl = system.logo_url || '';
    return `
<div class="w-full flex-1 min-h-screen flex items-center justify-center bg-primary p-md" style="width: 100vw; height: 100vh;">
    <div class="w-full bg-surface rounded-lg shadow-xl p-xl animate-fadeIn" style="max-width: 440px; width: 100%; margin: 16px;">
        <div class="text-center mb-xl">
            <div id="login-logo-container" class="inline-flex items-center justify-center w-28 h-28 bg-primary-container rounded-full mb-md overflow-hidden">
                ${logoUrl
                    ? `<img id="login-logo-img" src="${logoUrl}" alt="Logo" class="w-full h-full object-cover">`
                    : `<span id="login-logo-icon" class="material-symbols-outlined text-[64px] text-secondary">support_agent</span>`
                }
            </div>
            <h1 id="login-title" class="font-display-lg text-display-lg text-primary">${title}</h1>
            <p id="login-subtitle" class="text-on-surface-variant font-body-md">Acesse sua conta para continuar</p>
        </div>

        <form id="login-form" class="space-y-lg">
            <div>
                <label for="email" class="block font-label-caps text-label-caps text-on-surface-variant mb-xs">E-mail ou Usuário</label>
                <input type="text" id="email" required placeholder="admin@exemplo.com"
                       class="w-full bg-surface-container-low border border-outline-variant rounded-lg py-sm px-md text-body-md focus:outline-none focus:border-secondary transition-all">
            </div>

            <div>
                <label for="password" class="block font-label-caps text-label-caps text-on-surface-variant mb-xs">Senha</label>
                <input type="password" id="password" required placeholder="••••••••"
                       class="w-full bg-surface-container-low border border-outline-variant rounded-lg py-sm px-md text-body-md focus:outline-none focus:border-secondary transition-all">
            </div>

            <button type="submit" id="btn-login" class="w-full bg-secondary text-on-secondary rounded-lg py-md px-md font-title-sm text-title-sm flex items-center justify-center gap-sm hover:bg-secondary-container transition-all active:scale-[0.98] shadow-md">
                Entrar no Sistema
                <span class="material-symbols-outlined">login</span>
            </button>

            <div id="login-error" class="hidden p-sm bg-error/10 text-error rounded-lg text-body-sm text-center font-medium">
                Credenciais inválidas. Tente novamente.
            </div>
        </form>

        <div class="mt-xl text-center text-on-surface-variant font-body-sm border-t border-outline-variant/30 pt-lg">
            Acesso exclusivo para colaboradores e clientes autorizados.
        </div>
    </div>
</div>
`;
};
