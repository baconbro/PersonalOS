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
  if (converted.timestamp && converted.timestamp.toDate) {
    converted.timestamp = converted.timestamp.toDate();
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
  if (converted.timestamp instanceof Date) {
    converted.timestamp = Timestamp.fromDate(converted.timestamp);
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

  // Check-in methods
  async getCheckIns(): Promise<any[]> {
    try {
      const checkInsRef = collection(db, 'users', this.userId, 'checkIns');
      const q = query(checkInsRef, orderBy('timestamp', 'desc'));
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => {
        const data = convertTimestamps(doc.data());
        console.log('📥 Loading check-in - Firestore ID:', doc.id, 'Custom ID:', data.customId);
        return {
          ...data,
          id: data.customId || doc.id, // Use customId if available, fallback to Firestore ID
          firestoreId: doc.id
        };
      });
    } catch (error) {
      console.error('Error getting check-ins:', error);
      throw error;
    }
  }

  async addCheckIn(checkIn: any): Promise<string> {
    try {
      const checkInsRef = collection(db, 'users', this.userId, 'checkIns');
      const checkInData = {
        ...convertDatesToTimestamps(checkIn),
        customId: checkIn.id // Store the original ID as customId
      };
      const docRef = await addDoc(checkInsRef, checkInData);
      console.log('📤 Added check-in to Firebase:', docRef.id, 'Custom ID:', checkIn.id);
      return docRef.id;
    } catch (error) {
      console.error('Error adding check-in:', error);
      throw error;
    }
  }

  async updateCheckIn(checkIn: any): Promise<void> {
    try {
      // Find the document by customId
      const checkInsRef = collection(db, 'users', this.userId, 'checkIns');
      const snapshot = await getDocs(checkInsRef);
      
      let firestoreDocId = null;
      snapshot.forEach(doc => {
        const data = doc.data();
        if (data.customId === checkIn.id) {
          firestoreDocId = doc.id;
        }
      });

      if (!firestoreDocId) {
        throw new Error(`Check-in with ID ${checkIn.id} not found in Firestore`);
      }

      const checkInRef = doc(db, 'users', this.userId, 'checkIns', firestoreDocId);
      const { id, ...checkInData } = checkIn;
      await updateDoc(checkInRef, {
        ...convertDatesToTimestamps(checkInData),
        customId: id
      });
      console.log('📤 Updated check-in in Firebase:', firestoreDocId, 'Custom ID:', id);
    } catch (error) {
      console.error('Error updating check-in:', error);
      throw error;
    }
  }

  async deleteCheckIn(checkInId: string): Promise<void> {
    try {
      // Find the document by customId
      const checkInsRef = collection(db, 'users', this.userId, 'checkIns');
      const snapshot = await getDocs(checkInsRef);
      
      let firestoreDocId = null;
      snapshot.forEach(doc => {
        const data = doc.data();
        if (data.customId === checkInId) {
          firestoreDocId = doc.id;
        }
      });

      if (!firestoreDocId) {
        throw new Error(`Check-in with ID ${checkInId} not found in Firestore`);
      }

      const checkInRef = doc(db, 'users', this.userId, 'checkIns', firestoreDocId);
      await deleteDoc(checkInRef);
      console.log('📤 Deleted check-in from Firebase:', firestoreDocId, 'Custom ID:', checkInId);
    } catch (error) {
      console.error('Error deleting check-in:', error);
      throw error;
    }
  }

  // Goal Updates
  async getGoalUpdates(): Promise<any[]> {
    try {
      const updatesRef = collection(db, 'users', this.userId, 'goalUpdates');
      const snapshot = await getDocs(query(updatesRef, orderBy('createdAt', 'desc')));
      return snapshot.docs.map(doc => convertTimestamps({ ...doc.data(), id: doc.id }));
    } catch (error) {
      console.error('Error fetching goal updates:', error);
      throw error;
    }
  }

  async addGoalUpdate(update: any): Promise<string> {
    try {
      const updatesRef = collection(db, 'users', this.userId, 'goalUpdates');
      const docRef = await addDoc(updatesRef, convertDatesToTimestamps(update));
      return docRef.id;
    } catch (error) {
      console.error('Error adding goal update:', error);
      throw error;
    }
  }

  async deleteGoalUpdate(updateId: string): Promise<void> {
    try {
      const updateRef = doc(db, 'users', this.userId, 'goalUpdates', updateId);
      await deleteDoc(updateRef);
    } catch (error) {
      console.error('Error deleting goal update:', error);
      throw error;
    }
  }

  // Learnings
  async getLearnings(): Promise<any[]> {
    try {
      const learningsRef = collection(db, 'users', this.userId, 'learnings');
      const snapshot = await getDocs(query(learningsRef, orderBy('createdAt', 'desc')));
      return snapshot.docs.map(doc => convertTimestamps({ ...doc.data(), id: doc.id }));
    } catch (error) {
      console.error('Error fetching learnings:', error);
      throw error;
    }
  }

  async addLearning(learning: any): Promise<string> {
    try {
      const learningsRef = collection(db, 'users', this.userId, 'learnings');
      const docRef = await addDoc(learningsRef, convertDatesToTimestamps(learning));
      return docRef.id;
    } catch (error) {
      console.error('Error adding learning:', error);
      throw error;
    }
  }

  async deleteLearning(learningId: string): Promise<void> {
    try {
      const learningRef = doc(db, 'users', this.userId, 'learnings', learningId);
      await deleteDoc(learningRef);
    } catch (error) {
      console.error('Error deleting learning:', error);
      throw error;
    }
  }

  // Roadblocks
  async getRoadblocks(): Promise<any[]> {
    try {
      const roadblocksRef = collection(db, 'users', this.userId, 'roadblocks');
      const snapshot = await getDocs(query(roadblocksRef, orderBy('createdAt', 'desc')));
      return snapshot.docs.map(doc => convertTimestamps({ ...doc.data(), id: doc.id }));
    } catch (error) {
      console.error('Error fetching roadblocks:', error);
      throw error;
    }
  }

  async addRoadblock(roadblock: any): Promise<string> {
    try {
      const roadblocksRef = collection(db, 'users', this.userId, 'roadblocks');
      const docRef = await addDoc(roadblocksRef, convertDatesToTimestamps(roadblock));
      return docRef.id;
    } catch (error) {
      console.error('Error adding roadblock:', error);
      throw error;
    }
  }

  async updateRoadblock(roadblock: any): Promise<void> {
    try {
      const roadblockRef = doc(db, 'users', this.userId, 'roadblocks', roadblock.id);
      const { id, ...roadblockData } = roadblock;
      await updateDoc(roadblockRef, convertDatesToTimestamps(roadblockData));
    } catch (error) {
      console.error('Error updating roadblock:', error);
      throw error;
    }
  }

  async deleteRoadblock(roadblockId: string): Promise<void> {
    try {
      const roadblockRef = doc(db, 'users', this.userId, 'roadblocks', roadblockId);
      await deleteDoc(roadblockRef);
    } catch (error) {
      console.error('Error deleting roadblock:', error);
      throw error;
    }
  }

  // Decisions
  async getDecisions(): Promise<any[]> {
    try {
      const decisionsRef = collection(db, 'users', this.userId, 'decisions');
      const snapshot = await getDocs(query(decisionsRef, orderBy('createdAt', 'desc')));
      return snapshot.docs.map(doc => convertTimestamps({ ...doc.data(), id: doc.id }));
    } catch (error) {
      console.error('Error fetching decisions:', error);
      throw error;
    }
  }

  async addDecision(decision: any): Promise<string> {
    try {
      const decisionsRef = collection(db, 'users', this.userId, 'decisions');
      const docRef = await addDoc(decisionsRef, convertDatesToTimestamps(decision));
      return docRef.id;
    } catch (error) {
      console.error('Error adding decision:', error);
      throw error;
    }
  }

  async deleteDecision(decisionId: string): Promise<void> {
    try {
      const decisionRef = doc(db, 'users', this.userId, 'decisions', decisionId);
      await deleteDoc(decisionRef);
    } catch (error) {
      console.error('Error deleting decision:', error);
      throw error;
    }
  }

  // Wins
  async getWins(): Promise<any[]> {
    try {
      const winsRef = collection(db, 'users', this.userId, 'wins');
      const snapshot = await getDocs(query(winsRef, orderBy('createdAt', 'desc')));
      return snapshot.docs.map(doc => convertTimestamps({ ...doc.data(), id: doc.id }));
    } catch (error) {
      console.error('Error fetching wins:', error);
      throw error;
    }
  }

  async addWin(win: any): Promise<string> {
    try {
      const winsRef = collection(db, 'users', this.userId, 'wins');
      const docRef = await addDoc(winsRef, convertDatesToTimestamps(win));
      return docRef.id;
    } catch (error) {
      console.error('Error adding win:', error);
      throw error;
    }
  }

  async deleteWin(winId: string): Promise<void> {
    try {
      const winRef = doc(db, 'users', this.userId, 'wins', winId);
      await deleteDoc(winRef);
    } catch (error) {
      console.error('Error deleting win:', error);
      throw error;
    }
  }

  // Load all user data
  async loadAllData(): Promise<AppState> {
    try {
      const [annualGoals, quarterlyGoals, weeklyTasks, weeklyReviews, lifeGoals, checkIns, goalUpdates, learnings, roadblocks, decisions, wins] = await Promise.all([
        this.getAnnualGoals(),
        this.getQuarterlyGoals(),
        this.getWeeklyTasks(),
        this.getWeeklyReviews(),
        this.getLifeGoals(),
        this.getCheckIns(),
        this.getGoalUpdates(),
        this.getLearnings(),
        this.getRoadblocks(),
        this.getDecisions(),
        this.getWins()
      ]);

      return {
        annualGoals,
        quarterlyGoals,
        weeklyTasks,
        weeklyReviews,
        lifeGoals,
        activityLogs: [], // Activity logs are handled locally, not stored in Firebase
        checkIns,
        goalUpdates,
        learnings,
        roadblocks,
        decisions,
        wins,
        currentYear: new Date().getFullYear(),
        currentQuarter: Math.ceil((new Date().getMonth() + 1) / 3) as 1 | 2 | 3 | 4,
      };
    } catch (error) {
      console.error('Error loading all data:', error);
      throw error;
    }
  }
}
