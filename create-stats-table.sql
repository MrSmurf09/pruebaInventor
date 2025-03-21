-- Crear tabla para estadísticas de juego
CREATE TABLE IF NOT EXISTS "GameStats" (
  "id" SERIAL PRIMARY KEY,
  "userId" VARCHAR NOT NULL,
  "mode" VARCHAR NOT NULL,
  "timeSpent" INTEGER NOT NULL,
  "completedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Crear política para permitir inserciones anónimas
CREATE POLICY "Permitir inserciones anónimas en GameStats" 
ON "GameStats" 
FOR INSERT 
TO anon 
USING (true);

-- Crear política para permitir selecciones anónimas
CREATE POLICY "Permitir selecciones anónimas en GameStats" 
ON "GameStats" 
FOR SELECT 
TO anon 
USING (true);

