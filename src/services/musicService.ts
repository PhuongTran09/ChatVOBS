import { collection, query, where, onSnapshot, getDocs } from 'firebase/firestore';
import { db } from './firebase';

export interface SongDoc {
  id: string;
  artist: string;
  duration: string;
  fileName: string;
  sourceType: string;
  status: string;
  title: string;
  url: string;
}

/**
 * Subscribes to active songs from Firestore in real-time where status == "active".
 * Returns unsubscribe function.
 */
export function subscribeToActiveSongs(
  onUpdate: (songs: SongDoc[]) => void,
  onError: (err: Error) => void
): () => void {
  const songsQuery = query(
    collection(db, 'songs'),
    where('status', '==', 'active')
  );

  return onSnapshot(
    songsQuery,
    (snap) => {
      const list: SongDoc[] = [];
      snap.forEach((doc) => {
        const data = doc.data();
        list.push({
          id: doc.id,
          artist: data.artist || '',
          duration: data.duration || '',
          fileName: data.fileName || '',
          sourceType: data.sourceType || '',
          status: data.status || '',
          title: data.title || '',
          url: data.url || '',
        });
      });
      onUpdate(list);
    },
    onError
  );
}

/**
 * Fetches all active songs from Firestore once.
 */
export async function fetchActiveSongs(): Promise<SongDoc[]> {
  const songsQuery = query(
    collection(db, 'songs'),
    where('status', '==', 'active')
  );

  const snap = await getDocs(songsQuery);
  const list: SongDoc[] = [];
  
  snap.forEach((doc) => {
    const data = doc.data();
    list.push({
      id: doc.id,
      artist: data.artist || '',
      duration: data.duration || '',
      fileName: data.fileName || '',
      sourceType: data.sourceType || '',
      status: data.status || '',
      title: data.title || '',
      url: data.url || '',
    });
  });
  
  return list;
}
