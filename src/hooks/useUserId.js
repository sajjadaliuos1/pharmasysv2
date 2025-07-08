import { useAuthContext } from '../context/AuthContext';

export const useUserId = () => {
  const { userId } = useAuthContext();
  return userId;
};

export default useUserId;