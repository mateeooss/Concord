import Link from 'next/link';

export default function NotFound() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        gap: '12px',
        textAlign: 'center',
        padding: '24px',
      }}
    >
      <h1 style={{ fontSize: '20px', fontWeight: 600 }}>Página não encontrada</h1>
      <p style={{ color: 'var(--texto-2)', fontSize: '13px' }}>
        O endereço que você tentou acessar não existe.
      </p>
      <Link
        href="/sala"
        style={{
          marginTop: '8px',
          padding: '8px 16px',
          borderRadius: '8px',
          background: 'var(--roxo)',
          color: '#fff',
          textDecoration: 'none',
          fontWeight: 500,
          fontSize: '13px',
        }}
      >
        Voltar para a sala
      </Link>
    </div>
  );
}
