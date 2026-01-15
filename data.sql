-- =========================================================================================
-- PAYROLL SYSTEM FULL DUMMY DATA SEED (LIVE ACTION SCENARIO - EXTENDED)
-- Context: IT Department, Ages 23-33
-- Includes: Employees (20), Vehicles (15), Claims (15), Zakat (15), Payroll (All)
-- =========================================================================================

-- 0. CLEANUP (Prevent Duplicates)
TRUNCATE TABLE 
  payroll_items, payroll_runs, claims, employee_zakat_settings, 
  employee_vehicles, employee_salary_structures, employees, 
  salary_components, grades, departments 
RESTART IDENTITY CASCADE;

-- 1. DEPARTMENTS
INSERT INTO departments (name, cost_center_code) VALUES 
('Information Technology', 'IT-HQ-01'),
('Software Development', 'SD-DEV-02'),
('Infrastructure & Ops', 'INFRA-03'),
('Cyber Security', 'SEC-04'),
('Data Analytics', 'DA-05');

-- 2. GRADES (Corporate Levels)
INSERT INTO grades (name, min_salary, max_salary, description) VALUES 
('G1 - Junior', 3000, 4999, 'Fresh Grad / Junior Associate'),
('G2 - Executive', 5000, 7999, 'Experienced Associate'),
('G3 - Senior', 8000, 11999, 'Senior Executive / Specialist'),
('G4 - Lead', 12000, 18000, 'Team Lead / Manager'),
('G5 - Principal', 18001, 25000, 'Principal Architect / HoD');

-- 3. SALARY COMPONENTS (Malaysia Context)
INSERT INTO salary_components (name, code, type, frequency, is_taxable, is_epf_applicable, is_socso_applicable, is_eis_applicable, description) VALUES 
('Basic Salary', 'BASIC', 'EARNING', 'MONTHLY', true, true, true, true, 'Standard Monthly Base Pay'),
('Travel Allowance', 'TRAVEL', 'EARNING', 'MONTHLY', false, false, false, false, 'Fixed Monthly Travel Allowance'),
('Internet Allowance', 'INTERNET', 'EARNING', 'MONTHLY', false, false, false, false, 'Remote Work Subsidy'),
('Mobile Allowance', 'MOBILE', 'EARNING', 'MONTHLY', false, false, false, false, 'Phone Bill Subsidy'),
('Parking Allowance', 'PARKING', 'EARNING', 'MONTHLY', false, false, false, false, 'Office Parking'),
('Overtime Pay', 'OT', 'EARNING', 'ONE_OFF', true, true, true, true, 'Ad-hoc Overtime Payment'),
('Performance Bonus', 'BONUS', 'EARNING', 'ONE_OFF', true, true, true, true, 'Annual or Quarterly Bonus'),
('Medical Claim', 'CLAIM_MED', 'CLAIM', 'ONE_OFF', false, false, false, false, 'Medical Reimbursement'),
('Fuel Claim', 'CLAIM_FUEL', 'CLAIM', 'ONE_OFF', false, false, false, false, 'Mileage/Petrol Reimbursement'),
('Toll Claim', 'CLAIM_TOLL', 'CLAIM', 'ONE_OFF', false, false, false, false, 'Toll Reimbursement'),
('EPF Employee', 'EPF_EE', 'STATUTORY_DEDUCTION', 'MONTHLY', false, false, false, false, 'KWSP Employee Share (11%)'),
('SOCSO Employee', 'SOCSO_EE', 'STATUTORY_DEDUCTION', 'MONTHLY', false, false, false, false, 'PERKESO Employee Share'),
('EIS Employee', 'EIS_EE', 'STATUTORY_DEDUCTION', 'MONTHLY', false, false, false, false, 'SIP Employee Share'),
('PCB (Tax)', 'PCB', 'STATUTORY_DEDUCTION', 'MONTHLY', false, false, false, false, 'Monthly Tax Deduction'),
('Zakat Deduction', 'ZAKAT_DED', 'DEDUCTION', 'MONTHLY', false, false, false, false, 'Monthly Zakat via Payroll');

-- 4. EMPLOYEES (20 Pax, Ages 23-33)
-- Mix of races (Malay, Chinese, Indian, Punjabi) for realism

-- LEADERSHIP (30-33 y/o)
INSERT INTO employees (employee_code, full_name, identity_no, join_date, department_id, current_grade_id, status) VALUES 
('IT001', 'Ahmad Faiz bin Ruslan', '930101-14-5567', '2016-03-15', 3, 5, 'PERMANENT'), -- Head of Infra (33)
('IT002', 'Khairul Azman', '940520-10-8899', '2017-06-01', 2, 4, 'PERMANENT'), -- Tech Lead (32)
('IT003', 'Zainal Abidin', '930815-08-1234', '2018-11-20', 1, 4, 'PERMANENT'), -- IT Project Manager (33)
('IT004', 'Sarah Lee Mei Ling', '940212-07-7765', '2019-01-10', 4, 4, 'PERMANENT'); -- Security Lead (32)

-- SENIORS (27-30 y/o)
INSERT INTO employees (employee_code, full_name, identity_no, join_date, department_id, current_grade_id, status) VALUES 
('IT005', 'Brendan Ooi', '960730-14-9988', '2020-09-01', 2, 3, 'PERMANENT'), -- Senior Backend (30)
('IT006', 'Michelle Wong', '970425-10-6677', '2021-02-15', 2, 3, 'PERMANENT'), -- Senior Frontend (29)
('IT007', 'Rajesh Kumar', '981110-05-4433', '2021-08-01', 3, 3, 'PERMANENT'), -- Senior DevOps (28)
('IT008', 'Priya Anandan', '990315-14-2211', '2022-03-01', 5, 3, 'PERMANENT'); -- Senior Data Eng (27)

-- EXECUTIVES (25-27 y/o)
INSERT INTO employees (employee_code, full_name, identity_no, join_date, department_id, current_grade_id, status) VALUES 
('IT009', 'Farid Rosli', '000620-10-3344', '2023-01-05', 2, 2, 'PERMANENT'), -- Developer (26)
('IT010', 'Nurul Ain', '010912-08-7766', '2023-07-15', 2, 2, 'PERMANENT'), -- UI Designer (25)
('IT011', 'Farah Nabilah', '001205-03-5588', '2023-05-20', 1, 2, 'PERMANENT'), -- Business Analyst (26)
('IT012', 'Lim Wei Jie', '000228-14-1122', '2023-06-01', 2, 2, 'PERMANENT'), -- QA Engineer (26)
('IT013', 'Harjit Singh', '991102-14-5544', '2022-11-01', 3, 2, 'PERMANENT'), -- Network Engineer (27)
('IT014', 'Siti Aminah', '000515-10-9988', '2023-08-01', 5, 2, 'PERMANENT'); -- Data Analyst (26)

-- JUNIORS (23-24 y/o)
INSERT INTO employees (employee_code, full_name, identity_no, join_date, department_id, current_grade_id, status) VALUES 
('IT015', 'Aisyah Ramli', '020510-06-9900', '2024-02-01', 2, 1, 'PERMANENT'), -- Junior Mobile Dev (24)
('IT016', 'Davina Kaur', '030825-14-6655', '2024-09-01', 3, 1, 'PROBATION'), -- Jr SysAdmin (23)
('IT017', 'Jason Tan', '031115-10-2233', '2025-01-02', 2, 1, 'PROBATION'), -- Jr QA (23)
('IT018', 'Muhammad Hafiz', '021201-03-4455', '2024-10-10', 1, 1, 'PROBATION'), -- IT Support (24)
('IT019', 'Jessica Low', '030101-14-1122', '2025-01-01', 5, 1, 'PROBATION'), -- Jr Data Analyst (23)
('IT020', 'Kevin Rao', '030420-10-3366', '2025-01-01', 2, 1, 'PROBATION'); -- Jr Developer (23)


-- 5. SALARY STRUCTURES
-- =========================================================================

-- Leads/Managers (Ranges 12k - 15k)
INSERT INTO employee_salary_structures (employee_id, component_id, amount, effective_start_date) VALUES 
(1, 1, 15000, '2024-01-01'), (1, 2, 800, '2024-01-01'), (1, 4, 200, '2024-01-01'), -- Ahmad (Infra)
(2, 1, 13500, '2024-01-01'), (2, 2, 500, '2024-01-01'), (2, 3, 150, '2024-01-01'), -- Khairul (Tech)
(3, 1, 12000, '2024-01-01'), (3, 2, 500, '2024-01-01'), (3, 5, 200, '2024-01-01'), -- Zainal (PM)
(4, 1, 12500, '2024-01-01'), (4, 3, 150, '2024-01-01');                                -- Sarah (Sec)

-- Seniors (Ranges 8k - 11k)
INSERT INTO employee_salary_structures (employee_id, component_id, amount, effective_start_date) VALUES 
(5, 1, 10500, '2024-01-01'), (5, 3, 100, '2024-01-01'), -- Brendan
(6, 1, 9500, '2024-01-01'),  (6, 3, 100, '2024-01-01'), -- Michelle
(7, 1, 8800, '2024-01-01'),  (7, 2, 300, '2024-01-01'), (7, 4, 100, '2024-01-01'), -- Rajesh (On Call)
(8, 1, 9000, '2024-01-01'),  (8, 3, 100, '2024-01-01'); -- Priya

-- Executives (Ranges 5k - 7k)
INSERT INTO employee_salary_structures (employee_id, component_id, amount, effective_start_date) VALUES 
(9, 1, 6500, '2024-01-01'), (9, 3, 100, '2024-01-01'),
(10, 1, 5800, '2024-01-01'), (10, 3, 100, '2024-01-01'),
(11, 1, 6200, '2024-01-01'),
(12, 1, 6000, '2024-01-01'),
(13, 1, 7000, '2024-01-01'), (13, 2, 300, '2024-01-01'), -- Harjit (Field Work)
(14, 1, 6300, '2024-01-01');

-- Juniors (Ranges 3.5k - 4.8k)
INSERT INTO employee_salary_structures (employee_id, component_id, amount, effective_start_date) VALUES 
(15, 1, 4500, '2024-02-01'),
(16, 1, 3800, '2024-09-01'),
(17, 1, 3500, '2025-01-02'),
(18, 1, 3600, '2024-10-10'), (18, 2, 200, '2024-10-10'), -- Hafiz (Support needs travel)
(19, 1, 3800, '2025-01-01'),
(20, 1, 4000, '2025-01-01');


-- 6. VEHICLES (Targeting 15 Records)
-- =========================================================================
INSERT INTO employee_vehicles (employee_id, vehicle_type, registration_no, model, fuel_allowance_limit, is_active) VALUES 
(1, 'CAR', 'VHA 8822', 'Honda CRV', 800.00, true),     -- Head of Infra
(3, 'CAR', 'BQA 1234', 'Toyota Camry', 500.00, true),   -- PM
(7, 'MOTORCYCLE', 'WCY 5566', 'Yamaha Y15', 200.00, true), -- DevOps (On Call)
(13, 'CAR', 'JLU 9988', 'Perodua Myvi', 400.00, true),  -- Network Eng
(18, 'MOTORCYCLE', 'RSA 2211', 'Honda RS150', 150.00, true), -- IT Support
-- New Entries to reach 15
(2, 'CAR', 'VBB 1122', 'Mazda CX-5', 600.00, true),
(4, 'CAR', 'WDD 3344', 'Honda Civic', 600.00, true),
(5, 'MOTORCYCLE', 'BGT 7788', 'Yamaha NVX', 150.00, true),
(6, 'CAR', 'PJJ 9900', 'Hyundai Elantra', 400.00, true),
(8, 'CAR', 'VEE 5566', 'Toyota Vios', 450.00, true),
(9, 'MOTORCYCLE', 'DDA 1212', 'Honda Dash', 100.00, true),
(11, 'CAR', 'WEE 8899', 'Proton X50', 500.00, true),
(14, 'CAR', 'SAB 1234', 'Perodua Bezza', 300.00, true),
(15, 'MOTORCYCLE', 'KDA 7788', 'Modenas Kriss', 100.00, true),
(20, 'MOTORCYCLE', 'BKA 1122', 'Yamaha LC135', 120.00, true);


-- 7. ZAKAT SETTINGS (Targeting 15 Records - Diverse Bodies)
-- =========================================================================
INSERT INTO employee_zakat_settings (employee_id, zakat_body, deduction_type, amount_or_rate, effective_start_date) VALUES 
(1, 'Lembaga Zakat Selangor', 'FIXED_AMOUNT', 350.00, '2024-01-01'),
(2, 'Pusat Pungutan Zakat (PPZ)', 'FIXED_AMOUNT', 200.00, '2024-01-01'),
(3, 'Lembaga Zakat Selangor', 'FIXED_AMOUNT', 200.00, '2024-01-01'),
(9, 'Pusat Zakat Negeri Sembilan', 'FIXED_AMOUNT', 100.00, '2024-01-01'),
(10, 'Lembaga Zakat Selangor', 'FIXED_AMOUNT', 80.00, '2024-01-01'),
(11, 'PPZ Wilayah', 'FIXED_AMOUNT', 90.00, '2024-01-01'),
(15, 'Lembaga Zakat Selangor', 'FIXED_AMOUNT', 50.00, '2024-02-01'),
(18, 'Lembaga Zakat Selangor', 'FIXED_AMOUNT', 40.00, '2024-10-10'),
-- New Entries to reach 15
(4, 'PPZ Wilayah', 'FIXED_AMOUNT', 150.00, '2024-01-01'),
(5, 'Majlis Agama Islam Johor', 'FIXED_AMOUNT', 120.00, '2024-01-01'),
(6, 'Lembaga Zakat Selangor', 'FIXED_AMOUNT', 110.00, '2024-01-01'),
(8, 'PPZ Wilayah', 'FIXED_AMOUNT', 130.00, '2024-01-01'),
(12, 'Pusat Zakat Pulau Pinang', 'FIXED_AMOUNT', 95.00, '2024-01-01'),
(13, 'PPZ Wilayah', 'FIXED_AMOUNT', 105.00, '2024-01-01'),
(14, 'Lembaga Zakat Selangor', 'FIXED_AMOUNT', 75.00, '2024-01-01');


-- 8. CLAIMS (Targeting 15 Records - Mix of types, statuses, dates)
-- =========================================================================
INSERT INTO claims (employee_id, claim_type, amount, claim_date, description, status, approved_by, vehicle_id) VALUES 
(1, 'FUEL', 150.00, '2025-12-05', 'Site visit to Data Center', 'APPROVED', 'Admin', 1),
(3, 'TOLL', 45.50, '2025-12-10', 'Client Meeting at Cyberjaya', 'APPROVED', 'Admin', NULL),
(5, 'MEDICAL', 80.00, '2025-12-20', 'GP Clinic - Flu', 'APPROVED', 'HR', NULL),
(13, 'FUEL', 60.00, '2026-01-02', 'Network Cabling works at Branch', 'PENDING', NULL, 4),
(18, 'FUEL', 30.00, '2026-01-03', 'Fixing CEO Laptop at home', 'PENDING', NULL, 5),
(2, 'INTERNET', 120.00, '2026-01-04', 'Home Fiber Upgrade bill', 'REJECTED', 'Finance', NULL),
-- New Entries to reach 15
(7, 'FUEL', 25.00, '2026-01-01', 'Emergency onsite support', 'APPROVED', 'Manager', 3),
(4, 'MEDICAL', 150.00, '2025-12-25', 'Dental Checkup', 'APPROVED', 'HR', NULL),
(6, 'TOLL', 12.00, '2026-01-02', 'Meeting with UI Vendor', 'PENDING', NULL, NULL),
(9, 'FUEL', 40.00, '2026-01-03', 'Client Deployment', 'PENDING', NULL, 11),
(11, 'MEDICAL', 65.00, '2025-12-28', 'Fever Medication', 'APPROVED', 'HR', NULL),
(12, 'TOLL', 35.00, '2026-01-04', 'QA Testing at Client Site', 'PENDING', NULL, NULL),
(14, 'FUEL', 55.00, '2026-01-01', 'Data Center Audit', 'APPROVED', 'Manager', 13),
(15, 'MEDICAL', 200.00, '2025-11-15', 'Annual Health Checkup', 'REJECTED', 'HR', NULL), -- Rejected as too expensive/not covered
(20, 'FUEL', 15.00, '2026-01-05', 'Dispatch documents', 'PENDING', NULL, 15);


-- 9. HISTORICAL PAYROLL (December 2025)
-- =========================================================================
INSERT INTO payroll_runs (month, year, status, processed_by, total_payout, run_date) VALUES 
(12, 2025, 'PAID', 'System', 165000.00, '2025-12-28 10:00:00');

-- Payroll Items for ALL 20 Employees (Dec 2025)
INSERT INTO payroll_items (payroll_run_id, employee_id, component_id, amount) VALUES 
(1, 1, 1, 15000), (1, 2, 1, 13500), (1, 3, 1, 12000), (1, 4, 1, 12500), -- Leads
(1, 5, 1, 10500), (1, 6, 1, 9500), (1, 7, 1, 8800), (1, 8, 1, 9000),   -- Seniors
(1, 9, 1, 6500), (1, 10, 1, 5800), (1, 11, 1, 6200), (1, 12, 1, 6000), -- Execs
(1, 13, 1, 7000), (1, 14, 1, 6300), (1, 15, 1, 4500), (1, 16, 1, 3800), -- Mixed
(1, 17, 1, 3500), (1, 18, 1, 3600), (1, 19, 1, 3800), (1, 20, 1, 4000);  -- New Juniors

