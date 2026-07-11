import { collection, query, where, onSnapshot, getDocs } from 'firebase/firestore';
import { db } from './firebase';

export interface DonateMethod {
  id: string;
  name: string;
  url: string;
  color: string;
  description?: string;
  descriptionKey?: string;
  isActive: string;
  btnClass?: string;
}

/**
 * Subscribes to active donation methods from Firestore where isActive == "1".
 * Returns unsubscribe function.
 */
export function subscribeToActiveDonates(
  onUpdate: (donates: DonateMethod[]) => void,
  onError: (err: Error) => void
): () => void {
  const donatesQuery = query(
    collection(db, 'donates'),
    where('isActive', '==', '1')
  );

  return onSnapshot(
    donatesQuery,
    (snap) => {
      const list: DonateMethod[] = [];
      snap.forEach((doc) => {
        const data = doc.data();
        list.push({
          id: doc.id,
          name: data.name_donate || '',
          url: data.link_donate || '',
          color: data.color || '#6366f1',
          description: data.description || '',
          descriptionKey: data.descriptionKey || '',
          isActive: data.isActive || '1',
          btnClass: 'custom-dynamic'
        });
      });
      onUpdate(list);
    },
    onError
  );
}

/**
 * Fetches active donation methods from Firestore once.
 */
export async function fetchActiveDonates(): Promise<DonateMethod[]> {
  const donatesQuery = query(
    collection(db, 'donates'),
    where('isActive', '==', '1')
  );
  
  const snap = await getDocs(donatesQuery);
  const list: DonateMethod[] = [];
  snap.forEach((doc) => {
    const data = doc.data();
    list.push({
      id: doc.id,
      name: data.name_donate || '',
      url: data.link_donate || '',
      color: data.color || '#6366f1',
      description: data.description || '',
      descriptionKey: data.descriptionKey || '',
      isActive: data.isActive || '1',
      btnClass: 'custom-dynamic'
    });
  });
  return list;
}
