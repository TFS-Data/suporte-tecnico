-- TABELAS PRINCIPAIS DO SISTEMA DE SUPORTE

-- 1. Categorias
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    color TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Status de Chamados
CREATE TABLE status_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    type TEXT NOT NULL, -- error, secondary, warning, success
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Perfis de Usuário (Integrado com Auth)
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
    full_name TEXT,
    email TEXT,
    role TEXT CHECK (role IN ('Administrador', 'Técnico', 'Cliente')),
    job_title TEXT,
    phone TEXT,
    avatar_url TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Chamados (Tickets)
CREATE TABLE tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    status_id UUID REFERENCES status_types(id) ON DELETE SET NULL,
    priority TEXT CHECK (priority IN ('Baixa', 'Média', 'Alta')),
    client_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    assigned_to_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    closed_at TIMESTAMP WITH TIME ZONE
);

-- 5. Configurações do Sistema
CREATE TABLE system_settings (
    id INT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
    title TEXT DEFAULT 'Suporte Integrado',
    subtitle TEXT DEFAULT 'Gestão Operacional',
    logo_url TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Informações de Ajuda
CREATE TABLE help_info (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    display_text VARCHAR(20) NOT NULL,
    email TEXT,
    website TEXT,
    phone TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- HABILITAR RLS (Row Level Security)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE status_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE help_info ENABLE ROW LEVEL SECURITY;

-- POLÍTICAS BÁSICAS (Exemplo: Leitura para todos autenticados)
CREATE POLICY "Leitura pública para autenticados" ON categories FOR SELECT TO authenticated USING (true);
CREATE POLICY "Leitura pública para autenticados" ON status_types FOR SELECT TO authenticated USING (true);
CREATE POLICY "Leitura pública para autenticados" ON system_settings FOR SELECT TO authenticated USING (true);
CREATE POLICY "Leitura pública para autenticados" ON help_info FOR SELECT TO authenticated USING (true);

-- Polícias de Perfis
CREATE POLICY "Usuários podem ver seu próprio perfil" ON profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "Admins podem ver todos os perfis" ON profiles FOR SELECT TO authenticated USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'Administrador'
);

-- Políticas de Tickets
CREATE POLICY "Clientes veem seus próprios tickets" ON tickets FOR SELECT TO authenticated USING (client_id = auth.uid());
CREATE POLICY "Técnicos e Admins veem todos os tickets" ON tickets FOR SELECT TO authenticated USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) IN ('Administrador', 'Técnico')
);

-- DADOS DE EXEMPLO
INSERT INTO system_settings (id, title, subtitle) VALUES (1, 'Suporte Integrado', 'Gestão Operacional') ON CONFLICT DO NOTHING;

INSERT INTO categories (name, color) VALUES 
('Informática/TI', 'secondary'),
('Elétrica', 'surface-tint'),
('Predial/Civil', 'primary-container'),
('Segurança Eletrônica', 'error')
ON CONFLICT DO NOTHING;

INSERT INTO status_types (name, type) VALUES 
('Aberto', 'error'),
('Em Atendimento', 'secondary'),
('Aguardando Peças', '[#f59e0b]'),
('Concluído', '[#10b981]')
ON CONFLICT DO NOTHING;
