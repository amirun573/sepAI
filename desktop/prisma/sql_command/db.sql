SET TIMEZONE TO 'UTC';


CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
SELECT * FROM pg_extension WHERE extname = 'uuid-ossp';


INSERT INTO "Region" (region_code, region_name, active, created_at, updated_at, uuid)
VALUES ('asia', 'ASIA', true, now(), now(),uuid_generate_v4());

INSERT INTO "Country" (
    country_code, 
    country_name, 
    region_id, 
    currency, 
    currency_code, 
    active, 
    created_at, 
    updated_at, 
    country_phone_code,
    uuid
)
VALUES (
    'my', 
    'MALAYSIA', 
    (SELECT region_id FROM "Region" WHERE region_code = 'asia'), 
    'Ringgit', 
    'MYR', 
    true, 
    now(), 
    now(), 
    '+60',
    uuid_generate_v4()
);

INSERT INTO "Feature" (
  feature_code,
  feature_name,
  description,
  feature_link,uuid
) VALUES
  ('report',                 
   'Report',           
   'Report will show the usage for credit.',   
   '/report',uuid_generate_v4()),
   
  ('employee_details',            
   'Employee Details',          
   'Show Details of Employee.', 
   '/employee-details',uuid_generate_v4()),
   
    ('subsidy',                 
   'Subsidy',           
   'Setup Subsidy.',   
   '/subsidy',uuid_generate_v4());
   
   ;


INSERT INTO "SubsidyType" (
  subsidy_type_code,
  subsidy_type_name,
  price,
   created_at, 
   updated_at,
   uuid
) VALUES (
  'meal',
  'Meal Subsidy',
  5,
  now(),
  now(),
  uuid_generate_v4()
);


INSERT INTO "Role"(
  role_code,
  role_name,
     created_at, 
   updated_at,
   uuid
) VALUES (
  'super_admin',
  'Super Admin',
   now(),
  now(),
  uuid_generate_v4()
);

INSERT INTO "Role"(
  role_code,
  role_name,
   created_at, 
   updated_at,
   uuid
) VALUES (
  'employee',
  'Employee',
  now(),
  now(),
  uuid_generate_v4()
);

INSERT INTO "EmployeeCategory" (employee_category_code, employee_category_name, uuid)
VALUES 
('dl', 'DIRECT LABOUR',uuid_generate_v4()),
('idl', 'INDIRECT LABOUR',uuid_generate_v4()),
('ndl', 'Non Eligible DIRECT LABOUR',uuid_generate_v4());


INSERT INTO "Department" (department_code, department_name,created_at, 
   updated_at, uuid)
VALUES 
  ('hr', 'HUMAN RESOURCE',now(),now(),uuid_generate_v4()),
  ('finance', 'FINANCE',now(),now(),uuid_generate_v4()),
  ('op', 'OPERATIONS',now(),now(),uuid_generate_v4()),
  ('cs', 'CUSTOMER SERVICE',now(),now(),uuid_generate_v4()),
  ('en', 'ENGINEERING',now(),now(),uuid_generate_v4()),
  ('fc', 'FACILITIES',now(),now(),uuid_generate_v4()),
  ('hs&e', 'HS&E',now(),now(),uuid_generate_v4()),
  ('it', 'INFORMATION TECHNOLOGY',now(),now(),uuid_generate_v4()),
  ('pm', 'PRODUCT MANAGEMENT',now(),now(),uuid_generate_v4()),
  ('pr', 'PRODUCTION',now(),now(),uuid_generate_v4()),
  ('qa', 'QUALITY ASSURANCE',now(),now(),uuid_generate_v4()),
  ('rc', 'REGIONAL COMMUNICATION',now(),now(),uuid_generate_v4()),
  ('sa', 'SALES',now(),now(),uuid_generate_v4()),
  ('sc', 'SUPPLY CHAIN',now(),now(),uuid_generate_v4()),
  ('qc', 'QUALITY CONTROL',now(),now(),uuid_generate_v4()),
  ('cashier', 'CASHIER',now(),now(),uuid_generate_v4())
  

  ;

  INSERT INTO "CostCenter" (cost_center_code,created_at, 
   updated_at,uuid)
VALUES
  ('037-31',now(),now(),uuid_generate_v4()),
  ('037-3001',now(),now(),uuid_generate_v4()),
  ('037-60',now(),now(),uuid_generate_v4()),
  ('037-6962',now(),now(),uuid_generate_v4()),
  ('037-6077',now(),now(),uuid_generate_v4()),
  ('037-30',now(),now(),uuid_generate_v4()),
  ('037-3101',now(),now(),uuid_generate_v4()),
  ('037-34',now(),now(),uuid_generate_v4()),
  ('037-3401',now(),now(),uuid_generate_v4()),
  ('037-38',now(),now(),uuid_generate_v4()),
  ('037-6071',now(),now(),uuid_generate_v4()),
  ('037-33',now(),now(),uuid_generate_v4()),
  ('037-32',now(),now(),uuid_generate_v4()),
  ('037-3801',now(),now(),uuid_generate_v4()),
  ('037-3301',now(),now(),uuid_generate_v4())

;

INSERT INTO "User" (employee_id, email,password_hash,active, role_id, is_email_verified,is_acc_verify,department_id, cost_center_id,employee_category_id,created_at, 
   updated_at,uuid)
VALUES ('13129',
'admin@watlow.com', 
'$2b$10$xh4BExYtlEvdYcg.voMn5.3QoNFbWDG62Q8weecFReOGYrSn6YowW',
true,
(SELECT role_id FROM "Role" WHERE role_code = 'super_admin'),
true,
true,
(SELECT department_id FROM "Department" WHERE department_code = 'hr'),
(SELECT cost_center_id FROM "CostCenter" WHERE cost_center_code = '037-31'),
(SELECT employee_category_id FROM "EmployeeCategory" WHERE employee_category_code = 'dl'),
now(),now(),uuid_generate_v4()
);

INSERT INTO "UserDetails"(name,user_id,created_at,updated_at,uuid, country_id)
VALUES ('Super Admin', 
(SELECT user_id FROM "User" WHERE email = 'admin@watlow.com'),

now(), 
now(),
uuid_generate_v4(),
(SELECT country_id FROM "Country" WHERE country_code = 'my')

);

INSERT INTO "UserFeatures"(user_id,feature_id,is_read, is_write,uuid,created_at,updated_at)
VALUES (
(SELECT user_id FROM "User" WHERE email = 'admin@watlow.com'),
(SELECT feature_id FROM "Feature" WHERE feature_code = 'report'),
true,
true,
uuid_generate_v4(),
now(), 
now()
),
 (
(SELECT user_id FROM "User" WHERE email = 'admin@watlow.com'),
(SELECT feature_id FROM "Feature" WHERE feature_code = 'employee_details'),
true,
true,
uuid_generate_v4(),
now(), 
now()
),
 (
(SELECT user_id FROM "User" WHERE email = 'admin@watlow.com'),
(SELECT feature_id FROM "Feature" WHERE feature_code = 'subsidy'),
true,
true,
uuid_generate_v4(),
now(), 
now()
);

INSERT INTO "Subsidy"(subsidy_type_id,applicable, start_date,uuid,created_at,updated_at,amount,user_id)
VALUES
(
  (SELECT subsidy_type_id FROM "SubsidyType" WHERE subsidy_type_code = 'meal'),
  true,
  now(),
  uuid_generate_v4(),
now(),
now(),
5,
(SELECT user_id FROM "User" WHERE email = 'admin@watlow.com')



);




