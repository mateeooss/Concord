import type { Metadata } from 'next';
import '@/styles/tokens.css';
import '@/styles/globals.css';

export const metadata: Metadata = {
  title: 'Concord',
};

const scriptTema = `
(function () {
  try {
    var salvo = localStorage.getItem('concord:tema');
    var escuro = window.matchMedia('(prefers-color-scheme: dark)');
    var aplicar = function (tema) {
      document.documentElement.dataset.tema = tema;
    };
    aplicar(salvo === 'claro' || salvo === 'escuro' ? salvo : (escuro.matches ? 'escuro' : 'claro'));
    if (!salvo) {
      escuro.addEventListener('change', function (e) {
        if (!localStorage.getItem('concord:tema')) {
          aplicar(e.matches ? 'escuro' : 'claro');
        }
      });
    }
  } catch (e) {}
})();
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: scriptTema }} />
        <meta name="color-scheme" content="light dark" />
      </head>
      <body>{children}</body>
    </html>
  );
}
