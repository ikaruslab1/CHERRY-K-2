-- 1. Actualizar registros existentes para cumplir con los nuevos tipos permitidos

-- 'Charla' se puede mapear a 'Ponencia' o 'Conferencia' (Asumiendo Ponencia por similitud)
UPDATE events SET type = 'Ponencia' WHERE type = 'Charla';

-- Normalizar capitalización si es necesario
UPDATE events SET type = 'Conferencia Magistral' WHERE type = 'Conferencia magistral';

-- Mapear cualquier otro valor desconocido a 'Actividad'
UPDATE events 
SET type = 'Actividad' 
WHERE type NOT IN ('Taller', 'Ponencia', 'Actividad', 'Conferencia', 'Conferencia Magistral');

-- 2. Agregar restricción de verificación (Check Constraint)
ALTER TABLE events
ADD CONSTRAINT check_event_type_valid
CHECK (type IN ('Taller', 'Ponencia', 'Actividad', 'Conferencia', 'Conferencia Magistral'));
