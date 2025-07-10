import { Outlet } from 'react-router-dom';
import LoyeNavbar from '../../components/LoyeNavbar';

function LoyeLayout() {
  return (
    <>
      <LoyeNavbar />
      <Outlet />
    </>
  );
}

export default LoyeLayout;
