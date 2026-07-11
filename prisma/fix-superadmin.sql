update auth.users set encrypted_password = crypt('Admin@123', gen_salt('bf')) where email = 'superadmin@mpproduction.com';
