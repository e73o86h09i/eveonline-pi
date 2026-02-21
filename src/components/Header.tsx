import type { FC } from 'react';
import { Navbar, NavbarBrand } from 'flowbite-react';

const Header: FC = () => (
  <Navbar fluid className="border-b border-gray-700 bg-gray-800">
    <NavbarBrand href="/">
      <span className="self-center whitespace-nowrap text-xl font-semibold text-white">EVE Online PI Calculator</span>
    </NavbarBrand>
  </Navbar>
);

export default Header;
