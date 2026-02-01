-- Archivo de ejemplos de actividades ficticias para pruebas
-- Se incluyen 10 eventos con variaciones en duración, certificados, ubicación y tipos.

INSERT INTO events (title, description, location, date, type, image_url, gives_certificate, duration_days)
VALUES
  (
    'Taller de React Avanzado', 
    'Aprende patrones avanzados de React, optimización de rendimiento y Hooks personalizados. Ideal para desarrolladores con experiencia previa.', 
    'Sala de Conferencias A', 
    NOW() + interval '2 days', 
    'Taller', 
    'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&auto=format&fit=crop&q=60', 
    TRUE, 
    3
  ),
  (
    'Conferencia de Inteligencia Artificial', 
    'Descubre las últimas tendencias en IA, Machine Learning y Redes Neuronales. Ponentes internacionales y networking.', 
    'Auditorio Principal', 
    NOW() + interval '5 days', 
    'Conferencia', 
    'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&auto=format&fit=crop&q=60', 
    FALSE, 
    1
  ),
  (
    'Hackathon Cherry-K 2026', 
    '48 horas de programación intensa. Crea soluciones innovadoras y gana premios increíbles. Comida y bebidas incluidas.', 
    'Laboratorio de Computación 1', 
    NOW() + interval '10 days', 
    'Actividad', 
    'https://images.unsplash.com/photo-1504384308090-c54be3852f33?w=800&auto=format&fit=crop&q=60', 
    TRUE, 
    2
  ),
  (
    'Seminario de UX/UI Moderno', 
    'Exploraremos los principios de diseño centrado en el usuario y las nuevas herramientas de prototipado como Figma.', 
    'Aula 304', 
    NOW() + interval '12 days', 
    'Conferencia', 
    'https://images.unsplash.com/photo-1586717791821-3f44a5638d48?w=800&auto=format&fit=crop&q=60', 
    TRUE, 
    1
  ),
  (
    'Curso Intensivo de Python', 
    'Desde cero a experto en Python. Cubriremos sintaxis básica, estructuras de datos y una introducción a Data Science.', 
    'Online (Zoom)', 
    NOW() + interval '15 days', 
    'Taller', 
    'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=800&auto=format&fit=crop&q=60', 
    TRUE, 
    5
  ),
  (
    'Charla: Ciberseguridad en 2026', 
    'Cómo proteger tus aplicaciones y datos en un mundo cada vez más conectado. Estrategias de defensa y casos de estudio.', 
    'Sala Virtual B', 
    NOW() + interval '20 days', 
    'Ponencia', 
    'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&auto=format&fit=crop&q=60', 
    FALSE, 
    1
  ),
  (
    'Workshop de Diseño Gráfico Publicitario', 
    'Aprende a crear piezas gráficas de alto impacto para redes sociales y campañas publicitarias usando Adobe Creative Cloud.', 
    'Estudio de Diseño', 
    NOW() + interval '25 days', 
    'Taller', 
    'https://images.unsplash.com/photo-1626785774573-4b799314346d?w=800&auto=format&fit=crop&q=60', 
    TRUE, 
    2
  ),
  (
    'Reunión de Networking para Startups', 
    'Conecta con otros emprendedores, inversores y mentores. Una oportunidad única para hacer crecer tu red de contactos.', 
    'Cafetería Central', 
    NOW() + interval '1 day', 
    'Actividad', 
    'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=800&auto=format&fit=crop&q=60', 
    FALSE, 
    1
  ),
  (
    'Clase de Yoga para Programadores', 
    'Relaja tu mente y cuerpo después de largas horas de código. Ejercicios específicos para mejorar la postura y reducir el estrés.', 
    'Gimnasio del Campus', 
    NOW() + interval '3 days', 
    'Actividad', 
    'https://images.unsplash.com/photo-1544367563-12123d8965cd?w=800&auto=format&fit=crop&q=60', 
    FALSE, 
    1
  ),
  (
    'Bootcamp Full Stack Developer', 
    'Entrenamiento intensivo de una semana cubriendo frontend, backend y despliegue. Proyecto final incluido.', 
    'Sala de Entrenamiento IT', 
    NOW() + interval '30 days', 
    'Taller', 
    'https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=800&auto=format&fit=crop&q=60', 
    TRUE, 
    7
  );
