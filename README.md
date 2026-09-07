# Commons Marketplace Client

Cliente web para Commons Marketplace - un marketplace local que conecta compradores con vendedores de su comunidad.

## Características

- **Exploración de productos** - Busca y filtra productos por categoría con caché inteligente
- **Tiendas locales** - Descubre tiendas de vendedores en tu comunidad
- **Tienda propia** - Crea y gestiona tu propia tienda con upload de imágenes
- **Chat en tiempo real** - Comunícate directamente con los vendedores via Socket.io
- **Wishlist** - Guarda tus productos favoritos
- **Panel de administración** - Gestiona usuarios, tiendas y productos
- **Diseño responsive** - Optimizado para móviles y desktop
- **Tema oscuro/claro** - Soporte automático según preferencias del sistema
- **Autenticación JWT** - Login con refresh automático de tokens
- **RBAC** - Control de acceso por roles (buyer, seller, admin)

## Tech Stack

| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| Next.js | 16.2.4 | Framework (App Router) |
| React | 19.2.4 | UI Library |
| TypeScript | 5.x | Tipado estático (strict mode) |
| Tailwind CSS | 4.x | Estilos utility-first |
| Zustand | 5.x | Estado global (2 stores) |
| Axios | 1.15.1 | HTTP client con JWT refresh |
| Socket.io Client | 4.8.3 | WebSocket en tiempo real |
| Framer Motion | 12.38.0 | Animaciones |
| Vitest | 2.x | Unit testing |

## Arquitectura

### Estructura de Directorios

```
commons-marketplace-client/
├── app/                              # Next.js App Router (rutas)
│   ├── (auth)/                       # Login, register
│   ├── (public)/                     # Productos, tiendas públicas
│   ├── (dashboard)/                  # Dashboard de vendedor
│   ├── (admin)/                      # Panel de administración
│   ├── profile/
│   ├── wishlist/
│   └── api/health/
│
├── components/                       # Componentes por dominio
│   ├── ui/                           # Primitivas base (Button, Input, Card, etc.)
│   ├── layout/                       # Navbar, Footer
│   ├── chat/                         # Chat widget (lazy-loaded)
│   ├── products/                     # ProductCard, ProductsList, SearchBar
│   └── stores/                       # StoreCard, StoresList
│
├── hooks/                            # Custom hooks
│   ├── use-auth.ts                   # Autenticación + RBAC
│   ├── use-products.ts               # Products con caché
│   ├── use-stores.ts                 # Stores con caché
│   ├── use-categories.ts             # Categories con caché
│   ├── use-reviews.ts                # Reviews
│   └── use-form-field.ts             # Abstracción de formularios
│
├── lib/                              # Utilidades y API
│   ├── api/                          # Cliente API + endpoints
│   ├── validation.ts                 # Validación de campos
│   ├── sanitize.ts                   # Sanitización de inputs
│   └── socket.ts                     # Socket.io client
│
├── store/                            # Zustand stores
│   ├── auth-store.ts                 # Auth (persist en localStorage + cookies)
│   └── wishlist-store.ts             # Wishlist
│
├── types/                            # TypeScript types centralizados
│   ├── index.ts                      # Entidades core
│   ├── api.ts                        # API response types
│   └── chat.ts                       # Chat types
│
├── middleware.ts                      # Auth + RBAC middleware
├── vitest.config.ts                  # Test configuration
└── __tests__/                        # Unit tests
```

### Capas de Arquitectura

```
┌─────────────────────────────────────────┐
│          PRESENTATION LAYER             │
│  app/ (pages) + components/ (UI)        │
│  Server Components → SEO/metadata       │
│  Client Components → interactividad     │
├─────────────────────────────────────────┤
│            STATE LAYER                  │
│  store/ (Zustand) + hooks/              │
│  auth-store: sesión persistida          │
│  hooks: orquestan data + estado local   │
├─────────────────────────────────────────┤
│            DATA LAYER                   │
│  lib/api/ (Axios client)                │
│  Token injection + refresh + retry      │
│  Domain modules: auth, products, etc.   │
├─────────────────────────────────────────┤
│        INFRASTRUCTURE LAYER             │
│  middleware.ts + nginx/ + Docker        │
│  Auth guards + reverse proxy           │
└─────────────────────────────────────────┘
```

## Getting Started

### Prerequisitos

- Node.js 22+
- npm, yarn, pnpm o bun
- Servidor backend corriendo (ver variables de entorno)

### Instalación

1. Clona el repositorio:
```bash
git clone https://github.com/tu-usuario/commons-marketplace-client.git
cd commons-marketplace-client
```

2. Instala las dependencias:
```bash
npm install
```

3. Configura las variables de entorno:
```bash
cp .env.example .env.local
```

4. Inicia el servidor de desarrollo:
```bash
npm run dev
```

Abre [http://localhost:4000](http://localhost:4000) en tu navegador.

### Docker

```bash
docker-compose up -d
```

Esto levanta: client (4000), backend (5000), postgres, redis, nginx (8080).

## Scripts Disponibles

```bash
npm run dev          # Servidor de desarrollo en puerto 4000
npm run build        # Build de producción
npm run start        # Servidor de producción
npm run lint         # ESLint
npm run test         # Vitest (unit tests)
npm run test:watch   # Vitest en watch mode
npm run test:coverage # Tests con cobertura
```

## Variables de Entorno

| Variable | Descripción | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | URL del backend API (browser) | same-origin |
| `NEXT_PUBLIC_SOCKET_URL` | URL para Socket.io | fallback a NEXT_PUBLIC_API_URL |
| `INTERNAL_API_ORIGIN` | URL interna del backend (server-side rewrites) | `http://localhost:5000` |
| `CLIENT_PORT` | Puerto del client (docker-compose) | `4000` |
| `BACKEND_PORT` | Puerto del backend (docker-compose) | `5000` |
| `NGINX_HTTP_PORT` | Puerto de nginx proxy (docker-compose) | `8080` |

## Integración con Backend

- **REST API** - CRUD via Axios con auto-refresh de JWT
- **WebSocket** - Chat en tiempo real via Socket.io
- **Auth** - JWT tokens con refresh automático en 401
- **Rewrites** - `/api/*` se proxya al backend via Next.js server rewrites

### Endpoints Principales

| Endpoint | Módulo |
|----------|--------|
| `/api/v1/auth/*` | Autenticación (register, login, logout, refresh) |
| `/api/v1/products` | Productos (CRUD + filtros) |
| `/api/v1/stores` | Tiendas (CRUD + status) |
| `/api/v1/categories` | Categorías |
| `/api/v1/reviews` | Reseñas |
| `/api/v1/chat/*` | Chat (conversaciones, mensajes) |
| `/api/v1/wishlist` | Lista de deseos |
| `/api/v1/admin/*` | Administración |

## Testing

```bash
# Unit tests
npm test

# Watch mode
npm run test:watch

# Cobertura
npm run test:coverage
```

Los tests cubren:
- `lib/validation.ts` - Validación de campos
- `lib/sanitize.ts` - Sanitización de inputs
- `types/` - Helper functions para entidades

## Despliegue

### Docker (Recomendado)

```bash
docker-compose --profile production up -d
```

### Self-hosting

```bash
npm run build
npm run start
```

### CI/CD

GitHub Actions ejecuta automáticamente:
1. **Lint & Typecheck** - ESLint + TypeScript
2. **Test** - Vitest unit tests
3. **Security** - npm audit
4. **Build & Push** - Docker image a GHCR (solo en main)

## Contribución

1. Fork el proyecto
2. Crea tu rama (`git checkout -b feature/nueva-caracteristica`)
3. Commit tus cambios (`git commit -m 'Agrega nueva característica'`)
4. Push a la rama (`git push origin feature/nueva-caracteristica`)
5. Abre un Pull Request

### Guía de Código

- **Components**:命名 en PascalCase, en `components/{domain}/`
- **Hooks**:命名 en `use-{name}.ts`, en `hooks/`
- **Types**: Centralizados en `types/`
- **Tests**: En `__tests__/{domain}/` con sufijo `.test.ts`

## Licencia

ISC
