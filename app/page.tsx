'use client'
import React, { useState, useEffect, useRef } from 'react';
import { ShieldCheck, CalendarDays, Users, BarChart2, MessageCircle, Star, Menu, X } from 'lucide-react';
import mochup from '../public/mochup.png'
// Dados para a página (poderiam vir de uma API)
const navLinks = [
  { href: '#features', label: 'Funcionalidades' },
  { href: '#how-it-works', label: 'Como Funciona' },
  { href: '#pricing', label: 'Planos' },
  { href: '#testimonials', label: 'Depoimentos' },
];

const features = [
  {
    icon: <CalendarDays className="h-8 w-8 text-indigo-500" />,
    title: 'Agenda Inteligente',
    description: 'Visualize e gerencie todos os agendamentos em uma interface simples e intuitiva. Chega de conflitos de horários.',
  },
  {
    icon: <MessageCircle className="h-8 w-8 text-indigo-500" />,
    title: 'Lembretes Automáticos',
    description: 'Reduza as faltas com lembretes automáticos via WhatsApp e E-mail para seus pacientes.',
  },
  {
    icon: <Users className="h-8 w-8 text-indigo-500" />,
    title: 'Gestão de Pacientes',
    description: 'Mantenha um histórico completo de cada paciente, com informações de contato, consultas e observações.',
  },
  {
    icon: <BarChart2 className="h-8 w-8 text-indigo-500" />,
    title: 'Relatórios e Insights',
    description: 'Tome decisões mais inteligentes com relatórios detalhados sobre agendamentos, faturamento e desempenho.',
  },
];

const testimonials = [
  {
    name: 'Dr.ª Ana Clara',
    role: 'Fisioterapeuta',
    quote: 'O AgendaFácil transformou a gestão do meu consultório. Meus pacientes adoram a facilidade de marcar online e a taxa de ausência diminuiu 70%!',
    avatar: 'https://placehold.co/100x100/E2E8F0/4A5568?text=AC',
  },
  {
    name: 'Clínica Sorriso',
    role: 'Clínica Odontológica',
    quote: 'A melhor decisão que tomamos! A plataforma é robusta, intuitiva e o suporte é incrível. Nossas secretárias agora focam no que realmente importa: o atendimento.',
    avatar: 'https://placehold.co/100x100/E2E8F0/4A5568?text=CS',
  },
  {
    name: 'Pedro Martins',
    role: 'Psicólogo',
    quote: 'Simplesmente indispensável. Consigo gerenciar meus horários de qualquer lugar, e os lembretes automáticos são uma mão na roda para mim e para meus clientes.',
    avatar: 'https://placehold.co/100x100/E2E8F0/4A5568?text=PM',
  },
];

const pricingTiers = [
  {
    name: 'Essencial',
    price: 'R$ 49',
    frequency: '/mês',
    description: 'Perfeito para profissionais autônomos e pequenos consultórios.',
    features: ['1 Profissional', 'Até 100 agendamentos/mês', 'Lembretes via E-mail', 'Suporte Básico'],
    cta: 'Começar Agora',
    mostPopular: false,
  },
  {
    name: 'Profissional',
    price: 'R$ 99',
    frequency: '/mês',
    description: 'Ideal para clínicas em crescimento que precisam de mais recursos.',
    features: ['Até 5 Profissionais', 'Agendamentos Ilimitados', 'Lembretes via WhatsApp', 'Relatórios Avançados', 'Suporte Prioritário'],
    cta: 'Escolher Plano',
    mostPopular: true,
  },
  {
    name: 'Empresarial',
    price: 'Contato',
    frequency: '',
    description: 'Soluções personalizadas para grandes clínicas e redes.',
    features: ['Profissionais Ilimitados', 'API de Integração', 'Gerente de Contas Dedicado', 'Marca Branca'],
    cta: 'Falar com um especialista',
    mostPopular: false,
  },
];

const faqs = [
    {
        question: 'Preciso instalar algum programa?',
        answer: 'Não! Nossa plataforma é 100% online. Você e seus pacientes podem acessá-la de qualquer dispositivo com internet, seja computador, tablet ou celular.'
    },
    {
        question: 'Existe um período de teste gratuito?',
        answer: 'Sim! Oferecemos um teste gratuito de 14 dias no plano Profissional para você experimentar todos os recursos sem compromisso. Não é necessário cartão de crédito.'
    },
    {
        question: 'Meus dados estão seguros?',
        answer: 'Com certeza. A segurança é nossa prioridade máxima. Usamos criptografia de ponta e seguimos as melhores práticas do mercado para garantir a proteção e a confidencialidade dos seus dados e dos seus pacientes.'
    },
    {
        question: 'Posso cancelar a qualquer momento?',
        answer: 'Sim. Você pode cancelar sua assinatura a qualquer momento, sem taxas ou burocracia. O acesso à plataforma permanecerá ativo até o final do período já pago.'
    }
];

// Componente para animar elementos ao rolar a página
const AnimateOnScroll = ({ children, className, delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) => {
    const ref = useRef(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    observer.unobserve(entry.target);
                }
            },
            { threshold: 0.1 } // Anima quando 10% do elemento está visível
        );

        if (ref.current) {
            observer.observe(ref.current);
        }

        return () => {
            if (ref.current) {
                observer.unobserve(ref.current);
            }
        };
    }, []);

    return (
        <div
            ref={ref}
            className={`${className} transition-all duration-700 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
            style={{ transitionDelay: `${delay}ms` }}
        >
            {children}
        </div>
    );
};


// Componente para o Accordion do FAQ (estilo inspirado em Shadcn/UI)
const FaqItem = ({ question, answer }: { question: string; answer: string }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="border-b border-gray-200 py-6">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex justify-between items-center text-left text-lg font-medium text-gray-800 hover:text-indigo-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded"
            >
                <span className="flex-1 pr-4">{question}</span>
                 <svg
                    className={`w-5 h-5 transform transition-transform duration-300 flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                </svg>
            </button>
            <div
                className={`grid transition-all duration-500 ease-in-out ${isOpen ? 'grid-rows-[1fr] opacity-100 mt-4' : 'grid-rows-[0fr] opacity-0'}`}
            >
                <div className="overflow-hidden">
                    <p className="text-gray-600 pb-2">
                        {answer}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="bg-white font-sans antialiased text-gray-900">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-sm shadow-sm">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <a href="#" className="text-2xl font-bold text-indigo-600 flex items-center">
            <CalendarDays className="h-7 w-7 mr-2" />
            AgendaFácil
          </a>
          <nav className="hidden md:flex space-x-8">
            {navLinks.map((link) => (
              <a key={link.href} href={link.href} className="text-gray-600 hover:text-indigo-600 transition-colors duration-200">
                {link.label}
              </a>
            ))}
          </nav>
          <div className="hidden md:flex items-center space-x-4">
            <a href="/dashboard" className="text-gray-600 hover:text-indigo-600">Login</a>
            <a href="#pricing" className="bg-indigo-600 text-white px-5 py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors duration-200 shadow">
              Começar Agora
            </a>
          </div>
          <div className="md:hidden">
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-gray-600 hover:text-indigo-600 focus:outline-none">
              {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white shadow-lg">
            <div className="flex flex-col items-center space-y-4 px-6 py-4">
              {navLinks.map((link) => (
                <a key={link.href} href={link.href} onClick={() => setIsMenuOpen(false)} className="text-gray-600 hover:text-indigo-600 w-full text-center py-2">
                  {link.label}
                </a>
              ))}
              <a href="/dashboard" className="text-gray-600 hover:text-indigo-600 w-full text-center py-2">Login</a>
              <a href="/dashboard" onClick={() => setIsMenuOpen(false)} className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors duration-200 shadow w-full text-center">
                Começar Agora
              </a>
            </div>
          </div>
        )}
      </header>

      <main>
        {/* Hero Section */}
        <section className="pt-32 pb-20 bg-gray-50 text-center overflow-hidden">
          <div className="container mx-auto px-6">
             <AnimateOnScroll>
                <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-4 bg-gradient-to-r from-indigo-600 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                  Otimize sua agenda, transforme seu atendimento.
                </h1>
            </AnimateOnScroll>
            <AnimateOnScroll delay={100}>
                <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto mb-8">
                  A plataforma de agendamento online mais simples e poderosa para clínicas, consultórios e profissionais da saúde.
                </p>
            </AnimateOnScroll>
            <AnimateOnScroll delay={200}>
                <div className="flex flex-wrap justify-center gap-4">
                  <a href="#pricing" className="bg-indigo-600 text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-indigo-700 transition-all duration-300 transform hover:scale-105 shadow-lg">
                    Comece seu teste grátis
                  </a>
                  <a href="#features" className="bg-white text-indigo-600 px-8 py-4 rounded-lg font-bold text-lg hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 shadow-lg border border-gray-200">
                    Conhecer Recursos
                  </a>
                </div>
            </AnimateOnScroll>
            <AnimateOnScroll delay={300}>
                <div className="mt-16">
                  <img 
                    src="./mochup.png"
                    alt="Mockup da plataforma AgendaFácil em um laptop"
                    className="mx-auto rounded-lg shadow-2xl"
                    onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                      const target = e.target as HTMLImageElement;
                      target.onerror = null;
                      target.src = 'https://placehold.co/1000x500/E0E7FF/4338CA?text=Visualização+do+Produto';
                    }}
                  />
                </div>
            </AnimateOnScroll>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
                 <AnimateOnScroll>
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-800">Tudo que você precisa para uma gestão eficiente</h2>
                    <p className="text-lg text-gray-600 mt-4 max-w-2xl mx-auto">Funcionalidades pensadas para simplificar seu dia a dia e encantar seus pacientes.</p>
                </AnimateOnScroll>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, index) => (
                <AnimateOnScroll key={feature.title} delay={index * 100}>
                    <div className="bg-gray-50 p-8 rounded-xl text-center h-full hover:shadow-lg hover:-translate-y-2 transition-all duration-300">
                      <div className="inline-block p-4 bg-indigo-100 rounded-full mb-4">
                        {feature.icon}
                      </div>
                      <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                      <p className="text-gray-600">{feature.description}</p>
                    </div>
                </AnimateOnScroll>
              ))}
            </div>
          </div>
        </section>
        
        {/* How It Works Section */}
        <section id="how-it-works" className="py-20 bg-gray-50">
            <div className="container mx-auto px-6">
                <div className="text-center mb-16">
                    <AnimateOnScroll>
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-800">Comece a usar em 3 passos simples</h2>
                        <p className="text-lg text-gray-600 mt-4 max-w-2xl mx-auto">Veja como é fácil organizar sua agenda e otimizar seu tempo.</p>
                    </AnimateOnScroll>
                </div>
                <div className="relative">
                    <div className="hidden md:block absolute top-8 left-0 w-full h-0.5 bg-indigo-200 -translate-y-1/2"></div>
                    <div className="relative grid md:grid-cols-3 gap-12">
                         <AnimateOnScroll delay={0} className="text-center">
                            <div className="flex items-center justify-center h-16 w-16 mx-auto bg-indigo-600 text-white text-2xl font-bold rounded-full border-4 border-gray-50 shadow-md mb-4 z-10 relative">1</div>
                            <h3 className="text-xl font-bold mb-2">Crie sua conta</h3>
                            <p className="text-gray-600">Cadastre-se em menos de 2 minutos. É rápido e fácil.</p>
                        </AnimateOnScroll>
                         <AnimateOnScroll delay={150} className="text-center">
                            <div className="flex items-center justify-center h-16 w-16 mx-auto bg-indigo-600 text-white text-2xl font-bold rounded-full border-4 border-gray-50 shadow-md mb-4 z-10 relative">2</div>
                            <h3 className="text-xl font-bold mb-2">Configure sua agenda</h3>
                            <p className="text-gray-600">Defina seus horários de atendimento e serviços oferecidos.</p>
                        </AnimateOnScroll>
                         <AnimateOnScroll delay={300} className="text-center">
                            <div className="flex items-center justify-center h-16 w-16 mx-auto bg-indigo-600 text-white text-2xl font-bold rounded-full border-4 border-gray-50 shadow-md mb-4 z-10 relative">3</div>
                            <h3 className="text-xl font-bold mb-2">Compartilhe e agende</h3>
                            <p className="text-gray-600">Compartilhe seu link exclusivo e comece a receber agendamentos online.</p>
                        </AnimateOnScroll>
                    </div>
                </div>
            </div>
        </section>

        {/* Testimonials Section */}
        <section id="testimonials" className="py-20">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <AnimateOnScroll>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-800">Amado por profissionais de todo o Brasil</h2>
                <p className="text-lg text-gray-600 mt-4 max-w-2xl mx-auto">Não acredite apenas na nossa palavra. Veja o que nossos clientes dizem.</p>
              </AnimateOnScroll>
            </div>
            <div className="grid md:grid-cols-1 lg:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <AnimateOnScroll key={testimonial.name} delay={index * 100}>
                    <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 flex flex-col h-full">
                      <div className="flex text-yellow-400 mb-4">
                          {[...Array(5)].map((_, i) => <Star key={i} className="h-5 w-5 fill-current" />)}
                      </div>
                      <p className="text-gray-600 mb-6 flex-grow">"{testimonial.quote}"</p>
                      <div className="flex items-center">
                        <img 
                          src={testimonial.avatar} 
                          alt={`Avatar de ${testimonial.name}`} 
                          className="h-14 w-14 rounded-full mr-4 object-cover"
                          onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                            const target = e.target as HTMLImageElement;
                            target.onerror = null;
                            target.src = 'https://placehold.co/100x100/E2E8F0/4A5568?text=USER';
                          }}
                        />
                        <div>
                          <h4 className="font-bold text-gray-800">{testimonial.name}</h4>
                          <p className="text-gray-500 text-sm">{testimonial.role}</p>
                        </div>
                      </div>
                    </div>
                </AnimateOnScroll>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-20 bg-gray-50">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <AnimateOnScroll>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-800">Planos flexíveis para cada necessidade</h2>
                <p className="text-lg text-gray-600 mt-4 max-w-2xl mx-auto">Escolha o plano que melhor se adapta ao tamanho do seu negócio. Sem taxas escondidas.</p>
              </AnimateOnScroll>
            </div>
            <div className="grid lg:grid-cols-3 gap-8 items-center">
              {pricingTiers.map((tier, index) => (
                <AnimateOnScroll key={tier.name} delay={index * 100}>
                    <div className={`bg-white p-8 rounded-2xl shadow-lg border h-full ${tier.mostPopular ? 'border-indigo-500 border-2 transform lg:scale-105' : 'border-gray-200'}`}>
                      {tier.mostPopular && (
                        <div className="bg-indigo-500 text-white text-xs font-bold uppercase tracking-wider px-4 py-1 rounded-full inline-block mb-4 -mt-12">Mais Popular</div>
                      )}
                      <h3 className="text-2xl font-bold text-center mb-2">{tier.name}</h3>
                      <p className="text-gray-500 text-center mb-6 h-12">{tier.description}</p>
                      <div className="text-center mb-6">
                        <span className="text-5xl font-extrabold">{tier.price}</span>
                        <span className="text-gray-500 font-medium">{tier.frequency}</span>
                      </div>
                      <ul className="space-y-4 mb-8">
                        {tier.features.map((feature) => (
                          <li key={feature} className="flex items-center">
                            <ShieldCheck className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                            <span className="text-gray-600">{feature}</span>
                          </li>
                        ))}
                      </ul>
                      <a href="#" className={`w-full block text-center py-3 px-6 rounded-lg font-bold transition-all duration-300 ${tier.mostPopular ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'bg-white text-indigo-600 border border-indigo-600 hover:bg-indigo-50'}`}>
                        {tier.cta}
                      </a>
                    </div>
                </AnimateOnScroll>
              ))}
            </div>
          </div>
        </section>
        
        {/* FAQ Section */}
        <section id="faq" className="py-20">
            <div className="container mx-auto px-6 max-w-4xl">
                <div className="text-center mb-16">
                    <AnimateOnScroll>
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-800">Perguntas Frequentes</h2>
                        <p className="text-lg text-gray-600 mt-4">Ainda tem dúvidas? Estamos aqui para ajudar.</p>
                    </AnimateOnScroll>
                </div>
                <AnimateOnScroll>
                    <div>
                        {faqs.map((faq, index) => (
                            <FaqItem key={index} question={faq.question} answer={faq.answer} />
                        ))}
                    </div>
                </AnimateOnScroll>
            </div>
        </section>

        {/* Call to Action Section */}
        <section className="bg-gradient-to-r from-indigo-600 to-purple-600">
          <div className="container mx-auto px-6 py-20 text-center">
            <AnimateOnScroll>
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Pronto para simplificar sua gestão?</h2>
                <p className="text-indigo-200 text-lg mb-8 max-w-2xl mx-auto">Junte-se a milhares de profissionais que já otimizaram seu tempo e melhoraram o atendimento.</p>
                <a href="#pricing" className="bg-white text-indigo-600 px-8 py-4 rounded-lg font-bold text-lg hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 shadow-lg">
                  Comece seu teste de 14 dias
                </a>
            </AnimateOnScroll>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white">
        <div className="container mx-auto px-6 py-12">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-1">
              <a href="#" className="text-2xl font-bold text-white flex items-center mb-4">
                <CalendarDays className="h-7 w-7 mr-2" />
                AgendaFácil
              </a>
              <p className="text-gray-400">Transformando o atendimento na área da saúde.</p>
            </div>
            <div>
              <h4 className="font-bold uppercase tracking-wider mb-4">Produto</h4>
              <a href="#features" className="block text-gray-400 hover:text-white mb-2">Funcionalidades</a>
              <a href="#pricing" className="block text-gray-400 hover:text-white mb-2">Planos</a>
              <a href="#how-it-works" className="block text-gray-400 hover:text-white mb-2">Como Funciona</a>
            </div>
            <div>
              <h4 className="font-bold uppercase tracking-wider mb-4">Empresa</h4>
              <a href="#" className="block text-gray-400 hover:text-white mb-2">Sobre Nós</a>
              <a href="#" className="block text-gray-400 hover:text-white mb-2">Contato</a>
              <a href="#" className="block text-gray-400 hover:text-white mb-2">Blog</a>
            </div>
            <div>
              <h4 className="font-bold uppercase tracking-wider mb-4">Legal</h4>
              <a href="#" className="block text-gray-400 hover:text-white mb-2">Termos de Serviço</a>
              <a href="#" className="block text-gray-400 hover:text-white mb-2">Política de Privacidade</a>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center text-gray-400 text-sm">
            <p>&copy; {new Date().getFullYear()} AgendaFácil. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}