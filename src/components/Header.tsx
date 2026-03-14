import type { FC } from 'react';
import { useState } from 'react';
import { Navbar, NavbarBrand } from 'flowbite-react';
import { LuCircleHelp } from 'react-icons/lu';
import logo from '../../assets/EveOnline-PI-Calculator-Logo.png';
import { useGlobalLoading } from '../hooks';

const Header: FC = () => {
  const [showMarginInfo, setShowMarginInfo] = useState(false);
  const { loading } = useGlobalLoading();

  return (
    <>
      <Navbar fluid className="relative border-b border-gray-700 bg-gray-800">
        {loading && (
          <div className="absolute bottom-0 left-0 h-0.5 w-full overflow-hidden bg-gray-700">
            <div className="h-full w-1/3 animate-[shimmer_1.2s_ease-in-out_infinite] bg-blue-500" />
          </div>
        )}
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4">
          <NavbarBrand href="/">
            <img src={logo} alt="EVE Online PI Calculator" className="mr-3 h-8" />
            <span className="self-center whitespace-nowrap text-xl font-semibold text-white">EVE Online PI Calculator</span>
          </NavbarBrand>
          <button onClick={() => setShowMarginInfo(true)} className="text-gray-300 hover:text-white" aria-label="Margin calculation info">
            <LuCircleHelp size={22} />
          </button>
        </div>
      </Navbar>
      {showMarginInfo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={() => setShowMarginInfo(false)}>
          <div className="mx-4 w-full max-w-lg rounded-lg border border-gray-600 bg-gray-800 shadow-xl" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-gray-600 p-4">
              <h3 className="text-lg font-semibold text-white">How Margins Are Calculated</h3>
              <button
                onClick={() => setShowMarginInfo(false)}
                className="flex h-7 w-7 items-center justify-center rounded text-gray-400 hover:bg-gray-700 hover:text-white"
                aria-label="Close"
              >
                ✕
              </button>
            </div>
            <div className="space-y-4 p-4 text-sm text-gray-300">
              <p>Margins are calculated per production run using live market prices from the selected trade station.</p>
              <div className="space-y-2">
                <div>
                  <span className="font-semibold text-white">Output value</span> = output quantity per run × highest buy order price
                </div>
                <div>
                  <span className="font-semibold text-white">Input cost</span> = Σ (input quantity per run × lowest sell order price)
                </div>
                <div>
                  <span className="font-semibold text-white">Margin (ISK)</span> = output value − input cost
                </div>
                <div>
                  <span className="font-semibold text-white">Margin (%)</span> = margin / input cost × 100
                </div>
              </div>
              <div className="rounded border border-gray-600 bg-gray-900 p-3">
                <div className="mb-1 text-xs font-semibold uppercase tracking-wider text-gray-400">Example</div>
                <p>
                  A <span className="text-yellow-400">P2</span> schematic produces <strong>5</strong> units per run from two{' '}
                  <span className="text-red-400">P1</span> inputs (40 each).
                </p>
                <p className="mt-1">
                  Output value = 5 × <span className="text-green-400">buy price</span>
                </p>
                <p>
                  Input cost = 40 × <span className="text-yellow-400">sell price₁</span> + 40 × <span className="text-yellow-400">sell price₂</span>
                </p>
                <p>Margin = output value − input cost</p>
              </div>
              <p className="text-xs text-gray-400">
                Prices used: <span className="text-green-400">buy.max</span> (highest buy order) for output, <span className="text-yellow-400">sell.min</span>{' '}
                (lowest sell order) for inputs. This represents the instant-sell profit if you sell output immediately to buy orders and purchase inputs from
                the cheapest sell orders.
              </p>
              <p className="text-xs text-gray-400">
                <span className="font-semibold text-gray-300">Note:</span> Input costs always use market prices, not the cost of producing those inputs
                yourself. For example, a <span className="text-yellow-400">P2</span> margin is based on buying its <span className="text-red-400">P1</span>{' '}
                inputs from the market — not on the cost of manufacturing those <span className="text-red-400">P1</span> items from{' '}
                <span className="text-gray-400">R0</span> raw resources. Each tier&apos;s margin is calculated independently.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export { Header };
