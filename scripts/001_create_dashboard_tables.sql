-- Dashboard Core Tables
CREATE TABLE IF NOT EXISTS dashboards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  is_public BOOLEAN DEFAULT false,
  layout_config JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Dashboard Widgets
CREATE TABLE IF NOT EXISTS dashboard_widgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dashboard_id UUID NOT NULL REFERENCES dashboards(id) ON DELETE CASCADE,
  widget_type TEXT NOT NULL, -- 'chart', 'table', 'metric', 'text'
  title TEXT NOT NULL,
  config JSONB DEFAULT '{}',
  position_x INTEGER DEFAULT 0,
  position_y INTEGER DEFAULT 0,
  width INTEGER DEFAULT 4,
  height INTEGER DEFAULT 3,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Data Sources
CREATE TABLE IF NOT EXISTS data_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL, -- 'csv', 'api', 'database'
  connection_config JSONB DEFAULT '{}',
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Dashboard Sharing
CREATE TABLE IF NOT EXISTS dashboard_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dashboard_id UUID NOT NULL REFERENCES dashboards(id) ON DELETE CASCADE,
  shared_with_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  permission_level TEXT NOT NULL DEFAULT 'view', -- 'view', 'edit', 'admin'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Roles
CREATE TABLE IF NOT EXISTS user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'user', -- 'user', 'admin', 'super_admin'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE dashboards ENABLE ROW LEVEL SECURITY;
ALTER TABLE dashboard_widgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE dashboard_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for dashboards
CREATE POLICY "Users can view their own dashboards" ON dashboards FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can view shared dashboards" ON dashboards FOR SELECT USING (
  id IN (SELECT dashboard_id FROM dashboard_shares WHERE shared_with_user_id = auth.uid())
);
CREATE POLICY "Users can view public dashboards" ON dashboards FOR SELECT USING (is_public = true);
CREATE POLICY "Users can create their own dashboards" ON dashboards FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own dashboards" ON dashboards FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own dashboards" ON dashboards FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for dashboard_widgets
CREATE POLICY "Users can view widgets of their dashboards" ON dashboard_widgets FOR SELECT USING (
  dashboard_id IN (SELECT id FROM dashboards WHERE user_id = auth.uid())
);
CREATE POLICY "Users can view widgets of shared dashboards" ON dashboard_widgets FOR SELECT USING (
  dashboard_id IN (SELECT dashboard_id FROM dashboard_shares WHERE shared_with_user_id = auth.uid())
);
CREATE POLICY "Users can create widgets for their dashboards" ON dashboard_widgets FOR INSERT WITH CHECK (
  dashboard_id IN (SELECT id FROM dashboards WHERE user_id = auth.uid())
);
CREATE POLICY "Users can update widgets of their dashboards" ON dashboard_widgets FOR UPDATE USING (
  dashboard_id IN (SELECT id FROM dashboards WHERE user_id = auth.uid())
);
CREATE POLICY "Users can delete widgets of their dashboards" ON dashboard_widgets FOR DELETE USING (
  dashboard_id IN (SELECT id FROM dashboards WHERE user_id = auth.uid())
);

-- RLS Policies for data_sources
CREATE POLICY "Users can view their own data sources" ON data_sources FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own data sources" ON data_sources FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own data sources" ON data_sources FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own data sources" ON data_sources FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for dashboard_shares
CREATE POLICY "Users can view shares of their dashboards" ON dashboard_shares FOR SELECT USING (
  dashboard_id IN (SELECT id FROM dashboards WHERE user_id = auth.uid())
);
CREATE POLICY "Users can view their received shares" ON dashboard_shares FOR SELECT USING (shared_with_user_id = auth.uid());
CREATE POLICY "Users can create shares for their dashboards" ON dashboard_shares FOR INSERT WITH CHECK (
  dashboard_id IN (SELECT id FROM dashboards WHERE user_id = auth.uid())
);
CREATE POLICY "Users can delete shares of their dashboards" ON dashboard_shares FOR DELETE USING (
  dashboard_id IN (SELECT id FROM dashboards WHERE user_id = auth.uid())
);

-- RLS Policies for user_roles
CREATE POLICY "Users can view their own role" ON user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all roles" ON user_roles FOR SELECT USING (
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'super_admin'))
);
CREATE POLICY "Super admins can manage all roles" ON user_roles FOR ALL USING (
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'super_admin')
);

-- Create indexes for better performance
CREATE INDEX idx_dashboards_user_id ON dashboards(user_id);
CREATE INDEX idx_dashboard_widgets_dashboard_id ON dashboard_widgets(dashboard_id);
CREATE INDEX idx_data_sources_user_id ON data_sources(user_id);
CREATE INDEX idx_dashboard_shares_dashboard_id ON dashboard_shares(dashboard_id);
CREATE INDEX idx_dashboard_shares_user_id ON dashboard_shares(shared_with_user_id);
CREATE INDEX idx_user_roles_user_id ON user_roles(user_id);

-- Insert sample data
INSERT INTO user_roles (user_id, role) 
SELECT id, 'admin' FROM auth.users LIMIT 1
ON CONFLICT (user_id) DO NOTHING;
