To setup db, after creating a user with psql -U postgres
we ran these commands

-- Create a new role
CREATE ROLE admin WITH LOGIN PASSWORD 'admin';
-- Optionally enable the role to create databases
ALTER ROLE admin CREATEDB;

-- Create a new database with the new role as its owner
CREATE DATABASE dharma OWNER admin;

-- Grant all privileges of the new database to the new role
GRANT ALL PRIVILEGES ON DATABASE dharma TO admin;

-- Grant CREATE on the database (if needed)
GRANT CREATE ON DATABASE dharma TO admin;

-- Grant usage on the schema
GRANT USAGE ON SCHEMA public TO admin;

-- Grant all privileges on all tables in the public schema
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO admin;

-- Optionally, grant privileges on sequences
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO admin;

-- If you also want the admin to be able to create new schemas:
GRANT CREATE ON DATABASE dharma TO admin;
