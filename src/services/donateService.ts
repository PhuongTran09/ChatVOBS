import { collection, query, where, onSnapshot } from 'firebase/firestore';
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
  // Read by QROverlayPage/DonateSection, but never populated by the mapper
  // below, so the api.qrserver.com fallback always wins today. See notes.
  qrImage?: string;
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
