import { Platform } from 'react-native';
import Constants from 'expo-constants';

type ExpoNotifications = typeof import('expo-notifications');
type NotificationResponse = import('expo-notifications').NotificationResponse;

let notificationsModule: ExpoNotifications | null = null;

async function getNotifications() {
  if (Platform.OS === 'web' || Constants.appOwnership === 'expo') {
    return null;
  }

  if (!notificationsModule) {
    notificationsModule = await import('expo-notifications');
    notificationsModule.setNotificationHandler({
      handleNotification: async () => ({
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });
  }

  return notificationsModule;
}

export function addNotificationResponseListener(onUrl: (url: string) => void) {
  let disposed = false;
  let subscription: { remove: () => void } | null = null;

  getNotifications().then((Notifications) => {
    if (!Notifications || disposed) return;

    subscription = Notifications.addNotificationResponseReceivedListener(
      (response: NotificationResponse) => {
        const url = response.notification.request.content.data?.url;
        if (typeof url === 'string') {
          onUrl(url);
        }
      }
    );
  });

  return {
    remove: () => {
      disposed = true;
      subscription?.remove();
    },
  };
}

export async function configureNotifications() {
  try {
    const Notifications = await getNotifications();
    if (!Notifications) return;

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('learning', {
        name: 'Lembretes de estudo',
        importance: Notifications.AndroidImportance.HIGH,
        sound: 'default',
        vibrationPattern: [0, 250, 250, 250],
      });
    }

    await ensureNotificationPermission();
  } catch {
    return;
  }
}

export async function ensureNotificationPermission() {
  try {
    const Notifications = await getNotifications();
    if (!Notifications) return false;

    const current = await Notifications.getPermissionsAsync();
    if (current.granted || current.status === Notifications.PermissionStatus.GRANTED) {
      return true;
    }

    const requested = await Notifications.requestPermissionsAsync();
    return requested.granted || requested.status === Notifications.PermissionStatus.GRANTED;
  } catch {
    return false;
  }
}

export async function notifyEnrollment(cursoId: string, cursoTitulo: string) {
  try {
    const Notifications = await getNotifications();
    const allowed = await ensureNotificationPermission();
    if (!Notifications || !allowed) return;

    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Matricula confirmada',
        body: `Seu curso "${cursoTitulo}" ja esta liberado para continuar.`,
        data: { url: `/cursos/${cursoId}` },
        sound: 'default',
      },
      trigger: { seconds: 8, channelId: 'learning' },
    });
  } catch {
    return;
  }
}

export async function notifyLessonCompleted(cursoId: string, aulaTitulo: string, cursoTitulo: string) {
  try {
    const Notifications = await getNotifications();
    const allowed = await ensureNotificationPermission();
    if (!Notifications || !allowed) return;

    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Aula concluida',
        body: `"${aulaTitulo}" foi registrada em ${cursoTitulo}. Continue pelo proximo modulo.`,
        data: { url: `/cursos/${cursoId}` },
        sound: 'default',
      },
      trigger: null,
    });
  } catch {
    return;
  }
}

export async function notifyCertificate(cursoId: string, cursoTitulo: string) {
  try {
    const Notifications = await getNotifications();
    const allowed = await ensureNotificationPermission();
    if (!Notifications || !allowed) return;

    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Certificado emitido',
        body: `Parabens! Seu certificado de ${cursoTitulo} ja esta disponivel.`,
        data: { url: '/certificados' },
        sound: 'default',
      },
      trigger: null,
    });
  } catch {
    return;
  }
}
