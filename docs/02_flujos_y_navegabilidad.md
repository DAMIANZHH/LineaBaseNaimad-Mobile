# Documento 02: Flujos de Usuario y Navegabilidad

Este documento define la arquitectura de navegación de la aplicación móvil implementada sobre **Expo Router v6**, los mapas de pantallas y los diagramas de flujo detallados para las tres fases del método de **Islas Lingüísticas**.

---

## 1. Arquitectura de Rutas en Expo Router (`app/`)

El enrutamiento está estructurado siguiendo la convención de carpetas de Expo Router para garantizar un rendimiento óptimo, transiciones fluidas y una clara separación de responsabilidades:

```
app/
├── _layout.tsx                     # Root Layout: Redux Provider, Auth Gate & Tema
├── (auth)/                         # Grupo de autenticación y bienvenida
│   ├── _layout.tsx                 # Stack simple sin cabecera
│   ├── login.tsx                   # Inicio de sesión con JWT
│   ├── register.tsx                # Registro de nuevo usuario
│   └── onboarding.tsx              # Cuestionario inicial (profesión, rutina, metas)
├── (tabs)/                         # Navegación principal en barra inferior (Bottom Tabs)
│   ├── _layout.tsx                 # Configuración de los 4 tabs principales
│   ├── index.tsx                   # TAB 1: Mapa interactivo de Islas Lingüísticas
│   ├── practice/                   # TAB 2: Gimnasio de Práctica Activa (SRS)
│   │   └── index.tsx               # Resumen de repasos diarios y accesos rápidos
│   ├── coach/                      # TAB 3: Asistente Conversacional por Voz
│   │   └── index.tsx               # Chat por notas de voz y selector de roleplays
│   └── profile/                    # TAB 4: Perfil y Estadísticas
│       └── index.tsx               # Métricas de retención, racha y configuración
├── ingestion/                      # Flujos de captura de información (Fase 1)
│   ├── _layout.tsx                 # Stack modal con botón de cierre
│   ├── select-method.tsx           # Selector: Entrevista, Grabación o Llamada
│   ├── interview.tsx               # Entrevista guiada interactiva (Voz/Texto)
│   ├── ambient-recorder.tsx        # Grabación pasiva de ambiente con VAD
│   ├── simulated-call.tsx          # Pantalla de llamada telefónica simulada
│   └── review-island.tsx           # Vista previa, edición y confirmación de frases
├── exercise/                       # Pantallas inmersivas de entrenamiento (Fase 2)
│   ├── _layout.tsx                 # Stack a pantalla completa (sin tab bar)
│   ├── srs-session.tsx             # Sesión de repetición espaciada continua
│   ├── shadowing.tsx               # Pantalla de Shadowing con análisis de onda
│   ├── blind-translation.tsx       # Traducción oral rápida contra reloj
│   └── skills-quiz.tsx             # Cuestionario interactivo (4 skills)
├── island/                         # Detalles de Islas
│   └── [id].tsx                    # Vista detallada de una isla y su catálogo de frases
└── modal.tsx                       # Modal genérico / Notificaciones
```

---

## 2. Mapa de Navegación Visual (Sitemap)

```mermaid
graph TD
    Root["app/_layout.tsx (Root Auth Guard)"] -->|No Autenticado| AuthGroup["(auth)"]
    Root -->|Autenticado| TabsGroup["(tabs) Bottom Bar"]

    subgraph AuthGroup["Área Pública"]
        Login["login.tsx"]
        Register["register.tsx"]
        Onboarding["onboarding.tsx"]
        Login --> Register
        Register --> Onboarding
    end

    subgraph TabsGroup["Navegación Principal"]
        TabIslands["Tab 1: index.tsx (Archipiélago de Islas)"]
        TabPractice["Tab 2: practice/index.tsx (Gimnasio SRS)"]
        TabCoach["Tab 3: coach/index.tsx (Tutor IA de Voz)"]
        TabProfile["Tab 4: profile/index.tsx (Analytics & Ajustes)"]
    end

    TabIslands -->|Tocar botón '+'| IngestModal["ingestion/select-method.tsx"]
    TabIslands -->|Tocar una isla| IslandDetail["island/[id].tsx"]

    IngestModal --> IngestInterview["ingestion/interview.tsx"]
    IngestModal --> IngestRecorder["ingestion/ambient-recorder.tsx"]
    IngestModal --> IngestCall["ingestion/simulated-call.tsx"]
    IngestInterview & IngestRecorder & IngestCall --> IngestReview["ingestion/review-island.tsx"]
    IngestReview -->|Aprobar| TabIslands

    TabPractice -->|Iniciar Repaso Diario| ExerciseSRS["exercise/srs-session.tsx"]
    TabPractice -->|Modo Shadowing| ExerciseShadowing["exercise/shadowing.tsx"]
    TabPractice -->|Modo Traducción Ciega| ExerciseBlind["exercise/blind-translation.tsx"]
    TabPractice -->|Quiz 4-Skills| ExerciseQuiz["exercise/skills-quiz.tsx"]

    TabCoach -->|Seleccionar Escenario| ChatVoice["Conversación Activa de Voz"]
    TabProfile -->|Editar Configuración| SettingsModal["Ajustes de Voz & Cuenta"]
```

---

## 3. Diagramas de Flujo de Usuario Detallados

### Flujo 1: Captura e Ingesta de Información (Fase 1)

El usuario crea una nueva isla de conocimiento utilizando uno de los tres métodos disponibles:

```mermaid
sequenceDiagram
    autonumber
    actor U as Usuario
    participant App as App Móvil (Expo)
    participant API as Backend API
    participant AI as Pipeline NLP / LLM

    U->>App: Presiona "Crear Nueva Isla"
    App->>U: Muestra selector de métodos (Entrevista / Grabadora / Llamada)
    alt Método A: Entrevista Guiada
        U->>App: Selecciona "Entrevista Guiada"
        App->>AI: Solicita preguntas según perfil
        AI-->>App: Envía primera pregunta contextual
        loop Conversación de Ingesta (5-10 turnos)
            App->>U: Reproduce pregunta por voz y texto
            U->>App: Responde con nota de voz o texto en español
            App->>AI: Envía respuesta para análisis y repregunta
        end
    else Método B: Grabación en Ambiente Abierto
        U->>App: Selecciona "Grabación Ambiental"
        App->>App: Solicita permisos de micrófono y background audio
        U->>App: Inicia grabación durante comida/reunión (15-30 min)
        App->>App: Detección de silencios (VAD) y compresión local
        U->>App: Detiene y confirma carga de audio
        App->>API: Sube fragmentos de audio cifrados
    else Método C: Llamada Simulada
        U->>App: Selecciona "Llamada Simulada"
        App->>U: Interfaz de llamada entrante ("Coach Daniel")
        U->>App: Contesta e interactúa en español fluido
    end

    App->>API: Enviar datos recopilados para procesamiento
    API->>AI: Transcripción STT + Limpieza PII + Clustering de frases
    AI-->>API: Retorna Isla estructurada con 10-25 frases en ES + EN nativo
    API-->>App: Notifica "Isla Lista para Revisión"
    App->>U: Pantalla 'review-island.tsx': Permite editar/deseleccionar frases
    U->>App: Confirma "Guardar Isla"
    App->>API: Guarda frases y dispara generación de audios neuronales (TTS)
    App->>U: Redirige al Archipiélago con la nueva Isla activa
```

---

### Flujo 2: Sesión Diaria de Gimnasio Activo (Fase 2)

El estudiante realiza su rutina diaria calculada por el algoritmo de repetición espaciada:

```mermaid
flowchart TD
    Start([Usuario abre la pestaña Práctica]) --> CheckDue{¿Hay tarjetas pendientes hoy?}
    CheckDue -- No --> FreeMode[Ofrecer Práctica Libre o Shadowing Exploratorio]
    CheckDue -- Sí --> LoadQueue[Cargar Cola de Tarjetas SRS desde Caché/API]
    LoadQueue --> CardLoop[Mostrar Siguiente Frase]

    CardLoop --> ExerciseType{Tipo de Ejercicio}

    %% Shadowing
    ExerciseType -- Shadowing --> PlayNative[1. Reproducir Audio Nativo 100% velocidad]
    PlayNative --> UserRecord[2. Usuario presiona botón y graba imitación]
    UserRecord --> WaveformCompare[3. Comparación de Curva de Entonación y Fonemas]
    WaveformCompare --> ShowScore[4. Mostrar Score de Ritmo y Precisión %]

    %% Traducción a Ciegas
    ExerciseType -- Traducción Ciega --> ShowES[1. Mostrar Frase en Español - EN oculto]
    ShowES --> Countdown[2. Temporizador de 5 segundos]
    Countdown --> RecordSpeech[3. Usuario habla en Inglés]
    RecordSpeech --> STTEval[4. STT evalúa coincidencia semántica]
    STTEval --> RevealEN[5. Revelar Frase Modelo en Inglés]

    %% 4-Skills Quiz
    ExerciseType -- 4-Skills Quiz --> MicroQuiz[Ejecutar Dictado o Orden Sintáctico]

    ShowScore & RevealEN & MicroQuiz --> UserRate[Usuario califica esfuerzo: Otra vez / Difícil / Bien / Fácil]
    UserRate --> UpdateInterval[Algoritmo calcula próximo repaso en días]
    UpdateInterval --> MoreCards{¿Quedan tarjetas en la cola?}
    MoreCards -- Sí --> CardLoop
    MoreCards -- No --> SessionComplete[Pantalla de Victoria: Frases Dominadas, Racha +1 día]
```

---

### Flujo 3: Fluidez Conversacional con Agente de IA (Fase 3)

El usuario conversa mediante mensajes de voz para automatizar su capacidad de hablar:

```mermaid
sequenceDiagram
    autonumber
    actor U as Usuario
    participant App as App Móvil
    participant AudioServ as Servidor de Audio & STT
    participant LLM as Agente Tutor IA
    participant TTS as Síntesis de Voz Neuronal

    U->>App: Selecciona Escenario ("Reunión de sprint con cliente")
    App->>LLM: Iniciar sesión con contexto de las Islas del usuario
    LLM-->>App: Mensaje inicial de bienvenida en inglés
    App->>TTS: Generar audio del mensaje
    TTS-->>App: Audio nativo
    App->>U: Reproduce nota de voz del tutor

    loop Diálogo Interactivo (N turnos)
        U->>App: Mantiene presionado botón de micrófono y habla en inglés
        App->>AudioServ: Envía nota de voz del usuario (.m4a / Opus)
        par Evaluación Fonética y Gramatical
            AudioServ->>AudioServ: Pronunciation Assessment (fonemas, acento, pausas)
            AudioServ-->>App: Scores por palabra (Verde, Amarillo, Rojo)
        and Generación de Respuesta Conversacional
            AudioServ->>LLM: Transcripción del usuario
            LLM-->>App: Respuesta conversacional + Píldora de feedback pedagógico
        end
        App->>TTS: Sintetiza respuesta del tutor
        TTS-->>App: Audio de respuesta
        App->>U: Muestra waveform con feedback y reproduce respuesta
        U->>App: Puede tocar cualquier palabra para oír la pronunciación correcta
    end

    U->>App: Presiona "Finalizar Conversación"
    App->>U: Resumen de Desempeño: Palabras dominadas, áreas de mejora y fluidez general
```

---

## 4. Gestión de Estados y Casos Extremos en la App

### 4.1 Manejo de Permisos de Micrófono
- **Detección Previa:** La aplicación verifica permisos antes de entrar a cualquier flujo de grabación mediante `expo-av` o `react-native-permissions`.
- **Estado de Bloqueo:** Si el usuario rechazó el permiso, se muestra una pantalla educativa explicativa con un botón directo a los Ajustes del Sistema Operativo (`Linking.openSettings()`).

### 4.2 Funcionamiento Offline (Sin Conexión)
- **Caché Preventivo de Repasos:** Al abrir la app con conexión, el sistema precarga las tarjetas SRS del día y sus archivos de audio `.mp3` en el almacenamiento local (`FileSystem.documentDirectory`).
- **Registro Local de Intentos:** Si el usuario no tiene conexión durante la sesión de práctica, las calificaciones (Otra vez / Difícil / Bien / Fácil) se encolan en Redux Persist / SQLite local y se sincronizan silenciosamente en segundo plano una vez restaurada la conectividad.

### 4.3 Detección de Ruido de Fondo y Audios Ininteligibles
- Si el módulo de grabación abierta o el ejercicio de habla detecta una relación señal/ruido menor a 12 dB, la interfaz alerta al usuario: *"Demasiado ruido ambiental detectado. Te recomendamos usar auriculares o moverte a un lugar más silencioso"*.
- En caso de que el STT no reconozca ninguna palabra producida, se ofrece la opción de reintentar sin penalizar el puntaje en el SRS.
