import { useAppSelector } from '../store/hooks';
import { getTheme, Theme } from '../styles/themes';

export const useTheme = (): Theme => {
  const themePreference = useAppSelector((state) => state.settings.theme);
  return getTheme(themePreference);
};

export default useTheme;
