import { collection, query, onSnapshot, getDocs } from 'firebase/firestore';
import { db } from './firebase';

export interface MediaDoc {
  id: string;
  name: string;
  resolution: string;
  size: string;
  uploadedDate: string;
  url: string;
}

/**
 * Subscribes to the media collection from Firestore in real-time.
 * Returns unsubscribe function.
 */
export function subscribeToMedia(
  onUpdate: (mediaList: MediaDoc[]) => void,
  onError: (err: any) => void
): () => void {
  const mediaQuery = query(collection(db, 'media'));

  return onSnapshot(
    mediaQuery,
    (snap) => {
      const list: MediaDoc[] = [];
      snap.forEach((doc) => {
        const data = doc.data();
        list.push({
          id: doc.id,
          name: data.name || '',
          resolution: data.resolution || '',
          size: data.size || '',
          uploadedDate: data.uploadedDate || '',
          url: data.url || '',
        });
      });
      
      // Optionally sort by uploadedDate descending or name
      list.sort((a, b) => b.uploadedDate.localeCompare(a.uploadedDate));
      
      onUpdate(list);
    },
    onError
  );
}

/**
 * Fetches all media items from Firestore once.
 */
export async function fetchMedia(): Promise<MediaDoc[]> {
  const mediaQuery = query(collection(db, 'media'));
  const snap = await getDocs(mediaQuery);
  const list: MediaDoc[] = [];
  
  snap.forEach((doc) => {
    const data = doc.data();
    list.push({
      id: doc.id,
      name: data.name || '',
      resolution: data.resolution || '',
      size: data.size || '',
      uploadedDate: data.uploadedDate || '',
      url: data.url || '',
    });
  });

  list.sort((a, b) => b.uploadedDate.localeCompare(a.uploadedDate));
  return list;
}
