const key = (uid: string) => `estante-welcome-seen:${uid}`;

export const hasSeenEstanteWelcome = (uid: string): boolean => {
  try {
    return localStorage.getItem(key(uid)) === '1';
  } catch {
    return true;
  }
};

export const markEstanteWelcomeSeen = (uid: string): void => {
  try {
    localStorage.setItem(key(uid), '1');
    window.dispatchEvent(new Event('estante-welcome-seen'));
  } catch {
    return;
  }
};
