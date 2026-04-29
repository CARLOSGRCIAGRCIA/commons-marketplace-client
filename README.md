# Commons Marketplace Client

Cliente web para Commons Marketplace - un marketplace local que conecta compradores con vendedores de su comunidad.

## Características

- **Exploración de productos** - Busca y filtra productos por categoría
- **Tiendas locales** - Descubre tiendas de vendedores en tu comunidad
- **Tienda propia** - Crea y gestiona tu propia tienda
- **Chat en tiempo real** - Comunícate directamente con los vendedores
- **Wishlist** - Guarda tus productos favoritos
- **Panel de administración** - Gestiona usuarios, tiendas y productos
- **Diseño responsive** - Optimizado para móviles y desktop
- **Tema oscuro/claro** - Soporte automático según preferencias del sistema

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Runtime:** React 19
- **Estilos:** Tailwind CSS 4 + CSS Variables personalizadas
- **Estado:** Zustand
- **HTTP Client:** Axios
- **Tiempo real:** Socket.io Client
- **Tipado:** TypeScript 5
- **Animaciones:** Framer Motion
- **Linting:** ESLint + ESLint Config Next.js

## Estructura del Proyecto

```
commons-marketplace-client/
├── app/                          # Next.js App Router
│   ├── admin/                    # Panel de administración
│   │   ├── categories/           # Gestión de categorías
│   │   ├── products/             # Gestión de productos
│   │   └── users/               # Gestión de usuarios
│   ├── dashboard/                # Dashboard de vendedor
│   │   └── my-store/
│   │       ├── edit/             # Editar tienda
│   │       └── products/         # Gestionar productos
│   ├── products/                 # Catálogo de productos
│   │   ├── [slug]/              # Detalle de producto
│   │   ├── search-bar.tsx        # Barra de búsqueda
│   │   ├── categories-sidebar.tsx # Filtro de categorías
│   │   └── products-list.tsx     # Lista de productos
│   ├── stores/                   # Catálogo de tiendas
│   │   └── [slug]/              # Detalle de tienda
│   ├── login/                    # Inicio de sesión
│   ├── register/                 # Registro de usuario
│   ├── profile/                 # Perfil de usuario
│   └── wishlist/                # Lista de deseos
├── components/                    # Componentes reutilizables
│   ├── ui/                       # Componentes base (Button, Input, etc.)
│   ├── layout/                   # Navbar, Footer
│   └── chat/                    # Chat components
├── hooks/                        # Custom hooks
│   ├── use-products.ts           # Hook para productos
│   ├── use-stores.ts             # Hook para tiendas
│   └── use-auth.ts               # Hook para autenticación
├── lib/                          # Utilidades y configuración
│   ├── api/                      # Cliente API y endpoints
│   └── types.ts                 # Tipos de TypeScript
├── public/                        # Archivos estáticos
└── types/                         # Definiciones de tipos globales
```

## Getting Started

### Prerequisitos

- Node.js 18+
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
# o
yarn install
# o
pnpm install
```

3. Configura las variables de entorno:
```bash
cp .env.example .env.local
```
Edita `.env.local` con tus valores:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
```

4. Inicia el servidor de desarrollo:
```bash
npm run dev
```

Abre [http://localhost:4000](http://localhost:4000) en tu navegador.

## Scripts Disponibles

```bash
npm run dev        # Inicia servidor de desarrollo en puerto 4000
npm run build      # Build de producción
npm run start      # Inicia servidor de producción
npm run lint       # Ejecuta ESLint
```

## Variables de Entorno

| Variable | Descripción | Requerida |
|----------|-------------|----------|
| `NEXT_PUBLIC_API_URL` | URL del backend API | Sí |
| `NEXT_PUBLIC_SOCKET_URL` | URL para Socket.io | Sí |
| `URL_BACKEND` | URL del backend (fallback) | No |

## Integración con Backend

El cliente se comunica con el backend a través de:
- **REST API** - CRUD operations via Axios
- **WebSocket** - Chat en tiempo real via Socket.io
- **Autenticación** - JWT tokens con refresh automático

### Endpoints Principales

- `/api/v1/products` - Productos
- `/api/v1/stores` - Tiendas
- `/api/v1/categories` - Categorías
- `/api/v1/auth` - Autenticación
- `/api/v1/chat` - Chat

## Características SEO

- Metadatos dinámicos por página
- Open Graph y Twitter Cards
- URLs amigables
- Sitemap XML (pendiente)
- Structured Data (pendiente)

## Despliegue

### Vercel (Recomendado)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/tu-usuario/commons-marketplace-client)

### Self-hosting

```bash
npm run build
npm run start
```

## Contribución

1. Fork el proyecto
2. Crea tu rama de características (`git checkout -b feature/nueva-caracteristica`)
3. Commit tus cambios (`git commit -m 'Agrega nueva característica'`)
4. Push a la rama (`git push origin feature/nueva-caracteristica`)
5. Abre un Pull Request

## Licencia

ISC
