import { Navbar, NavbarBrand } from 'flowbite-react';

export function Header() {
  return (
    <Navbar fluid className="border-b border-gray-700 bg-gray-800">
      <NavbarBrand href="/">
        <span className="self-center whitespace-nowrap text-xl font-semibold text-white">EVE Online PI Calculator</span>
      </NavbarBrand>
    </Navbar>
  );
}
