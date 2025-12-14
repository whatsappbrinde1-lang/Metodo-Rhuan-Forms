
import React, { useState, useEffect, useRef } from 'react';
import { UserData, PlanType, PricingTier } from './types';
import { generateSlimmingPlan } from './services/geminiService';

// --- UI Components ---

const Badge = ({ children }: { children: React.ReactNode }) => (
  <span className="px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/30 text-orange-500 text-[10px] font-bold uppercase tracking-widest mb-4 inline-block">
    {children}
  </span>
);

const Section = ({ children, className = "", id, mesh = false }: { children: React.ReactNode, className?: string, id?: string, mesh?: boolean }) => (
  <section id={id} className={`min-h-screen flex flex-col justify-center items-center px-6 py-24 relative ${mesh ? 'mesh-gradient' : ''} ${className}`}>
    <div className="max-w-7xl w-full z-10">{children}</div>
  </section>
);

const PriceCard = ({ tier }: { tier: PricingTier }) => (
  <div className={`relative p-8 rounded-[2rem] transition-all duration-500 group ${tier.popular ? 'bg-orange-600 scale-105 z-20 shadow-2xl shadow-orange-600/40' : 'glass hover:border-orange-500/50'}`}>
    {tier.popular && (
      <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-white text-orange-600 text-[10px] font-black px-4 py-1 rounded-full uppercase tracking-tighter">
        O Mais Escolhido
      </div>
    )}
    <h3 className={`text-2xl font-bold mb-1 ${tier.popular ? 'text-white' : 'text-gray-100'}`}>{tier.name}</h3>
    <div className="flex items-baseline gap-1 mb-6">
      <span className={`text-sm ${tier.popular ? 'text-orange-100' : 'text-gray-400'}`}>R$</span>
      <span className={`text-5xl font-black ${tier.popular ? 'text-white' : 'text-white'}`}>{tier.price}</span>
      <span className={`text-xs opacity-60 ml-1 ${tier.popular ? 'text-white' : 'text-gray-400'}`}>/único</span>
    </div>
    <p className={`text-sm mb-8 leading-relaxed ${tier.popular ? 'text-orange-50' : 'text-gray-400'}`}>{tier.description}</p>
    <ul className="space-y-4 mb-10">
      {tier.features.map((f, i) => (
        <li key={i} className="flex items-center gap-3 text-sm">
          <div className={`w-5 h-5 rounded-full flex items-center justify-center ${tier.popular ? 'bg-white/20' : 'bg-orange-500/20'}`}>
            <svg className={`w-3 h-3 ${tier.popular ? 'text-white' : 'text-orange-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <span className={tier.popular ? 'text-white' : 'text-gray-300'}>{f}</span>
        </li>
      ))}
    </ul>
    <button className={`w-full py-4 rounded-xl font-bold transition-all transform group-hover:scale-[1.02] ${tier.popular ? 'bg-white text-orange-600 hover:bg-gray-100' : 'bg-orange-600 text-white hover:bg-orange-500'}`}>
      Começar Agora
    </button>
  </div>
);

// --- Chat Interface Component ---

const AiChat = () => {
  const [messages, setMessages] = useState<{ role: 'ai' | 'user', text: string }[]>([
    { role: 'ai', text: 'Olá! Sou o assistente Rhuan Forms. Para eu criar o seu plano de emagrecimento perfeito, primeiro preciso te conhecer. Qual é o seu nome?' }
  ]);
  const [input, setInput] = useState('');
  const [currentStep, setCurrentStep] = useState(0);
  const [userData, setUserData] = useState<UserData>({
    name: '', age: '', weight: '', height: '', goal: '', activityLevel: '', dietPreference: ''
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const steps = [
    { key: 'name', question: 'Prazer, {name}! Quantos anos você tem?', label: 'Idade' },
    { key: 'weight', question: 'Entendido. Qual o seu peso atual (kg)?', label: 'Peso' },
    { key: 'height', question: 'E a sua altura (cm)?', label: 'Altura' },
    { key: 'goal', question: 'Qual seu principal objetivo hoje?', label: 'Objetivo', options: ['Perder peso rápido', 'Ganhar massa magra', 'Definição abdominal'] },
    { key: 'activityLevel', question: 'Como é sua rotina de exercícios?', label: 'Atividade', options: ['Sedentário', 'Leve (1-2x semana)', 'Intenso (4x+ semana)'] },
    { key: 'dietPreference', question: 'Tem alguma restrição alimentar?', label: 'Restrição', options: ['Nenhuma', 'Vegetariano', 'Sem Glúten'] }
  ];

  const handleSend = async (val?: string) => {
    const text = val || input;
    if (!text && !val) return;

    const newMessages = [...messages, { role: 'user', text } as const];
    setMessages(newMessages);
    setInput('');

    // Atualiza dados
    const currentKey = currentStep === 0 ? 'name' : steps[currentStep - 1].key;
    const updatedData = { ...userData, [currentKey]: text };
    setUserData(updatedData);

    if (currentStep < steps.length) {
      const nextQ = steps[currentStep].question.replace('{name}', updatedData.name);
      setTimeout(() => {
        setMessages(prev => [...prev, { role: 'ai', text: nextQ }]);
        setCurrentStep(currentStep + 1);
      }, 600);
    } else {
      setIsGenerating(true);
      setMessages(prev => [...prev, { role: 'ai', text: 'Excelente. Estou processando seus dados biométricos e cruzando com milhares de artigos científicos para gerar sua melhor versão...' }]);
      
      const result = await generateSlimmingPlan(updatedData);
      setMessages(prev => [...prev, { role: 'ai', text: `PRONTO! Aqui está o seu diagnóstico: \n\n ${result}` }]);
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="w-full max-w-2xl mx-auto glass rounded-[2.5rem] overflow-hidden flex flex-col h-[600px] shadow-2xl border-white/5">
      <div className="bg-white/5 px-6 py-4 flex items-center justify-between border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-orange-500 to-purple-600 flex items-center justify-center font-bold">RF</div>
          <div>
            <div className="text-sm font-bold">Rhuan AI Consultant</div>
            <div className="text-[10px] text-green-500 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span> Analisando em tempo real
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-300`}>
            <div className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
              msg.role === 'user' ? 'bg-orange-600 text-white rounded-tr-none' : 'bg-white/10 text-gray-200 rounded-tl-none'
            }`}>
              {msg.text.split('\n').map((line, idx) => <p key={idx} className="mb-2">{line}</p>)}
            </div>
          </div>
        ))}
        {isGenerating && (
          <div className="flex justify-start">
             <div className="bg-white/10 px-4 py-3 rounded-2xl rounded-tl-none flex gap-1">
                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0.4s]"></div>
             </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      <div className="p-4 bg-white/5 border-t border-white/10">
        {currentStep > 0 && currentStep <= steps.length && steps[currentStep - 1].options ? (
          <div className="flex flex-wrap gap-2 mb-4">
            {steps[currentStep - 1].options?.map(opt => (
              <button key={opt} onClick={() => handleSend(opt)} className="px-4 py-2 bg-orange-500/20 hover:bg-orange-500 border border-orange-500/30 text-xs rounded-full transition-all">
                {opt}
              </button>
            ))}
          </div>
        ) : (
          <div className="flex gap-2">
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Digite sua resposta..."
              className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-orange-500 outline-none transition"
            />
            <button onClick={() => handleSend()} className="bg-orange-600 hover:bg-orange-500 p-3 rounded-xl transition-all">
               <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
               </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// --- Main Application ---

const App: React.FC = () => {
  const tiers: PricingTier[] = [
    {
      id: PlanType.BASIC,
      name: "Start Lite",
      price: "19,90",
      description: "O básico para sair da inércia e começar a ver os primeiros gramas sumindo.",
      features: ["Manual de Reeducação", "Checklist de Atividade", "Acesso via Email"]
    },
    {
      id: PlanType.PRO,
      name: "Master Pro",
      price: "49,90",
      description: "Acelerador de resultados para quem quer transformar o corpo em 30 dias.",
      features: ["Protocolo 30 Dias", "Vídeo-aulas Práticas", "Grupo VIP Telegram", "Planilha de Cargas"],
      popular: true
    },
    {
      id: PlanType.AI_SPECIAL,
      name: "Especial IA",
      price: "109,90",
      description: "Consultoria personalizada 24h com a IA mais avançada do mercado fitness.",
      features: ["Tudo do Master Pro", "IA Coach Individual", "Cardápio Dinâmico", "Ajuste Biométrico Semanal"]
    }
  ];

  return (
    <div className="selection:bg-orange-500 selection:text-white">
      {/* HEADER NAVBAR */}
      <nav className="fixed top-0 left-0 w-full z-[100] px-6 py-6">
        <div className="max-w-7xl mx-auto glass rounded-full px-6 py-3 flex justify-between items-center">
          <div className="text-xl font-black text-white tracking-tighter">RHUAN<span className="text-orange-500">FORMS</span></div>
          <div className="hidden md:flex gap-8 text-[10px] font-bold uppercase tracking-widest text-gray-400">
            <a href="#metodo" className="hover:text-white transition">Método</a>
            <a href="#resultados" className="hover:text-white transition">Resultados</a>
            <a href="#planos" className="hover:text-white transition">Planos</a>
          </div>
          <a href="#planos" className="bg-orange-600 text-white text-[10px] font-black px-6 py-2 rounded-full hover:bg-orange-500 transition-all">
            ASSINAR AGORA
          </a>
        </div>
      </nav>

      {/* DOBRA 1: HERO - ATENÇÃO */}
      <Section mesh className="text-center pt-40">
        <Badge>O Futuro do Emagrecimento Chegou</Badge>
        <h1 className="text-6xl md:text-[7rem] font-black leading-[0.9] tracking-tighter mb-8 text-gradient">
          REPROGRAME SEU <br /> <span className="italic font-light">METABOLISMO</span>
        </h1>
        <p className="text-gray-400 text-xl md:text-2xl max-w-2xl mx-auto mb-12 font-light leading-relaxed">
          Chega de dietas que te deixam com fome. Use a ciência de dados e o Rhuan Forms para transformar gordura em energia.
        </p>
        <div className="flex flex-col md:flex-row gap-4 justify-center">
          <a href="#ia" className="bg-orange-600 px-10 py-5 rounded-2xl font-black text-lg hover:shadow-2xl hover:shadow-orange-600/30 transition-all hover:-translate-y-1">
            EXPERIMENTAR CONSULTORIA IA
          </a>
          <a href="#planos" className="glass px-10 py-5 rounded-2xl font-bold text-lg hover:bg-white/10 transition-all">
            VER NOSSOS PLANOS
          </a>
        </div>
        <div className="mt-24 opacity-30 flex justify-center gap-12 grayscale">
          <img src="https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg" className="h-6" alt="trusted" />
          <img src="https://upload.wikimedia.org/wikipedia/commons/b/b9/Forbes_logo.svg" className="h-6" alt="featured" />
          <img src="https://upload.wikimedia.org/wikipedia/commons/5/51/IBM_logo.svg" className="h-6" alt="technology" />
        </div>
      </Section>

      {/* DOBRA 2: PROBLEMA - CONEXÃO */}
      <Section className="bg-[#080808]">
        <div className="grid md:grid-cols-2 gap-20 items-center">
          <div className="relative">
             <div className="absolute inset-0 bg-orange-600 rounded-full blur-[120px] opacity-10"></div>
             <img 
               src="https://images.unsplash.com/photo-1594882645126-14020914d58d?auto=format&fit=crop&q=80&w=800" 
               className="rounded-[3rem] border border-white/10 shadow-2xl relative z-10 animate-float"
               alt="Frustration"
             />
          </div>
          <div className="space-y-8">
            <h2 className="text-4xl md:text-6xl font-bold leading-tight">VOCÊ ESTÁ <span className="text-orange-500">LUTANDO</span> CONTRA SUA PRÓPRIA BIOLOGIA?</h2>
            <p className="text-gray-400 text-lg">
              90% das pessoas desistem em 2 semanas porque usam métodos da década de 90. O seu corpo evoluiu para economizar energia, não para gastá-la. Sem o estímulo certo, seu cérebro sabotará cada grama perdida.
            </p>
            <div className="space-y-4">
               {["Dietas restritivas causam efeito sanfona", "Treinos chatos matam sua motivação", "Falta de acompanhamento gera dúvidas"].map((text, i) => (
                 <div key={i} className="flex items-center gap-4 text-gray-200">
                    <div className="w-6 h-6 rounded-full bg-red-500/20 flex items-center justify-center text-red-500">✕</div>
                    {text}
                 </div>
               ))}
            </div>
          </div>
        </div>
      </Section>

      {/* DOBRA 3: MÉTODO - SOLUÇÃO */}
      <Section id="metodo">
        <div className="text-center mb-20">
          <Badge>A Ciência por Trás</Badge>
          <h2 className="text-5xl font-bold">O PROTOCOLO <span className="text-orange-500">BIO-SYNERGY</span></h2>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { title: "Neuro-Controle", desc: "Ajustamos sua alimentação para regular grelina e leptina, eliminando a compulsão noturna.", img: "🧠" },
            { title: "Metabolic Peak", desc: "Exercícios curtos de alta intensidade que mantêm seu metabolismo queimando por até 48h.", img: "⚡" },
            { title: "Data-Focus", desc: "Medição de progresso real, focando no que importa: espelho e saúde, não apenas o número na balança.", img: "📊" }
          ].map((item, i) => (
            <div key={i} className="glass p-10 rounded-[2.5rem] hover:-translate-y-2 transition-all group">
              <div className="text-6xl mb-8 group-hover:scale-110 transition-transform inline-block">{item.img}</div>
              <h3 className="text-2xl font-bold mb-4">{item.title}</h3>
              <p className="text-gray-400 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* DOBRA 4: IA DEMO - NOVIDADE */}
      <Section id="ia" className="bg-[#050505]">
        <div className="max-w-5xl mx-auto text-center mb-16">
          <h2 className="text-4xl md:text-6xl font-black mb-6">SUA <span className="text-orange-500">IA PESSOAL</span> <br /> EM TEMPO REAL</h2>
          <p className="text-gray-400 max-w-xl mx-auto">Responda as perguntas abaixo para que nosso algoritmo crie seu plano agora mesmo. É gratuito testar.</p>
        </div>
        <AiChat />
      </Section>

      {/* DOBRA 5: RESULTADOS - AUTORIDADE */}
      <Section id="resultados" mesh>
        <div className="flex flex-col md:flex-row gap-20 items-center">
          <div className="flex-1 space-y-8">
             <h2 className="text-5xl font-bold">ELAS NÃO SÓ <span className="text-orange-500">MUDARAM O CORPO</span>, MUDARAM O JOGO.</h2>
             <div className="glass p-8 rounded-3xl relative">
                <p className="text-xl italic text-gray-300 mb-6">"Eu achava que minha genética era o problema. Com o Rhuan Forms, descobri que meu problema era o método. Em 45 dias, perdi 9kg e minha energia triplicou."</p>
                <div className="flex items-center gap-4">
                   <div className="w-12 h-12 rounded-full bg-orange-500"></div>
                   <div>
                      <div className="font-bold">Ana Clara, 32 anos</div>
                      <div className="text-xs text-orange-500">Advogada & Mãe</div>
                   </div>
                </div>
             </div>
          </div>
          <div className="flex-1 grid grid-cols-2 gap-4">
             {[
               "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&q=80&w=400",
               "https://images.unsplash.com/photo-1583454110551-21f2fa2ae617?auto=format&fit=crop&q=80&w=400",
               "https://images.unsplash.com/photo-1518310321115-5a99c03d4744?auto=format&fit=crop&q=80&w=400",
               "https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?auto=format&fit=crop&q=80&w=400"
             ].map((url, i) => (
               <img key={i} src={url} className={`rounded-2xl border border-white/10 grayscale hover:grayscale-0 transition-all duration-700 ${i % 2 === 0 ? 'translate-y-8' : ''}`} alt="Results" />
             ))}
          </div>
        </div>
      </Section>

      {/* DOBRA 6: PLANOS - TRIANGULAÇÃO */}
      <Section id="planos">
        <div className="text-center mb-20">
          <Badge>Oferta Exclusiva</Badge>
          <h2 className="text-5xl font-black mb-4 uppercase">Investimento no <span className="text-orange-500">Seu Futuro</span></h2>
          <p className="text-gray-400">Menos que o preço de uma pizza para transformar sua vida.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8 items-center">
           {tiers.map(tier => <PriceCard key={tier.id} tier={tier} />)}
        </div>
      </Section>

      {/* DOBRA 7: GARANTIA - REVERSÃO DE RISCO */}
      <Section className="bg-[#080808]">
        <div className="max-w-4xl mx-auto glass p-12 md:p-20 rounded-[3rem] text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-orange-600/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
          <div className="w-24 h-24 bg-orange-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-orange-600/40">
            <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <h2 className="text-4xl font-bold mb-6">SUA SATISFAÇÃO É <span className="text-orange-500">BLINDADA</span></h2>
          <p className="text-gray-400 text-lg mb-10 leading-relaxed">
            Você tem 7 dias para testar o método completo. Se não gostar do suporte, da IA ou se não perder nenhum centímetro, basta enviar um email. Devolvemos 100% do seu dinheiro. Sem perguntas, sem burocracia.
          </p>
          <a href="#planos" className="inline-block bg-white text-black px-12 py-5 rounded-2xl font-black text-xl hover:bg-orange-600 hover:text-white transition-all">
            GARANTIR MINHA VAGA AGORA
          </a>
        </div>
      </Section>

      {/* DOBRA 8: FAQ & RODAPÉ */}
      <Section className="bg-black">
        <div className="grid md:grid-cols-2 gap-20 w-full mb-20">
          <div>
            <h2 className="text-3xl font-bold mb-10 uppercase tracking-tighter">Dúvidas <span className="text-orange-500">Frequentes</span></h2>
            <div className="space-y-6">
              {[
                { q: "O plano é mensal?", a: "Não! O pagamento é único. Você paga uma vez e tem acesso vitalício à sua plataforma." },
                { q: "A IA funciona no celular?", a: "Sim! O Rhuan Forms foi desenhado para ser acessado de qualquer lugar pelo seu navegador." },
                { q: "Tenho suporte humano?", a: "No plano Especial IA e Master Pro, você tem acesso ao nosso time de especialistas para tirar dúvidas." }
              ].map((item, i) => (
                <div key={i} className="glass p-6 rounded-2xl">
                  <h4 className="font-bold mb-2 text-orange-500">{item.q}</h4>
                  <p className="text-sm text-gray-400 leading-relaxed">{item.a}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="flex flex-col justify-center">
            <div className="text-5xl font-black text-white mb-6 tracking-tighter">RHUAN<span className="text-orange-500">FORMS</span></div>
            <p className="text-gray-500 mb-8 max-w-sm">Junte-se a mais de 15.000 pessoas que decidiram parar de tentar e começaram a emagrecer com inteligência.</p>
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full glass flex items-center justify-center hover:bg-white/10 cursor-pointer transition">IG</div>
              <div className="w-10 h-10 rounded-full glass flex items-center justify-center hover:bg-white/10 cursor-pointer transition">FB</div>
              <div className="w-10 h-10 rounded-full glass flex items-center justify-center hover:bg-white/10 cursor-pointer transition">YT</div>
            </div>
          </div>
        </div>
        <div className="w-full border-t border-white/5 pt-10 text-center text-[10px] text-gray-600 uppercase tracking-widest font-bold">
          Rhuan Forms Technology © 2024 - Todos os direitos reservados. <br />
          CNPJ: 00.000.000/0001-00 - São Paulo, Brasil
        </div>
      </Section>
    </div>
  );
};

export default App;
