-- Add 'ponente' to the user_role enum
-- This allows the 'ponente' role to be assigned to users in the profiles table.
-- Since 'ponente' is intended to have the same rights as 'user', existing RLS policies 
-- that apply to non-staff/non-admin users will automatically cover this new role.

ALTER TYPE user_role ADD VALUE 'ponente';
