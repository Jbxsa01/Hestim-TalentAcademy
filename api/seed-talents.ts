import { VercelRequest, VercelResponse } from '@vercel/node';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, addDoc, updateDoc, doc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const sampleTalents = [
  {
    title: 'Musique / Chant',
    description: 'Cours de musique et de chant professionnel',
    category: 'Music',
    imageUrl: 'https://images.unsplash.com/photo-1511379938547-c1f69b13d835?w=500',
    trainerId: 'trainer-1',
    trainerName: 'Ahmed Zaki',
    rating: 5.0,
    reviewCount: 0,
    followers: 0,
    isActive: true,
    offers: [
      { title: 'Cours solo', description: 'Leçons de chant en tête-à-tête', duration: '4 semaines', price: 120 }
    ]
  },
  {
    title: 'Arts visuels',
    description: 'Dessin, peinture et art numérique',
    category: 'Design',
    imageUrl: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=500',
    trainerId: 'trainer-2',
    trainerName: 'Leila Bennani',
    rating: 4.9,
    reviewCount: 0,
    followers: 0,
    isActive: true,
    offers: [
      { title: 'Dessin débutant', description: 'Initiation au dessin', duration: '4 semaines', price: 120 },
      { title: 'Peinture', description: 'Techniques de peinture', duration: '6 semaines', price: 120 },
      { title: 'Digital art', description: 'Art numérique et design graphique', duration: '5 semaines', price: 120 },
      { title: 'Portfolio', description: 'Création de portfolio professionnel', duration: '3 semaines', price: 120 }
    ]
  },
  {
    title: 'Programmation',
    description: 'Développement web et applications mobiles',
    category: 'Coding',
    imageUrl: 'https://images.unsplash.com/photo-1633356122544-f134324ef6db?w=500',
    trainerId: 'trainer-3',
    trainerName: 'Mehdi Choukri',
    rating: 5.0,
    reviewCount: 0,
    followers: 0,
    isActive: true,
    offers: [
      { title: 'Intro Python', description: 'Introduction à Python', duration: '4 semaines', price: 120 },
      { title: 'Web', description: 'Développement web - HTML, CSS, JavaScript', duration: '6 semaines', price: 120 },
      { title: 'App mobile', description: 'Développement d\'applications mobiles', duration: '8 semaines', price: 120 },
      { title: 'Projet guide', description: 'Réalisation de projets complets guidés', duration: '7 semaines', price: 120 }
    ]
  },
  {
    title: 'Photographie',
    description: 'Photographie professionnelle et édition',
    category: 'Photography',
    imageUrl: 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=500',
    trainerId: 'trainer-4',
    trainerName: 'Hassan Bennani',
    rating: 4.9,
    reviewCount: 0,
    followers: 0,
    isActive: true,
    offers: [
      { title: 'Prise de vue', description: 'Techniques de photographie', duration: '4 semaines', price: 120 },
      { title: 'Retouche', description: 'Édition et retouche photo', duration: '5 semaines', price: 120 },
      { title: 'Sortie terrain', description: 'Photographie en extérieur', duration: '3 semaines', price: 120 },
      { title: 'Exposition', description: 'Préparation d\'expositions photo', duration: '4 semaines', price: 120 }
    ]
  },
  {
    title: 'Langues',
    description: 'Apprentissage de langues - Arabe, Anglais, Français',
    category: 'Soft Skills',
    imageUrl: 'https://images.unsplash.com/photo-1543269865-cbdf26cecb46?w=500',
    trainerId: 'trainer-5',
    trainerName: 'Fatima Zohra',
    rating: 4.8,
    reviewCount: 0,
    followers: 0,
    isActive: true,
    offers: [
      { title: 'Conversation', description: 'Pratique de la conversation', duration: '6 semaines', price: 120 },
      { title: 'Grammaire', description: 'Grammaire et structures linguistiques', duration: '5 semaines', price: 120 },
      { title: 'Preparation examen', description: 'Préparation aux examens officiels', duration: '8 semaines', price: 120 },
      { title: 'Echange DIALECT ARABE ANGALIS FRANCAIS', description: 'Échange de dialecte arabe, anglais et français', duration: '6 semaines', price: 120 }
    ]
  },
  {
    title: 'Jeux stratégiques',
    description: 'Échecs, jeux de stratégie et coaching',
    category: 'Soft Skills',
    imageUrl: 'https://images.unsplash.com/photo-1611003228941-98852ba62227?w=500',
    trainerId: 'trainer-6',
    trainerName: 'Karim El Kasmi',
    rating: 4.9,
    reviewCount: 0,
    followers: 0,
    isActive: true,
    offers: [
      { title: 'Initiation', description: 'Initiation aux jeux stratégiques', duration: '4 semaines', price: 120 },
      { title: 'Tournoi', description: 'Préparation aux tournois', duration: '6 semaines', price: 120 },
      { title: 'Coaching', description: 'Coaching personnalisé', duration: '8 semaines', price: 120 },
      { title: 'Analyse de partie', description: 'Analyse et stratégies avancées', duration: '5 semaines', price: 120 }
    ]
  },
  {
    title: 'Sport / Fitness',
    description: 'Entraînement sportif et fitness professionnel',
    category: 'Soft Skills',
    imageUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=500',
    trainerId: 'trainer-7',
    trainerName: 'Youssef Hamid',
    rating: 5.0,
    reviewCount: 0,
    followers: 0,
    isActive: true,
    offers: [
      { title: 'Coaching personnalisé', description: 'Entraînement adapté à vos objectifs', duration: '8 semaines', price: 120 },
      { title: 'Plan d\'entraînement', description: 'Création de plans d\'entraînement', duration: '4 semaines', price: 120 },
      { title: 'Bootcamp', description: 'Bootcamp intensif de fitness', duration: '6 semaines', price: 120 }
    ]
  },
  {
    title: 'Crochet',
    description: 'Art du crochet et travaux manuels',
    category: 'Crochets',
    imageUrl: 'https://images.unsplash.com/photo-1578926078328-123456789012?w=500',
    trainerId: 'trainer-8',
    trainerName: 'Nadia Sami',
    rating: 4.8,
    reviewCount: 0,
    followers: 0,
    isActive: true,
    offers: [
      { title: 'Cours de base', description: 'Les bases du crochet', duration: '4 semaines', price: 120 },
      { title: 'Apprentissage en groupe', description: 'Apprentissage en groupe convivial', duration: '6 semaines', price: 120 },
      { title: 'Atelier', description: 'Ateliers créatifs et projets', duration: '5 semaines', price: 120 },
      { title: 'Cours accéléré', description: 'Cours intensif et accéléré', duration: '3 semaines', price: 120 }
    ]
  }
];

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

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

    // Add sample talents with offers at 120 DH
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

    console.log(`✅ Added ${addedCount} talents with ${sampleTalents.length * 2} offers`);

    res.setHeader('Content-Type', 'application/json');
    return res.status(200).json({
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
    return res.status(500).json({
      success: false,
      error: error.message || 'Unknown error'
    });
  }
}
