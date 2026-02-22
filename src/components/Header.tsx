import type { FC } from 'react';
import { Navbar, NavbarBrand } from 'flowbite-react';
import logo from '../../assets/EveOnline-PI-Calculator-Logo.png';

const Header: FC = () => (
  <Navbar fluid className="border-b border-gray-700 bg-gray-800">
    <NavbarBrand href="/">
      <img src={logo} alt="EVE Online PI Calculator" className="mr-3 h-8" />
      <span className="self-center whitespace-nowrap text-xl font-semibold text-white">EVE Online PI Calculator</span>
    </NavbarBrand>
  </Navbar>
);

export { Header };
