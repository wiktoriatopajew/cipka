-- Poprawa typu kolumny has_subscription na BOOLEAN w tabeli users
ALTER TABLE users ALTER COLUMN has_subscription TYPE BOOLEAN USING has_subscription::BOOLEAN;

-- (Opcjonalnie) Popraw inne kolumny boolean, jeśli są typu integer:
ALTER TABLE users ALTER COLUMN is_admin TYPE BOOLEAN USING is_admin::BOOLEAN;
ALTER TABLE users ALTER COLUMN is_online TYPE BOOLEAN USING is_online::BOOLEAN;
ALTER TABLE users ALTER COLUMN is_blocked TYPE BOOLEAN USING is_blocked::BOOLEAN;
