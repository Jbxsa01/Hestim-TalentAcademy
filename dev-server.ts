import express from 'express';
import cors from 'cors';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, addDoc, updateDoc, doc } from 'firebase/firestore';
import firebaseConfig from './firebase-applet-config.json' assert { type: 'json' };

const app = express();
app.use(cors());
app.use(express.json());

const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);

const sampleTalents = [
  {
    title: 'Master UI Design Marocaine',
    description: 'Design moderne avec influences Zellige et architecture marocaine',
    category: 'Design',
    imageUrl: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=500',
    trainerId: 'trainer-1',
    trainerName: 'Anas El Alami',
    rating: 5.0,
    reviewCount: 0,
    followers: 0,
    isActive: true,
    offers: [
      { title: 'Introduction au Design Marocain', description: 'Découvrez les bases', duration: '4 semaines', price: 120 },
      { title: 'Design Avancé Zellige', description: 'Techniques avancées', duration: '8 semaines', price: 120 }
    ]
  },
  {
    title: 'Full Stack Development with React',
    description: 'Apprenez React, Node.js et MongoDB from scratch',
    category: 'Coding',
    imageUrl: 'https://images.unsplash.com/photo-1633356122544-f134324ef6db?w=500',
    trainerId: 'trainer-2',
    trainerName: 'Mehdi Choukri',
    rating: 5.0,
    reviewCount: 0,
    followers: 0,
    isActive: true,
    offers: [
      { title: 'React Fundamentals', description: 'Concepts de base React', duration: '4 semaines', price: 120 },
      { title: 'Building Real Projects', description: 'Projets pratiques', duration: '6 semaines', price: 120 }
    ]
  },
  {
    title: 'Digital Marketing Essentials',
    description: 'Stratégies marketing numériques modernes',
    category: 'Marketing',
    imageUrl: 'https://images.unsplash.com/photo-1460925895917-aeb19be489c7?w=500',
    trainerId: 'trainer-3',
    trainerName: 'Fatima Bouchaara',
    rating: 4.8,
    reviewCount: 0,
    followers: 0,
    isActive: true,
    offers: [
      { title: 'Social Media Strategy', description: 'Maîtrisez les réseaux sociaux', duration: '3 semaines', price: 120 },
      { title: 'SEO & Content Marketing', description: 'Optimisation et contenu', duration: '5 semaines', price: 120 }
    ]
  },
  {
    title: 'Photography & Videography',
    description: 'Techniques professionnelles de photo et vidéo',
    category: 'Photo',
    imageUrl: 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=500',
    trainerId: 'trainer-4',
    trainerName: 'Hassan Bennani',
    rating: 4.9,
    reviewCount: 0,
    followers: 0,
    isActive: true,
    offers: [
      { title: 'Photography Basics', description: 'Principes fondamentaux', duration: '4 semaines', price: 120 },
      { title: 'Video Production', description: 'Production vidéo professionnelle', duration: '6 semaines', price: 120 }
    ]
  }
];

const categories = ['Design', 'Coding', 'Marketing', 'Photo', 'Musique', 'Soft Skills', 'Business', 'Crochets'];
const skills = [
  'Fundamentals', 'Intermediate', 'Advanced', 'Mastery', 'Professional',
  'Basics', 'Techniques', 'Strategies', 'Best Practices', 'Industry Insights',
  'Deep Dive', 'Practical Applications', 'Real-World Projects', 'Expert Tips', 'Certification Prep'
];
const trainers = [
  { name: 'Anas El Alami' },
  { name: 'Fatima Bouchaara' },
  { name: 'Mehdi Choukri' },
  { name: 'Hassan Bennani' },
  { name: 'Leila Mansouri' },
  { name: 'Youssef Karim' },
  { name: 'Amina Khalif' },
  { name: 'Omar Nassar' },
];
const images = [
  'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=500',
  'https://images.unsplash.com/photo-1633356122544-f134324ef6db?w=500',
  'https://images.unsplash.com/photo-1460925895917-aeb19be489c7?w=500',
  'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=500',
  'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500',
  'https://images.unsplash.com/photo-1517694712202-14819c9602d2?w=500',
  'https://images.unsplash.com/photo-1507238691715-25ceb3424e5f?w=500',
  'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=500',
];

function generateTalent(index: number) {
  const category = categories[index % categories.length];
  const trainer = trainers[index % trainers.length];
  const image = images[index % images.length];
  
  return {
    title: `${category} Mastery - Session ${index + 1}`,
    description: `Apprenez les techniques avancées de ${category.toLowerCase()} avec ${trainer.name}. Un cours complet couvrant tous les aspects professionnels et pratiques.`,
    category,
    imageUrl: image,
    trainerId: `trainer-${index}`,
    trainerName: trainer.name,
    rating: 4.5 + Math.random() * 0.5,
    reviewCount: Math.floor(Math.random() * 50) + 10,
    followers: Math.floor(Math.random() * 200) + 50,
    isActive: true,
    createdAt: new Date().toISOString(),
  };
}

function generateOffers(talentIndex: number): any[] {
  const offers = [];
  const skillCount = 8 + Math.floor(Math.random() * 4);
  
  for (let i = 0; i < skillCount; i++) {
    const skill = skills[i % skills.length];
    const duration = [2, 3, 4, 5, 6, 8, 10, 12][Math.floor(Math.random() * 8)];
    
    offers.push({
      title: `${skill} - Level ${i + 1}`,
      description: `Master the ${skill.toLowerCase()} techniques step by step. Perfect for professionals seeking excellence.`,
      duration: `${duration} semaines`,
      price: 120,
      createdAt: new Date().toISOString(),
    });
  }
  
  return offers;
}

// Seed talents with 120 DH fixed price
app.post('/api/seed-talents', async (req, res) => {
  try {
    console.log('🔄 Updating all existing offer prices to 120 DH...');
    const talentsSnap = await getDocs(collection(db, 'talents'));
    let updatedCount = 0;

    for (const talentDoc of talentsSnap.docs) {
      const offersSnap = await getDocs(collection(db, 'talents', talentDoc.id, 'offers'));
      for (const offerDoc of offersSnap.docs) {
        await updateDoc(doc(db, 'talents', talentDoc.id, 'offers', offerDoc.id), { price: 120 });
        updatedCount++;
      }
    }
    console.log(`✅ Updated ${updatedCount} offers to 120 DH`);

    console.log('📚 Adding sample talents...');
    let addedCount = 0;

    for (const talent of sampleTalents) {
      const { offers, ...talentData } = talent;
      
      const talentRef = await addDoc(collection(db, 'talents'), {
        ...talentData,
        createdAt: new Date().toISOString(),
      });

      for (const offer of offers) {
        await addDoc(collection(db, 'talents', talentRef.id, 'offers'), {
          ...offer,
          createdAt: new Date().toISOString(),
        });
      }
      addedCount++;
    }

    console.log(`✅ Added ${addedCount} talents`);

    res.json({
      success: true,
      message: `✅ Successfully updated ${updatedCount} existing offers and added ${addedCount} new talents, all with 120 DH fixed price`,
      stats: {
        updatedOffers: updatedCount,
        addedTalents: addedCount,
        newOffers: sampleTalents.length * 2
      }
    });
  } catch (error: any) {
    console.error('Error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Unknown error'
    });
  }
});

// Seed 50+ talents with offers
app.post('/api/seed-50talents', async (req, res) => {
  try {
    console.log('🚀 Début de l\'ajout de 50+ talents avec offres...');
    
    let talentCount = 0;
    let offerCount = 0;
    const talentLimit = 50;

    for (let t = 0; t < talentLimit; t++) {
      const talentData = generateTalent(t);
      
      const talentRef = await addDoc(collection(db, 'talents'), talentData);
      talentCount++;
      
      const offers = generateOffers(t);
      
      for (const offer of offers) {
        await addDoc(collection(db, 'talents', talentRef.id, 'offers'), offer);
        offerCount++;
      }
      
      if ((t + 1) % 10 === 0) {
        console.log(`✅ ${t + 1}/50 talents créés avec ${offerCount} offres`);
      }
    }

    console.log(`🎉 Complétion: ${talentCount} talents créés avec ${offerCount} offres!`);

    res.json({
      success: true,
      message: `✅ ${talentCount} talents créés avec succès!`,
      stats: {
        talentsAdded: talentCount,
        totalOffers: offerCount,
        averageOffersPerTalent: (offerCount / talentCount).toFixed(1)
      }
    });
  } catch (error: any) {
    console.error('Erreur:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Erreur inconnue'
    });
  }
});

const PORT = process.env.API_PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 API Server running on http://localhost:${PORT}`);
  console.log(`  POST http://localhost:${PORT}/api/seed-talents`);
  console.log(`  POST http://localhost:${PORT}/api/seed-50talents`);
});
