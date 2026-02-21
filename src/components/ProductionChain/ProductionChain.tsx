import type { FC } from 'react';
import { Alert, Card, Spinner, ToggleSwitch } from 'flowbite-react';
import { useProductionChain } from '../../hooks';
import { useProductionTree } from './ProductionTreeContext';
import { ProductionTreeNode } from './ProductionTreeNode';

type ProductionChainProps = {
  typeId: number | null;
  quantity: number;
};

const ProductionChain: FC<ProductionChainProps> = ({ typeId, quantity }) => {
  const { tree, loading, error } = useProductionChain(typeId, quantity);
  const { exactNumbers, setExactNumbers } = useProductionTree();

  if (typeId === null) {
    return (
      <Card className="mt-6 border-gray-700 bg-gray-800">
        <p className="text-gray-400">Select a commodity above to view its production chain.</p>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card className="mt-6 border-gray-700 bg-gray-800">
        <div className="flex items-center gap-2 text-gray-400">
          <Spinner size="md" />
          <span>Building production chain...</span>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert color="failure" className="mt-6">
        <span>Error loading production chain: {error}</span>
      </Alert>
    );
  }

  if (!tree) {
    return null;
  }

  return (
    <Card className="mt-6 border-gray-700 bg-gray-800">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-bold text-white">Production Chain</h2>
        <ToggleSwitch checked={exactNumbers} onChange={setExactNumbers} label="Exact numbers" sizing="sm" />
      </div>
      <ProductionTreeNode node={tree} />
    </Card>
  );
};

export default ProductionChain;
