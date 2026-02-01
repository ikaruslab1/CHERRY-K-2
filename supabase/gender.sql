-- 1. Actualizar registros existentes que no cumplan con el nuevo criterio
-- Se asigna 'Neutro' a cualquier valor que no sea 'Masculino' o 'Femenino'
UPDATE profiles
SET gender = 'Neutro'
WHERE gender NOT IN ('Masculino', 'Femenino', 'Neutro');

-- 2. Agregar restricción de verificación (Check Constraint)
ALTER TABLE profiles
ADD CONSTRAINT check_gender_valid
CHECK (gender IN ('Masculino', 'Femenino', 'Neutro'));
