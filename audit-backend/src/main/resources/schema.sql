-- =========================================================================================
-- Payroll System Audit-Proof Schema
-- Database: PostgreSQL
-- Author: Antigravity
-- Description: Supports zero-overwrite history, audit trails, and Malaysian payroll standards.
-- =========================================================================================

-- 1. ENUMS & TYPES
-- =========================================================================================
CREATE TYPE salary_component_type AS ENUM ('EARNING', 'DEDUCTION', 'STATUTORY_DEDUCTION', 'COMPANY_CONTRIBUTION', 'CLAIM');
CREATE TYPE salary_frequency AS ENUM ('MONTHLY', 'ONE_OFF', 'ANNUAL');
CREATE TYPE employment_status AS ENUM ('PERMANENT', 'CONTRACT', 'PROBATION', 'RESIGNED', 'TERMINATED');
CREATE TYPE vehicle_type AS ENUM ('CAR', 'MOTORCYCLE');
CREATE TYPE change_action AS ENUM ('INSERT', 'UPDATE', 'DELETE');

-- 2. CORE EMPLOYEE MANAGEMENT
-- =========================================================================================

CREATE TABLE departments (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    cost_center_code VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE grades (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL, -- e.g., "E1", "M2"
    min_salary DECIMAL(12,2),
    max_salary DECIMAL(12,2),
    description TEXT
);

CREATE TABLE employees (
    id SERIAL PRIMARY KEY,
    employee_code VARCHAR(20) UNIQUE NOT NULL, -- Internal ID
    full_name VARCHAR(150) NOT NULL,
    identity_no VARCHAR(20) NOT NULL, -- IC / Passport
    epf_no VARCHAR(20),
    socso_no VARCHAR(20),
    tax_no VARCHAR(20),
    bank_name VARCHAR(100),
    bank_account_no VARCHAR(50),
    join_date DATE NOT NULL,
    resign_date DATE,
    department_id INT REFERENCES departments(id),
    current_grade_id INT REFERENCES grades(id),
    status employment_status DEFAULT 'PROBATION',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. FINANCIAL CONFIGURATION (Lookup Tables)
-- =========================================================================================

-- Defines WHAT can be paid or deducted. e.g. "Basic Salary", "Parking Allowance", "Zakat"
CREATE TABLE salary_components (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(20) UNIQUE NOT NULL, -- e.g., "BASIC", "ZAKAT", "FUEL_CLAIM"
    type salary_component_type NOT NULL,
    frequency salary_frequency DEFAULT 'MONTHLY',
    is_taxable BOOLEAN DEFAULT TRUE,
    is_epf_applicable BOOLEAN DEFAULT TRUE,
    is_socso_applicable BOOLEAN DEFAULT TRUE,
    is_eis_applicable BOOLEAN DEFAULT TRUE,
    description TEXT,
    gl_account_code VARCHAR(50) -- Integration with Finance
);

-- 4. COMPENSATION STRUCTURE (The "Effective Date" Engine)
-- =========================================================================================

-- Assigns components to employees with specific values and validity periods.
-- ZERO OVERWRITE POLICY: Updates require closing the old record (setting end_date) and inserting a new one.
CREATE TABLE employee_salary_structures (
    id SERIAL PRIMARY KEY,
    employee_id INT REFERENCES employees(id),
    component_id INT REFERENCES salary_components(id),
    amount DECIMAL(12,2) DEFAULT 0.00,
    currency VARCHAR(3) DEFAULT 'MYR',
    effective_start_date DATE NOT NULL,
    effective_end_date DATE, -- NULL means "Current" / "Indefinite"
    is_active BOOLEAN DEFAULT TRUE,
    remarks TEXT,
    created_by VARCHAR(50), -- User ID of HR admin
    approved_by VARCHAR(50), -- User ID of Approver
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraint: Ensure overlapping dates for same component & employee don't exist (Optional, but good practice)
    CONSTRAINT check_stat_dates CHECK (effective_end_date IS NULL OR effective_start_date <= effective_end_date)
);

-- 5. VEHICLE & TRANSPORT MODULE
-- =========================================================================================

CREATE TABLE employee_vehicles (
    id SERIAL PRIMARY KEY,
    employee_id INT REFERENCES employees(id),
    vehicle_type vehicle_type NOT NULL,
    registration_no VARCHAR(20) NOT NULL,
    model VARCHAR(100),
    fuel_allowance_limit DECIMAL(12,2), -- Max claimable amount
    is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE claims (
    id SERIAL PRIMARY KEY,
    employee_id INT REFERENCES employees(id),
    claim_type VARCHAR(50) NOT NULL, -- "FUEL", "MEDICAL", "TOLL"
    amount DECIMAL(12,2) NOT NULL,
    receipt_ref VARCHAR(100), -- File path or Receipt No
    claim_date DATE NOT NULL,
    description TEXT,
    status VARCHAR(20) DEFAULT 'PENDING', -- PENDING, APPROVED, REJECTED
    approved_by VARCHAR(50),
    approval_date TIMESTAMP,
    vehicle_id INT REFERENCES employee_vehicles(id) -- Optional link for vehicle claims
);

-- 6. DEDUCTIONS & ZAKAT (Specific Configurations)
-- =========================================================================================
-- Specialized table for Zakat to track "Eligible" status and Body
CREATE TABLE employee_zakat_settings (
    id SERIAL PRIMARY KEY,
    employee_id INT REFERENCES employees(id),
    zakat_body VARCHAR(100) NOT NULL, -- e.g., "Pusat Zakat Selangor"
    deduction_type VARCHAR(20) DEFAULT 'FIXED_AMOUNT', -- 'FIXED_AMOUNT' or 'PERCENTAGE'
    amount_or_rate DECIMAL(12,2) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    effective_start_date DATE NOT NULL,
    effective_end_date DATE
);

-- 7. PAYROLL PROCESSING (Transactions)
-- =========================================================================================

CREATE TABLE payroll_runs (
    id SERIAL PRIMARY KEY,
    month INT NOT NULL CHECK (month BETWEEN 1 AND 12),
    year INT NOT NULL,
    run_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) DEFAULT 'DRAFT', -- DRAFT, FINALIZED, PAID
    processed_by VARCHAR(50),
    total_payout DECIMAL(15,2),
    UNIQUE (month, year)
);

CREATE TABLE payroll_items (
    id SERIAL PRIMARY KEY,
    payroll_run_id INT REFERENCES payroll_runs(id),
    employee_id INT REFERENCES employees(id),
    component_id INT REFERENCES salary_components(id),
    
    amount DECIMAL(12,2) NOT NULL, -- Positive for Earnings, Negative/Positive for Deductions (convention depends on logic, usually Deductions stored as positive and subtracted)
    
    calculation_base DECIMAL(12,2), -- The amount this was calculated from (e.g., Basic Salary used for EPF calc)
    calculation_rate DECIMAL(10,4), -- e.g., 0.11 for 11% EPF
    
    remarks TEXT
);

-- 8. AUDIT LOGGING (The "Black Box")
-- =========================================================================================

CREATE TABLE audit_logs (
    id BIGSERIAL PRIMARY KEY,
    table_name VARCHAR(50) NOT NULL,
    record_id INT NOT NULL, -- The ID of the row being changed
    action change_action NOT NULL,
    
    old_values JSONB, -- Snapshot of data BEFORE change
    new_values JSONB, -- Snapshot of data AFTER change
    
    changed_by VARCHAR(50) DEFAULT 'SYSTEM', -- User ID or 'SYSTEM'
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    ip_address VARCHAR(45),
    user_agent TEXT
);

-- 9. AUDIT TRIGGER FUNCTION
-- =========================================================================================
-- Generic trigger to auto-log changes to any table it's attached to

CREATE OR REPLACE FUNCTION log_audit_change()
RETURNS TRIGGER AS $$
DECLARE
    old_data JSONB;
    new_data JSONB;
    action_type change_action;
BEGIN
    IF (TG_OP = 'INSERT') THEN
        old_data := NULL;
        new_data := to_jsonb(NEW);
        action_type := 'INSERT';
    ELSIF (TG_OP = 'UPDATE') THEN
        old_data := to_jsonb(OLD);
        new_data := to_jsonb(NEW);
        action_type := 'UPDATE';
    ELSIF (TG_OP = 'DELETE') THEN
        old_data := to_jsonb(OLD);
        new_data := NULL;
        action_type := 'DELETE';
    END IF;

    -- Insert into audit log
    INSERT INTO audit_logs (
        table_name, 
        record_id, 
        action, 
        old_values, 
        new_values, 
        changed_by,
        changed_at
    )
    VALUES (
        TG_TABLE_NAME, 
        COALESCE(NEW.id, OLD.id), -- Assumes all tables have 'id' column
        action_type, 
        old_data, 
        new_data, 
        current_setting('app.current_user', true), -- Can be set via session variable in app
        NOW()
    );

    RETURN NULL; -- Result is ignored for AFTER triggers
END;
$$ LANGUAGE plpgsql;

-- 10. ATTACH TRIGGERS
-- =========================================================================================
-- Apply audit logging to critical tables

CREATE TRIGGER audit_employee_changes
AFTER INSERT OR UPDATE OR DELETE ON employees
FOR EACH ROW EXECUTE FUNCTION log_audit_change();

CREATE TRIGGER audit_salary_structure_changes
AFTER INSERT OR UPDATE OR DELETE ON employee_salary_structures
FOR EACH ROW EXECUTE FUNCTION log_audit_change();

CREATE TRIGGER audit_grade_changes
AFTER INSERT OR UPDATE OR DELETE ON grades
FOR EACH ROW EXECUTE FUNCTION log_audit_change();

CREATE TRIGGER audit_zakat_changes
AFTER INSERT OR UPDATE OR DELETE ON employee_zakat_settings
FOR EACH ROW EXECUTE FUNCTION log_audit_change();

-- =========================================================================================
-- END OF SCHEMA
-- =========================================================================================
