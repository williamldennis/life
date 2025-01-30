'use client';

import { initializeApp, getApps } from 'firebase/app';
import { getAuth, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, enableIndexedDbPersistence, deleteDoc, serverTimestamp, writeBatch } from 'firebase/firestore';

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Log config (without exposing sensitive values)
console.log('Firebase config check:', {
  hasApiKey: !!firebaseConfig.apiKey,
  hasAuthDomain: !!firebaseConfig.authDomain,
  hasProjectId: !!firebaseConfig.projectId,
  hasStorageBucket: !!firebaseConfig.storageBucket,
  hasMessagingSenderId: !!firebaseConfig.messagingSenderId,
  hasAppId: !!firebaseConfig.appId,
  projectId: firebaseConfig.projectId // Safe to log project ID
});

// Initialize Firebase
let app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
let auth = getAuth(app);
let db = getFirestore(app);

// Enable Firestore offline persistence
if (typeof window !== 'undefined') {
  // Enable Auth persistence
  setPersistence(auth, browserLocalPersistence)
    .then(() => {
      console.log('Firebase auth persistence set to LOCAL');
    })
    .catch((error) => {
      console.error('Error setting auth persistence:', error);
    });

  // Enable Firestore persistence
  enableIndexedDbPersistence(db)
    .then(() => {
      console.log('Firestore persistence enabled');
    })
    .catch((err) => {
      if (err.code === 'failed-precondition') {
        console.warn('Firestore persistence failed: Multiple tabs open');
      } else if (err.code === 'unimplemented') {
        console.warn('Firestore persistence not available in this browser');
      }
    });
}

export async function saveAssessment(userId: string, responses: Record<string, string>) {
  if (!navigator.onLine) {
    throw new Error('You are offline. Please check your internet connection and try again.');
  }

  console.log('Attempting to save assessment for user:', userId);
  
  try {
    const docRef = doc(db, 'assessments', userId);
    const data = {
      responses,
      completedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    await setDoc(docRef, data);
    console.log('Assessment saved successfully:', {
      userId,
      timestamp: data.completedAt,
      responseCount: Object.keys(responses).length
    });
  } catch (error: any) {
    console.error('Error saving assessment:', {
      userId,
      errorCode: error.code,
      errorMessage: error.message
    });
    throw error;
  }
}

export async function getAssessment(userId: string) {
  console.log('Attempting to get assessment for user:', userId);
  
  try {
    const docRef = doc(db, 'assessments', userId);
    const docSnap = await getDoc(docRef);
    
    if (!navigator.onLine && !docSnap.exists()) {
      console.warn('Offline and no cached data available');
      return null;
    }
    
    console.log('Assessment retrieval result:', {
      userId,
      exists: docSnap.exists(),
      timestamp: docSnap.exists() ? docSnap.data()?.completedAt : null
    });
    
    return docSnap.exists() ? docSnap.data() : null;
  } catch (error: any) {
    console.error('Error getting assessment:', {
      userId,
      errorCode: error.code,
      errorMessage: error.message
    });
    if (!navigator.onLine) {
      console.warn('You are offline. Trying to load cached data...');
      return null;
    }
    throw error;
  }
}

export interface AssessmentInsights {
  takeaways: {
    health: string[];
    work: string[];
    play: string[];
    love: string[];
  };
  actionItems: {
    health: string[];
    work: string[];
    play: string[];
    love: string[];
  };
  generatedAt: number;
}

export async function saveInsights(userId: string, insights: AssessmentInsights) {
  console.log('Attempting to save insights for user:', userId);
  try {
    const docRef = doc(db, 'insights', userId);
    await setDoc(docRef, insights);
    console.log('Insights saved successfully:', {
      userId,
      timestamp: insights.generatedAt,
      takeawayCount: Object.values(insights.takeaways).flat().length,
      actionItemCount: Object.values(insights.actionItems).flat().length
    });
  } catch (error) {
    console.error('Error saving insights:', {
      userId,
      error,
      errorMessage: error instanceof Error ? error.message : 'Unknown error'
    });
    throw error;
  }
}

export async function getInsights(userId: string): Promise<AssessmentInsights | null> {
  console.log('Attempting to get insights for user:', userId);
  try {
    const docRef = doc(db, 'insights', userId);
    const docSnap = await getDoc(docRef);
    
    console.log('Insights retrieval result:', {
      userId,
      exists: docSnap.exists(),
      timestamp: docSnap.exists() ? docSnap.data()?.generatedAt : null
    });
    
    if (docSnap.exists()) {
      const data = docSnap.data() as AssessmentInsights;
      return data;
    }
    return null;
  } catch (error) {
    console.error('Error getting insights:', {
      userId,
      error,
      errorMessage: error instanceof Error ? error.message : 'Unknown error'
    });
    throw error;
  }
}

export async function deleteAssessmentData(userId: string) {
  console.log('Attempting to delete assessment data for user:', userId);
  try {
    // Delete assessment document
    await deleteDoc(doc(db, 'assessments', userId));
    // Delete insights document
    await deleteDoc(doc(db, 'insights', userId));
    console.log('Assessment and insights data deleted successfully');
  } catch (error) {
    console.error('Error deleting assessment data:', error);
    throw error;
  }
}

export interface LifeBalanceScores extends Record<string, number> {
  health: number;
  work: number;
  play: number;
  love: number;
}

export async function saveScores(userId: string, scores: LifeBalanceScores) {
  console.log('Attempting to save scores:', {
    userId,
    path: `users/${userId}/data/lifeBalance`,
    scores,
    currentUser: auth.currentUser?.uid
  });

  // Verify auth state
  if (!auth.currentUser) {
    throw new Error('No authenticated user found');
  }

  // Verify user ID matches current user
  if (auth.currentUser.uid !== userId) {
    throw new Error('User ID mismatch');
  }

  try {
    // Create a batch to ensure atomic updates
    const batch = writeBatch(db);

    // Update the user document
    const userRef = doc(db, 'users', userId);
    batch.set(userRef, {
      updatedAt: serverTimestamp(),
      email: auth.currentUser.email,
    }, { merge: true });

    // Update the scores document - using the full path
    const scoresRef = doc(db, 'users', userId, 'data', 'lifeBalance');
    batch.set(scoresRef, {
      ...scores,
      updatedAt: serverTimestamp(),
    });

    // Commit the batch
    await batch.commit();
    console.log('Successfully saved scores to Firebase');
  } catch (error: any) {
    console.error('Error saving scores to Firebase:', {
      error,
      errorCode: error?.code,
      errorMessage: error?.message,
      userId,
      currentUser: auth.currentUser?.uid,
      scores
    });
    throw error;
  }
}

export async function getScores(userId: string): Promise<LifeBalanceScores | null> {
  console.log('Attempting to get scores:', {
    userId,
    path: `users/${userId}/data/lifeBalance`,
    currentUser: auth.currentUser?.uid
  });

  // Verify auth state
  if (!auth.currentUser) {
    throw new Error('No authenticated user found');
  }

  // Verify user ID matches current user
  if (auth.currentUser.uid !== userId) {
    throw new Error('User ID mismatch');
  }

  try {
    // Using the full path for consistency
    const scoresRef = doc(db, 'users', userId, 'data', 'lifeBalance');
    const scoresSnap = await getDoc(scoresRef);
    
    console.log('Got scores snapshot:', {
      exists: scoresSnap.exists(),
      data: scoresSnap.data()
    });
    
    if (scoresSnap.exists()) {
      const data = scoresSnap.data();
      return {
        health: data.health ?? 50,
        work: data.work ?? 50,
        play: data.play ?? 50,
        love: data.love ?? 50,
      };
    }
    
    return null;
  } catch (error: any) {
    console.error('Error getting scores from Firebase:', {
      error,
      errorCode: error?.code,
      errorMessage: error?.message,
      userId,
      currentUser: auth.currentUser?.uid
    });
    throw error;
  }
}

export { auth, db };
export default app; 