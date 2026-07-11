import { collection, query, where, onSnapshot, doc, QuerySnapshot, QueryDocumentSnapshot } from 'firebase/firestore';
import { db } from './firebase';
import { decryptText } from '../utils/crypto';

export interface ScheduleEvent {
  title: string;
  titleKey?: string;
  description?: string;
  descriptionKey?: string;
  time: string;
  highlight: boolean;
}

export interface WeekDoc {
  id: string;
  week: number;
  year: string;
  scheduleId: string;
  name: string;
}

const dayMapping: Record<string, number> = {
  monday: 0,
  tuesday: 1,
  wednesday: 2,
  thursday: 3,
  friday: 4,
  saturday: 5,
  sunday: 6
};

const SECRET_KEY = import.meta.env.VITE_CRYPTO_SECRET_KEY || 'vos-chat-sec-2026';

export function getWeekNumberAndYear(d: Date): { week: number; year: number } {
  const target = new Date(d.valueOf());
  const dayNr = (d.getDay() + 6) % 7; // Monday is 0, Sunday is 6
  target.setDate(target.getDate() - dayNr + 3); // Thursday
  const firstThursday = target.valueOf();
  target.setMonth(0, 1);
  if (target.getDay() !== 4) {
    target.setMonth(0, 1 + ((4 - target.getDay() + 7) % 7));
  }
  const week = 1 + Math.ceil((firstThursday - target.valueOf()) / 604800000);
  return { week, year: target.getFullYear() };
}

/**
 * Subscribes to all weeks from Firestore and triggers onUpdate callback on any changes.
 * Returns unsubscribe function.
 */
export function subscribeToAllWeeks(
  onUpdate: (weeks: WeekDoc[]) => void,
  onError: (err: Error) => void
): () => void {
  const weeksQuery = query(collection(db, 'weeks'));
  
  return onSnapshot(
    weeksQuery,
    (snap) => {
      const list: WeekDoc[] = [];
      snap.forEach((doc) => {
        const data = doc.data();
        list.push({
          id: doc.id,
          week: Number(data.week),
          year: String(data.year),
          scheduleId: data.scheduleId || '',
          name: data.name || ''
        });
      });
      
      // Sort in JavaScript to avoid requiring a composite index in Firestore
      list.sort((a, b) => {
        const yearDiff = a.year.localeCompare(b.year);
        if (yearDiff !== 0) return yearDiff;
        return a.week - b.week;
      });
      
      onUpdate(list);
    },
    onError
  );
}

/**
 * Subscribes to events for a specific week doc ID in real-time, matching string ID or DocumentReference.
 * Returns unsubscribe function.
 */
export function subscribeToEventsByWeekId(
  weekId: string,
  onUpdate: (events: ScheduleEvent[] | null) => void,
  onError: (err: Error) => void
): () => void {
  // Query 1: String-based weekId filter
  const eventsQuery = query(
    collection(db, 'events'),
    where('weekId', '==', weekId)
  );
  
  const unsubscribes: (() => void)[] = [];
  
  const processSnap = async (snap: QuerySnapshot) => {
    const fetchedTasks: ScheduleEvent[] = Array(7).fill(null).map(() => ({
      title: '',
      time: '',
      highlight: false
    }));

    const tasksPromises = snap.docs.map(async (docSnap: QueryDocumentSnapshot) => {
      const data = docSnap.data();
      const dayName = (data.day || '').toLowerCase().trim();
      const dayIndex = dayMapping[dayName];
      
      const titleVal = data.title || '';
      const descriptionVal = data.description || '';
      
      const decryptedTitle = await decryptText(titleVal, SECRET_KEY);
      const decryptedDescription = await decryptText(descriptionVal, SECRET_KEY);
      
      return {
        dayIndex,
        event: {
          title: decryptedTitle,
          titleKey: data.titleKey || undefined,
          description: decryptedDescription,
          descriptionKey: data.descriptionKey || undefined,
          time: data.time || '',
          highlight: !!data.highlight
        }
      };
    });
    
    const mappedResults = await Promise.all(tasksPromises);
    mappedResults.forEach(({ dayIndex, event }) => {
      if (dayIndex !== undefined && dayIndex >= 0 && dayIndex < 7) {
        fetchedTasks[dayIndex] = event;
      }
    });
    
    onUpdate(fetchedTasks);
  };

  const handleSnapshot = async (eventsSnap: QuerySnapshot) => {
    if (eventsSnap.empty) {
      // Query 2: Fallback to DocumentReference if string query yields no events
      const weekDocRef = doc(db, 'weeks', weekId);
      const fallbackQuery = query(
        collection(db, 'events'),
        where('weekId', '==', weekDocRef)
      );
      
      const fallbackUnsub = onSnapshot(
        fallbackQuery,
        async (fallbackSnap) => {
          if (fallbackSnap.empty) {
            onUpdate(null);
            return;
          }
          await processSnap(fallbackSnap);
        },
        onError
      );
      unsubscribes.push(fallbackUnsub);
      return;
    }
    await processSnap(eventsSnap);
  };

  const mainUnsub = onSnapshot(eventsQuery, handleSnapshot, onError);
  unsubscribes.push(mainUnsub);

  return () => {
    unsubscribes.forEach((unsub) => unsub());
  };
}
