import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { tokenStore } from '../services/auth/tokenStore';

export default function Index() {
  const router = useRouter();

  useEffect(() => {
    async function checkAuth() {
      const token = await tokenStore.getAccessToken();
      if (token) {
        router.replace('/(tabs)/process-voice');
      } else {
        router.replace('/login');
      }
    }
    checkAuth();
  }, [router]);

  return null;
}
