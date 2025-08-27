-- CEA Real Estate ERP System Database Schema
-- Created: August 25, 2025
-- This schema implements the complete CEA compliance structure

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create custom types for better type safety
CREATE TYPE user_role AS ENUM ('admin', 'keo', 'team_leader', 'agent');
CREATE TYPE compliance_status AS ENUM ('compliant', 'pending', 'non_compliant', 'expired');
CREATE TYPE form_status AS ENUM ('draft', 'pending_signature', 'completed', 'submitted', 'rejected');
CREATE TYPE risk_level AS ENUM ('low', 'medium', 'high');
CREATE TYPE client_type AS ENUM ('buyer', 'seller', 'landlord', 'tenant');
CREATE TYPE property_type AS ENUM ('hdb', 'condo', 'landed', 'commercial', 'industrial');

-- ============================================================================
-- MODULE 1: AUTHENTICATION & USER MANAGEMENT
-- ============================================================================

-- Main users table (extends Supabase auth.users)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    role user_role DEFAULT 'agent',
    cea_reg_no VARCHAR(20) UNIQUE,
    license_expiry DATE,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User profiles for personal information
CREATE TABLE user_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    mobile VARCHAR(20),
    address TEXT,
    emergency_contact JSONB, -- {name, relationship, phone}
    social_media JSONB, -- {linkedin, facebook, instagram, etc.}
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User sessions for tracking active sessions
CREATE TABLE user_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    device_info JSONB, -- {browser, os, ip_address}
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- MODULE 2: MASTER PROFILE SYSTEM
-- ============================================================================

-- Agent profiles for CEA-specific information
CREATE TABLE agent_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    cea_reg VARCHAR(20) UNIQUE NOT NULL,
    cpd_credits INTEGER DEFAULT 0,
    upline_id UUID REFERENCES users(id), -- For team structure
    social_links JSONB, -- {linkedin, facebook, website}
    conviction_status VARCHAR(20) DEFAULT 'clear', -- clear, pending, convicted
    performance_metrics JSONB, -- {deals_closed, revenue, rating}
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Client profiles for CDD and compliance
CREATE TABLE client_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    nric_passport VARCHAR(20),
    client_type client_type NOT NULL,
    risk_level risk_level DEFAULT 'medium',
    cdd_completed BOOLEAN DEFAULT false,
    cdd_completion_date TIMESTAMP WITH TIME ZONE,
    additional_parties JSONB, -- Array of additional parties
    contact_info JSONB, -- {email, mobile, address}
    source_of_funds TEXT,
    pep_status BOOLEAN DEFAULT false, -- Politically Exposed Person
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Property profiles
CREATE TABLE property_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    address TEXT NOT NULL,
    postal_code VARCHAR(6),
    property_type property_type NOT NULL,
    price DECIMAL(15,2),
    gst_applicable BOOLEAN DEFAULT false,
    transaction_history JSONB, -- Array of past transactions
    ownership_details JSONB, -- {owner_name, title_number, etc.}
    valuation_info JSONB, -- {valuation_date, amount, valuer}
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- MODULE 3: SMART FORM GENERATOR
-- ============================================================================

-- Form templates for CEA-compliant documents
CREATE TABLE form_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    category VARCHAR(50), -- commission_agreement, otp, spa, etc.
    fields JSONB NOT NULL, -- Form field definitions
    validation_rules JSONB, -- Validation requirements
    cea_requirements JSONB, -- CEA compliance requirements
    template_version VARCHAR(10) DEFAULT '1.0',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Generated forms from templates
CREATE TABLE generated_forms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    template_id UUID REFERENCES form_templates(id),
    agent_id UUID REFERENCES users(id),
    client_id UUID REFERENCES client_profiles(id),
    property_id UUID REFERENCES property_profiles(id),
    form_data JSONB NOT NULL, -- Populated form data
    status form_status DEFAULT 'draft',
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Digital signatures tracking
CREATE TABLE form_signatures (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    form_id UUID REFERENCES generated_forms(id) ON DELETE CASCADE,
    signer_type VARCHAR(20), -- agent, client, witness
    signer_name VARCHAR(255) NOT NULL,
    signer_nric VARCHAR(20),
    signature_data TEXT, -- Base64 signature or SingPass reference
    signed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ip_address INET,
    device_info JSONB
);

-- Form submissions and delivery tracking
CREATE TABLE form_submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    form_id UUID REFERENCES generated_forms(id) ON DELETE CASCADE,
    submitted_to VARCHAR(255), -- CEA, MAS, client email, etc.
    delivery_method VARCHAR(50), -- email, api, portal
    delivery_status VARCHAR(20) DEFAULT 'pending', -- pending, sent, delivered, failed
    submission_reference VARCHAR(100), -- External reference number
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    delivered_at TIMESTAMP WITH TIME ZONE
);

-- ============================================================================
-- MODULE 4: COMPLIANCE ENGINE
-- ============================================================================

-- Compliance checks tracking
CREATE TABLE compliance_checks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID REFERENCES client_profiles(id),
    check_type VARCHAR(50) NOT NULL, -- aml, cdd, pep, sanctions
    result JSONB NOT NULL, -- Check results and details
    risk_score INTEGER, -- 0-100 risk score
    status compliance_status DEFAULT 'pending',
    performed_by UUID REFERENCES users(id),
    performed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AML assessments
CREATE TABLE aml_assessments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID REFERENCES client_profiles(id),
    risk_factors JSONB NOT NULL, -- Array of identified risk factors
    overall_score INTEGER NOT NULL, -- 0-100
    status compliance_status DEFAULT 'pending',
    review_date DATE,
    next_review_date DATE,
    assessor_id UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Suspicious Transaction Reports (STR)
CREATE TABLE str_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    transaction_id UUID, -- Reference to specific transaction
    client_id UUID REFERENCES client_profiles(id),
    property_id UUID REFERENCES property_profiles(id),
    reason_codes TEXT[] NOT NULL, -- Array of STR reason codes
    description TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'draft', -- draft, submitted, acknowledged
    submitted_to_mas BOOLEAN DEFAULT false,
    mas_reference VARCHAR(100), -- MAS acknowledgment reference
    reported_by UUID REFERENCES users(id),
    submitted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Comprehensive audit trail
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    action VARCHAR(100) NOT NULL, -- create, update, delete, view, export
    table_name VARCHAR(50) NOT NULL,
    record_id UUID,
    changes JSONB, -- Before/after changes for updates
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- MODULE 5: CPD MANAGEMENT SYSTEM
-- ============================================================================

-- CPD courses catalog
CREATE TABLE cpd_courses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    provider VARCHAR(255) NOT NULL,
    credits INTEGER NOT NULL,
    competency_type VARCHAR(20) NOT NULL, -- professional, generic
    duration_hours INTEGER,
    approval_status VARCHAR(20) DEFAULT 'approved', -- approved, pending, rejected
    cea_course_id VARCHAR(50), -- CEA's course reference
    cost DECIMAL(10,2),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- CPD enrollments and completions
CREATE TABLE cpd_enrollments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    course_id UUID REFERENCES cpd_courses(id),
    enrollment_date DATE NOT NULL,
    completion_date DATE,
    certificate_url TEXT, -- URL to stored certificate
    grade VARCHAR(5), -- Pass, Fail, A, B, C, etc.
    status VARCHAR(20) DEFAULT 'enrolled', -- enrolled, completed, failed, withdrawn
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- CPD tracking per agent per cycle
CREATE TABLE cpd_tracking (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    cycle_year INTEGER NOT NULL, -- e.g., 2025
    professional_credits INTEGER DEFAULT 0,
    generic_credits INTEGER DEFAULT 0,
    total_credits INTEGER GENERATED ALWAYS AS (professional_credits + generic_credits) STORED,
    status compliance_status DEFAULT 'pending',
    cycle_start_date DATE,
    cycle_end_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, cycle_year)
);

-- CPD alerts and reminders
CREATE TABLE cpd_alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    alert_type VARCHAR(50) NOT NULL, -- renewal_due, credits_low, course_reminder
    message TEXT NOT NULL,
    due_date DATE,
    status VARCHAR(20) DEFAULT 'active', -- active, dismissed, completed
    sent_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Authentication & Users
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_cea_reg_no ON users(cea_reg_no);
CREATE INDEX idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_token ON user_sessions(token);

-- Profiles
CREATE INDEX idx_agent_profiles_user_id ON agent_profiles(user_id);
CREATE INDEX idx_agent_profiles_cea_reg ON agent_profiles(cea_reg);
CREATE INDEX idx_client_profiles_created_by ON client_profiles(created_by);
CREATE INDEX idx_client_profiles_nric_passport ON client_profiles(nric_passport);
CREATE INDEX idx_property_profiles_created_by ON property_profiles(created_by);
CREATE INDEX idx_property_profiles_postal_code ON property_profiles(postal_code);

-- Forms
CREATE INDEX idx_generated_forms_agent_id ON generated_forms(agent_id);
CREATE INDEX idx_generated_forms_client_id ON generated_forms(client_id);
CREATE INDEX idx_generated_forms_status ON generated_forms(status);
CREATE INDEX idx_form_signatures_form_id ON form_signatures(form_id);
CREATE INDEX idx_form_submissions_form_id ON form_submissions(form_id);

-- Compliance
CREATE INDEX idx_compliance_checks_client_id ON compliance_checks(client_id);
CREATE INDEX idx_compliance_checks_performed_at ON compliance_checks(performed_at);
CREATE INDEX idx_aml_assessments_client_id ON aml_assessments(client_id);
CREATE INDEX idx_str_reports_client_id ON str_reports(client_id);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);

-- CPD
CREATE INDEX idx_cpd_enrollments_user_id ON cpd_enrollments(user_id);
CREATE INDEX idx_cpd_tracking_user_id ON cpd_tracking(user_id);
CREATE INDEX idx_cpd_alerts_user_id ON cpd_alerts(user_id);
CREATE INDEX idx_cpd_alerts_status ON cpd_alerts(status);

-- ============================================================================
-- TRIGGERS FOR AUTOMATIC UPDATES
-- ============================================================================

-- Update timestamps automatically
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers to all tables that have updated_at column
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_agent_profiles_updated_at BEFORE UPDATE ON agent_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_client_profiles_updated_at BEFORE UPDATE ON client_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_property_profiles_updated_at BEFORE UPDATE ON property_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_form_templates_updated_at BEFORE UPDATE ON form_templates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_generated_forms_updated_at BEFORE UPDATE ON generated_forms
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_aml_assessments_updated_at BEFORE UPDATE ON aml_assessments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_str_reports_updated_at BEFORE UPDATE ON str_reports
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cpd_courses_updated_at BEFORE UPDATE ON cpd_courses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cpd_enrollments_updated_at BEFORE UPDATE ON cpd_enrollments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cpd_tracking_updated_at BEFORE UPDATE ON cpd_tracking
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE generated_forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE compliance_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE cpd_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE cpd_tracking ENABLE ROW LEVEL SECURITY;

-- Basic RLS policies (to be expanded based on specific requirements)
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

-- Admin users can view all profiles
CREATE POLICY "Admins can view all users" ON users
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- ============================================================================
-- SAMPLE DATA FOR TESTING
-- ============================================================================

-- Insert sample form templates
INSERT INTO form_templates (name, category, fields, validation_rules, cea_requirements) VALUES 
(
    'Commission Agreement',
    'commission_agreement',
    '{
        "agent_info": {"type": "object", "required": true},
        "client_info": {"type": "object", "required": true},
        "property_info": {"type": "object", "required": true},
        "commission_rate": {"type": "number", "required": true, "min": 0, "max": 10},
        "terms_conditions": {"type": "text", "required": true},
        "validity_period": {"type": "date", "required": true}
    }',
    '{
        "commission_rate": {"max": 3.0, "message": "Commission rate cannot exceed 3%"},
        "validity_period": {"future_date": true, "message": "Validity period must be in the future"}
    }',
    '{
        "cea_form_reference": "CEA-CA-2024",
        "required_disclosures": ["conflict_of_interest", "commission_structure"],
        "retention_period": "5_years"
    }'
),
(
    'Option to Purchase (OTP)',
    'otp',
    '{
        "purchaser_info": {"type": "object", "required": true},
        "vendor_info": {"type": "object", "required": true},
        "property_details": {"type": "object", "required": true},
        "purchase_price": {"type": "number", "required": true},
        "option_fee": {"type": "number", "required": true},
        "exercise_date": {"type": "date", "required": true},
        "completion_date": {"type": "date", "required": true}
    }',
    '{
        "option_fee": {"min": 1000, "message": "Option fee must be at least $1,000"},
        "exercise_date": {"future_date": true, "message": "Exercise date must be in the future"},
        "completion_date": {"after_exercise": true, "message": "Completion must be after exercise date"}
    }',
    '{
        "cea_form_reference": "CEA-OTP-2024",
        "required_attachments": ["property_title", "floor_plan"],
        "legal_requirements": ["stamp_duty", "buyer_stamp_duty"]
    }'
);

-- Insert sample CPD courses
INSERT INTO cpd_courses (title, provider, credits, competency_type, duration_hours, cea_course_id, cost) VALUES
('Real Estate Law Update 2025', 'Singapore Institute of Estate Agents', 4, 'professional', 8, 'CEA-RLU-2025', 150.00),
('Ethics and Professional Conduct', 'Council for Estate Agencies', 2, 'generic', 4, 'CEA-EPC-2025', 80.00),
('Property Valuation Fundamentals', 'Singapore Institute of Surveyors and Valuers', 6, 'professional', 12, 'SISV-PVF-2025', 250.00),
('Anti-Money Laundering for Real Estate', 'Compliance Institute Singapore', 3, 'professional', 6, 'CIS-AML-2025', 120.00);

-- Create initial admin user (to be updated with real data)
INSERT INTO users (id, email, role, cea_reg_no, license_expiry, status) VALUES 
('00000000-0000-0000-0000-000000000000', 'admin@cea-erp.sg', 'admin', 'ADM001', '2025-12-31', 'active');

INSERT INTO user_profiles (user_id, name, mobile, address) VALUES
('00000000-0000-0000-0000-000000000000', 'System Administrator', '+65 6123 4567', '1 Marina Bay, Singapore 018989');