ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_degree_check;

ALTER TABLE public.profiles
ADD CONSTRAINT profiles_degree_check 
CHECK (degree = ANY (ARRAY[
  'Licenciatura'::text, 
  'Maestría'::text, 
  'Doctorado'::text, 
  'Especialidad'::text,
  'Estudiante'::text,
  'Profesor'::text
]));
