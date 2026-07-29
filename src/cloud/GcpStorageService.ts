import { ref, uploadBytes, getDownloadURL, uploadString } from 'firebase/storage';
import { firebaseStorage } from './firebaseConfig';

class GcpStorageServiceClass {
  // Uploads a profile picture and returns the public download URL
  public async uploadProfilePicture(file: File, uid: string): Promise<string | null> {
    if (!firebaseStorage) {
      console.warn('⚠️ [GCP Storage] Storage SDK not initialized, cannot upload profile picture.');
      return null;
    }
    try {
      const extension = file.name.split('.').pop() || 'png';
      const storageRef = ref(firebaseStorage, `avatars/${uid}-${Date.now()}.${extension}`);
      const snapshot = await uploadBytes(storageRef, file);
      const url = await getDownloadURL(snapshot.ref);
      console.log(`☁️ [GCP Storage] Uploaded profile picture for ${uid}`);
      return url;
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      return null;
    }
  }

  // Uploads a base64 encoded data URL (canvas snapshot) and returns the public download URL
  public async uploadBoardThumbnail(dataUrl: string, boardId: string): Promise<string | null> {
    if (!firebaseStorage) {
      console.warn('⚠️ [GCP Storage] Storage SDK not initialized, cannot upload thumbnail.');
      return null;
    }
    try {
      const cleanId = boardId.toLowerCase().replace(/\s+/g, '-');
      const storageRef = ref(firebaseStorage, `thumbnails/${cleanId}-${Date.now()}.png`);
      // dataUrl is typically 'data:image/png;base64,...'
      const snapshot = await uploadString(storageRef, dataUrl, 'data_url');
      const url = await getDownloadURL(snapshot.ref);
      console.log(`☁️ [GCP Storage] Uploaded thumbnail for board ${boardId}`);
      return url;
    } catch (error) {
      console.error('Error uploading board thumbnail:', error);
      return null;
    }
  }
}

export const GcpStorageService = new GcpStorageServiceClass();
