import { 
  collection, 
  doc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy,
  Timestamp 
} from 'firebase/firestore';
import type { User } from 'firebase/auth';
import { db } from './firebase';
import type { AnnualGoal, QuarterlyGoal, WeeklyTask, WeeklyReviewData, AppState, LifeGoal } from '../types';

// Helper function to convert Firestore timestamps to Date objects
const convertTimestamps = (data: any) => {
  const converted = { ...data };
  if (converted.createdAt && converted.createdAt.toDate) {
    converted.createdAt = converted.createdAt.toDate();
  }
  if (converted.targetDate && converted.targetDate.toDate) {
    converted.targetDate = converted.targetDate.toDate();
  }
  if (converted.weekOf && converted.weekOf.toDate) {
    converted.weekOf = converted.weekOf.toDate();
  }
  return converted;
};

// Helper function to convert Date objects to Firestore timestamps
const convertDatesToTimestamps = (data: any) => {
  const converted = { ...data };
  if (converted.createdAt instanceof Date) {
    converted.createdAt = Timestamp.fromDate(converted.createdAt);
  }
  if (converted.targetDate instanceof Date) {
    converted.targetDate = Timestamp.fromDate(converted.targetDate);
  }
  if (converted.weekOf instanceof Date) {
    converted.weekOf = Timestamp.fromDate(converted.weekOf);
  }
  return converted;
};

export class FirebaseService {
  private userId: string;

  constructor(user: User) {
    this.userId = user.uid;
    console.log('🔐 FirebaseService initialized for user:', this.userId);
  }

  // Annual Goals
  async getAnnualGoals(): Promise<AnnualGoal[]> {
    try {
      const goalsRef = collection(db, 'users', this.userId, 'annualGoals');
      const snapshot = await getDocs(query(goalsRef, orderBy('createdAt', 'desc')));
      return snapshot.docs.map(doc => {
        const data = doc.data();
        const firestoreId = doc.id; // The real Firestore document ID
        console.log('📥 Loading annual goal - Firestore ID:', firestoreId, 'Custom ID:', data.id);
        return convertTimestamps({ 
          ...data, 
          id: firestoreId, // Use Firestore document ID as the primary ID
          customId: data.id // Preserve the custom ID if needed
        }) as AnnualGoal;
      });
    } catch (error) {
      console.error('Error fetching annual goals:', error);
      throw error;
    }
  }

  async addAnnualGoal(goal: Omit<AnnualGoal, 'id'>): Promise<string> {
    try {
      const goalsRef = collection(db, 'users', this.userId, 'annualGoals');
      const docRef = await addDoc(goalsRef, convertDatesToTimestamps(goal));
      return docRef.id;
    } catch (error) {
      console.error('Error adding annual goal:', error);
      throw error;
    }
  }

  async updateAnnualGoal(goal: AnnualGoal): Promise<void> {
    try {
      const goalRef = doc(db, 'users', this.userId, 'annualGoals', goal.id);
      const { id, ...goalData } = goal;
      await updateDoc(goalRef, convertDatesToTimestamps(goalData));
    } catch (error) {
      console.error('Error updating annual goal:', error);
      throw error;
    }
  }

  async deleteAnnualGoal(goalId: string): Promise<void> {
    try {
      const goalRef = doc(db, 'users', this.userId, 'annualGoals', goalId);
      await deleteDoc(goalRef);
    } catch (error) {
      console.error('Error deleting annual goal:', error);
      throw error;
    }
  }

  // Life Goals
  async getLifeGoals(): Promise<LifeGoal[]> {
    try {
      const goalsRef = collection(db, 'users', this.userId, 'lifeGoals');
      const snapshot = await getDocs(query(goalsRef, orderBy('createdAt', 'desc')));
      return snapshot.docs.map(doc => {
        const data = doc.data();
        const firestoreId = doc.id; // The real Firestore document ID
        console.log('📥 Loading life goal - Firestore ID:', firestoreId, 'Custom ID:', data.id);
        return convertTimestamps({ 
          ...data, 
          id: firestoreId, // Use Firestore document ID as the primary ID
          customId: data.id // Preserve the custom ID if needed
        }) as LifeGoal;
      });
    } catch (error) {
      console.error('Error fetching life goals:', error);
      throw error;
    }
  }

  async addLifeGoal(goal: Omit<LifeGoal, 'id'>): Promise<string> {
    try {
      const goalsRef = collection(db, 'users', this.userId, 'lifeGoals');
      const docRef = await addDoc(goalsRef, convertDatesToTimestamps(goal));
      return docRef.id;
    } catch (error) {
      console.error('Error adding life goal:', error);
      throw error;
    }
  }

  async updateLifeGoal(goal: LifeGoal): Promise<void> {
    try {
      const goalRef = doc(db, 'users', this.userId, 'lifeGoals', goal.id);
      const { id, ...goalData } = goal;
      await updateDoc(goalRef, convertDatesToTimestamps(goalData));
    } catch (error) {
      console.error('Error updating life goal:', error);
      throw error;
    }
  }

  async deleteLifeGoal(goalId: string): Promise<void> {
    try {
      console.log('🔥 Firebase: Attempting to delete life goal with ID:', goalId);
      console.log('🔥 Firebase: Document ID type:', typeof goalId);
      console.log('🔥 Firebase: Document ID length:', goalId.length);
      console.log('🔥 Firebase: User ID:', this.userId);
      const goalRef = doc(db, 'users', this.userId, 'lifeGoals', goalId);
      console.log('🔥 Firebase: Goal reference path:', goalRef.path);
      console.log('🔥 Firebase: Goal reference ID:', goalRef.id);
      await deleteDoc(goalRef);
      console.log('✅ Firebase: Life goal deleted successfully');
    } catch (error) {
      console.error('❌ Firebase: Error deleting life goal:', error);
      throw error;
    }
  }

  // Quarterly Goals
  async getQuarterlyGoals(): Promise<QuarterlyGoal[]> {
    try {
      const goalsRef = collection(db, 'users', this.userId, 'quarterlyGoals');
      const snapshot = await getDocs(query(goalsRef, orderBy('createdAt', 'desc')));
      return snapshot.docs.map(doc => {
        const data = doc.data();
        const firestoreId = doc.id; // The real Firestore document ID
        console.log('📥 Loading quarterly goal - Firestore ID:', firestoreId, 'Custom ID:', data.id);
        return convertTimestamps({ 
          ...data, 
          id: firestoreId, // Use Firestore document ID as the primary ID
          customId: data.id // Preserve the custom ID if needed
        }) as QuarterlyGoal;
      });
    } catch (error) {
      console.error('Error fetching quarterly goals:', error);
      throw error;
    }
  }

  async addQuarterlyGoal(goal: Omit<QuarterlyGoal, 'id'>): Promise<string> {
    try {
      const goalsRef = collection(db, 'users', this.userId, 'quarterlyGoals');
      const docRef = await addDoc(goalsRef, convertDatesToTimestamps(goal));
      return docRef.id;
    } catch (error) {
      console.error('Error adding quarterly goal:', error);
      throw error;
    }
  }

  async updateQuarterlyGoal(goal: QuarterlyGoal): Promise<void> {
    try {
      const goalRef = doc(db, 'users', this.userId, 'quarterlyGoals', goal.id);
      const { id, ...goalData } = goal;
      await updateDoc(goalRef, convertDatesToTimestamps(goalData));
    } catch (error) {
      console.error('Error updating quarterly goal:', error);
      throw error;
    }
  }

  async deleteQuarterlyGoal(goalId: string): Promise<void> {
    try {
      const goalRef = doc(db, 'users', this.userId, 'quarterlyGoals', goalId);
      await deleteDoc(goalRef);
    } catch (error) {
      console.error('Error deleting quarterly goal:', error);
      throw error;
    }
  }

  // Weekly Tasks
  async getWeeklyTasks(): Promise<WeeklyTask[]> {
    try {
      const tasksRef = collection(db, 'users', this.userId, 'weeklyTasks');
      const snapshot = await getDocs(query(tasksRef, orderBy('weekOf', 'desc')));
      const tasks = snapshot.docs.map(doc => {
        const data = doc.data();
        const firestoreId = doc.id; // The real Firestore document ID
        console.log('📥 Loading weekly task - Firestore ID:', firestoreId, 'Custom ID:', data.id);
        const convertedData = convertTimestamps({ 
          ...data, 
          id: firestoreId, // Use Firestore document ID as the primary ID
          customId: data.id // Preserve the custom ID if needed
        }) as WeeklyTask;
        // Debug logging to see what's being loaded
        console.log('📥 Loaded task from Firebase:', convertedData.id, 'status:', convertedData.status, 'completed:', convertedData.completed);
        return convertedData;
      });
      console.log(`✅ Loaded ${tasks.length} weekly tasks from Firebase`);
      return tasks;
    } catch (error) {
      console.error('Error fetching weekly tasks:', error);
      throw error;
    }
  }

  async addWeeklyTask(task: Omit<WeeklyTask, 'id'>): Promise<string> {
    try {
      const tasksRef = collection(db, 'users', this.userId, 'weeklyTasks');
      const docRef = await addDoc(tasksRef, convertDatesToTimestamps(task));
      return docRef.id;
    } catch (error) {
      console.error('Error adding weekly task:', error);
      throw error;
    }
  }

  async updateWeeklyTask(task: WeeklyTask): Promise<void> {
    try {
      const taskRef = doc(db, 'users', this.userId, 'weeklyTasks', task.id);
      const { id, ...taskData } = task;
      
      // Ensure status field is always present and consistent with completed field
      const normalizedTaskData = {
        ...taskData,
        status: task.status || (task.completed ? 'done' : 'todo'),
        completed: task.status === 'done' || task.completed
      };
      
      const dataToSave = convertDatesToTimestamps(normalizedTaskData);
      
      // Debug logging to see what's being saved
      console.log('🔥 Saving task to Firebase:', task.id, 'status:', normalizedTaskData.status, 'completed:', normalizedTaskData.completed);
      console.log('📦 Full data being saved:', dataToSave);
      
      await updateDoc(taskRef, dataToSave);
      console.log('✅ Task saved successfully to Firebase');
    } catch (error) {
      console.error('❌ Error updating weekly task:', error);
      throw error;
    }
  }

  async deleteWeeklyTask(taskId: string): Promise<void> {
    try {
      const taskRef = doc(db, 'users', this.userId, 'weeklyTasks', taskId);
      await deleteDoc(taskRef);
    } catch (error) {
      console.error('Error deleting weekly task:', error);
      throw error;
    }
  }

  // Weekly Reviews
  async getWeeklyReviews(): Promise<WeeklyReviewData[]> {
    try {
      const reviewsRef = collection(db, 'users', this.userId, 'weeklyReviews');
      const snapshot = await getDocs(query(reviewsRef, orderBy('weekOf', 'desc')));
      return snapshot.docs.map(doc => {
        const data = doc.data();
        const firestoreId = doc.id; // The real Firestore document ID
        console.log('📥 Loading weekly review - Firestore ID:', firestoreId, 'Custom ID:', data.id);
        return convertTimestamps({ 
          ...data, 
          id: firestoreId, // Use Firestore document ID as the primary ID
          customId: data.id // Preserve the custom ID if needed
        }) as WeeklyReviewData;
      });
    } catch (error) {
      console.error('Error fetching weekly reviews:', error);
      throw error;
    }
  }

  async addWeeklyReview(review: Omit<WeeklyReviewData, 'id'>): Promise<string> {
    try {
      const reviewsRef = collection(db, 'users', this.userId, 'weeklyReviews');
      const docRef = await addDoc(reviewsRef, convertDatesToTimestamps(review));
      return docRef.id;
    } catch (error) {
      console.error('Error adding weekly review:', error);
      throw error;
    }
  }

  async updateWeeklyReview(review: WeeklyReviewData): Promise<void> {
    try {
      const reviewRef = doc(db, 'users', this.userId, 'weeklyReviews', review.id);
      const { id, ...reviewData } = review;
      await updateDoc(reviewRef, convertDatesToTimestamps(reviewData));
    } catch (error) {
      console.error('Error updating weekly review:', error);
      throw error;
    }
  }

  async deleteWeeklyReview(reviewId: string): Promise<void> {
    try {
      const reviewRef = doc(db, 'users', this.userId, 'weeklyReviews', reviewId);
      await deleteDoc(reviewRef);
    } catch (error) {
      console.error('Error deleting weekly review:', error);
      throw error;
    }
  }

  // Load all user data
  async loadAllData(): Promise<AppState> {
    try {
      const [annualGoals, quarterlyGoals, weeklyTasks, weeklyReviews, lifeGoals] = await Promise.all([
        this.getAnnualGoals(),
        this.getQuarterlyGoals(),
        this.getWeeklyTasks(),
        this.getWeeklyReviews(),
        this.getLifeGoals()
      ]);

      return {
        annualGoals,
        quarterlyGoals,
        weeklyTasks,
        weeklyReviews,
        lifeGoals,
        activityLogs: [], // Activity logs are handled locally, not stored in Firebase
        checkIns: [], // Check-ins are local-only for now
        currentYear: new Date().getFullYear(),
        currentQuarter: Math.ceil((new Date().getMonth() + 1) / 3) as 1 | 2 | 3 | 4,
      };
    } catch (error) {
      console.error('Error loading all data:', error);
      throw error;
    }
  }
}
