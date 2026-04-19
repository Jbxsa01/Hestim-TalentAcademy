export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  roles: ('learner' | 'trainer' | 'admin')[];
  createdAt: string;
}

export interface Talent {
  id: string;
  trainerId: string;
  trainerName: string;
  title: string;
  description: string;
  category: string;
  imageUrl: string;
  rating: number;
  reviewCount: number;
  createdAt: string;
}

export interface Offer {
  id: string;
  talentId: string;
  title: string;
  description: string;
  duration: string;
  price: number;
  createdAt: string;
}
