import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/appointments/send-confirmations(.*)',
  '/api/whatsapp/webhook(.*)'
])

// Lista de rotas especiais que não são slugs de clínica
const specialRoutes = new Set([
  'dashboard',
  'agenda', 
  'pacientes',
  'profissionais',
  'create-clinic',
  'api',
  '_next',
  'sign-in',
  'sign-up'
])

export default clerkMiddleware(async (auth, req) => {
  const { pathname } = req.nextUrl
  
  // Verificar se é uma rota de clínica dinâmica
  const clinicSlugMatch = pathname.match(/^\/([^/]+)(?:\/.*)?$/)
  
  if (clinicSlugMatch && !isPublicRoute(req) && !pathname.startsWith('/api')) {
    const slug = clinicSlugMatch[1]
    
    // Verificar se não é uma rota especial
    if (!specialRoutes.has(slug)) {
      // Validar formato do slug (segurança)
      if (!/^[a-z0-9-]+$/.test(slug)) {
        return NextResponse.redirect(new URL('/', req.url))
      }
      
      // É potencialmente uma rota de clínica, proteger com auth
      await auth.protect()
      
      // A validação da clínica será feita no componente da página
      // não no middleware para evitar problemas com Prisma
      return NextResponse.next()
    }
  }
  
  if (!isPublicRoute(req)) {
    await auth.protect()
  }
})

export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
}