import { useEffect, useRef } from 'react';

const cards = [
  {
    icon: "🔍",
    title: "Recherchez",
    text: "Trouvez rapidement un appartement meublé selon vos besoins.",
  },
  {
    icon: "📞",
    title: "Support Rapide",
    text: "Notre service client est disponible pour vous assister à tout moment.",
  },
  {
    icon: "💳",
    title: "Réservez",
    text: "Possibilité de réserver en ligne avec un paiement sécurisé et instantané.",
  },
  {
    icon: "🛏️",
    title: "Installez-vous",
    text: "Profitez de votre logement dès votre arrivée.",
  },
  {
    icon: "✅",
    title: "Paiement Mobile",
    text: "Orange Money, Wave, Moov — rapide et sécurisé.",
  },
  {
    icon: "🏠",
    title: "Propriétaires Vérifiés",
    text: "Nous vérifions chaque annonce pour votre sécurité.",
  },
];

function CardSection() {
  const cardWrapperRef = useRef(null);

  useEffect(() => {
    const container = cardWrapperRef.current;
    if (!container) return;

    const scrollStep = 260 + 16;
    let isPaused = false;

    const handleMouseEnter = () => { isPaused = true; };
    const handleMouseLeave = () => { isPaused = false; };

    container.addEventListener('mouseenter', handleMouseEnter);
    container.addEventListener('mouseleave', handleMouseLeave);

    const interval = setInterval(() => {
      if (isPaused) return;
      if (container.scrollLeft + container.offsetWidth >= container.scrollWidth) {
        container.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        container.scrollBy({ left: scrollStep, behavior: 'smooth' });
      }
    }, 5000);

    return () => {
      clearInterval(interval);
      container.removeEventListener('mouseenter', handleMouseEnter);
      container.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return (
    <section style={styles.cardSection}>
      <div ref={cardWrapperRef} style={styles.cardWrapper}>
        {cards.map((card, index) => (
          <div key={index} style={styles.card}>
            <div style={styles.cardIcon} role="img" aria-label={card.title}>{card.icon}</div>
            <h3 style={styles.cardTitle}>{card.title}</h3>
            <p style={styles.cardText}>{card.text}</p>
          </div>
        ))}
      </div>

      <div style={styles.footerMessage}>
        🇨🇮 Fait par un Ivoiriens-Américain, pour les Ivoiriens
      </div>
    </section>
  );
}

const styles = {
  cardSection: {
    padding: '3rem 1rem 2rem',
  },
  cardWrapper: {
    display: 'flex',
    overflowX: 'auto',
    gap: '1rem',
    padding: '0 1rem',
    scrollSnapType: 'x mandatory',
    WebkitOverflowScrolling: 'touch',
  },
  card: {
    flex: '0 0 260px',
    scrollSnapAlign: 'start',
    background: '#fff',
    borderRadius: '12px',
    boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
    padding: '1.5rem',
    textAlign: 'center',
    minHeight: '220px',
  },
  cardIcon: {
    fontSize: '2rem',
    marginBottom: '0.5rem',
  },
  cardTitle: {
    fontSize: '1.25rem',
    marginBottom: '0.5rem',
    fontWeight: '600',
    color: '#007bff',
  },
  cardText: {
    fontSize: '1rem',
    color: '#555',
  },
  footerMessage: {
    marginTop: '2rem',
    textAlign: 'center',
    fontSize: '1.1rem',
    fontWeight: '500',
    color: '#444',
  },
};

export default CardSection;
